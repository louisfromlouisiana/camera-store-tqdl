import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    name: String,
    url: String,
  },
  category: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'categories',
  },
});

bannerSchema.indexes({ title: 1 });
export const bannerModel = mongoose.model('banners', bannerSchema);
