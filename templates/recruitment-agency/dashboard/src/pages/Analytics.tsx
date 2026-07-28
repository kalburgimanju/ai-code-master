import { useState } from 'react'
import { useAnalyticsOverview } from '../hooks/useApi'
import { BarChart3, Mail, DollarSign, Calendar } from 'lucide-react'

const PERIODS = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
]

export function Analytics() {
  const [period, setPeriod] = useState(30)
  const { data: analytics, isLoading } = useAnalyticsOverview(period)

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  const email = analytics?.email
  const pipeline = analytics?.pipeline
  const calls = analytics?.calls

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">
            Performance metrics for the last {period} days
          </p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Email Metrics */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Performance</h2>
        </div>

        {email ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-400">Total Emails</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{email.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-400">Sent</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{email.sent}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-400">Open Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {(email.open_rate * 100).toFixed(1)}%
              </p>
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${email.open_rate * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-400">Reply Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {(email.reply_rate * 100).toFixed(1)}%
              </p>
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${email.reply_rate * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-dark-400 text-sm">No email data available</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Metrics */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pipeline</h2>
          </div>

          {pipeline ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-dark-400">Deals Created</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{pipeline.deals_created}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-dark-400">Pipeline Value</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ${pipeline.pipeline_value.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-dark-400 text-sm">No pipeline data</p>
          )}
        </div>

        {/* Call Metrics */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Calls</h2>
          </div>

          {calls ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-dark-400">Calls Booked</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{calls.booked}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-dark-400 text-sm">No call data</p>
          )}
        </div>
      </div>

      {/* Detailed Rates */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Rates</h2>
        {email ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-dark-700">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {(email.open_rate * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">Open Rate</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-dark-700">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {((email.click_rate ?? 0) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">Click Rate</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-dark-700">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {(email.reply_rate * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">Reply Rate</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-dark-700">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {((email.bounce_rate ?? 0) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">Bounce Rate</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-dark-400 text-sm">No data available</p>
        )}
      </div>
    </div>
  )
}
