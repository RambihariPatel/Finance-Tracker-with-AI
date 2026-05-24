import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a group name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

groupSchema.index({ members: 1 });

export default mongoose.model('Group', groupSchema);
