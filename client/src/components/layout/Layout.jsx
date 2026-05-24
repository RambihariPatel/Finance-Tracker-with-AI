import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BudgetAlertBanner from '../common/BudgetAlertBanner'

const PAGE_NAMES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budget': 'Budget',
  '/insights': 'AI Insights',
  '/groups': 'Group Splitter',
  '/reports': 'Reports',
  '/profile': 'Profile'
}

function Footer() {
  const location = useLocation()
  const current = PAGE_NAMES[location.pathname] || 'FinTrackAI'
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-100 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-8 py-4 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* Left — branding */}
        <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
          <div className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-500 dark:text-slate-400">FinTrack<span className="text-indigo-500">AI</span></span>
          <span className="hidden sm:inline text-gray-300 dark:text-slate-600">|</span>
          <span className="hidden sm:inline">© {year} All rights reserved.</span>
        </div>

        {/* Center — breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>Home</span>
          <svg className="w-3 h-3 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
          </svg>
          <span className="text-indigo-500 font-semibold">{current}</span>
        </div>

        {/* Right — quick links */}
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-slate-500">
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 md:z-0`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Budget Alert Banner — shows automatically when budget >= 80% used */}
        <BudgetAlertBanner />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 w-full custom-scrollbar dark:bg-slate-950 transition-colors duration-300">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

export default Layout