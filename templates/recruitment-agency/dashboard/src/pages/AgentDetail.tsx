import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAgent, useAgentRuns, useAgentRunDetail, useRunAgent } from '../hooks/useApi'
import { ArrowLeft, Bot, Play, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, ChevronDown, Mail, Building2, Send, Timer, FileText } from 'lucide-react'
import type { AgentRun, AgentRunDetail, StepLogEntry, RunEmail, RunCompany } from '../types'

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return ''
  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt).getTime()
  const diffMs = end - start
  if (diffMs < 1000) return `${diffMs}ms`
  if (diffMs < 60000) return `${(diffMs / 1000).toFixed(1)}s`
  const mins = Math.floor(diffMs / 60000)
  const secs = Math.floor((diffMs % 60000) / 1000)
  return `${mins}m ${secs}s`
}

function StepIcon({ status }: { status: StepLogEntry['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
    case 'running':
      return <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" />
    default:
      return <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-dark-600 flex-shrink-0" />
  }
}

function StepCard({ step, index }: { step: StepLogEntry; index: number }) {
  const [expanded, setExpanded] = useState(step.status === 'running')
  const duration = formatDuration(step.started_at, step.completed_at)

  const statusColors: Record<string, string> = {
    running: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10',
    completed: 'border-l-green-500 bg-green-50/30 dark:bg-green-900/5',
    failed: 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10',
    pending: 'border-l-gray-300 dark:border-l-dark-600',
  }

  const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
    running: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Running' },
    completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Done' },
    failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Failed' },
    pending: { bg: 'bg-gray-100 dark:bg-dark-700', text: 'text-gray-600 dark:text-dark-400', label: 'Pending' },
  }

  const badge = statusBadge[step.status] || statusBadge.pending
  const hasDetails = step.details || step.result || step.completed_at

  return (
    <div className={`border-l-4 rounded-r-lg ${statusColors[step.status] || statusColors.pending} transition-all`}>
      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
        disabled={!hasDetails}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-mono text-gray-400 dark:text-dark-500 w-6 text-right flex-shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <StepIcon status={step.status} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-medium ${
                step.status === 'running' ? 'text-blue-600 dark:text-blue-400' :
                step.status === 'completed' ? 'text-gray-900 dark:text-white' :
                step.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                'text-gray-400 dark:text-dark-500'
              }`}>
                {step.name}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
            </div>
            {step.details && !expanded && (
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5 truncate">{step.details}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {duration && (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-500">
              <Timer className="h-3 w-3" />
              {duration}
            </span>
          )}
          {step.started_at && (
            <span className="text-xs text-gray-400 dark:text-dark-500 whitespace-nowrap">
              {new Date(step.started_at).toLocaleTimeString()}
            </span>
          )}
          {hasDetails && (
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && hasDetails && (
        <div className="px-4 pb-3 ml-11 space-y-2">
          {step.details && (
            <div className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-gray-100 dark:border-dark-700">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText className="h-3.5 w-3.5 text-gray-400 dark:text-dark-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">Details</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-dark-300 whitespace-pre-wrap">{step.details}</p>
            </div>
          )}
          {step.result && (
            <div className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-gray-100 dark:border-dark-700">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-gray-400 dark:text-dark-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">Result</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-dark-300 whitespace-pre-wrap">{step.result}</p>
            </div>
          )}
          {step.completed_at && (
            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-dark-500">
              <span>Started: {new Date(step.started_at).toLocaleTimeString()}</span>
              <span>Completed: {new Date(step.completed_at).toLocaleTimeString()}</span>
              {duration && <span>Duration: {duration}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StepsTimeline({ steps }: { steps: StepLogEntry[] }) {
  if (!steps || steps.length === 0) {
    return (
      <p className="text-gray-500 dark:text-dark-400 text-sm italic">No steps recorded yet</p>
    )
  }

  const completedCount = steps.filter(s => s.status === 'completed').length
  const failedCount = steps.filter(s => s.status === 'failed').length
  const totalCount = steps.length

  return (
    <div className="space-y-1">
      {/* Summary bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-400 mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {completedCount} completed
          </span>
          {failedCount > 0 && (
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              {failedCount} failed
            </span>
          )}
        </div>
        <span>{totalCount} total steps</span>
      </div>

      {/* Step cards */}
      {steps.map((step, i) => (
        <StepCard key={i} step={step} index={i} />
      ))}
    </div>
  )
}

function RunCard({ run, onClick, isSelected }: { run: AgentRun; onClick: () => void; isSelected: boolean }) {
  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    completed: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-500', label: 'Completed' },
    running: { icon: <Clock className="h-4 w-4 animate-spin" />, color: 'text-blue-500', label: 'Running' },
    failed: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-500', label: 'Failed' },
    pending: { icon: <Clock className="h-4 w-4" />, color: 'text-yellow-500', label: 'Pending' },
    partial: { icon: <AlertCircle className="h-4 w-4" />, color: 'text-orange-500', label: 'Partial' },
  }
  const config = statusConfig[run.status] || statusConfig.pending

  return (
    <button
      onClick={onClick}
      className={`w-full text-left card p-4 hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary-500 dark:ring-primary-400 shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={config.color}>{config.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Run: {run.mode}
              </span>
              <span className={`badge ${run.status === 'completed' ? 'badge-success' : run.status === 'running' ? 'badge-info' : run.status === 'failed' ? 'badge-error' : 'badge-neutral'}`}>
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-dark-400">
              <span>{new Date(run.created_at).toLocaleString()}</span>
              {run.duration_seconds != null && (
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {run.duration_seconds < 60 ? `${run.duration_seconds.toFixed(1)}s` : `${(run.duration_seconds / 60).toFixed(1)}m`}
                </span>
              )}
              {run.items_processed > 0 && (
                <span className={run.items_failed > 0 ? 'text-orange-500 dark:text-orange-400' : ''}>
                  {run.items_succeeded}/{run.items_processed} items
                  {run.items_failed > 0 && ` (${run.items_failed} failed)`}
                </span>
              )}
            </div>
            {run.error_message && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1 truncate">{run.error_message}</p>
            )}
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
      </div>
    </button>
  )
}

