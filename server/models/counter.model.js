import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: String,
  sequence_value: Number,
});
export const counterModel = mongoose.model('counters', counterSchema);
