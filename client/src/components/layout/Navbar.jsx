import { useSelector } from 'react-redux'

function Navbar() {
  const { user } = useSelector((state) => state.auth)

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 z-10 sticky top-0">
      <div className="px-8 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 hidden sm:block">Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h2>
        <div className="flex items-center gap-4 ml-auto">
          <div className="bg-gray-100 p-2 rounded-full text-gray-500 hover:text-indigo-600 cursor-pointer transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </div>
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-md">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar