import { userModel } from '../models/user.model.js';

export function validateEmail(email) {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

export const verifiedAccount = async (req, res, user) => {
  const curUser = await userModel.findOne({ email: user?.email });
  if (!curUser) {
    res.status(409).json({
      error: true,
      success: false,
      message: 'No users found!',
    });
    return true;
  }
  if (curUser.isBanned) {
    res.status(409).json({
      error: true,
      success: false,
      message: 'Your account is currently banned, please contact administrator for help!',
    });
    return true;
  }
  if (!curUser?.isVerified) {
    res.status(409).json({
      error: true,
      success: false,
      message: 'Your account needs to be verified!',
    });
    return true;
  }
  return false;
};
