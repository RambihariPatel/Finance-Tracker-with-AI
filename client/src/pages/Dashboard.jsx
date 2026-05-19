import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { getDashboardSummary } from '../services/dashboardService'
import { formatCurrency, formatDate } from '../utils/format'

const COLORS = ['#2563eb', '#059669', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2']

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await getDashboardSummary()
        setSummary(response.data.data)
      } catch (err) {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  if (loading) return <div className="text-center py-20 text-xl font-medium text-gray-500">Loading dashboard...</div>
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg max-w-4xl mx-auto mt-6">{error}</div>
  if (!summary) return null

  const trend = summary.monthlyTrend || []
  const categories = summary.categoryBreakdown || []
  const totalExpenseVal = categories.reduce((sum, c) => sum + c.amount, 0)
  const formattedCategories = categories.map(c => ({
    ...c,
    categoryName: c.category || c._id || 'Other',
    percentageVal: c.percentage || (totalExpenseVal ? (c.amount / totalExpenseVal) * 100 : 0)
  }))
  const incomeExpense = trend.map(t => ({
    month: t.month,
    Income: t.income,
    Expense: t.expense
  }))

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your financial overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Income</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(summary.totalIncome)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Expense</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(summary.totalExpense)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Remaining Budget</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{formatCurrency(summary.budgetRemaining)}</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900 p-6 flex flex-col justify-between">
          <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">Net Savings</p>
          <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-200 mt-2">{formatCurrency(summary.savings)}</p>
        </div>
      </div>

      {/* Monthly Budget Progress Bar */}
      {summary.monthlyBudget > 0 && (() => {
        const spent = summary.totalExpense || 0
        const budget = summary.monthlyBudget || 0
        const percentage = Math.min(100, Math.round((spent / budget) * 100))
        const remaining = Math.max(0, budget - spent)

        let barGradient = 'linear-gradient(90deg, #4ade80, #22c55e)'
        let statusColor = 'text-green-600'
        let statusBg = 'bg-green-50'
        let statusBorder = 'border-green-200'
        let statusEmoji = '✅'
        let statusText = 'On Track'
        let glowColor = 'shadow-green-100'

        if (percentage >= 100) {
          barGradient = 'linear-gradient(90deg, #f87171, #dc2626)'
          statusColor = 'text-red-600'
          statusBg = 'bg-red-50'
          statusBorder = 'border-red-200'
          statusEmoji = '🔴'
          statusText = 'Budget Exceeded!'
          glowColor = 'shadow-red-100'
        } else if (percentage >= 80) {
          barGradient = 'linear-gradient(90deg, #fbbf24, #f59e0b)'
          statusColor = 'text-amber-600'
          statusBg = 'bg-amber-50'
          statusBorder = 'border-amber-200'
          statusEmoji = '⚠️'
          statusText = 'Warning - Almost Full'
          glowColor = 'shadow-amber-100'
        } else if (percentage >= 50) {
          barGradient = 'linear-gradient(90deg, #60a5fa, #3b82f6)'
          statusColor = 'text-blue-600'
          statusBg = 'bg-blue-50'
          statusBorder = 'border-blue-200'
          statusEmoji = '📊'
          statusText = 'Moderate'
          glowColor = 'shadow-blue-100'
        }

        return (
          <section className={`rounded-2xl border ${statusBorder} bg-white p-6 shadow-lg ${glowColor}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Monthly Budget Overview</h2>
                <p className="text-sm text-gray-500 mt-0.5">How much of your budget is used this month</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full border ${statusBg} ${statusColor} ${statusBorder}`}>
                {statusEmoji} {statusText}
              </span>
            </div>

            {/* Bar */}
            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentage}%`, background: barGradient }}
              />
              {/* Percentage Label inside bar */}
              {percentage > 10 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                  {percentage}% used
                </span>
              )}
            </div>

            {/* Stats below bar */}
            <div className="flex flex-col sm:flex-row justify-between mt-4 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                <span className="text-sm text-gray-600">Spent: <span className="font-bold text-gray-800">{formatCurrency(spent)}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
                <span className="text-sm text-gray-600">Remaining: <span className="font-bold text-gray-800">{formatCurrency(remaining)}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block"></span>
                <span className="text-sm text-gray-600">Total Budget: <span className="font-bold text-gray-800">{formatCurrency(budget)}</span></span>
              </div>
            </div>
          </section>
        )
      })()}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Monthly Spending Trend</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} tickFormatter={(value) => `₹${value}`} />
                <Tooltip cursor={{fill: '#f5f5f5'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Category Distribution</h2>
          <div className="h-80 w-full">
            {formattedCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="categoryName"
                  >
                    {formattedCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No expense data yet</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {formattedCategories.map((c, i) => (
              <div key={i} className="flex items-center text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                {c.categoryName} ({Math.round(c.percentageVal)}%)
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Income vs Expense</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeExpense} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} tickFormatter={(value) => `₹${value}`} />
                <Tooltip cursor={{fill: '#f5f5f5'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Recent Transactions</h2>
          <div className="mt-2 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {summary.recentTransactions?.length > 0 ? (
              summary.recentTransactions.map((t) => (
                <div key={t._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type === 'income' ? '↓' : '↑'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 truncate max-w-[150px]">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.category} • {formatDate(t.transactionDate)}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-10">No recent transactions.</p>
            )}
          </div>
        </section>
      </div>

      {/* Category Budgets Visualizer Section */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm w-full">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-6 flex justify-between items-center">
          <span>Category Budget Limits</span>
          <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">Live Track</span>
        </h2>
        
        {summary.categoryBudgets && summary.categoryBudgets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {summary.categoryBudgets.map((cat, idx) => {
              const spentObj = summary.categoryBreakdown?.find(c => (c.category || c._id)?.toLowerCase() === cat.category?.toLowerCase())
              const spent = spentObj ? spentObj.amount : 0
              const percentage = cat.limit ? Math.min(100, Math.round((spent / cat.limit) * 100)) : 0
              
              // Dynamic status colors based on percentage
              let barColor = 'bg-indigo-600'
              let textColor = 'text-indigo-600'
              let bgTagColor = 'bg-indigo-50'
              let statusText = 'Safe'
              
              if (percentage >= 100) {
                barColor = 'bg-red-500'
                textColor = 'text-red-600'
                bgTagColor = 'bg-red-50'
                statusText = 'Exceeded!'
              } else if (percentage >= 80) {
                barColor = 'bg-amber-500'
                textColor = 'text-amber-600'
                bgTagColor = 'bg-amber-50'
                statusText = 'Warning!'
              }
              
              return (
                <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-base">{cat.category}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Budget Target: {formatCurrency(cat.limit)}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgTagColor} ${textColor}`}>
                      {statusText}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-500">
                      <span>Spent: {formatCurrency(spent)}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-gray-50">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No Category Budgets set yet.</p>
            <p className="text-xs text-gray-400 mt-1">Go to the <strong>Budget</strong> tab in the sidebar to set custom category limits!</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard