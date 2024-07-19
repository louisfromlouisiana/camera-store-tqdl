import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: String,
  value: Number,
});

roleSchema.indexes({ value: Number });

export const roleModel = mongoose.model('roles', roleSchema);
