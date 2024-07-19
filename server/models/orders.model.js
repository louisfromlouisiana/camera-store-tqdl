import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'products',
      },
      isReviews: {
        type: Boolean,
        default: false,
      },
      quantity: Number,
    },
  ],
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
  },
  paymentMethod: String,
  isPaid: {
    type: Boolean,
    default: false,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
  paymentInfo: {
    vnp_Version: {
      type: String,
      default: null,
    },
    vnp_Command: {
      type: String,
      default: null,
    },
    vnp_TmnCode: {
      type: String,
      default: null,
    },
    vnp_Amount: Number,
    vnp_Locale: {
      type: String,
      default: null,
    },
    orderCode: Number,
    vnp_CurrCode: {
      type: String,
      default: 'VND',
    },
    vnp_OrderInfo: {
      type: String,
      default: null,
    },
    vnp_TxnRef: {
      type: String,
      default: null,
    },
    vnp_OrderType: {
      type: String,
      default: null,
    },
    vnp_ReturnUrl: {
      type: String,
      default: null,
    },
    vnp_IpAddr: {
      type: String,
      default: null,
    },
    vnp_CreateDate: {
      type: Number || String,
    },
    vnpUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: 'pending',
      lowercase: true,
    },
  },
  message: String,
  address: String,
  phone: Number,
  discount: Number,
  originPrice: Number,
  rateFromProvince: Number,
  totalPrice: Number,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
  received_at: {
    type: Date,
    default: null,
  },
});

orderSchema.indexes({ 'paymentInfo.orderCode': 1 });
orderSchema.indexes({ user: 1 });
orderSchema.indexes({ user: 1, 'paymentInfo.orderCode': 1 });
orderSchema.indexes({
  user: 1,
  'paymentInfo.paymentMethod': 1,
  'paymentInfo.orderCode': 1,
});
orderSchema.indexes({
  user: 1,
  isProcessing: 1,
  'paymentInfo.orderCode': 1,
});
orderSchema.indexes({
  user: 1,
  isProcessing: 1,
  'paymentInfo.paymentMethod': 1,
  'paymentInfo.orderCode': 1,
});
export const orderModel = mongoose.model('orders', orderSchema);
