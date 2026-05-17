import { Outlet, Link, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const PAGE_NAMES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budget': 'Budget',
  '/insights': 'AI Insights',
  '/reports': 'Reports',
  '/profile': 'Profile'
}

function Footer() {
  const location = useLocation()
  const current = PAGE_NAMES[location.pathname] || 'FinTrackAI'
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-100 bg-white/60 backdrop-blur-sm px-8 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* Left — branding */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-500">FinTrack<span className="text-indigo-500">AI</span></span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="hidden sm:inline">© {year} All rights reserved.</span>
        </div>

        {/* Center — breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>Home</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
          </svg>
          <span className="text-indigo-500 font-semibold">{current}</span>
        </div>

        {/* Right — quick links */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link to="/dashboard"  className="hover:text-indigo-500 transition">Dashboard</Link>
          <Link to="/transactions" className="hover:text-indigo-500 transition">Transactions</Link>
          <Link to="/insights"  className="hover:text-indigo-500 transition">AI Insights</Link>
          <Link to="/profile"   className="hover:text-indigo-500 transition">Profile</Link>
        </div>
      </div>
    </footer>
  )
}

function Layout() {
  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 w-full custom-scrollbar">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

export default Layout