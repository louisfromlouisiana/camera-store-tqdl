import { chatModel } from '../models/chat.model.js';
import { newestMessageModel } from '../models/newestMessage.model.js';
export const getChatFormUser = async (req, res) => {
  const user = req.decoded;
  try {
    const chat = await chatModel
      .find({
        sender: user._id,
      })
      .sort({ created_at: 1 });
    return res.status(200).json(chat);
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
// only for admin
export const getNewestChatFromAdmin = async (req, res) => {
  const user = req.decoded;
  const { page } = req.query;
  const curPage = page ? Number(page) : 1;
  try {
    if (user?.role?.value !== 1)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Bạn không đủ quyền!',
      });
    const totalChats = await newestMessageModel.countDocuments({
      receiver: user._id,
    });
    const chat = await newestMessageModel
      .find({
        receiver: user._id,
      })
      .populate('sender', '_id email name image')
      .sort({ updated_at: 1 })
      .skip((curPage - 1) * 10)
      .limit(10);
    return res
      .status(200)
      .json({ messages: chat, totalPage: Math.ceil(totalChats / 10) });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const getChatDetailsFromAdmin = async (req, res) => {
  const user = req.decoded;
  const { senderId } = req.params;
  try {
    if (user?.role?.value !== 1)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Bạn không đủ quyền!',
      });
    const chat = await chatModel
      .find({
        sender: senderId,
        receiver: user._id,
      })
      .populate('sender', '_id email username image')
      .sort({ updated_at: -1 });
    if (chat) return res.status(200).json(chat);
    return res.status(404).json({ message: 'Not found user!' });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  const user = req.decoded;
  const { senderId } = req.params;
  try {
    if (user?.role?.value !== 1)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Bạn không đủ quyền!',
      });
    await Promise.all([
      chatModel.deleteMany({ sender: senderId, receiver: user?._id }),
      newestMessageModel.deleteOne({ sender: senderId, receiver: user?._id }),
    ]);
    return res.status(200).json({ message: 'End chat successfully!' });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
