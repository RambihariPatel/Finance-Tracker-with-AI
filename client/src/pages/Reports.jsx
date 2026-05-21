import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getMonthlyReport, downloadMonthlyReport } from '../services/reportService'
import { formatCurrency, formatDate } from '../utils/format'
import * as XLSX from 'xlsx'
import { useSelector } from 'react-redux'

const COLORS = ['#2563eb', '#059669', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#0d9488']

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

// Category emoji icons map
const CATEGORY_ICONS = {
  food:          '🍔',
  Food:          '🍔',
  housing:       '🏠',
  Housing:       '🏠',
  transport:     '🚗',
  Transport:     '🚗',
  travel:        '✈️',
  Travel:        '✈️',
  utilities:     '💡',
  Utilities:     '💡',
  entertainment: '🎬',
  Entertainment: '🎬',
  shopping:      '🛍️',
  Shopping:      '🛍️',
  health:        '💊',
  Health:        '💊',
  education:     '📚',
  Education:     '📚',
  salary:        '💼',
  Salary:        '💼',
  investment:    '📈',
  Investment:    '📈',
  savings:       '🏦',
  Savings:       '🏦',
  other:         '📦',
  Other:         '📦',
}

const getCategoryIcon = (category) => {
  if (!category) return '📦'
  return CATEGORY_ICONS[category] || CATEGORY_ICONS[category.toLowerCase()] || '📦'
}

function Reports() {
  const { user } = useSelector((state) => state.auth)
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useMemo(() => ({ ...period }), [period.month, period.year])

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true); setError('')
      try {
        const res = await getMonthlyReport(params)
        setReport(res.data.data)
      } catch (err) {
        setError('Failed to load report. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [params.month, params.year])

  const exportPdf = async () => {
    try {
      const res = await downloadMonthlyReport(params)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `finance-report-${params.year}-${String(params.month).padStart(2, '0')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Failed to export PDF.')
    }
  }

  const exportExcel = () => {
    if (!report) return

    const monthName = MONTH_NAMES[params.month - 1]
    const fileName = `finance-report-${params.year}-${String(params.month).padStart(2, '0')}.xlsx`

    // Sheet 1: Summary
    const summaryData = [
      ['Finance Report', `${monthName} ${params.year}`],
      [],
      ['Summary', ''],
      ['Total Income', report.totalIncome],
      ['Total Expense', report.totalExpense],
      ['Savings', report.savings],
      ['Budget Remaining', report.budgetRemaining],
    ]

    // Sheet 2: Transactions
    const txData = [
      ['Date', 'Title', 'Category', 'Type', 'Payment Method', 'Amount (₹)'],
      ...(report.transactions || []).map((t) => [
        formatDate(t.transactionDate),
        t.title,
        t.category,
        t.type,
        t.paymentMethod || '-',
        t.amount,
      ])
    ]

    // Sheet 3: Category Breakdown
    const catData = [
      ['Category', 'Total Spent (₹)'],
      ...(report.categoryBreakdown || []).map((c) => [c._id || c.category, c.amount || c.total])
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(txData), 'Transactions')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(catData), 'Category Breakdown')
    XLSX.writeFile(wb, fileName)
  }

  const categoryData = report?.categoryBreakdown?.map(c => ({
    name: c._id || c.category,
    amount: c.amount || c.total
  })) || []

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6 px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Monthly Reports</h1>
          <p className="text-gray-500 dark:text-slate-400">Detailed financial breakdown by period</p>
        </div>
        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportExcel}
            disabled={!report || loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>📊</span>
            Export Excel
          </button>
          <button
            onClick={exportPdf}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
        <div className="grid gap-4 md:grid-cols-3 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1">Month</label>
            <select
              value={period.month}
              onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })}
              className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1">Year</label>
            <input
              type="number"
              value={period.year}
              min="2020" max="2099"
              onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })}
              className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </section>

      {loading && (
        <div className="text-center py-16 text-gray-400 font-medium">
          <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading report...
        </div>
      )}
      {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>}

      {report && !loading && (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {[
              { label: 'Income', value: report.totalIncome, color: 'text-green-600', bg: 'bg-green-50', icon: '💰' },
              { label: 'Expense', value: report.totalExpense, color: 'text-red-500', bg: 'bg-red-50', icon: '💸' },
              { label: 'Savings', value: report.savings, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '🏦' },
              { label: 'Budget Left', value: report.budgetRemaining, color: 'text-amber-600', bg: 'bg-amber-50', icon: '🎯' }
            ].map(({ label, value, color, bg, icon }) => (
              <div key={label} className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <span>{icon}</span> {label}
                </p>
                <p className={`text-2xl font-black mt-2 ${color}`}>{formatCurrency(value, user?.baseCurrency)}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm xl:col-span-2">
              <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 border-b dark:border-slate-700 pb-4 mb-4">Category Analytics</h2>
              <div className="h-72">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }}
                        tickFormatter={(name) => `${getCategoryIcon(name)} ${name}`}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value, name) => [formatCurrency(value, user?.baseCurrency), 'Amount']}
                        labelFormatter={(label) => `${getCategoryIcon(label)} ${label}`}
                      />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={55}>
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">No expense data for this period</div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 border-b dark:border-slate-700 pb-4 mb-4">
                Transactions <span className="text-sm text-gray-400 font-normal">({report.transactions?.length || 0})</span>
              </h2>
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {report.transactions?.length > 0 ? (
                  report.transactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                      <div className="flex items-center gap-3">
                        {/* Category Icon Badge */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                          t.type === 'income' ? 'bg-green-100' : 'bg-gray-100 dark:bg-slate-700'
                        }`}>
                          {getCategoryIcon(t.category)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate max-w-[120px]">{t.title}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{t.category} • {formatDate(t.transactionDate)}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.baseAmount || t.amount, user?.baseCurrency)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-10">No transactions for this period.</p>
                )}
              </div>
            </section>
          </div>

          {/* Category Summary Cards with Icons */}
          {categoryData.length > 0 && (
            <section className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 border-b dark:border-slate-700 pb-4 mb-5">Category Breakdown</h2>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {categoryData.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600">
                    <div className="text-2xl w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-600 rounded-full shadow-sm">
                      {getCategoryIcon(c.name)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{c.name}</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-slate-100">{formatCurrency(c.amount, user?.baseCurrency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default Reports