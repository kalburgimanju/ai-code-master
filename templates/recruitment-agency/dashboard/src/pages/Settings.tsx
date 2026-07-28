import { useState } from 'react'
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react'

export function Settings() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-dark-400 mt-1">Configure your recruitment platform</p>
      </div>

      {/* General Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <SettingsIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Company Name</label>
            <input type="text" className="input mt-1" defaultValue="RecruitAI Agency" />
          </div>
          <div>
            <label className="label">From Email</label>
            <input type="email" className="input mt-1" defaultValue="recruiting@yourdomain.com" />
          </div>
          <div>
            <label className="label">From Name</label>
            <input type="text" className="input mt-1" defaultValue="Your Name" />
          </div>
        </div>
      </div>

      {/* LLM Settings */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">LLM Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Provider</label>
            <select className="input mt-1">
              <option value="openrouter">OpenRouter</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <div>
            <label className="label">Model</label>
            <input type="text" className="input mt-1" defaultValue="anthropic/claude-3.5-sonnet" />
          </div>
          <div>
            <label className="label">Temperature</label>
            <input type="number" className="input mt-1" defaultValue="0.7" step="0.1" min="0" max="2" />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features</h2>
        <div className="space-y-3">
          {[
            { label: 'AI Research', key: 'ai_research', default: true },
            { label: 'Auto Outreach', key: 'auto_outreach', default: true },
            { label: 'Auto Follow-up', key: 'auto_followup', default: true },
            { label: 'Auto Scheduling', key: 'auto_scheduling', default: true },
            { label: 'CRM Sync', key: 'crm_sync', default: true },
            { label: 'Analytics', key: 'analytics', default: true },
            { label: 'Dry Run Mode', key: 'dry_run', default: false },
          ].map((feature) => (
            <label key={feature.key} className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-dark-300">{feature.label}</span>
              <div className="relative">
                <input
                  type="checkbox"
                  defaultChecked={feature.default}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-dark-600 peer-checked:bg-primary-600 transition-colors cursor-pointer" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow peer-checked:translate-x-5 transition-transform" />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary">
          {saved ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  )
}
