import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  id: String || Number,
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'categories',
  },
  discount: Number,
  minPrice: Number,
  maxDiscount: Number,
  image: {
    name: String,
    url: String,
  },
  start_date: Date,
  end_date: Date,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  expired: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Finished'],
    default: 'Not Started',
  },
});
couponSchema.indexes({ name: 1 });
couponSchema.indexes({ category: 1 });
couponSchema.indexes({ id: 1 });

export const couponModel = mongoose.model('coupons', couponSchema);
