import { categoryModel } from '../models/category.model.js';
import { productModel } from '../models/product.model.js';
import { deleteImage } from '../utils/deleteImage.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    return res
      .status(200)
      .json({ error: false, success: true, categories: categories });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  const user = req.decoded;
  const { name, title, content } = req.body;
  const file = req.file;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    if (!name || !title || !content || !file)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Yêu cầu có tên, tiêu đề, nội dung và ảnh!',
      });
    const createdCategory = await categoryModel.create({
      name: name,
      title: title,
      content: content,
      image: {
        name: file.filename,
        url: file.path,
      },
    });
    if (createdCategory)
      return res.status(201).json({
        error: false,
        success: true,
        message: 'Category created successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  if (!id)
    return res.status(400).json({
      error: true,
      success: false,
      message: 'Không có id được truyền vào!',
    });
  const { name, oldImage, title, content } = req.body;
  const editImage = oldImage ? JSON.parse(oldImage) : null;
  const file = req.file;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    if (!name || !title || !content)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Name, title and content required!',
      });
    const category = {
      name: name,
      title: title,
      content: content,
      updated_at: Date.now(),
    };
    if (file) {
      await deleteImage(editImage?.url);
      category.image = {
        name: file.filename,
        url: file.path,
      };
    }
    const updatedCategory = await categoryModel.findByIdAndUpdate(id, {
      ...category,
      updated_at: Date.now(),
    });
    if (updatedCategory)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Category updated successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  if (!id)
    return res.status(400).json({
      error: true,
      success: false,
      message: 'Không có id được truyền vào!',
    });
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    const deletedProduct = await productModel.deleteMany({ category: id });
    const [promiseDeletedCategory, promiseDeletedProduct] = await Promise.all([
      deletedCategory,
      deletedProduct,
    ]);
    if (promiseDeletedCategory && promiseDeletedProduct)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Category and its products deleted successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
