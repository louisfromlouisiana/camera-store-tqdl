import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  name: {
    type: String,
    required: true,
    maxlength: 32,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    index: { unique: true },
    match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    name: {
      type: String,
      default: 'avatar_trang.jpg',
    },
    url: {
      type: String,
      default: 'public/avatar-trang.jpg',
    },
  },
  role: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'roles',
    required: true,
  },
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verify: {
    code: String,
    verified_at: Date || null,
    expired: Date,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  socketId: {
    type: String || null,
    default: null,
  },
});

userSchema.indexes({ _id: 1 });
userSchema.indexes({ email: 1 });

export const userModel = mongoose.model('users', userSchema);
