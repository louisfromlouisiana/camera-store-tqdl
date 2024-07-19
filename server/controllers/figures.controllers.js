import { orderModel } from '../models/orders.model.js';
import { format } from 'date-fns';
const getFiguresWeekly = (startDate, endDate, data) => {
  const result = [];
  const allDates = data.reduce((acc, order) => {
    const index = acc.findIndex((item) => item._id === order._id);
    if (index !== -1) {
      acc[index].totalOrders += order.totalOrders;
    } else {
      acc.push(order);
    }
    return acc;
  }, []);
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const index = allDates.findIndex(
      (item) => item._id === format(new Date(date), 'yyyy-MM-dd')
    );
    result.push({
      _id: format(new Date(date), 'yyyy-MM-dd'),
      totalOrders: index !== -1 ? allDates[index].totalOrders : 0,
    });
  }
  return result;
};
export const getFigures = async (req, res) => {
  const user = req.decoded;
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    let today = new Date();
    let yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    let lastWeek = new Date(today);
    lastWeek.setDate(endDate.getDate() - 6);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const totalOrders = await orderModel.countDocuments();
    const pendingOrders = await orderModel.countDocuments({
      'paymentInfo.status': 'pending',
    });
    const processingOrders = await orderModel.countDocuments({
      $or: [
        {
          'paymentInfo.status': 'processing',
        },
        {
          'paymentInfo.status': 'delivering',
        },
      ],
    });
    const deliveredOrders = await orderModel.countDocuments({
      'paymentInfo.status': 'received',
    });
    const todayOrders = await orderModel.aggregate([
      {
        $match: {
          created_at: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lte: new Date(today.setHours(23, 59, 59, 999)),
          },
          'paymentInfo.status': 'received',
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: '$totalPrice' },
        },
      },
    ]);
    const yesterdayOrders = await orderModel.aggregate([
      {
        $match: {
          created_at: {
            $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
            $lte: new Date(yesterday.setHours(23, 59, 59, 999)),
          },
          'paymentInfo.status': 'received',
        },
      },
      {
        $group: {
          _id: null,
          yesterdayOrders: { $sum: '$totalPrice' },
        },
      },
    ]);
    const thisMonthOrders = await orderModel.aggregate([
      {
        $match: {
          created_at: {
            $gte: firstDayOfMonth,
            $lte: today,
          },
          'paymentInfo.status': 'received',
        },
      },
      {
        $group: {
          _id: null,
          thisMonthOrders: { $sum: '$totalPrice' },
        },
      },
    ]);
    const lastMonthOrders = await orderModel.aggregate([
      {
        $match: {
          created_at: {
            $gte: lastMonth,
            $lte: firstDayOfMonth,
          },
          'paymentInfo.status': 'received',
        },
      },
      {
        $group: {
          _id: null,
          lastMonthOrders: { $sum: '$totalPrice' },
        },
      },
    ]);
    const allSalesTime = await orderModel.aggregate([
      {
        $match: {
          'paymentInfo.status': 'received',
        },
      },
      {
        $group: {
          _id: null,
          allSalesTime: { $sum: '$totalPrice' },
        },
      },
    ]);
    const allDiscount = await orderModel.aggregate([
      {
        $match: {
          'paymentInfo.status': 'received',
          discount: {
            $gte: 0,
          },
        },
      },
      {
        $group: {
          _id: null,
          allDiscount: { $sum: '$discount' },
        },
      },
    ]);
    const weeklyOrders = await orderModel.aggregate([
      {
        $match: {
          created_at: {
            $gte: lastWeek,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    const bestSellingProducts = await orderModel.aggregate([
      {
        $match: {
          'paymentInfo.status': 'received',
        },
      },
      {
        $unwind: '$products',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $group: {
          _id: '$categoryInfo',
          total: { $sum: '$products.quantity' },
        },
      },
    ]);
    return res.status(200).json({
      error: false,
      success: true,
      totalOrders: totalOrders,
      pendingOrders: pendingOrders,
      processingOrders: processingOrders,
      deliveredOrders: deliveredOrders,
      todayOrders: todayOrders[0]?.totalOrders ? todayOrders[0].totalOrders : 0,
      yesterdayOrders: yesterdayOrders[0]?.yesterdayOrders
        ? yesterdayOrders[0].yesterdayOrders
        : 0,
      thisMonthOrders: thisMonthOrders[0]?.thisMonthOrders
        ? thisMonthOrders[0].thisMonthOrders
        : 0,
      lastMonthOrders: lastMonthOrders[0]?.lastMonthOrders
        ? lastMonthOrders[0].lastMonthOrders
        : 0,
      allSalesTime: allSalesTime[0]?.allSalesTime
        ? allSalesTime[0].allSalesTime
        : 0,
        allDiscount: allDiscount[0]?.allDiscount
        ? allDiscount[0].allDiscount
        : 0,
      weeklyOrders: getFiguresWeekly(lastWeek, endDate, weeklyOrders),
      bestSellingProducts: bestSellingProducts,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
