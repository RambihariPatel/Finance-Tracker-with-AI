import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

function Landing() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Expense Tracking',
      desc: 'Log every income and expense in seconds. Categorize and filter transactions with ease.'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      title: 'Smart Budgeting',
      desc: 'Set monthly budgets per category. Get alerts before you overspend.'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'AI Financial Insights',
      desc: 'Get personalized financial advice powered by AI. Predict next month\'s spending before it happens.'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Visual Reports',
      desc: 'Interactive charts and monthly reports. Export to PDF anytime.'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Bank-Grade Security',
      desc: 'Your data is protected with JWT authentication and bcrypt encryption.'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: 'Unified Dashboard',
      desc: 'All your financial data in one beautiful, real-time dashboard.'
    }
  ]

  const stats = [
    { value: '100%', label: 'Free to Use' },
    { value: 'AI', label: 'Powered Insights' },
    { value: '6+', label: 'Powerful Features' },
    { value: '∞', label: 'Transactions' }
  ]

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden font-sans">

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-wide">FinTrack<span className="text-indigo-400">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition text-sm font-medium">
              Log In
            </Link>
            <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-lg shadow-indigo-600/25">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-purple-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-0 w-64 h-64 bg-blue-700/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            AI-Powered Finance Management
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Take Control of
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Finances
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track expenses, set budgets, and get AI-powered insights — all in one beautiful dashboard. Start making smarter money decisions today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              Start for Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Card */}
        <div className="relative max-w-5xl mx-auto mt-20">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent z-10 pointer-events-none bottom-0 h-1/3 top-auto" />
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1 shadow-2xl backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                <div className="flex-1 bg-white/5 rounded-md h-6 ml-4"></div>
              </div>
              {/* Fake dashboard preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Total Income', val: '₹50,000', color: 'text-green-400' },
                  { label: 'Total Expense', val: '₹18,500', color: 'text-red-400' },
                  { label: 'Budget Left', val: '₹11,500', color: 'text-indigo-400' },
                  { label: 'Net Savings', val: '₹31,500', color: 'text-purple-400' }
                ].map((card, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">{card.label}</p>
                    <p className={`font-bold text-lg mt-1 ${card.color}`}>{card.val}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 bg-white/5 rounded-lg p-3 h-32 flex flex-col">
                  <p className="text-gray-500 text-xs mb-2">Monthly Trend</p>
                  <div className="flex-1 flex items-end gap-2 px-2">
                    {[40, 65, 45, 80, 55, 90].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-sm opacity-80" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 h-32">
                  <p className="text-gray-500 text-xs mb-3">Categories</p>
                  <div className="space-y-2">
                    {[['Food', '38%', 'bg-indigo-500'], ['Housing', '25%', 'bg-purple-500'], ['Transport', '18%', 'bg-pink-500']].map(([label, pct, color]) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{label}</span><span>{pct}</span></div>
                        <div className="h-1.5 bg-white/10 rounded-full"><div className={`h-full rounded-full ${color}`} style={{ width: pct }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5 bg-white/2">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything you need to
              <span className="block text-indigo-400">manage money smarter</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">From simple expense logging to AI-generated insights — we've got it all covered.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group bg-white/3 hover:bg-white/6 border border-white/8 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-indigo-500/15 group-hover:bg-indigo-500/25 text-indigo-400 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-indigo-600/10 rounded-3xl blur-3xl pointer-events-none" />
          <div className="relative bg-gradient-to-br from-indigo-900/50 to-purple-900/30 border border-indigo-500/20 rounded-3xl p-12">
            <h2 className="text-4xl font-black mb-4">Ready to take control?</h2>
            <p className="text-gray-400 text-lg mb-8">Join thousands of users who track smarter with FinTrackAI. Free forever.</p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all duration-300 shadow-xl shadow-indigo-600/30 hover:-translate-y-0.5"
            >
              Create Free Account
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="text-gray-600 text-sm mt-4">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-indigo-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-black">F</span>
          </div>
          <span className="font-bold text-gray-400">FinTrackAI</span>
        </div>
        <p>Built with React, Node.js, MongoDB & OpenAI</p>
      </footer>
    </div>
  )
}

export default Landing
