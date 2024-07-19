import { useremailsModel } from '../models/useremail.model.js';
import { validateEmail } from '../utils/validate.js';
import { replyEmail } from '../utils/email.js';
import unidecode from 'unidecode';
const unValidValue = ['', null, 'null', 0, '0'];
export const getAllUserEmails = async (req, res) => {
  const user = req.decoded;
  const { page, search } = req.query;
  const curPage = page ? Number(page) : 1;
  let query = {};
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    if (search && search.trim() !== '' && !unValidValue.includes(search)) {
      const unaccentedQueryString = unidecode(search);
      const regex = new RegExp(unaccentedQueryString, 'i');
      query.email = regex;
    }
    const totalList = await useremailsModel.countDocuments(query);
    const list = await useremailsModel
      .find(query)
      .sort({ created_at: -1 })
      .skip((curPage - 1) * 10)
      .limit(10);
    return res.status(200).json({
      error: false,
      success: true,
      users: list,
      totalPage: Math.ceil(totalList / 10),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const getUserEmailDetails = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    const email = await useremailsModel.findById(id);
    if (email)
      return res.status(200).json({
        error: false,
        success: true,
        user: email,
      });
    return res.status(404).json({
      error: true,
      success: false,
      message: 'Not found!',
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const postUserEmail = async (req, res) => {
  const { email, message } = req.body;
  try {
    if (!email)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Email required!',
      });
    if (!validateEmail(email))
      return res
        .status(409)
        .json({ error: true, success: false, message: 'Email invalid!' });
    const createdEmail = await useremailsModel.create({
      email: email,
      message: message,
    });
    if (createdEmail)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'We will respond as soon as possible!',
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const replyEmailFromUser = async (req, res) => {
  const user = req.decoded;
  const { content, email, id } = req.body;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    if (content === '' || content === null)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Content required!',
      });
    const response = await replyEmail(email, content);
    if (response.error)
      return res.status(500).json({
        error: true,
        success: false,
        message: 'Error when responding email!',
      });
    if (response.success) {
      await useremailsModel.findOneAndUpdate(
        { _id: id, email: email },
        { isReply: true },
        { new: true }
      );
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Responded successfully!',
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
