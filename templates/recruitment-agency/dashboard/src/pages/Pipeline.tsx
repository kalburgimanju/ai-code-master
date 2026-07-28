import { usePipeline, useDeals } from '../hooks/useApi'
import { Kanban, DollarSign, TrendingUp } from 'lucide-react'

const STAGE_ORDER = [
  'discovered',
  'researched',
  'contacted',
  'replied',
  'call_booked',
  'qualified',
  'proposal_sent',
  'closed_won',
  'closed_lost',
]

const STAGE_COLORS: Record<string, string> = {
  discovered: 'bg-gray-100 dark:bg-dark-700',
  researched: 'bg-blue-50 dark:bg-blue-900/20',
  contacted: 'bg-yellow-50 dark:bg-yellow-900/20',
  replied: 'bg-green-50 dark:bg-green-900/20',
  call_booked: 'bg-purple-50 dark:bg-purple-900/20',
  qualified: 'bg-indigo-50 dark:bg-indigo-900/20',
  proposal_sent: 'bg-orange-50 dark:bg-orange-900/20',
  closed_won: 'bg-green-100 dark:bg-green-900/30',
  closed_lost: 'bg-red-50 dark:bg-red-900/20',
}

const STAGE_BORDER: Record<string, string> = {
  discovered: 'border-gray-300 dark:border-dark-600',
  researched: 'border-blue-300 dark:border-blue-700',
  contacted: 'border-yellow-300 dark:border-yellow-700',
  replied: 'border-green-300 dark:border-green-700',
  call_booked: 'border-purple-300 dark:border-purple-700',
  qualified: 'border-indigo-300 dark:border-indigo-700',
  proposal_sent: 'border-orange-300 dark:border-orange-700',
  closed_won: 'border-green-400 dark:border-green-600',
  closed_lost: 'border-red-300 dark:border-red-700',
}

export function Pipeline() {
  const { data: pipeline, isLoading: pipelineLoading } = usePipeline()
  const { data: dealData, isLoading: dealsLoading } = useDeals({ limit: 100 })
  const deals = dealData?.deals ?? []

  const isLoading = pipelineLoading || dealsLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline</h1>
        <p className="text-gray-500 dark:text-dark-400 mt-1">
          {pipeline?.total_deals ?? 0} deals worth ${(pipeline?.total_value ?? 0).toLocaleString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Kanban className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pipeline?.total_deals ?? 0}</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">Total Deals</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(pipeline?.total_value ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-400">Pipeline Value</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pipeline?.by_stage ? Object.keys(pipeline.by_stage).length : 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-400">Active Stages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4 min-w-max">
            {STAGE_ORDER.map((stage) => {
              const stageData = pipeline?.by_stage?.[stage]
              const stageDeals = deals.filter((d) => d.stage === stage)

              return (
                <div
                  key={stage}
                  className={`w-72 flex-shrink-0 rounded-xl border ${STAGE_BORDER[stage]} ${STAGE_COLORS[stage]} p-3`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-300 capitalize">
                      {stage.replace(/_/g, ' ')}
                    </h3>
                    <span className="text-xs font-medium text-gray-500 dark:text-dark-400">
                      {stageData?.count ?? 0}
                    </span>
                  </div>

                  {stageData && stageData.value > 0 && (
                    <p className="text-xs text-gray-500 dark:text-dark-400 mb-3">
                      ${stageData.value.toLocaleString()}
                    </p>
                  )}

                  <div className="space-y-2">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-gray-200 dark:border-dark-700 shadow-sm"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{deal.name}</p>
                        {deal.value_usd && (
                          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                            ${deal.value_usd.toLocaleString()}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 dark:text-dark-500">
                            {deal.probability}% likely
                          </span>
                          <span className="text-xs text-gray-400 dark:text-dark-500">
                            {new Date(deal.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}

                    {stageDeals.length === 0 && (
                      <p className="text-xs text-gray-400 dark:text-dark-500 text-center py-2">No deals</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
