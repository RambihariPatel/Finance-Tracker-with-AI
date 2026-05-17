import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../redux/slices/authSlice'

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [localError, setLocalError] = useState('')
  const { loading, error } = useSelector((state) => state.auth)
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const successMessage = location.state?.message || ''

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    
    if (!formData.email || !formData.password) {
      setLocalError('Please enter both email and password.')
      return
    }

    try {
      const resultAction = await dispatch(loginUser(formData))
      if (loginUser.fulfilled.match(resultAction)) {
        navigate('/dashboard')
      } else {
        setLocalError(resultAction.payload || 'Login failed.')
      }
    } catch (err) {
      setLocalError('An unexpected error occurred.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">FinTrack AI</h1>
          <p className="text-gray-500 mt-2">Welcome back! Please login.</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm font-medium">
            ✅ {successMessage}
          </div>
        )}

        {(error || localError) && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login