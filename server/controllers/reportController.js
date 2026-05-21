import PDFDocument from 'pdfkit';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { summarizeTransactions } from '../services/financeAnalyzer.js';
import User from '../models/User.js';

const formatCurrencyPdf = (value, currencyCode = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(value || 0);
};

export const getMonthlyReport = async (req, res) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const transactions = await Transaction.find({
      userId: req.userId,
      transactionDate: { $gte: start, $lt: end }
    }).sort({ transactionDate: -1 });
    const budget = await Budget.findOne({ userId: req.userId });
    const user = await User.findById(req.userId);
    const baseCurrency = user?.baseCurrency || 'INR';
    const summary = summarizeTransactions(transactions, budget);

    const report = {
      period: `${year}-${String(month).padStart(2, '0')}`,
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      savings: summary.savings,
      budgetRemaining: summary.budgetRemaining,
      categoryBreakdown: summary.categoryBreakdown,
      monthlyTrend: summary.monthlyTrend,
      transactions
    };

    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=finance-report-${report.period}.pdf`);

      const doc = new PDFDocument({ margin: 48 });
      doc.pipe(res);
      doc.fontSize(22).text('FinTrack Monthly Report');
      doc.moveDown(0.5).fontSize(12).text(`Period:${report.period}`);
      doc.moveDown();
      doc.fontSize(14).text(`Income:${formatCurrencyPdf(report.totalIncome, baseCurrency)}`);
      doc.text(`Expense:${formatCurrencyPdf(report.totalExpense, baseCurrency)}`);
      doc.text(`Savings:${formatCurrencyPdf(report.savings, baseCurrency)}`);
      doc.text(`Budget Remaining:${formatCurrencyPdf(report.budgetRemaining, baseCurrency)}`);
      doc.moveDown().fontSize(16).text('Category Breakdown');
      report.categoryBreakdown.forEach((item) => {
        doc.fontSize(11).text(`${item.category}:${formatCurrencyPdf(item.amount, baseCurrency)}`);
      });
      doc.moveDown().fontSize(16).text('Transactions');
      report.transactions.slice(0, 40).forEach((item) => {
        const amt = item.baseAmount || item.amount;
        doc.fontSize(10).text(`${new Date(item.transactionDate).toLocaleDateString('en-IN')} |${item.type} |${item.title} |${formatCurrencyPdf(amt, baseCurrency)}`);
      });
      doc.end();
      return;
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};