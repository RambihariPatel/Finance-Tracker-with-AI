import OpenAI from 'openai';
import { analyzeFinance } from './financeAnalyzer.js';

const hasOpenAIKey = () => {
  const key = process.env.OPENAI_API_KEY;
  return key && key !== 'your_openai_api_key_here';
};

export const generateAIInsights = async ({ transactions, budget, baseCurrency }) => {
  const analysis = analyzeFinance({ transactions, budget, baseCurrency });

  if (!hasOpenAIKey()) {
    return {
      provider: 'heuristic',
      insights: [...analysis.insights, ...analysis.recommendations].slice(0, 8)
    };
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = [
      'You are a friendly, encouraging financial assistant.',
      'Generate 3-5 personal finance insights for this user based on their data.',
      'Use very simple, easy-to-understand language. Avoid complex financial jargon.',
      'Write like you are talking to a friend. Be actionable and positive.',
      'Return EXACTLY a JSON array of objects with two keys: "title" (including a relevant emoji) and "description" (1-2 simple sentences).',
      'Example: [{"title": "🎉 Great Savings!", "description": "You saved some money this month. Keep up the good work!"}]',
      JSON.stringify({
        totalIncome: analysis.totalIncome,
        totalExpense: analysis.totalExpense,
        savings: analysis.savings,
        budgetRemaining: analysis.budgetRemaining,
        categoryBreakdown: analysis.categoryBreakdown,
        monthlyTrend: analysis.monthlyTrend
      })
    ].join('\n');

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4
    });

    const text = response.choices?.[0]?.message?.content || '[]';
    const insights = JSON.parse(text);

    return {
      provider: 'openai',
      insights: Array.isArray(insights) && insights.length ? insights : analysis.insights
    };
  } catch (error) {
    return {
      provider: 'heuristic',
      insights: [...analysis.insights, ...analysis.recommendations].slice(0, 8)
    };
  }
};

export const predictExpense = async ({ transactions, budget, baseCurrency }) => {
  const analysis = analyzeFinance({ transactions, budget, baseCurrency });

  return {
    predictedExpense: analysis.predictedExpense,
    confidence: analysis.confidence,
    budgetRisk: analysis.monthlyBudget > 0 ? analysis.predictedExpense > analysis.monthlyBudget : false,
    recommendations: analysis.recommendations
  };
};