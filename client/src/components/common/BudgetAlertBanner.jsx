import { useEffect, useState } from 'react'
import { getDashboardSummary } from '../../services/dashboardService'

// How many hours before showing the banner again after being dismissed
const DISMISS_DURATION_HOURS = 6

function BudgetAlertBanner() {
  const [alertInfo, setAlertInfo] = useState(null) // { percentage, spent, budget, status }
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if user dismissed the banner recently
    const dismissedAt = localStorage.getItem('budgetAlertDismissedAt')
    if (dismissedAt) {
      const hoursSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60)
      if (hoursSince < DISMISS_DURATION_HOURS) return
    }

    const checkBudget = async () => {
      try {
        const res = await getDashboardSummary()
        const data = res.data.data
        const budget = data.monthlyBudget || 0
        const spent = data.totalExpense || 0

        if (budget <= 0) return

        const percentage = Math.round((spent / budget) * 100)

        if (percentage >= 80) {
          setAlertInfo({ percentage, spent, budget, exceeded: percentage >= 100 })
          setVisible(true)
        }
      } catch {
        // Silently fail - don't disturb the user with error banners
      }
    }

    checkBudget()
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('budgetAlertDismissedAt', Date.now().toString())
  }

  if (!visible || !alertInfo) return null

  const { percentage, spent, budget, exceeded } = alertInfo

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0)

  return (
    <div
      className={`relative flex items-start sm:items-center justify-between gap-4 px-5 py-3.5 text-sm font-medium transition-all duration-500 ${
        exceeded
          ? 'bg-red-600 text-white'
          : 'bg-amber-500 text-white'
      }`}
      role="alert"
    >
      {/* Left: Icon + Message */}
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        <span className="text-xl flex-shrink-0 mt-0.5 sm:mt-0">
          {exceeded ? '🔴' : '⚠️'}
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
          <span className="font-bold">
            {exceeded ? 'Budget Exceeded!' : 'Budget Warning!'}
          </span>
          <span className="opacity-90 text-xs sm:text-sm">
            {exceeded
              ? `You've spent ${formatINR(spent)} — ${percentage}% of your ${formatINR(budget)} budget. Consider reducing expenses.`
              : `You've used ${percentage}% of your budget (${formatINR(spent)} of ${formatINR(budget)}). You're almost at the limit!`
            }
          </span>
        </div>
      </div>

      {/* Right: Progress pill + Dismiss */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Mini progress bar */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
          <span className="text-white font-bold text-xs">{percentage}%</span>
        </div>

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          title="Dismiss"
          className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/40 transition text-white font-bold text-base leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default BudgetAlertBanner
