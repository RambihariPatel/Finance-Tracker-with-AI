import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBudget, saveBudget } from '../redux/slices/budgetSlice'

function Budget() {
  const dispatch = useDispatch()
  const { monthlyBudget, categories, loading, error } = useSelector((state) => state.budget)
  
  const [localBudget, setLocalBudget] = useState(0)
  const [localCategories, setLocalCategories] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    dispatch(fetchBudget())
  }, [dispatch])

  useEffect(() => {
    setLocalBudget(monthlyBudget)
    setLocalCategories(categories || [])
  }, [monthlyBudget, categories])

  const addCategory = () => {
    setLocalCategories([...localCategories, { category: 'Food', limit: 0 }])
  }

  const updateCategory = (index, field, value) => {
    const updated = [...localCategories]
    updated[index] = { ...updated[index], [field]: value }
    setLocalCategories(updated)
  }

  const removeCategory = (index) => {
    const updated = localCategories.filter((_, i) => i !== index)
    setLocalCategories(updated)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const action = await dispatch(saveBudget({
        monthlyBudget: localBudget,
        categoryBudgets: localCategories
      }))
      if (saveBudget.fulfilled.match(action)) {
        setMessage('Budget saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Failed to save budget.')
      }
    } catch {
      setMessage('An error occurred.')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Budget Management</h1>
        <p className="text-gray-500">Set limits and track your spending</p>
      </div>

      {message && <div className="bg-green-50 text-green-700 p-4 rounded-lg">{message}</div>}
      {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Total Monthly Budget</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-gray-500 font-medium">₹</span>
              <input
                type="number"
                min="0"
                value={localBudget}
                onChange={(e) => setLocalBudget(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-semibold"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Category Budgets</h2>
              <button 
                type="button" 
                onClick={addCategory}
                className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
              >
                + Add Category
              </button>
            </div>

            <div className="space-y-4">
              {localCategories.map((cat, i) => (
                <div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Category Name</label>
                    <select 
                      value={cat.category}
                      onChange={(e) => updateCategory(i, 'category', e.target.value)}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="Food">Food</option>
                      <option value="Housing">Housing</option>
                      <option value="Transport">Transport</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Limit</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400">₹</span>
                      <input 
                        type="number" min="0"
                        value={cat.limit}
                        onChange={(e) => updateCategory(i, 'limit', e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="pt-5">
                    <button 
                      type="button" 
                      onClick={() => removeCategory(i)}
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-md transition"
                      title="Remove category"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
              
              {localCategories.length === 0 && (
                <p className="text-gray-500 text-sm italic text-center py-4">No category budgets set. Add one above.</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Budget Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Budget