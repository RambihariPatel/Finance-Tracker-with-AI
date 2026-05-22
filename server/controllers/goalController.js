import Goal from '../models/Goal.js';
import { convertAmount } from '../services/currencyService.js';
import User from '../models/User.js';

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline, color, icon } = req.body;
    
    // Create goal
    const goal = await Goal.create({
      userId: req.userId,
      title,
      targetAmount,
      currentAmount: 0,
      deadline,
      color,
      icon
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update goal (for editing details)
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    // Make sure user owns goal
    if (goal.userId.toString() !== req.userId) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this goal' });
    }

    const { title, targetAmount, deadline, color, icon } = req.body;

    goal = await Goal.findByIdAndUpdate(req.params.id, {
      title,
      targetAmount,
      deadline,
      color,
      icon
    }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add funds to goal
// @route   POST /api/goals/:id/add-funds
// @access  Private
export const addFundsToGoal = async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    // Make sure user owns goal
    if (goal.userId.toString() !== req.userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    goal.currentAmount += Number(amount);
    await goal.save();

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
