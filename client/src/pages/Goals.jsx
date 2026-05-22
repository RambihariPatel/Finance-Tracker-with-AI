import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGoals, createGoal, updateGoal, deleteGoal, addFundsToGoal } from '../redux/slices/goalSlice'
import { formatCurrency, getCurrencySymbol, formatDate } from '../utils/format'
import toast from 'react-hot-toast'

const EMOJIS = ['🎯', '🚗', '✈️', '🏠', '💍', '💻', '🎉', '🎓', '👶', '🏥', ' emergency']
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

function Goals() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { goals, loading } = useSelector(state => state.goals)

  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showFundsForm, setShowFundsForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedGoalId, setSelectedGoalId] = useState(null)

  const emptyForm = {
    title: '',
    targetAmount: '',
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().slice(0, 10),
    color: COLORS[0],
    icon: EMOJIS[0]
  }

  const [formData, setFormData] = useState(emptyForm)
  const [fundsAmount, setFundsAmount] = useState('')

  useEffect(() => {
    dispatch(fetchGoals())
  }, [dispatch])

  const handleOpenForm = (goal = null) => {
    if (goal) {
      setEditingId(goal._id)
      setFormData({
        title: goal.title,
        targetAmount: goal.targetAmount,
        deadline: new Date(goal.deadline).toISOString().slice(0, 10),
        color: goal.color,
        icon: goal.icon
      })
    } else {
      setEditingId(null)
      setFormData(emptyForm)
    }
    setShowGoalForm(true)
  }

  const handleOpenFunds = (id) => {
    setSelectedGoalId(id)
    setFundsAmount('')
    setShowFundsForm(true)
  }

  const handleGoalSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await dispatch(updateGoal({ id: editingId, goalData: formData })).unwrap()
        toast.success('Goal updated successfully!')
      } else {
        await dispatch(createGoal(formData)).unwrap()
        toast.success('Goal created successfully!')
      }
      setShowGoalForm(false)
    } catch (err) {
      toast.error(err || 'Failed to save goal')
    }
  }

  const handleFundsSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(addFundsToGoal({ id: selectedGoalId, amount: Number(fundsAmount) })).unwrap()
      toast.success('Funds added successfully!')
      setShowFundsForm(false)
    } catch (err) {
      toast.error(err || 'Failed to add funds')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await dispatch(deleteGoal(id)).unwrap()
        toast.success('Goal deleted')
      } catch (err) {
        toast.error('Failed to delete goal')
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-500 mt-1">Track and achieve your financial targets</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm transition flex items-center gap-2 w-max"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Create Goal
        </button>
      </div>

      {loading && !showGoalForm && goals.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Goals Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">Set specific targets like a new car, vacation, or emergency fund to stay motivated.</p>
          <button onClick={() => handleOpenForm()} className="bg-indigo-50 text-indigo-600 font-semibold py-2 px-6 rounded-lg hover:bg-indigo-100 transition">
            Set Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map(goal => {
            const percentage = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100))
            const remaining = goal.targetAmount - goal.currentAmount
            const isCompleted = percentage >= 100

            return (
              <div key={goal._id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col relative overflow-hidden ${isCompleted ? 'border-green-200' : 'border-gray-100'}`}>
                {/* Decorative Background Blob */}
                <div 
                  className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10"
                  style={{ backgroundColor: goal.color }}
                ></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                      style={{ backgroundColor: `${goal.color}15`, color: goal.color }}
                    >
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{goal.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Target: {formatDate(goal.deadline)}</p>
                    </div>
                  </div>
                  
                  {/* Actions Dropdown / Icons */}
                  <div className="flex gap-2 text-gray-400">
                    <button onClick={() => handleOpenForm(goal)} className="hover:text-indigo-600 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                    <button onClick={() => handleDelete(goal._id)} className="hover:text-red-500 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                  </div>
                </div>

                <div className="mt-2 mb-5">
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-2xl font-black text-gray-800">{formatCurrency(goal.currentAmount, user?.baseCurrency)}</span>
                    <span className="text-sm font-medium text-gray-400 mb-1">/ {formatCurrency(goal.targetAmount, user?.baseCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold mt-4 mb-1" style={{ color: goal.color }}>
                    <span>{percentage.toFixed(1)}%</span>
                    <span>{isCompleted ? 'Completed 🎉' : `${formatCurrency(remaining, user?.baseCurrency)} left`}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${percentage}%`, backgroundColor: goal.color }}
                    >
                      {isCompleted && (
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <button 
                    onClick={() => handleOpenFunds(goal._id)}
                    disabled={isCompleted}
                    className={`w-full py-2.5 rounded-xl font-bold transition flex justify-center items-center gap-2 ${
                      isCompleted 
                        ? 'bg-green-50 text-green-600 cursor-not-allowed'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200'
                    }`}
                  >
                    {isCompleted ? 'Goal Reached!' : '+ Add Funds'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Goal' : 'Create New Goal'}</h2>
              <button onClick={() => setShowGoalForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Goal Title</label>
                <input type="text" required placeholder="e.g. New Car"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Target Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">{getCurrencySymbol(user?.baseCurrency)}</span>
                  <input type="number" required min="1" placeholder="10000"
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Target Deadline</label>
                <input type="date" required min={new Date().toISOString().slice(0,10)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color Theme</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setFormData({...formData, color: c})}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'scale-110 border-gray-800' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                  <div className="flex gap-2 flex-wrap text-xl">
                    {EMOJIS.map(e => (
                      <button key={e} type="button" onClick={() => setFormData({...formData, icon: e})}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform ${formData.icon === e ? 'bg-gray-100 scale-110 ring-2 ring-indigo-500' : 'hover:bg-gray-50'}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-indigo-700 transition disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Goal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showFundsForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Add Funds</h2>
              <button onClick={() => setShowFundsForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleFundsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount to Add</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">{getCurrencySymbol(user?.baseCurrency)}</span>
                  <input type="number" required min="1" placeholder="500" autoFocus
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-lg"
                    value={fundsAmount} onChange={e => setFundsAmount(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">This amount will be added to your goal's progress.</p>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
                {loading ? 'Adding...' : 'Add to Goal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Goals
