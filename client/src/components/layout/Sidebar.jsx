import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'

function Sidebar({ onClose }) {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Transactions', path: '/transactions', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Budget', path: '/budget', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
    { label: 'AI Insights', path: '/insights', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Reports', path: '/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Profile', path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col shadow-xl z-20">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 overflow-hidden rounded-xl bg-slate-800 flex-shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.3)] border border-indigo-500/30">
            <img src="/logo.png" alt="FinTrackAI Logo" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">FinTrack<span className="text-indigo-400">AI</span></h1>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 group ${
              isActive(item.path) 
                ? 'bg-indigo-600 text-white font-semibold shadow-md' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg 
              className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white transition'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar