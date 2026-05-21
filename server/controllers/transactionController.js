import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import mongoose from 'mongoose';
import { convertAmount } from '../services/currencyService.js';

const checkBudgetAndNotify = async (userId) => {
  try {
    const budget = await Budget.findOne({ userId });
    if (!budget) return;

    const user = await User.findById(userId);
    if (!user) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          transactionDate: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenses = expenses.length > 0 ? expenses[0].totalAmount : 0;

    if (totalExpenses > budget.monthlyBudget) {
      const message = `Alert: Your total expenses for this month (₹${totalExpenses}) have exceeded your monthly budget (₹${budget.monthlyBudget}).`;
      await sendEmail({
        email: user.email,
        subject: 'Finance Tracker: Budget Exceeded Alert',
        message: message,
        htmlMessage: `<h3>Budget Alert</h3><p>${message}</p><p>Please review your expenses on your Finance Tracker Dashboard to stay on track!</p>`
      });
    }
  } catch (error) {
    console.error('Error in checkBudgetAndNotify:', error);
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { type, title, amount, currency, category, paymentMethod, description, transactionDate } = req.body;

    if (!type || !title?.trim() || amount === undefined || Number(amount) <= 0 || !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, title, amount greater than zero and category'
      });
    }

    const user = await User.findById(req.userId);
    const baseCurrency = user?.baseCurrency || 'INR';
    const txCurrency = currency || 'INR';
    const baseAmount = await convertAmount(Number(amount), txCurrency, baseCurrency);

    const transaction = await Transaction.create({
      userId: req.userId,
      type,
      title: title.trim(),
      amount: Number(amount),
      currency: txCurrency,
      baseAmount,
      category: category.trim(),
      paymentMethod,
      description: description?.trim(),
      transactionDate: transactionDate || new Date()
    });

    // Check budget if it's an expense
    if (type === 'expense') {
      await checkBudgetAndNotify(req.userId);
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, search, sort = 'latest' } = req.query;

    const query = { userId: req.userId };
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortMap = {
      latest: { transactionDate: -1 },
      oldest: { transactionDate: 1 },
      amount_desc: { amount: -1 },
      amount_asc: { amount: 1 }
    };

    const transactions = await Transaction.find(query)
      .sort(sortMap[sort] || sortMap.latest)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, amount, currency, category, paymentMethod, description, transactionDate } = req.body;

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be income or expense'
      });
    }
    
    const existingTx = await Transaction.findOne({ _id: id, userId: req.userId });
    if (!existingTx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const updatedAmount = amount !== undefined ? Number(amount) : existingTx.amount;
    const updatedCurrency = currency !== undefined ? currency : existingTx.currency;
    const user = await User.findById(req.userId);
    const baseCurrency = user?.baseCurrency || 'INR';
    const baseAmount = await convertAmount(updatedAmount, updatedCurrency, baseCurrency);

    const update = {
      ...(type && { type }),
      ...(title !== undefined && { title: title.trim() }),
      ...(amount !== undefined && { amount: Number(amount) }),
      ...(currency !== undefined && { currency }),
      baseAmount,
      ...(category !== undefined && { category: category.trim() }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(description !== undefined && { description: description?.trim() }),
      ...(transactionDate !== undefined && { transactionDate })
    };

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.userId },
      update,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check budget if the transaction type is/was expense
    if (transaction.type === 'expense') {
      await checkBudgetAndNotify(req.userId);
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};