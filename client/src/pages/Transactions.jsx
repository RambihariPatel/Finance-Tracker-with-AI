import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTransactions, removeTransactionById, saveTransaction } from '../redux/slices/transactionSlice'
import { formatCurrency, formatDate } from '../utils/format'

const emptyForm = {
  type: 'expense',
  title: '',
  amount: '',
  category: 'Food',
  paymentMethod: 'upi',
  description: '',
  transactionDate: new Date().toISOString().slice(0, 10)
}

function Transactions() {
  const dispatch = useDispatch()
  const { transactions, loading, error } = useSelector((state) => state.transactions)
  
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [localMessage, setLocalMessage] = useState('')

  useEffect(() => {
    dispatch(fetchTransactions({}))
  }, [dispatch])

  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowForm(true)
    setLocalMessage('')
  }

  const openEdit = (item) => {
    setEditingId(item._id)
    setFormData({
      type: item.type,
      title: item.title,
      amount: item.amount,
      category: item.category,
      paymentMethod: item.paymentMethod,
      description: item.description || '',
      transactionDate: new Date(item.transactionDate).toISOString().slice(0, 10)
    })
    setShowForm(true)
    setLocalMessage('')
  }

  const submitForm = async (e) => {
    e.preventDefault()
    setLocalMessage('')
    try {
      const action = await dispatch(saveTransaction({ id: editingId, data: formData }))
      if (saveTransaction.fulfilled.match(action)) {
        setShowForm(false)
        dispatch(fetchTransactions({}))
      } else {
        setLocalMessage('Failed to save transaction')
      }
    } catch {
      setLocalMessage('An error occurred')
    }
  }

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await dispatch(removeTransactionById(id))
      dispatch(fetchTransactions({}))
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6 px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-500">Manage your income and expenses</p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          + Add Transaction
        </button>
      </div>

      {(error || localMessage) && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error || localMessage}
        </div>
      )}

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading transactions...</td></tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{t.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{t.category}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(t.transactionDate)}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(t.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(t)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium">Edit</button>
                      <button onClick={() => deleteItem(t._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No transactions found. Start by adding one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={submitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <input type="date" required
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.transactionDate} onChange={(e) => setFormData({...formData, transactionDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input type="text" required placeholder="Salary, Groceries, etc."
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                  <input type="number" required placeholder="0.00" min="0" step="0.01"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Food">Food</option>
                    <option value="Housing">Housing</option>
                    <option value="Transport">Transport</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions