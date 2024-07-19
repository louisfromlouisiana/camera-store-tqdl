import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/user.model.js';
import { signToken } from '../utils/signToken.js';
import { roleModel } from '../models/role.model.js';
import { blackList } from '../utils/blackList.js';
import { resetPassword, sendVerificationEmail } from '../utils/email.js';
import { deleteImage } from '../utils/deleteImage.js';
import { generateVerificationCode } from '../utils/generateCode.js';
import { counterModel } from '../models/counter.model.js';
async function getNextSequenceValue(sequenceName) {
  const sequenceDocument = await counterModel.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  return sequenceDocument.sequence_value;
}
export const getUserByToken = async (req, res) => {
  const user = req.decoded;
  try {
    const curUser = await userModel
      .findOne(
        { email: user.email },
        {
          _id: 1,
          name: 1,
          email: 1,
          password: 1,
          role: 1,
          image: 1,
          isVerified: 1,
        }
      )
      .populate('role')
      .lean();
    if (curUser)
      return res
        .status(200)
        .json({ error: false, success: true, user: curUser });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Email and password required!',
      });
    }
    const user = await userModel
      .findOne(
        { email: email },
        {
          _id: 1,
          id: 1,
          name: 1,
          email: 1,
          password: 1,
          role: 1,
          image: 1,
          isVerified: 1,
        }
      )
      .populate('role')
      .lean();
    if (!user)
      return res.status(404).json({ message: 'User not found!' });
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = await signToken({ ...user });
      return res
        .status(200)
        .json({ error: false, success: true, token: token });
    }
    return res
      .status(401)
      .json({ error: true, success: false, message: 'Wrong password!' });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const userRegister = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const duplicatedUser = await userModel.findOne({ email: email }).lean();
    if (duplicatedUser)
      return res.status(409).json({
        error: true,
        success: false,
        message: 'User existed!',
      });
    const userRole = await roleModel.findOne({ value: 0 });
    if (!userRole)
      return res.status(500).json({
        error: true,
        success: false,
        message: 'User role error!',
      });
    const hasPwd = bcrypt.hashSync(password, 10);
    const code = generateVerificationCode();
    const curDate = Date.now();
    const newUser = {
      name: name,
      email: email,
      password: hasPwd,
      role: userRole._id,
      verify: {
        code: code,
        verified_at: null,
        expired: new Date(curDate + 5 * 60000),
      },
    };
    const userId = await getNextSequenceValue('userId');
    newUser.id = userId;
    const createdUser = await (
      await userModel.create(newUser)
    ).populate('role');
    await sendVerificationEmail(newUser.email, code);
    if (createdUser) {
      const token = await signToken({ ...createdUser._doc });
      return res.status(201).json({
        error: false,
        success: true,
        message: 'Sign up successfully!',
        token: token,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const userLogout = async (req, res) => {
  const token = req.headers['authorization'];

  try {
    const getToken = token?.split(' ')[1];
    if (!getToken) {
      return res
        .status(401)
        .json({ error: true, success: false, message: 'Token not exist' });
    }
    if (blackList.has(getToken))
      return res.status(409).json({
        error: true,
        success: false,
        message: 'User signed out!',
      });
    jwt.verify(getToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          error: true,
          success: false,
          message: 'Token is not incorrect!',
        });
      }
      if (decoded) {
        blackList.add(getToken);
        if (blackList.has(getToken))
          return res.status(200).json({
            error: false,
            success: true,
            message: 'Signed out successfully!',
          });
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const existedUser = await userModel.findOne({ email: email });
    if (existedUser) {
      const randomPassword = crypto.randomBytes(8).toString('hex');
      const token = await signToken(
        { email: email, password: randomPassword },
        '360s'
      );
      const response = await resetPassword(
        email,
        `${process.env.APP_URL}/api/reset_password/${token}`
      );
      if (response.error)
        return res.status(500).json({
          error: true,
          success: false,
          message: 'Error when resetting password!',
        });

      if (response.success)
        return res.status(200).json({
          error: false,
          success: true,
          message: 'Please check your email!',
        });
    }
    return res.status(404).json({
      error: true,
      success: false,
      message: 'Email invalid!',
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: 'Error when resetting password!',
    });
  }
};
export const resendCode = async (req, res) => {
  const user = req.decoded;
  try {
    const curDate = Date.now();
    const existedUser = await userModel.findOne({ email: user?.email });
    if (!existedUser)
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Email invalid',
      });
    const code = generateVerificationCode();
    const updatedUser = await userModel.findOneAndUpdate(
      { email: user?.email },
      {
        verify: {
          code: code,
          verified_at: null,
          expired: new Date(curDate + 5 * 60000),
        },
      }
    );
    if (updatedUser) {
      await sendVerificationEmail(user?.email, code);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Please check your email!',
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const verifiedEmail = async (req, res) => {
  const user = req.decoded;
  const { code } = req.body;
  try {
    const curDate = Date.now();
    const existedCode = await userModel.findOne({
      email: user.email,
      'verify.code': code,
    });
    if (!existedCode)
      return res
        .status(404)
        .json({ error: true, success: false, message: 'Wrong code!' });
    if (new Date(curDate) > new Date(existedCode?.verify?.expired))
      return res
        .status(409)
        .json({ error: true, success: false, message: 'Code expired!' });
    const updatedUser = await userModel.findOneAndUpdate(
      { email: user?.email },
      {
        isVerified: true,
        'verify.verified_at': Date.now(),
      }
    );
    if (updatedUser) {
      return res.status(200).json({
        error: false,
        success: true,
        message: 'User verified successfully!',
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const changePassword = async (req, res) => {
  const user = req.decoded;
  const { oldPassword, newPassword } = req.body;
  try {
    if (!oldPassword || !newPassword)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Old password and new password required!',
      });
    const curUser = await userModel.findOne({ email: user.email });
    if (!curUser)
      return res.status(404).json({
        error: true,
        success: false,
        message: `No ${user.email} found!`,
      });
    const match = bcrypt.compareSync(oldPassword, curUser.password);
    if (!match)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Wrong password!' });
    const hasPwd = bcrypt.hashSync(newPassword, 10);
    const updatedUser = await userModel.findOneAndUpdate(
      { email: user.email },
      { password: hasPwd }
    );
    if (updatedUser)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Password changed successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const validateResetPassword = async (req, res) => {
  const { token } = req.params;
  try {
    if (!token)
      return res
        .status(400)
        .json({ error: false, success: true, message: 'Bad request!' });
    if (blackList.has(token))
      return res.status(401).json({
        error: true,
        success: false,
        message: 'Token expired or invalid.',
      });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          error: true,
          success: false,
          message: 'Token is not incorrect!',
        });
      }
      if (decoded) {
        const hasPassword = bcrypt.hashSync(decoded.password, 10);
        const updatedPassword = await userModel.findOneAndUpdate(
          { email: decoded.email },
          { password: hasPassword, updated_at: Date.now() },
          { new: true }
        );
        if (updatedPassword) {
          blackList.add(token);
          return res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password</title>
    <style>
      body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
      }
    </style>
  </head>
  <body>
    <h1>Your password</h1>
    <p>${decoded.password}</p>
  </body>
</html>
`);
        }
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, newPassword, oldImage } = req.body;
  const file = req.file;
  const parseOldImage = oldImage ? JSON.parse(oldImage) : null;
  try {
    const existedUser = await userModel.findById(id);
    if (!existedUser && !existedUser.email === email)
      return res.status(404).json({
        error: true,
        success: false,
        message: 'No user found!',
      });
    const user = {
      name: name,
      email: email,
      updated_at: Date.now(),
    };
    if (newPassword) {
      const match = bcrypt.compareSync(password, existedUser.password);
      if (!match)
        return res.status(403).json({
          error: true,
          success: false,
          message: 'Wrong password!',
        });
      const hasPwd = bcrypt.hashSync(newPassword, 10);
      user.password = hasPwd;
    }

    if (file) {
      user.image = {
        name: file.filename,
        url: file.path,
      };
      if (parseOldImage && parseOldImage?.name !== 'avatar_trang.jpg') {
        await deleteImage(parseOldImage?.url);
      }
    }
    const updatedUser = await userModel.findByIdAndUpdate(id, user, {
      new: true,
    });
    if (updatedUser)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'User updated successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const getListUserByAdmin = async (req, res) => {
  const user = req.decoded;
  const { page } = req.query;
  const curPage = page ? Number(page) : 1;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    const totalUsers = await userModel.countDocuments();
    const users = await userModel
      .find(
        { role: { $ne: user.role._id } },
        {
          _id: 1,
          id: 1,
          name: 1,
          email: 1,
          image: 1,
          created_at: 1,
          updated_at: 1,
          isBanned: 1,
        }
      )
      .skip((curPage - 1) * 10)
      .limit(10);
    return res.status(200).json({
      error: false,
      success: true,
      users: users,
      totalPage: Math.ceil(totalUsers / 10),
      curPage: curPage,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const banUser = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    const bannedUser = await userModel.findByIdAndUpdate(
      id,
      { isBanned: true },
      { new: true }
    );
    if (bannedUser)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'User banned successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const disBanUser = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    const disBannedUser = await userModel.findByIdAndUpdate(
      id,
      { isBanned: false },
      { new: true }
    );
    if (disBannedUser)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'User unbanned successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
