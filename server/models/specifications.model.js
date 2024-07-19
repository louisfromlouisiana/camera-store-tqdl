import mongoose from 'mongoose';
const specificationSchema = new mongoose.Schema({
  SKU: {
    type: String,
    uppercase: true,
  },
  name: String,
  value: String,
  image: {
    name: String,
    url: String,
  },
  isSell: Boolean,
  price: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
});
specificationSchema.indexes({ SKU: 1 });
export const specificationModel = mongoose.model(
  'specifications',
  specificationSchema
);
