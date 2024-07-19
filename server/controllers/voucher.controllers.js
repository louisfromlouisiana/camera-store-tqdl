import unidecode from 'unidecode';
import { voucherModel } from '../models/voucher.model.js';

export const checkVoucher = async (req, res) => {
  const { sku, price, coupons } = req.body;
  try {
    // if (!sku || Number(price) < 0) {
    //   return res.status(404).json({
    //     error: true,
    //     success: false,
    //     message: `Không tìm thấy voucher!`,
    //   });
    // }
    if (coupons) {
      for (let coupon of coupons) {
        if (coupon) {
          return res.status(409).json({
            error: true,
            success: false,
            message:
              'Voucher cannot be applied for discounted products!',
          });
        }
      }
    }
    const existedVoucher = await voucherModel.findOne({
      SKU: sku.toUpperCase(),
      enabled: true,
    });
    if (!existedVoucher)
      return res.status(404).json({
        error: true,
        success: false,
        message: `No vouchers found!`,
      });
    if (existedVoucher?.quantity === 0)
      return res.status(409).json({
        error: false,
        success: true,
        message: 'No voucher left!',
      });
    if (existedVoucher && existedVoucher?.minPrice <= Number(price))
      return res.status(200).json({
        error: false,
        success: true,
        voucher: existedVoucher,
        message: 'Voucher applied successfully!',
      });
    return res.status(404).json({
      error: true,
      success: false,
      message: `Required at least ${existedVoucher.minPrice} đ for this voucher!`,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const getAllVouchers = async (req, res) => {
  const user = req.decoded;
  const { search, page } = req.query;
  const curPage = page ? Number(page) : 1;
  const query = {};
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    if (search !== null && search !== 'null' && search) {
      const unaccentedQueryString = unidecode(search);
      const regex = new RegExp(unaccentedQueryString, 'i');
      query.SKU = regex;
    }
    const totalVouchers = await voucherModel.countDocuments(query);
    const vouchers = await voucherModel
      .find(query)
      .skip((curPage - 1) * 20)
      .limit(20);
    return res.status(200).json({
      error: false,
      success: true,
      vouchers: vouchers,
      totalPage: Math.ceil(totalVouchers / 20),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const postVoucher = async (req, res) => {
  const {
    SKU,
    description,
    discount,
    maxDiscount,
    minPrice,
    enabled,
    quantity,
  } = req.body;
  const user = req.decoded;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    if (!SKU || !description || !discount || !maxDiscount || !minPrice) {
      return res.status(400).json({
        error: true,
        success: false,
        message: `SKU, description, discount, max discount and min price required!`,
      });
    }
    if (Number(discount) < 0 || Number(maxDiscount) < 0 || Number(minPrice) < 0)
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Cannot be less than 0!',
      });
    if (discount > 100) {
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Cannot discount 100%!',
      });
    }
    const duplicatedVoucher = await voucherModel.findOne({ SKU: SKU });
    if (duplicatedVoucher)
      return res.status(409).json({
        error: true,
        success: false,
        message: `SKU: ${SKU} existed!`,
      });
    const createdVoucher = await voucherModel.create({
      SKU: SKU,
      description: description,
      discount: discount,
      maxDiscount: maxDiscount,
      minPrice: minPrice,
      quantity: Number(quantity),
      enabled: enabled ? enabled : false,
    });
    if (createdVoucher)
      return res.status(201).json({
        error: false,
        success: true,
        message: `Voucher created successfully!`,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const updateVoucher = async (req, res) => {
  const { sku } = req.params;
  const { description, discount, maxDiscount, minPrice, enabled, quantity } =
    req.body;
  const user = req.decoded;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    if (!description || !discount || !maxDiscount || !minPrice || !quantity)
      return res.status(400).json({
        error: true,
        success: false,
        message: `SKU, description, discount, max discount, min price and ENABLE required!`,
      });
    if (
      Number(discount) < 0 ||
      Number(maxDiscount) < 0 ||
      Number(minPrice) < 0
    ) {
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Cannot be less than 0!',
      });
    }

    if (discount > 100) {
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Cannot discount 100%!',
      });
    }
    const updatedVoucher = await voucherModel.findOneAndUpdate(
      { SKU: sku },
      {
        description: description,
        discount: discount,
        maxDiscount: maxDiscount,
        minPrice: minPrice,
        enabled: enabled,
        quantity: Number(quantity),
      }
    );
    if (updatedVoucher)
      return res.status(200).json({
        error: false,
        success: true,
        message: `Voucher updated successfully!`,
      });
    return res.status(404).json({
      error: true,
      success: false,
      message: `No vouchers found!`,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const deleteVoucher = async (req, res) => {
  const { sku } = req.params;
  const user = req.decoded;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    const deletedVoucher = await voucherModel.findOneAndDelete({ SKU: sku });
    if (deletedVoucher)
      return res.status(200).json({
        error: false,
        success: true,
        message: `Voucher deleted successfully!`,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
