import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  sender: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
  },
  receiver: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
  },
  sentBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
  },
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  content: String,
});

chatSchema.indexes({ sender: 1 });
chatSchema.indexes({ receiver: 1 });

export const chatModel = mongoose.model('chats', chatSchema);
