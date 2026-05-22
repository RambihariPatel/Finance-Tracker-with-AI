import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { convertAmount } from '../services/currencyService.js';

// @desc    Get all subscriptions for user
// @route   GET /api/subscriptions
// @access  Private
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.userId }).sort({ nextDueDate: 1 });
    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new subscription
// @route   POST /api/subscriptions
// @access  Private
export const createSubscription = async (req, res) => {
  try {
    const { title, amount, currency, category, frequency, nextDueDate } = req.body;
    
    const user = await User.findById(req.userId);
    const baseCurrency = user.baseCurrency || 'INR';
    
    const baseAmount = await convertAmount(amount, currency || 'INR', baseCurrency);

    const subscription = await Subscription.create({
      userId: req.userId,
      title,
      amount,
      currency: currency || 'INR',
      baseAmount,
      category,
      frequency,
      nextDueDate
    });

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
export const updateSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.userId.toString() !== req.userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { title, amount, currency, category, frequency, nextDueDate, status } = req.body;
    
    // Recalculate baseAmount if amount or currency changed
    let newBaseAmount = subscription.baseAmount;
    if (amount !== subscription.amount || currency !== subscription.currency) {
      const user = await User.findById(req.userId);
      newBaseAmount = await convertAmount(amount || subscription.amount, currency || subscription.currency, user.baseCurrency || 'INR');
    }

    subscription = await Subscription.findByIdAndUpdate(req.params.id, {
      title,
      amount,
      currency,
      baseAmount: newBaseAmount,
      category,
      frequency,
      nextDueDate,
      status
    }, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
export const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.userId.toString() !== req.userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await subscription.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Manually pay a subscription
// @route   POST /api/subscriptions/:id/pay
// @access  Private
export const paySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.userId.toString() !== req.userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findById(req.userId);
    const liveBaseAmount = await convertAmount(subscription.amount, subscription.currency, user.baseCurrency || 'INR');

    // 1. Create the transaction
    await Transaction.create({
      userId: req.userId,
      type: 'expense',
      title: `[Manual Pay] ${subscription.title}`,
      amount: subscription.amount,
      currency: subscription.currency,
      baseAmount: liveBaseAmount,
      category: subscription.category,
      paymentMethod: 'other',
      description: `Manual payment for ${subscription.frequency} subscription.`,
      transactionDate: new Date()
    });

    // 2. Calculate next due date
    const today = new Date();
    today.setHours(0,0,0,0);
    let nextDate = new Date(subscription.nextDueDate);

    // Fast forward to next future date
    do {
      if (subscription.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (subscription.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (subscription.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
    } while (nextDate <= today);

    // 3. Update subscription
    subscription.nextDueDate = nextDate;
    subscription.baseAmount = liveBaseAmount;
    subscription.lastPaidDate = new Date();
    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
