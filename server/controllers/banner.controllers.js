import { bannerModel } from '../models/banner.model.js';
import { deleteImage } from '../utils/deleteImage.js';

export const getBanners = async (req, res) => {
  try {
    const banners = await bannerModel.find().populate('category');
    return res
      .status(200)
      .json({ error: false, success: true, banners: banners });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const createBanner = async (req, res) => {
  const user = req.decoded;
  const { title, content, category } = req.body;
  const file = req.file;
  try {
    if (user?.role?.value !== 1)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Bạn không đủ quyền!',
      });
    if (!title || !content || !category || !file)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Title, content, category and image required!',
      });
    const existedBanner = await bannerModel.findOne({
      $or: [
        {
          title: title,
        },
        { category: category },
      ],
    });
    if (existedBanner)
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Title or category existed!',
      });
    const createdBanner = await bannerModel.create({
      title: title,
      content: content,
      category: category,
      image: { name: file.filename, url: file.path },
    });
    if (createdBanner)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Banner created successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const updateBanner = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  const { title, content, category, oldImage } = req.body;
  const parseImage = JSON.parse(oldImage);
  const file = req.file;
  try {
    if (user?.role?.value !== 1)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Bạn không đủ quyền!',
      });
    if (!title || !content || !category)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Title, content, category and image required!',
      });

    // const duplicatedBanner = await bannerModel.findOne({
    //   $or: [{ category: category }],
    // });
    // if (duplicatedBanner)
    //   return res.status(409).json({
    //     error: true,
    //     success: false,
    //     message: 'Không thể cập nhật 1 lúc có 2 category giống nhau!',
    //   });
    const banner = {
      title: title,
      content: content,
      category: category,
    };
    if (file) {
      await deleteImage(parseImage.url);
      banner.image = {
        name: file.filename,
        url: file.path,
      };
    }
    const updatedBanner = await bannerModel.findByIdAndUpdate(id, banner, {
      new: true,
    });
    if (updatedBanner)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Banner updated successfully!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  try {
    if (user?.role?.value !== 1)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Bạn không đủ quyền!',
      });
    const deletedBanner = await bannerModel.findByIdAndDelete(id);
    if (deletedBanner) {
      await deleteImage(deletedBanner.image.url);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Banner deleted successfully!',
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
