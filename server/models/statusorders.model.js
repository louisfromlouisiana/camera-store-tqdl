import mongoose from 'mongoose';

const statusOrdersSchema = new mongoose.Schema({
  name: String,
  value: Number,
  backgroundColor: String,
  color: String,
  validRole: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'roles',
  },
  order: Number,
});

statusOrdersSchema.indexes({ value: 1, validRole: 1 });
export const statusOrdersModel = mongoose.model(
  'statusorders',
  statusOrdersSchema
);
