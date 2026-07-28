import { Briefcase, Globe, Users, TrendingDown, CheckCircle, Mail, Play } from 'lucide-react'

interface StatsProps {
  stats: {
    total: number
    filtered: number
    applied: number
    remote: number
    contractor: number
    avgApplicants: number
    avgMinSalary: number
    email_count?: number
    last_scrape?: string
  }
  onScrapeTrigger?: () => void
  onEmailTrigger?: () => void
  scraping?: boolean
  emailing?: boolean
}

export default function StatsCards({ stats, onScrapeTrigger, onEmailTrigger, scraping, emailing }: StatsProps) {
  const cards = [
    { label: 'Total Jobs', value: stats.total, icon: Briefcase, color: 'bg-blue-500', onClick: onScrapeTrigger },
    { label: 'Showing', value: stats.filtered, icon: Briefcase, color: 'bg-brand-500', onClick: onScrapeTrigger },
    { label: 'Applied', value: stats.applied, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Remote', value: stats.remote, icon: Globe, color: 'bg-green-500' },
    { label: 'Avg Applicants', value: stats.avgApplicants, icon: TrendingDown, color: 'bg-amber-500' },
    { label: 'Contractor OK', value: stats.contractor, icon: Users, color: 'bg-purple-500' },
    { label: 'Email Notifications', value: stats.email_count || 0, icon: Mail, color: 'bg-indigo-500', onClick: onEmailTrigger },
    { label: 'Last Scrape', value: stats.last_scrape ? new Date(stats.last_scrape).toLocaleString() : 'Never', icon: Play, color: 'bg-red-500', onClick: onScrapeTrigger },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer transition-all hover:scale-105 ${card.onClick ? 'hover:shadow-lg' : ''}`}
          onClick={card.onClick}
        >
          <div className="flex items-center gap-3">
            <div className={`${card.color} text-white p-2 rounded-lg relative`}>
              <card.icon size={20} />
              {(scraping || emailing) && card.label === 'Email Notifications' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              )}
              {(scraping || emailing) && card.label === 'Last Scrape' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">
                {card.onClick && (scraping || emailing)
                  ? (card.label === 'Email Notifications' || card.label === 'Last Scrape' ? 'Running...' : 'Click to trigger')
                  : card.label
                }
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
