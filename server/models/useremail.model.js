import mongoose from 'mongoose';
const useremailsSchema = new mongoose.Schema({
  email: String,
  message: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  isReply: {
    type: Boolean,
    default: false,
  },
});
export const useremailsModel = mongoose.model('useremails', useremailsSchema);
