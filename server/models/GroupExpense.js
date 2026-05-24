import mongoose from 'mongoose';

const groupExpenseSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  category: {
    type: String,
    default: 'other'
  },
  splitType: {
    type: String,
    enum: ['equal', 'custom'],
    default: 'equal'
  },
  splits: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Split amount cannot be negative']
      }
    }
  ],
  isSettlement: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

groupExpenseSchema.index({ groupId: 1, date: -1 });

export default mongoose.model('GroupExpense', groupExpenseSchema);
