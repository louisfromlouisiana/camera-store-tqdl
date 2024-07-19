import mongoose from 'mongoose';
const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
  },
  products: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'products',
    },
  ],
});

favoriteSchema.indexes({ user: 1 });

export const favoriteModel = mongoose.model('favorites', favoriteSchema);
