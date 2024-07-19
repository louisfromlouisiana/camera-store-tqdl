import unidecode from 'unidecode';
import { couponModel } from '../models/coupon.model.js';
import { deleteImage } from '../utils/deleteImage.js';
import { format } from 'date-fns';
import { productModel } from '../models/product.model.js';
export const getAllCoupons = async (req, res) => {
  const { page, search } = req.query;
  const curPage = page ? Number(page) : 1;
  try {
    const query = {};
    if (search != 'null' && search !== null && search) {
      const unaccentedQueryString = unidecode(search);
      const regex = new RegExp(unaccentedQueryString, 'i');
      query.name = regex;
    }
    const totalCoupons = await couponModel.countDocuments(query);
    const coupons = await couponModel
      .find(query)
      .skip((curPage - 1) * 10)
      .limit(10)
      .sort({ created_at: -1 })
      .populate('category', '_id name');
    return res.status(200).json({
      error: false,
      success: true,
      coupons: coupons,
      totalPage: Math.ceil(totalCoupons / 10),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  const user = req.decoded;
  const {
    name,
    category,
    discount,
    minPrice,
    maxDiscount,
    start_date,
    end_date,
  } = req.body;
  const file = req.file;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    if (
      !file ||
      !name ||
      !category ||
      !discount ||
      !minPrice ||
      !maxDiscount ||
      !start_date ||
      !end_date
    )
      return res.status(400).json({
        error: true,
        success: false,
        message:
          'Image, name, category, discount, min price, max discount, start date and end date required!',
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
    if (new Date(start_date) <= new Date(Date.now()))
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Start date cannot be less than or equal to the current time!',
      });
    if (new Date(end_date) < new Date(start_date))
      return res.status(409).json({
        error: true,
        success: false,
        message: 'End date cannot be less than start date!',
      });
    const coupon = {
      id: String(Date.now()).slice(-6),
      name: name,
      category: category,
      discount: Number(discount),
      minPrice: Number(minPrice),
      maxDiscount: Number(maxDiscount),
    };
    coupon.start_date = new Date(start_date);
    coupon.end_date = new Date(end_date);
    if (Number(discount) > 100 || Number(discount) < 0) {
      file && (await deleteImage(file.path));
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Cannot discount beyond 100% and under 0%',
      });
    }
    if (file) {
      coupon.image = {
        name: file.filename,
        url: file.path,
      };
    }
    const duplicatedCoupon = await couponModel.findOne({ name: name });
    if (duplicatedCoupon)
      return res.status(409).json({
        error: true,
        success: false,
        message: `Coupon ${name} existed!`,
      });
    const createdCoupon = await couponModel.create(coupon);
    if (createdCoupon)
      return res.status(201).json({
        error: false,
        success: true,
        message: `Coupon created successfully! Coupon will start on ${format(
          new Date(createdCoupon.start_date),
          'dd/MM/yyyy HH:mm:ssxxx'
        )}!`,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

const disabledCoupon = async (coupon) => {
  const products = await productModel.find({ coupon: coupon._id });
  const updatedProducts = products.map(async (product) => {
    product.coupon = null;
    await productModel.findOneAndUpdate({ _id: product._id }, product, {
      new: true,
    });
  });
  await Promise.all(updatedProducts);
};

export const deleteCoupon = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    const deletedCoupon = await couponModel.findOneAndDelete({ id: id });
    if (deletedCoupon) {
      await deleteImage(deletedCoupon?.image?.url);
      await disabledCoupon(deletedCoupon);
      return res.status(200).json({ message: 'Coupon deleted successfully!' });
    }
    return res.status(404).json({ message: `No coupons found!` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const checkAndUpdateCoupon = async () => {
  console.log('Checking coupons...');
  try {
    const currentDate = Date.now();
    const startDay = new Date(currentDate);
    const endDay = new Date(currentDate);
    endDay.setHours(23, 59, 59, 999);

    const coupons = await couponModel.find({ expired: false });

    for (const coupon of coupons) {
      const couponStartDate = new Date(coupon.start_date);
      const couponEndDate = new Date(coupon.end_date);

      if (couponEndDate < endDay && startDay > couponStartDate) {
        await couponModel.updateOne(
          { id: coupon.id },
          { expired: true, status: 'Finished' },
          { new: true }
        );
        await disabledCoupon(coupon);
        console.log(`Coupon ${coupon.id} expired.`);
      }
      if (couponEndDate >= endDay && startDay > couponStartDate) {
        await couponModel.updateOne(
          { id: coupon.id },
          { status: 'In Progress' },
          { new: true }
        );
        await productModel.updateMany(
          {
            category: coupon.category,
            price: {
              $gte: coupon.minPrice,
            },
          },
          { coupon: coupon._id },
          { new: true }
        );
        console.log('Updating products...');
      }
    }
    console.log('Coupon checking completed.');
  } catch (error) {
    console.error('Error occurred while checking expiration:', error);
  }
};
