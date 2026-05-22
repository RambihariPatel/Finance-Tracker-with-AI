import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Subscription from '../models/Subscription.js';
import { summarizeTransactions } from '../services/financeAnalyzer.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ transactionDate: -1 });
    const budget = await Budget.findOne({ userId: req.userId });
    const summary = summarizeTransactions(transactions, budget);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const upcomingBills = await Subscription.find({
      userId: req.userId,
      status: 'active',
      nextDueDate: { $gte: today, $lte: nextWeek }
    }).sort({ nextDueDate: 1 });

    const projectedBalance = summary.savings - upcomingBills.reduce((acc, sub) => acc + sub.baseAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        savings: summary.savings,
        budgetRemaining: summary.budgetRemaining,
        monthlyTrend: summary.monthlyTrend,
        categoryBreakdown: summary.categoryBreakdown,
        categoryBudgets: summary.categoryBudgets,
        upcomingBills,
        projectedBalance,
        recentTransactions: transactions.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};