import axios from 'axios'

// Smart API base URL detection:
// 1. If VITE_API_URL env var is set (Vercel env vars panel) → use it
// 2. If running in production (not localhost) → derive backend URL from window.location won't work
//    for cross-origin, so we rely on the env var. If missing, show a clear error.
// 3. In development → fallback to localhost:5000

const getBaseURL = () => {
  // Explicitly set via Vercel/build env var → highest priority
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Development fallback
  return 'http://localhost:5000/api'
}

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30s timeout (handles Render cold start)
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout on 401 if it's NOT a login/password request
    const isAuthRequest =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/signup') ||
      error.config?.url?.includes('/auth/password')

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect to login if token expired
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    // Network error — backend unreachable (cold start or wrong URL)
    if (!error.response) {
      console.error('Network Error: Backend unreachable. Check VITE_API_URL env var.', error.message)
    }

    return Promise.reject(error)
  }
)

export default API
