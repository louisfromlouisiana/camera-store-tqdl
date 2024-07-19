import mongoose from 'mongoose';
const userAddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
  },
  province: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'provinces',
  },
  district: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'districts',
  },
  ward: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'wards',
  },
  address: String,
  phone: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
});
userAddressSchema.indexes({ user: 1 });
userAddressSchema.indexes({ user: 1, isDefault: 1 });
export const userAddressModel = mongoose.model(
  'useraddress',
  userAddressSchema
);
