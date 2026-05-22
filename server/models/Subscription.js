import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for the subscription'],
    trim: true,
    maxlength: [50, 'Title cannot be more than 50 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide the subscription amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY']
  },
  baseAmount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    required: true
  },
  nextDueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused'],
    default: 'active'
  },
  lastPaidDate: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Subscription', subscriptionSchema);
