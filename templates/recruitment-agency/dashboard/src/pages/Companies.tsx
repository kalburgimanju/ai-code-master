import { useState } from 'react'
import { useCompanies } from '../hooks/useApi'
import { Building2, ExternalLink, Filter } from 'lucide-react'

const STAGES = [
  { value: '', label: 'All Stages' },
  { value: 'discovered', label: 'Discovered' },
  { value: 'researched', label: 'Researched' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'call_booked', label: 'Call Booked' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
]

const stageColor = (stage: string) => {
  const colors: Record<string, string> = {
    discovered: 'badge-neutral',
    researched: 'badge-info',
    contacted: 'badge-warning',
    replied: 'badge-success',
    call_booked: 'badge-success',
    qualified: 'badge-success',
    proposal_sent: 'badge-info',
    closed_won: 'badge-success',
    closed_lost: 'badge-error',
  }
  return colors[stage] || 'badge-neutral'
}

export function Companies() {
  const [stage, setStage] = useState('')
  const [page, setPage] = useState(0)
  const limit = 20

  const { data, isLoading } = useCompanies({ stage: stage || undefined, limit, offset: page * limit })
  const companies = data?.companies ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Companies</h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">
            {total} companies in your pipeline
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-gray-400" />
        <div className="flex gap-2 flex-wrap">
          {STAGES.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStage(s.value); setPage(0) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                stage === s.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Company List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : companies.length > 0 ? (
        <>
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Industry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-dark-700 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-gray-500 dark:text-dark-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{company.name}</p>
                          {company.domain && (
                            <a
                              href={`https://${company.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 hover:text-primary-600 flex items-center gap-1"
                            >
                              {company.domain}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-400">{company.industry || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-400">
                      {company.employee_count?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${stageColor(company.stage)}`}>
                        {company.stage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-400">{company.source}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-400">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-dark-400">
                Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn-secondary text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-secondary text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-300 dark:text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No companies found</h3>
          <p className="text-gray-500 dark:text-dark-400">
            {stage ? 'Try a different filter' : 'Run a discovery agent to find companies'}
          </p>
        </div>
      )}
    </div>
  )
}
