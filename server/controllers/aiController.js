import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { generateAIInsights, predictExpense } from '../services/aiService.js';
import User from '../models/User.js';

export const generateInsights = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    const budget = await Budget.findOne({ userId: req.userId });
    const user = await User.findById(req.userId);
    const result = await generateAIInsights({ transactions, budget, baseCurrency: user?.baseCurrency || 'INR' });

    res.status(200).json({
      success: true,
      data: result,
      insights: result.insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const predictSpending = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    const budget = await Budget.findOne({ userId: req.userId });
    const user = await User.findById(req.userId);
    const prediction = await predictExpense({ transactions, budget, baseCurrency: user?.baseCurrency || 'INR' });

    res.status(200).json({
      success: true,
      data: prediction,
      prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};