export function AgentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: agent, isLoading: agentLoading } = useAgent(id!)
  const { data: runs, isLoading: runsLoading } = useAgentRuns(id!)
  const runAgent = useRunAgent()

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const { data: selectedRun } = useAgentRunDetail(
    id!,
    selectedRunId || '',
    !!selectedRunId
  )

  // Auto-select the latest running or most recent run
  const activeRun = selectedRunId
    ? runs?.find((r) => r.id === selectedRunId)
    : runs?.find((r) => r.status === 'running') || runs?.[0]

  const { data: liveRun } = useAgentRunDetail(
    id!,
    activeRun?.id || '',
    !!activeRun && activeRun.status === 'running'
  )

  const displayRun = selectedRun || liveRun || activeRun
  const isRunning = displayRun?.status === 'running' || displayRun?.status === 'pending'
  const hasSteps = displayRun && 'steps_log' in displayRun
  const stepsLog = hasSteps ? (displayRun as AgentRunDetail).steps_log : []
  const currentStep = hasSteps ? (displayRun as AgentRunDetail).current_step : null

  if (agentLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-dark-400">Agent not found</p>
        <button onClick={() => navigate('/agents')} className="btn-primary mt-4">
          Back to Agents
        </button>
      </div>
    )
  }

  const handleRun = async () => {
    await runAgent.mutateAsync({ id: id!, mode: 'full', dry_run: true })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/agents')}
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-white mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{agent.name}</h1>
              <p className="text-gray-500 dark:text-dark-400">{agent.specialization || 'General Agent'}</p>
            </div>
          </div>
          <button
            onClick={handleRun}
            disabled={runAgent.isPending || isRunning}
            className="btn-primary"
          >
            <Play className="h-4 w-4 mr-2" />
            {runAgent.isPending ? 'Starting...' : isRunning ? 'Running...' : 'Run Agent'}
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Industries</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {agent.config?.discovery_industries?.slice(0, 3).join(', ') || 'Any'}
              {(agent.config?.discovery_industries?.length || 0) > 3 && '...'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Research</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {agent.config?.research_depth || 'standard'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Outreach Tone</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {agent.config?.outreach_tone || 'professional_peer'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Follow-up</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {agent.config?.followup_sequence || 'standard_3_touch'}
            </p>
          </div>
        </div>
        {agent.value_prop && (
          <div className="mt-4 bg-primary-50 dark:bg-primary-900/10 rounded-lg p-3">
            <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">Value Proposition</p>
            <p className="text-sm text-gray-700 dark:text-dark-300">{agent.value_prop}</p>
          </div>
        )}
      </div>

      {/* Live Progress */}
      {displayRun && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRunning ? 'Live Progress' : 'Run Details'}
            </h2>
            {isRunning && (
              <span className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Live
              </span>
            )}
          </div>

          {/* Progress bar */}
          {stepsLog.length > 0 && isRunning && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-400 mb-2">
                <span>{currentStep || 'Starting...'}</span>
                <span>
                  {stepsLog.filter((s: StepLogEntry) => s.status === 'completed').length} / {stepsLog.length} steps
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(stepsLog.filter((s: StepLogEntry) => s.status === 'completed').length / stepsLog.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Steps timeline */}
          {stepsLog.length > 0 ? (
            <StepsTimeline steps={stepsLog} />
          ) : (
            <div className="text-center py-8">
              {isRunning ? (
                <>
                  <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-dark-400">Agent is starting up...</p>
                </>
              ) : displayRun.error_message ? (
                <div className="text-red-500 dark:text-red-400">
                  <XCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">{displayRun.error_message}</p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-dark-400 text-sm">Run completed with no step details</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Output Summary */}
      {selectedRun && selectedRun.output_data && Object.keys(selectedRun.output_data).length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-500" />
            Run Output
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(selectedRun.output_data)
              .filter(([key]) => !['steps_log', 'current_step', 'report'].includes(key))
              .map(([key, value]) => {
                const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                let displayValue = ''
                if (typeof value === 'number') {
                  displayValue = value.toLocaleString()
                } else if (typeof value === 'boolean') {
                  displayValue = value ? 'Yes' : 'No'
                } else if (Array.isArray(value)) {
                  displayValue = `${value.length} items`
                } else if (typeof value === 'object' && value !== null) {
                  displayValue = JSON.stringify(value)
                } else if (value != null) {
                  displayValue = String(value)
                }
                return (
                  <div key={key} className="bg-gray-50 dark:bg-dark-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">{displayKey}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={displayValue}>
                      {displayValue || '-'}
                    </p>
                  </div>
                )
              })}
          </div>
          {typeof selectedRun.output_data.report === 'string' && (
            <div className="mt-4 bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-dark-400 mb-2 font-medium">Generated Report</p>
              <pre className="text-sm text-gray-700 dark:text-dark-300 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {selectedRun.output_data.report}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Companies Contacted */}
      {selectedRun && selectedRun.companies && selectedRun.companies.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary-500" />
            Companies Contacted
          </h2>
          <div className="space-y-3">
            {selectedRun.companies.map((company: RunCompany) => (
              <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-400">
                    {company.industry} {company.employee_count ? `· ${company.employee_count} employees` : ''}
                  </p>
                </div>
                <span className="badge badge-info capitalize">{company.stage.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emails Sent */}
      {selectedRun && selectedRun.emails && selectedRun.emails.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary-500" />
            Emails ({selectedRun.emails.length})
          </h2>
          <div className="space-y-4">
            {selectedRun.emails.map((email: RunEmail) => {
              const statusColors: Record<string, string> = {
                sent: 'badge-success',
                delivered: 'badge-success',
                opened: 'badge-info',
                clicked: 'badge-info',
                replied: 'badge-success',
                bounced: 'badge-error',
                failed: 'badge-error',
                pending: 'badge-neutral',
              }
              return (
                <div key={email.id} className="border border-gray-200 dark:border-dark-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        To: {email.to_name} &lt;{email.to_email}&gt;
                      </span>
                    </div>
                    <span className={`badge ${statusColors[email.status] || 'badge-neutral'}`}>
                      {email.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-dark-300 mb-1">
                    <span className="font-medium">Subject:</span> {email.subject}
                  </p>
                  {email.body_text && (
                    <p className="text-xs text-gray-500 dark:text-dark-400 bg-gray-50 dark:bg-dark-800 rounded p-2 mt-2 whitespace-pre-wrap">
                      {email.body_text}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-dark-500">
                    {email.sent_at && <span>Sent: {new Date(email.sent_at).toLocaleString()}</span>}
                    <span>Step {email.sequence_step}</span>
                    {email.is_followup && <span className="badge badge-neutral">Follow-up</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Run History */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Run History</h2>
        {runsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : runs && runs.length > 0 ? (
          <div className="space-y-3">
            {runs.map((run) => (
              <RunCard
                key={run.id}
                run={run}
                isSelected={run.id === (selectedRun || activeRun)?.id}
                onClick={() => setSelectedRunId(run.id === selectedRunId ? null : run.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-dark-400 text-center py-8">No runs yet</p>
        )}
      </div>
    </div>
  )
}
