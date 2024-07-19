import mongoose from 'mongoose';
const provincesSchema = new mongoose.Schema({
  name: String,
  slug: String,
  type: String,
  name_with_type: String,
  code: String,
  rate: Number,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  unaccentedName: String,
});
provincesSchema.index({ name: 'text', code: 1, unaccentedName: 1 });

export const provincesModel = mongoose.model('provinces', provincesSchema);
