const formatCurrency = (value, currencyCode = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(value || 0);
};

export const getMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
};

export const summarizeTransactions = (transactions = [], budget = null) => {
  const income = transactions.filter((item) => item.type === 'income');
  const expenses = transactions.filter((item) => item.type === 'expense');
  const totalIncome = income.reduce((sum, item) => sum + (item.baseAmount || item.amount), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + (item.baseAmount || item.amount), 0);
  const savings = totalIncome - totalExpense;
  const monthlyBudget = budget?.monthlyBudget || 0;
  const budgetRemaining = monthlyBudget ? monthlyBudget - totalExpense : savings;

  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + (item.baseAmount || item.amount);
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const monthlyBuckets = new Map();
  transactions.forEach((item) => {
    const date = new Date(item.transactionDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = monthlyBuckets.get(key) || { month: key, income: 0, expense: 0 };
    current[item.type] += (item.baseAmount || item.amount);
    monthlyBuckets.set(key, current);
  });

  const monthlyTrend = Array.from(monthlyBuckets.values()).sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalIncome,
    totalExpense,
    savings,
    budgetRemaining,
    monthlyBudget,
    categoryBudgets: budget?.categoryBudgets || [],
    categoryBreakdown,
    monthlyTrend
  };
};

export const analyzeFinance = ({ transactions = [], budget = null, baseCurrency = 'INR' }) => {
  const summary = summarizeTransactions(transactions, budget);
  const expenses = transactions.filter((item) => item.type === 'expense');
  const insights = [];
  const recommendations = [];

  if (!transactions.length) {
    return {
      ...summary,
      insights: [
        { title: "👋 Welcome to FinTrack!", description: "Add your first income and expense entries to unlock personalized insights." },
        { title: "🎯 Set a Goal", description: "Set a monthly budget so we can help you stay on track and avoid overspending." }
      ],
      recommendations: [
        { title: "💡 Pro Tip", description: "Start by adding your fixed expenses like rent, subscriptions, and groceries." }
      ],
      predictedExpense: 0,
      confidence: 0
    };
  }

  const topCategory = summary.categoryBreakdown[0];
  if (topCategory) {
    const share = summary.totalExpense ? Math.round((topCategory.amount / summary.totalExpense) * 100) : 0;
    insights.push({
      title: "📊 Top Spending Area",
      description: `You spent the most on ${topCategory.category} (${formatCurrency(topCategory.amount, baseCurrency)}). That's about ${share}% of your total expenses.`
    });
  }

  if (summary.monthlyBudget > 0) {
    const used = Math.round((summary.totalExpense / summary.monthlyBudget) * 100);
    if (used >= 100) {
      insights.push({ title: "⚠️ Budget Alert", description: `Oops! You have crossed your monthly budget by ${formatCurrency(Math.abs(summary.budgetRemaining), baseCurrency)}. Try to cut back on non-essentials.` });
    } else if (used >= 80) {
      insights.push({ title: "👀 Watch Your Spending", description: `You have used ${used}% of your budget for this month. It's time to slow down a bit!` });
    } else {
      insights.push({ title: "✅ On Track", description: `Great job! You still have ${formatCurrency(summary.budgetRemaining, baseCurrency)} left in your budget this month.` });
    }
  }

  budget?.categoryBudgets?.forEach((item) => {
    const spent = summary.categoryBreakdown.find((entry) => entry.category === item.category)?.amount || 0;
    if (item.limit > 0 && spent > item.limit) {
      insights.push({ title: "🚨 Category Over Limit", description: `You went over your budget for ${item.category} by ${formatCurrency(spent - item.limit, baseCurrency)}.` });
    }
  });

  if (summary.savings < 0) {
    insights.push({ title: "📉 Spending More Than Earning", description: `Your expenses are higher than your income by ${formatCurrency(Math.abs(summary.savings), baseCurrency)}.` });
    recommendations.push({ title: "💡 Quick Fix", description: "Try to reduce flexible spending (like dining out) until your cash flow is positive again." });
  } else {
    recommendations.push({ title: "💰 Saving Up", description: `You are currently saving ${formatCurrency(summary.savings, baseCurrency)}. Consider moving some of this into a dedicated savings account!` });
  }

  if (topCategory) {
    recommendations.push({ title: "✂️ Easy Savings", description: `If you cut back just 10% on ${topCategory.category}, you could save around ${formatCurrency(topCategory.amount * 0.1, baseCurrency)}!` });
  }

  const monthlyExpenses = summary.monthlyTrend.map((item) => item.expense);
  const predictedExpense = monthlyExpenses.length
    ? Math.round(monthlyExpenses.reduce((sum, item) => sum + item, 0) / monthlyExpenses.length)
    : Math.round(summary.totalExpense);
  const confidence = Math.min(95, Math.max(55, 60 + expenses.length * 3));

  return {
    ...summary,
    insights,
    recommendations,
    predictedExpense,
    confidence
  };
};