import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getMonthlyReport, downloadMonthlyReport } from '../services/reportService'
import { formatCurrency, formatDate } from '../utils/format'

const COLORS = ['#2563eb', '#059669', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#0d9488']

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function Reports() {
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

  const categoryData = report?.categoryBreakdown?.map(c => ({
    name: c._id || c.category,
    amount: c.amount || c.total
  })) || []

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6 px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Monthly Reports</h1>
          <p className="text-gray-500">Detailed financial breakdown by period</p>
        </div>
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

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="grid gap-4 md:grid-cols-3 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Month</label>
            <select
              value={period.month}
              onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Year</label>
            <input
              type="number"
              value={period.year}
              min="2020" max="2099"
              onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
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
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: 'Income', value: report.totalIncome, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Expense', value: report.totalExpense, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Savings', value: report.savings, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Budget Left', value: report.budgetRemaining, color: 'text-amber-600', bg: 'bg-amber-50' }
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
                <p className={`text-2xl font-black mt-2 ${color}`}>{formatCurrency(value)}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Category Analytics</h2>
              <div className="h-72">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">
                Transactions <span className="text-sm text-gray-400 font-normal">({report.transactions?.length || 0})</span>
              </h2>
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {report.transactions?.length > 0 ? (
                  report.transactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">{t.title}</p>
                        <p className="text-xs text-gray-500">{t.category} • {formatDate(t.transactionDate)}</p>
                      </div>
                      <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-10">No transactions for this period.</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default Reports