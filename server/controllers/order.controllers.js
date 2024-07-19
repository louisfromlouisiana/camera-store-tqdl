import { payOs } from '../config/payos.js';
import { vnpay } from '../config/vnpay.js';
import { cartModel } from '../models/cart.model.js';
import { orderModel } from '../models/orders.model.js';
import { productModel } from '../models/product.model.js';
import { voucherModel } from '../models/voucher.model.js';
import { verifiedAccount } from '../utils/validate.js';
import Qs from 'qs';
import crypto from 'crypto';
import moment from 'moment';
import { sendNotificationWhenOrder } from '../utils/email.js';
const updateQuantityProduct = async (products, req, res) => {
  for (const p of products) {
    const availableProduct = await productModel.findById(p.product);
    if (availableProduct?.availableQuantity < p.quantity) {
      return res.status(409).json({
        error: true,
        success: false,
        message: `${p.product} has been bought by others or not having enough quanity!`,
      });
    }
    await productModel.findByIdAndUpdate(p.product, {
      $inc: { availableQuantity: -p.quantity },
    });
  }
};
const updateCartAfterPayment = async (user, products) => {
  try {
    for (let product of products) {
      await cartModel.findOneAndUpdate(
        { user: user._id },
        {
          $pull: { products: { _id: product._id } },
          $inc: { totalPrice: -(product?.quantity * product?.product?.price) },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error('Error updating cart:', error);
  }
};
export const createPaymentCOD = async (req, res) => {
  const user = req.decoded;
  const {
    phone,
    message,
    address,
    products,
    totalPrice,
    discount,
    rateFromProvince,
    voucher,
  } = req.body;
  let orderCode = Number(String(Date.now()).slice(-6));
  const amount = Math.round(
    Number(totalPrice) - Number(discount) + Number(rateFromProvince)
  );
  try {
    if (user?.role?.value !== 0)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'This feature is only for user!',
      });
    if (!phone || !address || !products.length || !totalPrice)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Phone number, address required and product must be selected!',
      });
    const isVerified = await verifiedAccount(req, res, user);
    if (isVerified) return;
    const order = {
      user: user._id,
      products: products,
      paymentMethod: 'cod',
      paymentInfo: {
        orderCode: orderCode,
      },
      message: message,
      address: address,
      phone: Number(phone),
      discount: Number(discount),
      originPrice: Number(totalPrice),
      rateFromProvince: Number(rateFromProvince),
      totalPrice: amount,
    };
    const createdOrder = await orderModel.create(order);
    if (createdOrder) {
      await Promise.allSettled([
        sendNotificationWhenOrder(
          user?.email,
          createdOrder,
          `You have just placed an order, code ${createdOrder?.paymentInfo?.orderCode}`
        ),
        updateQuantityProduct(products, req, res),
      ]);
      if (voucher) {
        await voucherModel.findByIdAndUpdate(
          voucher,
          {
            $inc: {
              quantity: -1,
            },
          },
          {
            new: true,
          }
        );
      }
      await updateCartAfterPayment(user, products);
      return res
        .status(200)
        .json({ error: false, success: true, order: createdOrder });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}
export const createPaymentVNPAY = async (req, res) => {
  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss');
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  const user = req.decoded;
  let tmnCode = vnpay.vnp_TmnCode;
  let secretKey = vnpay.vnp_HashSecret;
  let vnpUrl = vnpay.vnp_Url;
  let returnUrl = vnpay.vnp_ReturnUrl;
  let orderCode = Number(String(Date.now()).slice(-6));
  let ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  const {
    phone,
    message,
    address,
    products,
    totalPrice,
    discount,
    rateFromProvince,
    voucher,
  } = req.body;
  const amount = Math.round(
    Number(totalPrice) - Number(discount) + Number(rateFromProvince)
  );
  try {
    if (user?.role?.value !== 0)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'This feature is only for user!',
      });
    if (!phone || !address || !products.length || !totalPrice)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Phone number, address required and product must be selected!',
      });
    const isVerified = await verifiedAccount(req, res, user);
    if (isVerified) return;
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderCode;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho hoa don:' + orderCode;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    // if (bankCode !== null && bankCode !== '') {
    //   vnp_Params['vnp_BankCode'] = bankCode;
    // }

    vnp_Params = sortObject(vnp_Params);
    let signData = Qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + Qs.stringify(vnp_Params, { encode: false });
    const order = {
      user: user._id,
      products: products,
      paymentMethod: 'vnpay',
      paymentInfo: {
        ...vnp_Params,
        orderCode: orderCode,
        vnpUrl: vnpUrl,
      },
      message: message,
      address: address,
      phone: Number(phone),
      discount: Number(discount),
      originPrice: Number(totalPrice),
      rateFromProvince: Number(rateFromProvince),
      totalPrice: amount,
    };
    const createdOrder = await orderModel.create(order);
    if (createdOrder) {
      await Promise.allSettled([
        sendNotificationWhenOrder(
          user?.email,
          createdOrder,
          `You have just placed an order, code ${createdOrder?.paymentInfo?.orderCode}`
        ),
        updateQuantityProduct(products, req, res),
      ]);
      if (voucher) {
        await voucherModel.findByIdAndUpdate(
          voucher,
          {
            $inc: {
              quantity: -1,
            },
          },
          {
            new: true,
          }
        );
      }
      await updateCartAfterPayment(user, products);
      return res
        .status(200)
        .json({ error: false, success: true, vnpay_url: vnpUrl });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
const responseCodeVNPAY = [
  {
    code: '00',
    message: 'Transaction completed',
    error: false,
    success: true,
  },
  {
    code: '01',
    message: 'Transaction uncompleted',
    error: true,
    success: false,
  },
  {
    code: '02',
    message: 'Transaction failed',
    error: true,
    success: false,
  },
  {
    code: '04',
    message:
      'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
    error: true,
    success: false,
  },
  {
    code: '05',
    message: 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
    error: true,
    success: false,
  },
  {
    code: '06',
    message: 'CVNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
    error: true,
    success: false,
  },
  {
    code: '07',
    message: 'Giao dịch bị nghi ngờ gian lận',
    error: true,
    success: false,
  },
  {
    code: '09',
    message: 'GD Hoàn trả bị từ chối',
    error: true,
    success: false,
  },
];
export const queryDrVnpay = async (req, res) => {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  const { vnp_TransactionDate, vnp_TxnRef } = req.query;
  try {
    if (vnp_TransactionDate && vnp_TxnRef) {
      let date = new Date();
      let vnp_TmnCode = vnpay.vnp_TmnCode;
      let secretKey = vnpay.vnp_HashSecret;
      let vnp_Api = vnpay.vnp_Api;
      let vnp_Version = '2.1.0';
      let vnp_RequestId = moment(date).format('HHmmss');
      let vnp_Command = 'querydr';
      let vnp_OrderInfo = 'Truy van hoa don:' + vnp_TxnRef;
      let vnp_IpAddr =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      let currCode = 'VND';
      let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
      let data =
        vnp_RequestId +
        '|' +
        vnp_Version +
        '|' +
        vnp_Command +
        '|' +
        vnp_TmnCode +
        '|' +
        vnp_TxnRef +
        '|' +
        vnp_TransactionDate +
        '|' +
        vnp_CreateDate +
        '|' +
        vnp_IpAddr +
        '|' +
        vnp_OrderInfo;

      let hmac = crypto.createHmac('sha512', secretKey);
      let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest('hex');
      let dataObj = {
        vnp_RequestId: vnp_RequestId,
        vnp_Version: vnp_Version,
        vnp_Command: vnp_Command,
        vnp_TmnCode: vnp_TmnCode,
        vnp_TxnRef: vnp_TxnRef,
        vnp_OrderInfo: vnp_OrderInfo,
        vnp_TransactionDate: vnp_TransactionDate,
        vnp_CreateDate: vnp_CreateDate,
        vnp_IpAddr: vnp_IpAddr,
        vnp_SecureHash: vnp_SecureHash,
      };
      const fetchData = async (req, res) => {
        const response = await fetch(vnp_Api, {
          method: 'POST',
          body: JSON.stringify(dataObj),
        });
        const data = await response.json();
        const curResponse = responseCodeVNPAY.find(
          (c) => c.code === data.vnp_TransactionStatus
        );
        if (curResponse) return res.status(200).json({ ...curResponse });
        return res.status(500).json({
          error: true,
          success: false,
          message: 'Something went wrong!',
        });
      };
      await fetchData(req, res);
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const updateOrderByUser = async (req, res) => {
  const user = req.decoded;
  const { orderId } = req.params;
  const { status, isPaid } = req.body;
  try {
    const isVerified = await verifiedAccount(req, res, user);
    if (isVerified) return;
    if (status === 'processing' || status === 'delivered')
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Only admin can choose this status!',
      });
    const curOrder = await orderModel.findOne({
      user: user._id,
      'paymentInfo.orderCode': Number(orderId),
    });
    if (!curOrder)
      return res.status(404).json({
        error: true,
        success: false,
        message: 'No orders found!',
      });
    if (
      curOrder.isPaid &&
      (isPaid === 'false' || isPaid === false) &&
      status === 'pending'
    )
      return res.status(409).json({
        error: true,
        success: false,
        message: 'You have already updated this order!',
      });
    if (curOrder.isProcessing && status === 'cancel')
      return res.status(409).json({
        error: true,
        success: false,
        message: 'You cannot cancel processed order',
      });
    if (curOrder) {
      const updatedOrder = await orderModel.findOneAndUpdate(
        {
          user: user._id,
          'paymentInfo.orderCode': Number(orderId),
        },
        {
          isPaid: isPaid ? isPaid : false,
          'paymentInfo.status': status,
          updated_at: Date.now(),
          received_at: status === 'received' ? Date.now() : null,
        },
        { new: true }
      );
      if (status === 'cancel' && updatedOrder.paymentInfo === 'payos') {
        await payOs.cancelPaymentLink(orderId, status.cancellationReason);
      }
      if (status === 'delivered') {
        const productUpdates = updatedOrder.products.map(async (p) => {
          await productModel.findOneAndUpdate(
            {
              _id: p.id,
            },
            {
              $inc: {
                quantity: -p.quantity,
              },
            },
            { new: true }
          );
        });
        await Promise.all([productUpdates, ,]);
      }
      return res.status(200).json({
        error: false,
        success: true,
        message: `Order updated successfully!`,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
export const updateOrderByAdmin = async (req, res) => {
  const { orderId } = req.params;
  const { status, userId } = req.body;
  try {
    const curOrder = await orderModel.findOne({
      'paymentInfo.orderCode': Number(orderId),
    });
    if (
      curOrder?.paymentMethod === 'vnpay' &&
      curOrder?.paymentInfo?.status === 'pending' &&
      !curOrder.isPaid
    ) {
      return res.status(409).json({
        error: true,
        success: false,
        message: 'User need to pay this order!',
      });
    }
    if (status === 'pending')
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Cannot change status to pending!',
      });
    if (curOrder.paymentInfo.status === 'cancel')
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Order cancelled!',
      });
    if (curOrder.paymentInfo.status === 'received')
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Order already received!',
      });
    if (status === 'received')
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Only user can choose this status!',
      });
    const updatedOrder = await orderModel
      .findOneAndUpdate(
        {
          user: userId,
          'paymentInfo.orderCode': Number(orderId),
        },
        {
          isProcessing: true,
          'paymentInfo.status': status,
          updated_at: Date.now(),
        },
        { new: true }
      )
      .populate('user', '_id email username');
    if (updatedOrder) {
      if (updatedOrder.paymentInfo.status === 'delivered') {
        await sendNotificationWhenOrder(
          updatedOrder.user?.email,
          updatedOrder,
          `Your order number ${orderId} has been delivered`
        );
      }
      return res.status(200).json({
        error: false,
        success: true,
        message: `Order updated successfully!`,
      });
    }
  } catch (error) {}
};
export const getOrderFormAdmin = async (req, res) => {
  const user = req.decoded;
  const { page, status } = req.query;
  const curPage = page ? Number(page) : 1;
  const query = {};
  try {
    if (user?.role?.value !== 1)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'Bạn không đủ quyền!' });
    if (status !== '' && status !== 'null' && status !== null) {
      query['paymentInfo.status'] = status;
    }
    const totalProducts = await orderModel.countDocuments(query);
    const orders = await orderModel
      .find(query)
      .populate('user', '_id name email')
      .populate('products.product', '_id name quantity price')
      .skip((curPage - 1) * 10)
      .limit(10)
      .sort({ created_at: -1 });
    return res.status(200).json({
      error: false,
      success: true,
      orders: orders,
      curPage: curPage,
      totalPage: Math.ceil(totalProducts / 10),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const getOrdersFromUser = async (req, res) => {
  const user = req.decoded;
  const { page, status } = req.query;
  const query = {
    user: user._id,
  };
  const curPage = page ? Number(page) : 1;
  try {
    if (status !== '' && status !== 'null' && status !== null) {
      query['paymentInfo.status'] = status;
    }
    const isVerified = await verifiedAccount(req, res, user);
    if (isVerified) return;
    const totalOrders = await orderModel.countDocuments(query);
    const orders = await orderModel
      .find(query)
      .populate('user', '_id name email')
      .populate('products.product', '_id name quantity price')
      .skip((curPage - 1) * 10)
      .limit(10)
      .sort({ created_at: -1 });
    return res.status(200).json({
      error: false,
      success: true,
      orders: orders,
      curPage: curPage,
      totalPage: Math.ceil(totalOrders / 10),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  const user = req.decoded;
  const { orderId } = req.params;
  try {
    if (user?.role?.value === 1) {
      const order = await orderModel
        .findOne({ 'paymentInfo.orderCode': orderId })
        .populate('user', '_id name email')
        .populate('products.product', '_id name quantity price');
      if (order)
        return res
          .status(200)
          .json({ error: false, success: true, order: order });
    }
    if (user?.role?.value === 0) {
      const order = await orderModel
        .findOne({ user: user._id, 'paymentInfo.orderCode': orderId })
        .populate('user', '_id name email')
        .populate('products.product', '_id name quantity price');
      if (order)
        return res
          .status(200)
          .json({ error: false, success: true, order: order });
    }

    return res.status(404).json({
      error: true,
      success: false,
      message: `Order ${orderId} not found!`,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
