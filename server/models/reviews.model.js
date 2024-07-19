import mongoose from 'mongoose';
const reviewsSchema = new mongoose.Schema({
  product: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'products',
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
  },
  rate: Number,
  message: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  images: [
    {
      name: String,
      url: String,
    },
  ],
});

reviewsSchema.indexes({ product: 1 });

export const reviewsModel = mongoose.model('reviews', reviewsSchema);
