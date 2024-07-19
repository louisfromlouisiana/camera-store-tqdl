import jwt from 'jsonwebtoken';

import unidecode from 'unidecode';
import { categoryModel } from '../models/category.model.js';
import { productModel } from '../models/product.model.js';
import { deleteImage } from '../utils/deleteImage.js';
const unValidValue = ['', null, 'null', 0, '0'];
export const getProducts = async (req, res) => {
  const token = req.headers['authorization'];
  const getToken = token?.split(' ')[1];
  const { search, page, category, sort, minPrice, maxPrice, price } = req.query;
  let query = {};
  let sortItem = {};
  try {
    jwt.verify(getToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (decoded?.role?.value != 1) {
        query.status = 'active';
      }
    });
    switch (sort) {
      case 'date':
        sortItem.created_at = -1;
        break;
      case '-date':
        sortItem.created_at = 1;
        break;
      case 'price':
        sortItem.price = -1;
        break;
      case '-price':
        sortItem.price = 1;
        break;
      default:
        sortItem.created_at = -1;
    }

    if (search && search.trim() !== '' && !unValidValue.includes(search)) {
      const unaccentedQueryString = unidecode(search);
      const regex = new RegExp(unaccentedQueryString, 'i');
      query.name = regex;
    }

    if (price && !unValidValue.includes(price)) {
      query.price = Number(price);
    } else {
      if (minPrice && !unValidValue.includes(minPrice)) {
        query.price = { $gte: Number(minPrice) };
      }
      if (maxPrice && !unValidValue.includes(maxPrice)) {
        if (query.price) {
          query.price.$lte = Number(maxPrice);
        } else {
          query.price = { $lte: Number(maxPrice) };
        }
      }
    }

    if (!unValidValue.includes(category)) {
      const findCategory = await categoryModel.findOne({ name: category });
      if (findCategory) {
        query.category = findCategory._id;
      }
    }
    console.log(query);
    const curPage = page ? parseInt(page) : 1;
    const limit = 12;
    const skip = (curPage - 1) * limit;
    const totalProducts = await productModel.countDocuments(query);
    const products = await productModel
      .find(query)
      .populate('category')
      // .populate('specifications')
      .populate('coupon')
      .sort(sortItem)
      .skip(skip)
      .limit(limit);
    const totalPage = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      error: false,
      success: true,
      products: products,
      totalProducts: totalProducts,
      totalPage: totalPage,
      curPage: curPage,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const getProductDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await productModel
      .findById(id)
      .populate('category')
      // .populate('specifications');
      .populate('coupon');
    if (product)
      return res
        .status(200)
        .json({ error: false, success: true, product: product });
    return res.status(404).json({
      error: true,
      success: false,
      message: 'No products found',
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const createProduct = async (req, res) => {
  const user = req.decoded;
  const {
    name,
    description,
    price,
    quantity,
    category,
    status,
    specifications,
    questions,
  } = req.body;
  const files = req.files;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    if (
      !name ||
      !description ||
      !price ||
      !quantity ||
      !category ||
      !status ||
      !files.length
    )
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Name, image, description, price, quantity, category and status required!',
      });
    if (Number(quantity) < 0 || Number(price) < 0) {
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Quantity cannot be less than 0!',
      });
    }
    const existedProduct = await productModel.findOne({ name: name });
    if (existedProduct)
      return res
        .status(409)
        .json({ error: true, success: false, message: 'Product existed!' });
    const images = files.map(async (file) => {
      return {
        name: file.filename,
        url: file.path,
      };
    });
    const imageUrls = await Promise.all(images);
    const product = {
      name: name,
      description: description,
      price: Number(price),
      availableQuantity: Number(quantity),
      quantity: Number(quantity),
      category: category,
      status: status,
      specifications: specifications ? JSON.parse(specifications) : [],
      questions: questions ? JSON.parse(questions) : [],
      images: imageUrls,
    };
    const createdProduct = await productModel.create(product);
    if (createdProduct)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Product created successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
function filterDifferentElements(arr1, arr2) {
  // Lọc ra các phần tử mà không có trong mảng thứ hai
  let differentElements = arr1.filter(
    (obj1) =>
      !arr2.some((obj2) => obj2.name === obj1.name && obj2.value === obj1.value)
  );

  // Lọc ra các phần tử mà không có trong mảng thứ nhất
  differentElements = differentElements.concat(
    arr2.filter(
      (obj2) =>
        !arr1.some(
          (obj1) => obj1.name === obj2.name && obj1.value === obj2.value
        )
    )
  );

  return differentElements;
}
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const user = req.decoded;
  const {
    name,
    description,
    price,
    quantity,
    oldQuantity,
    availableQuantity,
    category,
    status,
    oldImages,
    editImages,
    specifications,
    questions,
  } = req.body;
  const files = req.files;
  try {
    if (user?.role?.value !== 1) {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Bạn không đủ quyền!',
      });
    }

    if (!name || !description || !price || !quantity || !category || !status) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Name, image, description, price, quantity, category and status required!',
      });
    }
    if (Number(quantity) < 0 || Number(price) < 0) {
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Price and quantity cannot be negative!',
      });
    }
    // if (
    //   Number(quantity) < Number(availableQuantity) &&
    //   Number(oldQuantity) !== Number(quantity)
    // ) {
    //   return res.status(409).json({
    //     error: true,
    //     success: false,
    //     message:
    //       'Số lượng tồn kho sau khi thay đổi không thể nhỏ hơn số lượng khả dụng',
    //   });
    // }
    if (JSON.parse(editImages).length === 0 && files.length === 0) {
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Image cannot be blank!',
      });
    }
    const errorTerm = Number(quantity) - Number(oldQuantity);
    const validAvailableQuantity =
      Number(availableQuantity) + Number(errorTerm);
    if (validAvailableQuantity <= 0) {
      return res.status(409).json({
        error: true,
        success: false,
        message:
          'Updated quantity cannot be 0 or less!',
      });
    }
    const product = {
      name: name,
      description: description,
      price: Number(price),
      quantity: Number(quantity),
      availableQuantity: validAvailableQuantity,
      category: category,
      status: status,
      specifications: specifications ? JSON.parse(specifications) : [],
      questions: questions ? JSON.parse(questions) : [],
      updated_at: Date.now(),
    };

    const filterImages = filterDifferentElements(
      JSON.parse(oldImages),
      JSON.parse(editImages)
    );
    for (const image of filterImages) {
      await deleteImage(image.url);
    }

    if (files.length) {
      const newImages = await Promise.all(
        files.map(async (file) => ({
          name: file.filename,
          url: file.path,
        }))
      );
      product.images = [...JSON.parse(editImages), ...newImages];
    } else {
      product.images = [...JSON.parse(editImages)];
    }

    const updatedProduct = await productModel.findByIdAndUpdate(id, product, {
      new: true,
    });

    if (updatedProduct) {
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Product updated successfully!',
        data: updatedProduct,
      });
    } else {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'No products found',
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

export const deleteProduct = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    const deletedProduct = await productModel.findByIdAndDelete(id);
    if (deletedProduct) {
      const images = deletedProduct.images.map(async (img) => {
        return await deleteImage(img.url);
      });
      await Promise.all(images);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Product deleted successfully!',
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
