import { statusOrdersModel } from '../models/statusorders.model.js';

export const getStatusOrders = async (req, res) => {
  try {
    const statusorders = await statusOrdersModel
      .find()
      .sort({ order: 1 })
      .lean();
    return res
      .status(200)
      .json({ error: false, success: true, statusorders: statusorders });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
