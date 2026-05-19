import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInsights, fetchPrediction } from '../redux/slices/insightSlice'
import { formatCurrency } from '../utils/format'

function Insights() {
  const dispatch = useDispatch()
  const { insights, predictions, provider, loading, error } = useSelector((state) => state.insights)

  useEffect(() => {
    dispatch(fetchInsights())
    dispatch(fetchPrediction())
  }, [dispatch])

  const refreshInsights = () => {
    dispatch(fetchInsights())
    dispatch(fetchPrediction())
  }

  const downloadInsights = () => {
    const text = `FinTrackAI - Financial Insights\n` +
      `Date: ${new Date().toLocaleDateString()}\n` +
      `=======================================\n\n` +
      `--- Recommendations ---\n` +
      insights.map(i => `${i.title || 'Insight'}\n${i.description || i}`).join('\n\n') + 
      `\n\n--- Spending Prediction ---\n` +
      `Estimated Expense Next Month: ${formatCurrency(predictions.predictedExpense || 0)}\n` +
      `Model Confidence: ${predictions.confidence || 0}%\n`;
      
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-insights-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6 px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Financial Insights</h1>
          <p className="text-gray-500">Smart analysis of your spending habits</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={downloadInsights}
            disabled={loading || insights.length === 0}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download
          </button>
          <button 
            onClick={refreshInsights}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold text-gray-800">Recommendations</h2>
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
              {provider || 'heuristic'} AI
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
              <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="font-medium text-gray-500">Generating personalized insights...</p>
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition">
                  <h3 className="font-bold text-gray-800 mb-2">{insight.title || 'Insight'}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{insight.description || insight}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-300 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-gray-500">Not enough data to generate insights.</p>
              <p className="text-gray-400 text-sm mt-1">Add more transactions to get personalized recommendations.</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Spending Prediction</h2>
          
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-10">Calculating prediction...</p>
          ) : predictions.predictedExpense !== undefined ? (
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Estimated Expense Next Month</p>
                <p className="text-4xl font-black text-gray-800">
                  {formatCurrency(predictions.predictedExpense)}
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">Model Confidence</span>
                  <span className="text-sm font-bold text-indigo-600">{predictions.confidence || 85}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${predictions.confidence || 85}%` }}
                  ></div>
                </div>
              </div>

              {predictions.budgetRisk && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-700 font-medium">
                        Budget Warning
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Your predicted spending is trending above your monthly budget limit.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-10 text-center">Prediction model requires more transaction history.</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default Insights