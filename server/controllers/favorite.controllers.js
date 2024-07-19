import { favoriteModel } from '../models/favorite.model.js';
import { verifiedAccount } from '../utils/validate.js';

export const getAllFavorite = async (req, res) => {
  const user = req.decoded;
  try {
    if (user?.role?.value !== 0)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'This feature is only for user!',
      });
    const favorites = await favoriteModel
      .findOne({ user: user._id })
      .populate('products', '_id name images price');
    return res
      .status(200)
      .json({ error: false, success: true, favorite: favorites });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const postFavorite = async (req, res) => {
  const user = req.decoded;
  const { productId } = req.body;

  try {
    if (user?.role?.value !== 0) {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'This feature is only for user!',
      });
    }
    const isVerified = await verifiedAccount(req, res, user);
    if (isVerified) return;
    let favorite = await favoriteModel.findOne({ user: user._id });

    if (!favorite) {
      favorite = await favoriteModel.create({
        user: user._id,
        products: [productId],
      });
      return res.status(200).json({
        error: false,
        success: true,
        message: `Favorite initialized and add product to favorite!`,
      });
    }
    const isProductInFavorite = favorite.products.includes(productId);
    if (isProductInFavorite) {
      await favoriteModel.findOneAndUpdate(
        { user: user._id },
        { $pull: { products: productId } }
      );
      return res.status(200).json({
        error: false,
        success: true,
        message: `Removed product from favorite!`,
      });
    } else {
      await favoriteModel.findOneAndUpdate(
        { user: user._id },
        { $push: { products: productId } }
      );
      return res.status(200).json({
        error: false,
        success: true,
        message: `Added product to favorite!`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};
