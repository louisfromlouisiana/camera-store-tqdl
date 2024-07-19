import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  image: {
    name: {
      type: String,
      required: true,
    },
    url: { type: String, required: true },
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
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
categorySchema.indexes({ name: 1 });
export const categoryModel = mongoose.model('categories', categorySchema);
