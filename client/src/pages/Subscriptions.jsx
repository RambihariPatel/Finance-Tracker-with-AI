import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSubscriptions, createSubscription, updateSubscription, deleteSubscription } from '../redux/slices/subscriptionSlice'
import { formatCurrency, getCurrencySymbol, formatDate } from '../utils/format'
import toast from 'react-hot-toast'

function Subscriptions() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { subscriptions, loading } = useSelector(state => state.subscriptions)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const emptyForm = {
    title: '',
    amount: '',
    currency: user?.baseCurrency || 'INR',
    category: 'Housing',
    frequency: 'monthly',
    nextDueDate: new Date().toISOString().slice(0, 10),
    status: 'active'
  }

  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    dispatch(fetchSubscriptions())
  }, [dispatch])

  const handleOpenForm = (sub = null) => {
    if (sub) {
      setEditingId(sub._id)
      setFormData({
        title: sub.title,
        amount: sub.amount,
        currency: sub.currency,
        category: sub.category,
        frequency: sub.frequency,
        nextDueDate: new Date(sub.nextDueDate).toISOString().slice(0, 10),
        status: sub.status
      })
    } else {
      setEditingId(null)
      setFormData({ ...emptyForm, currency: user?.baseCurrency || 'INR' })
    }
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await dispatch(updateSubscription({ id: editingId, subData: formData })).unwrap()
        toast.success('Subscription updated!')
      } else {
        await dispatch(createSubscription(formData)).unwrap()
        toast.success('Subscription created!')
      }
      setShowForm(false)
    } catch (err) {
      toast.error(err || 'Failed to save subscription')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await dispatch(deleteSubscription(id)).unwrap()
        toast.success('Subscription deleted')
      } catch (err) {
        toast.error('Failed to delete')
      }
    }
  }

  const toggleStatus = async (sub) => {
    try {
      await dispatch(updateSubscription({
        id: sub._id,
        subData: { ...sub, status: sub.status === 'active' ? 'paused' : 'active' }
      })).unwrap()
      toast.success(`Subscription ${sub.status === 'active' ? 'paused' : 'activated'}`)
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  // Calculate Total Monthly Fixed Cost
  const totalMonthlyCost = subscriptions.reduce((acc, sub) => {
    if (sub.status === 'paused') return acc;
    let monthlyAmount = sub.baseAmount;
    if (sub.frequency === 'weekly') monthlyAmount *= 4.33;
    if (sub.frequency === 'yearly') monthlyAmount /= 12;
    return acc + monthlyAmount;
  }, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recurring Bills</h1>
          <p className="text-gray-500 mt-1">Manage your subscriptions and fixed expenses</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm transition flex items-center gap-2 w-max"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Add Bill
        </button>
      </div>

      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 shadow-lg text-white flex items-center justify-between">
        <div>
          <p className="text-indigo-200 font-medium mb-1">Total Monthly Fixed Cost</p>
          <h2 className="text-4xl font-black">{formatCurrency(totalMonthlyCost, user?.baseCurrency)}</h2>
          <p className="text-xs text-indigo-300 mt-2">Calculated from all active subscriptions across different frequencies.</p>
        </div>
        <div className="hidden sm:block opacity-20">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
        </div>
      </div>

      {loading && subscriptions.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Loading subscriptions...</div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🔁</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Recurring Bills</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">Add your Netflix, rent, or EMI to track them automatically.</p>
          <button onClick={() => handleOpenForm()} className="bg-indigo-50 text-indigo-600 font-semibold py-2 px-6 rounded-lg hover:bg-indigo-100 transition">
            Add Your First Bill
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map(sub => {
            const isPaused = sub.status === 'paused';
            return (
              <div key={sub._id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col relative transition-opacity ${isPaused ? 'opacity-60 grayscale' : 'border-indigo-100'}`}>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight flex items-center gap-2">
                      {sub.title}
                      {isPaused && <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Paused</span>}
                    </h3>
                    <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider mt-1">{sub.category}</p>
                  </div>
                  
                  <div className="flex gap-1 text-gray-400">
                    <button onClick={() => toggleStatus(sub)} className="hover:text-indigo-600 p-1" title={isPaused ? "Activate" : "Pause"}>
                      {isPaused ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      )}
                    </button>
                    <button onClick={() => handleOpenForm(sub)} className="hover:text-indigo-600 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                    <button onClick={() => handleDelete(sub._id)} className="hover:text-red-500 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                  </div>
                </div>

                <div className="my-2">
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-gray-800">{getCurrencySymbol(sub.currency)}{sub.amount}</span>
                    <span className="text-sm font-medium text-gray-400 mb-1">/ {sub.frequency}</span>
                  </div>
                  {sub.currency !== user?.baseCurrency && (
                    <p className="text-xs text-gray-400 mt-1">≈ {formatCurrency(sub.baseAmount, user?.baseCurrency)}</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Next due:</span>
                    <span className="font-semibold text-gray-800 bg-gray-50 px-2 py-1 rounded">{formatDate(sub.nextDueDate)}</span>
                  </div>
                  {sub.lastPaidDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Last paid:</span>
                      <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        {formatDate(sub.lastPaidDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto py-10">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 my-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Bill' : 'Add Recurring Bill'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bill Title</label>
                <input type="text" required placeholder="e.g. Netflix, Rent"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                  <input type="number" required min="0.01" step="0.01" placeholder="999"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Currency</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Housing">Housing</option>
                    <option value="Transport">Transport</option>
                    <option value="Food">Food</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Frequency</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Next Due Date</label>
                <input type="date" required min={new Date().toISOString().slice(0,10)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})}
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-indigo-700 transition disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Bill'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Subscriptions
