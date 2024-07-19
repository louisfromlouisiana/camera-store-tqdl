import mongoose from 'mongoose';
const voucherSchema = new mongoose.Schema({
  SKU: {
    type: String,
    uppercase: true,
  },
  description: String,
  discount: Number,
  maxDiscount: Number,
  minPrice: Number,
  quantity: Number,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});
voucherSchema.indexes({ SKU: 1 });
export const voucherModel = mongoose.model('vouchers', voucherSchema);
