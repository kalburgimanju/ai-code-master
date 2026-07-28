import { useAgents, useCompanies, usePipeline, useAnalyticsOverview } from '../hooks/useApi'
import {
  Bot,
  Building2,
  Mail,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down'
  icon: React.ElementType
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-dark-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'up' ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {change}
            </div>
          )}
        </div>
        <div className="h-12 w-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { data: agents } = useAgents()
  const { data: companyData } = useCompanies({ limit: 100 })
  const { data: pipeline } = usePipeline()
  const { data: analytics } = useAnalyticsOverview(30)

  const activeAgents = agents?.filter((a) => a.status === 'active').length ?? 0
  const totalCompanies = companyData?.total ?? 0
  const totalDeals = pipeline?.total_deals ?? 0
  const pipelineValue = pipeline?.total_value ?? 0
  const replyRate = analytics?.email?.reply_rate ?? 0
  const openRate = analytics?.email?.open_rate ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-dark-400 mt-1">
          Overview of your recruitment pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Agents"
          value={activeAgents}
          icon={Bot}
        />
        <StatCard
          title="Companies Found"
          value={totalCompanies}
          change="+12% this week"
          changeType="up"
          icon={Building2}
        />
        <StatCard
          title="Pipeline Value"
          value={`$${pipelineValue.toLocaleString()}`}
          change="+8% this month"
          changeType="up"
          icon={DollarSign}
        />
        <StatCard
          title="Reply Rate"
          value={`${(replyRate * 100).toFixed(1)}%`}
          change={replyRate > 0.05 ? 'Above target' : 'Below target'}
          changeType={replyRate > 0.05 ? 'up' : 'down'}
          icon={Mail}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Overview */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pipeline by Stage</h2>
          {pipeline?.by_stage && Object.keys(pipeline.by_stage).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(pipeline.by_stage).map(([stage, data]) => (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-primary-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-300 capitalize">
                      {stage.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-dark-400">{data.count} deals</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${data.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-dark-400 text-sm">No pipeline data yet</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Performance</h2>
          {analytics?.email ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-dark-400">Emails Sent</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.email.sent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-dark-400">Open Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {(openRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-dark-400">Reply Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {(replyRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-dark-400">Click Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {((analytics.email.click_rate ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-dark-400">Bounce Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {((analytics.email.bounce_rate ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-dark-400">Calls Booked</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.calls.booked}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-dark-400 text-sm">No email data yet</p>
          )}
        </div>
      </div>

      {/* Active Agents */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Agents</h2>
        {agents && agents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">Specialization</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">Last Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                {agents.slice(0, 5).map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{agent.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-400">{agent.specialization || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          agent.status === 'active'
                            ? 'badge-success'
                            : agent.status === 'error'
                            ? 'badge-error'
                            : 'badge-neutral'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-400">
                      {agent.last_run_at
                        ? new Date(agent.last_run_at).toLocaleDateString()
                        : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-gray-300 dark:text-dark-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-dark-400">No agents configured yet</p>
            <p className="text-sm text-gray-400 dark:text-dark-500 mt-1">Create an agent to start discovering companies</p>
          </div>
        )}
      </div>
    </div>
  )
}
