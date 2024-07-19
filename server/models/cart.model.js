import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'products',
      },
      quantity: Number,
    },
  ],
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
  },
  totalPrice: Number,
});
cartSchema.indexes({ user: 1 });

export const cartModel = mongoose.model('carts', cartSchema);
