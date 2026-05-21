import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfileThunk } from '../redux/slices/authSlice'
import { changePassword, getAccountStats } from '../services/authService'
import { formatCurrency, SUPPORTED_CURRENCIES } from '../utils/format'

function Profile() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [profile, setProfile] = useState({ name: '', email: '', baseCurrency: 'INR' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [stats, setStats] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', email: user.email || '', baseCurrency: user.baseCurrency || 'INR' })
    }
    const fetchStats = async () => {
      try {
        const res = await getAccountStats()
        setStats(res.data.data)
      } catch {
        // stats optional
      }
    }
    fetchStats()
  }, [user])

  const saveProfile = async (e) => {
    e.preventDefault()
    setMessage(''); setError('')
    try {
      const action = await dispatch(updateProfileThunk(profile))
      if (updateProfileThunk.fulfilled.match(action)) {
        setMessage('Profile updated successfully!')
      } else {
        setError(action.payload || 'Failed to update profile')
      }
    } catch {
      setError('An error occurred')
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setMessage(''); setError('')
    try {
      await changePassword(passwords)
      setPasswords({ currentPassword: '', newPassword: '' })
      setMessage('Password changed successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-500">Manage your account details and security</p>
      </div>

      {message && <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg">{message}</div>}
      {error && <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-lg">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          {/* Avatar & Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-3xl font-black shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Personal Information</h2>
            <form onSubmit={saveProfile} className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text" required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email" required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Base Currency</label>
                <select
                  value={profile.baseCurrency}
                  onChange={(e) => setProfile({ ...profile, baseCurrency: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  {SUPPORTED_CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end pt-2">
                <button type="submit" className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Security</h2>
            <form onSubmit={savePassword} className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                <input
                  type="password" required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <input
                  type="password" required minLength={6}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="md:col-span-2 flex justify-end pt-2">
                <button type="submit" className="bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-900 transition">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Account Summary</h2>
          {stats ? (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Transactions</span>
                <span className="font-bold text-gray-800 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">{stats.transactionCount}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-gray-600 font-medium">Total Income</span>
                <span className="font-bold text-green-600">{formatCurrency(stats.totalIncome, user?.baseCurrency)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Expenses</span>
                <span className="font-bold text-red-500">{formatCurrency(stats.totalExpense, user?.baseCurrency)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-gray-600 font-medium">Net Savings</span>
                <span className={`font-black text-lg ${stats.savings >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>{formatCurrency(stats.savings, user?.baseCurrency)}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Loading stats...</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile