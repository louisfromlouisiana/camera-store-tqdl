import { userAddressModel } from '../models/useraddress.model.js';
import { verifiedAccount } from '../utils/validate.js';
export const getDefaultAddress = async (req, res) => {
  const user = req.decoded;
  try {
    const address = await userAddressModel
      .findOne({
        isDefault: true,
        user: user._id,
      })
      .populate(['province', 'district', 'ward']);
    return res
      .status(200)
      .json({ error: false, success: true, address: address });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const getAddressFormUser = async (req, res) => {
  const user = req.decoded;
  try {
    const address = await userAddressModel
      .find({ user: user._id })
      .populate(['province', 'district', 'ward'])
      .sort({ isDefault: -1 });
    return res
      .status(200)
      .json({ error: false, success: true, address: address ? address : [] });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const getAddressFromAdmin = async (req, res) => {
  const user = req.decoded;
  const { page } = req.query;
  const curPage = page ? Number(page) : 1;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    const totalAddress = await userAddressModel.countDocuments({
      isDefault: true,
    });
    const address = await userAddressModel
      .find({ isDefault: true })
      .populate(['province', 'district', 'ward'])
      .populate('user', 'email')
      .skip((curPage - 1) * 10)
      .limit(10);
    return res.status(200).json({
      error: false,
      success: true,
      address: address,
      totalPage: Math.ceil(totalAddress / 10),
      curPage: curPage,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const createAddress = async (req, res) => {
  const user = req.decoded;
  const { province, district, ward, address, phone, isDefault } = req.body;

  try {
    if (user?.role?.value !== 0)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'This feature is only for user!',
      });
    if (!province || !district || !ward || !address || !phone)
      return res.status(400).json({
        error: true,
        success: false,
        message:
          'Province/City, District, Ward, specific address and phone number needed!',
      });
    if (phone && phone?.length !== 10) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Phone number needs to be 10-digits!',
      });
    }
    if(phone && !phone.startsWith('0')) return res.status(400).json({error: true, success: false, message: 'Phone number must started with 0!'})
    const isVerified = await verifiedAccount(req, res, user);
    if (isVerified) return;
    let shouldSetDefault = isDefault;
    if (isDefault) {
      const existingDefaultAddress = await userAddressModel.findOne({
        user: user._id,
        isDefault: true,
      });
      if (existingDefaultAddress?.isDefault) {
        shouldSetDefault = true;
        existingDefaultAddress.isDefault = false;
        await existingDefaultAddress.save();
      }
    }

    const createdAddress = await userAddressModel.create({
      user: user._id,
      province: province,
      district: district,
      ward: ward,
      address: address,
      phone: phone,
      isDefault: shouldSetDefault,
    });

    if (createdAddress) {
      // if (createdAddress.isDefault) {
      //   await userAddressModel.findOneAndUpdate(
      //     { user: user._id, _id: { $ne: createdAddress._id } },
      //     { isDefault: false }
      //   );
      // }
      return res.status(201).json({
        success: true,
        message: 'Address created successfully!',
        createdAddress,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  const { province, district, ward, address, phone, isDefault } = req.body;
  try {
    if (user?.role?.value !== 0)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'This feature is only for user!',
      });
    if (!province || !district || !ward || !address || !phone)
      return res.status(400).json({
        error: true,
        success: false,
        message:
          'Province/City, District, Ward, specific address and phone number needed!',
      });
    if (phone && phone?.length !== 10) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Phone number needs to be 10-digits!',
      });
    }
    const isVerified = await verifiedAccount(req, res, user);
    if (isVerified) return;

    const updatedAddress = await userAddressModel.findOneAndUpdate(
      { _id: id, user: user._id },
      {
        province: province,
        district: district,
        ward: ward,
        address: address,
        phone: phone,
        isDefault: isDefault,
      },
      { new: true }
    );
    if (updatedAddress) {
      if (isDefault) {
        await userAddressModel.updateMany(
          { user: user._id, _id: { $ne: updatedAddress._id } },
          { isDefault: false },
          { new: true }
        );
      }
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Address updated successfully!',
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  try {
    if (user?.role?.value !== 0)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'This feature is only for user!',
      });
    const isVerified = await verifiedAccount(req, res, user);
    if (isVerified) return;

    const deletedAddress = await userAddressModel.findOneAndDelete({
      _id: id,
      user: user._id,
    });
    if (deletedAddress)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Address deleted successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
