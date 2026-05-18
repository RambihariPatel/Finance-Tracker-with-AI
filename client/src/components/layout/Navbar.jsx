import { useSelector } from 'react-redux'
import { useDarkMode } from '../../hooks/useDarkMode'

function Navbar() {
  const { user } = useSelector((state) => state.auth)
  const { isDark, toggle } = useDarkMode()

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-slate-700 z-10 sticky top-0 transition-colors duration-300">
      <div className="px-8 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 hidden sm:block">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </h2>
        <div className="flex items-center gap-4 ml-auto">

          {/* Dark Mode Toggle */}
          <button
            onClick={toggle}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            style={{ background: isDark ? '#4f46e5' : '#e2e8f0' }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md transition-all duration-300"
              style={{
                transform: isDark ? 'translateX(28px)' : 'translateX(0)',
                background: isDark ? '#1e1b4b' : 'white',
              }}
            >
              {isDark ? '🌙' : '☀️'}
            </span>
          </button>

          {/* Notification Bell */}
          <div className="bg-gray-100 dark:bg-slate-700 p-2 rounded-full text-gray-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </div>

          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-600">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-md">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-800 dark:text-slate-100">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar