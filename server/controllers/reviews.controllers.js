import { reviewsModel } from '../models/reviews.model.js';
import { orderModel } from '../models/orders.model.js';
import mongoose from 'mongoose';
import { verifiedAccount } from '../utils/validate.js';
export const getReviewsProducts = async (req, res) => {
  const { productId } = req.params;
  const { page } = req.query;
  const curPage = page ? Number(page) : 1;
  try {
    const totalReviews = await reviewsModel.countDocuments({
      product: productId,
    });
    const totalPage = Math.ceil(totalReviews / 10);

    const reviews = await reviewsModel.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: 'product', avgRate: { $avg: '$rate' } } },
    ]);
    const avgRate = Math.ceil(reviews[0]?.avgRate * 10) / 10;
    const usersReview = await reviewsModel
      .find({ product: productId })
      .populate('user', '_id image email name')
      .sort({ created_at: -1 })
      .skip((curPage - 1) * 10)
      .limit(10);

    return res.status(200).json({
      error: false,
      success: true,
      reviews: usersReview,
      avgRate: avgRate,
      totalReviews: totalReviews,
      totalPage: totalPage,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const postReview = async (req, res) => {
  const user = req.decoded;
  const { productId, rate, message, orderCode } = req.body;
  const files = req.files;
  try {
    if (user?.role?.value !== 0)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'This feature is only for user!',
      });
    if (!rate || !message)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Rate and review required!',
      });
    const isVerified = await verifiedAccount(req, res, user);
    if (isVerified) return;
    const receivedOrder = await orderModel.findOne({
      user: user._id,
      'paymentInfo.orderCode': orderCode,
    });
    if (receivedOrder?.paymentInfo?.status !== 'received') {
      return res.status(409).json({
        error: true,
        success: false,
        message: 'You cannot review this order before its arrival!',
      });
    } else {
      const reviewProduct = await orderModel.findOne({
        user: user._id,
        'paymentInfo.orderCode': orderCode,
        'products.product': productId,
        'products.$.isReviews': true,
      });
      if (reviewProduct)
        return res.status(409).json({
          error: true,
          success: false,
          message: 'You have already reviewed this order!',
        });
      const images = files.map(async (file) => {
        return {
          name: file.filename,
          url: file.path,
        };
      });
      const imageUrls = await Promise.all(images);
      const [createdReview, updatedOrder] = await Promise.all([
        reviewsModel.create({
          product: productId,
          user: user._id,
          message: message,
          rate: rate,
          images: imageUrls,
        }),
        orderModel.findOneAndUpdate(
          {
            user: user._id,
            'paymentInfo.orderCode': orderCode,
            'products.product': productId,
          },
          {
            $set: {
              'products.$.isReviews': true,
            },
          },
          { new: true }
        ),
      ]);
      if (createdReview && updatedOrder)
        return res.status(200).json({
          error: false,
          success: true,
          message: 'Order reviewed successfully!',
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
