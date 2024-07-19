import { cartModel } from '../models/cart.model.js';
import { productModel } from '../models/product.model.js';
import { verifiedAccount } from '../utils/validate.js';
import mongoose from 'mongoose';
export const getCart = async (req, res) => {
  const user = req.decoded;
  try {
    const cart = await cartModel.findOne({ user: user._id }).populate({
      path: 'products.product',
      populate: {
        path: 'coupon',
        model: 'coupons',
        select: '_id name discount minPrice maxDiscount',
      },
      select: '_id name description images price coupon',
    });
    return res.status(200).json({ error: false, success: true, cart: cart });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const postCart = async (req, res) => {
  const user = req.decoded;
  const { productId, quantity } = req.body;

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

    const curProduct = await productModel.findById(productId);
    if (!curProduct) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'No products found!',
      });
    }

    if (curProduct.availableQuantity < Number(quantity)) {
      return res.status(409).json({
        error: true,
        success: false,
        message: `Selected quantity cannot be more than available quantity!`,
      });
    }

    const cart = await cartModel.findOne({ user: user._id });
    if (cart) {
      const existedProduct = cart.products.find((p) =>
        new mongoose.Types.ObjectId(p.product).equals(
          new mongoose.Types.ObjectId(productId)
        )
      );

      if (existedProduct) {
        existedProduct.quantity += quantity;

        if (curProduct.availableQuantity < existedProduct.quantity) {
          return res.status(409).json({
            error: true,
            success: false,
            message: `Selected quantity cannot be more than available quantity!`,
          });
        }
      } else {
        cart.products.push({
          product: productId,
          quantity: quantity,
        });
      }

      cart.totalPrice += Number(quantity) * curProduct.price;
      const savedCart = await cart.save();
      if (savedCart) {
        return res.status(200).json({
          error: false,
          success: true,
          message: 'Cart updated successfully!',
          cart,
        });
      }
    } else {
      const createdCart = await cartModel.create({
        products: [
          {
            product: productId,
            quantity: quantity,
          },
        ],
        user: user._id,
        totalPrice: Number(quantity) * curProduct.price,
      });

      if (createdCart) {
        return res.status(201).json({
          error: false,
          success: true,
          message: 'Cart created successfully!',
        });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const deleteProductFromCart = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  const { productId } = req.body;
  try {
    if (user?.role?.value !== 0)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'This feature is only for user!',
      });
    const isVerified = await verifiedAccount(req, res, user);
    if (isVerified) return;
    const curProduct = await cartModel
      .findOne({
        user: id,
        'products.product': productId,
      })
      .populate('products.product', '_id name price');

    if (!curProduct)
      return res.status(404).json({
        error: true,
        success: false,
        message: 'No products found in cart!',
      });

    const updatedCart = await cartModel.findOneAndUpdate(
      { user: id },
      {
        $pull: { products: { product: productId } },
        $inc: {
          totalPrice:
            -curProduct.products[0].product.price *
            curProduct.products[0].quantity,
        },
      },
      { new: true }
    );

    if (updatedCart) {
      if (!updatedCart.products || updatedCart.products.length === 0) {
        const deletedCart = await cartModel.findOneAndDelete({
          user: id,
        });
        if (deletedCart)
          return res.status(200).json({
            error: false,
            success: true,
            message: 'Cart deleted successfully!',
          });
      }
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Product removed successfully!',
      });
    }
    return res.status(404).json({
      error: true,
      success: false,
      message: 'No cart found!',
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
