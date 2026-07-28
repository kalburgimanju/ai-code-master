import { useState } from 'react'
import { useCampaigns, useCreateCampaign, useLaunchCampaign, useAgents } from '../hooks/useApi'
import { Mail, Plus, Play, Pause, CheckCircle, XCircle, Clock } from 'lucide-react'

const statusIcon = (status: string) => {
  switch (status) {
    case 'running':
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'paused':
      return <Pause className="h-4 w-4 text-yellow-500" />
    default:
      return <Mail className="h-4 w-4 text-gray-400" />
  }
}

export function Campaigns() {
  const { data: campaigns, isLoading } = useCampaigns()
  const { data: agents } = useAgents()
  const createCampaign = useCreateCampaign()
  const launchCampaign = useLaunchCampaign()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')

  const handleCreate = async () => {
    if (!newName.trim() || !selectedAgent) return
    await createCampaign.mutateAsync({ name: newName, agent_id: selectedAgent })
    setNewName('')
    setSelectedAgent('')
    setShowCreate(false)
  }

  const handleLaunch = async (id: string) => {
    await launchCampaign.mutateAsync({ id, dry_run: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">Manage outreach campaigns</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card w-full max-w-md p-6 mx-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Campaign</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Campaign Name</label>
                <input
                  type="text"
                  className="input mt-1"
                  placeholder="e.g., Q1 SaaS Outreach"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Agent</label>
                <select
                  className="input mt-1"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  <option value="">Select an agent</option>
                  {agents?.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleCreate} className="btn-primary" disabled={createCampaign.isPending}>
                  {createCampaign.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-dark-400">
                      Sequence: {campaign.sequence_name} | Created: {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {statusIcon(campaign.status)}
                      <span className="badge badge-neutral capitalize">{campaign.status}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                      <button
                        onClick={() => handleLaunch(campaign.id)}
                        disabled={launchCampaign.isPending}
                        className="btn-primary text-sm"
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Launch
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-dark-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.emails_sent}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-400">Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(campaign.open_rate * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-400">Opened</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(campaign.reply_rate * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-400">Replied</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.emails_bounced}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-400">Bounced</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Mail className="h-16 w-16 text-gray-300 dark:text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No campaigns yet</h3>
          <p className="text-gray-500 dark:text-dark-400 mb-6">
            Create a campaign to start outreach to companies
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </button>
        </div>
      )}
    </div>
  )
}
