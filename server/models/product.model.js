import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    availableQuantity: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'categories',
    },
    coupon:
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'coupons',
        default: null,
      } || null,
    images: [
      {
        name: String,
        url: String,
      },
    ],
    // specifications:
    //   [
    //     {
    //       type: mongoose.SchemaTypes.ObjectId,
    //       ref: 'specifications',
    //     },
    //   ] || [],
    specifications:
      [
        {
          name: String,
          value: String,
        },
      ] || [],
    questions:
      [
        {
          title: String,
          answer: String,
        },
      ] || [],
    status: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return ['active', 'disabled'].includes(value);
        },
        message: (props) =>
          `${props.value} is not a valid status. Status must be either 'active' or 'disabled'.`,
      },
    },
    created_at: {
      type: Date,
      default: () => Date.now(),
    },
    updated_at: {
      type: Date,
      default: () => Date.now(),
    },
  },
  { timestamps: true }
);

export const productModel = mongoose.model('products', productSchema);
