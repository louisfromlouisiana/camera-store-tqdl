import mongoose from 'mongoose';
const faqsSchema = new mongoose.Schema({
  title: String,
  answer: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export const faqsModel = mongoose.model('faqs', faqsSchema);
