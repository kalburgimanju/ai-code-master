import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAgents, useCreateAgent, useRunAgent } from '../hooks/useApi'
import { Bot, Plus, Play, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const PERSONAS = [
  { value: 'saas_hunter', label: 'SaaS Hunter', desc: 'Targets Series A-C SaaS companies' },
  { value: 'fintech_recruiter', label: 'FinTech Recruiter', desc: 'Targets FinTech companies' },
  { value: 'ai_ml_specialist', label: 'AI/ML Specialist', desc: 'Targets AI/ML companies' },
]

export function Agents() {
  const navigate = useNavigate()
  const { data: agents, isLoading } = useAgents()
  const createAgent = useCreateAgent()
  const runAgent = useRunAgent()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPersona, setNewPersona] = useState('saas_hunter')

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createAgent.mutateAsync({ name: newName, persona: newPersona })
    setNewName('')
    setShowCreate(false)
  }

  const handleRun = async (agentId: string) => {
    await runAgent.mutateAsync({ id: agentId, mode: 'full', dry_run: true })
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agents</h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">Manage your AI recruitment agents</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </button>
      </div>

      {/* Create Agent Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card w-full max-w-md p-6 mx-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Agent Name</label>
                <input
                  type="text"
                  className="input mt-1"
                  placeholder="e.g., SaaS Hunter 1"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Persona</label>
                <div className="space-y-2 mt-1">
                  {PERSONAS.map((p) => (
                    <label
                      key={p.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        newPersona === p.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="persona"
                        value={p.value}
                        checked={newPersona === p.value}
                        onChange={(e) => setNewPersona(e.target.value)}
                        className="text-primary-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{p.label}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">{p.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreate(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleCreate} className="btn-primary" disabled={createAgent.isPending}>
                  {createAgent.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 dark:text-dark-400 mt-3">Loading agents...</p>
        </div>
      ) : agents && agents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/agents/${agent.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-dark-400">{agent.specialization || 'General'}</p>
                  </div>
                </div>
                {statusIcon(agent.status)}
              </div>

              {agent.description && (
                <p className="text-sm text-gray-500 dark:text-dark-400 mb-4 line-clamp-2">{agent.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-dark-500 mb-4">
                <span>
                  Last run: {agent.last_run_at ? new Date(agent.last_run_at).toLocaleDateString() : 'Never'}
                </span>
                <span className={`badge ${agent.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                  {agent.status}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleRun(agent.id) }}
                  disabled={runAgent.isPending}
                  className="btn-primary flex-1 text-sm py-1.5"
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Run
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Bot className="h-16 w-16 text-gray-300 dark:text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No agents yet</h3>
          <p className="text-gray-500 dark:text-dark-400 mb-6">
            Create your first agent to start discovering companies automatically
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </button>
        </div>
      )}
    </div>
  )
}
