import mongoose from 'mongoose';

const newestMessage = new mongoose.Schema({
  sender: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
  },
  receiver: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
  },
  content: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  lastSent: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export const newestMessageModel = mongoose.model(
  'newestmessages',
  newestMessage
);
