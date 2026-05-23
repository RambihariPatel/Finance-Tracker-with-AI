import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

function NotFound() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Animated 404 Text */}
        <h1 className="text-[150px] md:text-[200px] font-black leading-none bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl mb-4 select-none animate-pulse">
          404
        </h1>
        
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-100">
          Page not found
        </h2>
        
        <p className="text-lg text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
          Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-4 rounded-xl font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 text-slate-300 hover:text-white"
          >
            Go Back
          </button>
          
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="px-8 py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] hover:-translate-y-1 inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {isAuthenticated ? "Go to Dashboard" : "Back to Home"}
          </Link>
        </div>
      </div>
      
      {/* Decorative floating elements */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-indigo-400 rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-purple-400 rounded-full animate-ping opacity-50" style={{ animationDuration: '4s' }} />
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-60" style={{ animationDuration: '2s' }} />
    </div>
  )
}

export default NotFound
