import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for your goal'],
    trim: true,
    maxlength: [50, 'Title cannot be more than 50 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please provide a target amount'],
    min: [1, 'Target amount must be greater than 0']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide a target deadline']
  },
  color: {
    type: String,
    default: '#4f46e5' // default indigo-600
  },
  icon: {
    type: String,
    default: '🎯'
  }
}, {
  timestamps: true
});

export default mongoose.model('Goal', goalSchema);
