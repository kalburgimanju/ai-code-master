export interface Agent {
  id: string
  name: string
  description: string | null
  specialization: string | null
  status: 'active' | 'inactive' | 'running' | 'error' | 'paused'
  last_run_at: string | null
  next_run_at: string | null
  created_at: string
}

export interface AgentDetail extends Agent {
  persona: string | null
  value_prop: string | null
  case_study: string | null
  config: AgentConfigDetail
  recent_runs: AgentRun[]
}

export interface AgentConfigDetail {
  discovery_industries: string[]
  discovery_company_size: string | null
  discovery_hiring_signals: string[]
  max_companies_per_run: number
  research_depth: string
  research_focus_areas: string[]
  outreach_tone: string
  outreach_daily_limit: number
  outreach_delay_seconds: number
  followup_sequence: string
  scheduler_meeting_type: string
  scheduler_duration_minutes: number
}

export interface AgentRun {
  id: string
  mode: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial'
  items_processed: number
  items_succeeded: number
  items_failed: number
  duration_seconds: number | null
  created_at: string
  completed_at: string | null
  error_message?: string | null
}

export interface StepLogEntry {
  name: string
  details: string | null
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string
  completed_at: string | null
  result: string | null
}

export interface RunEmail {
  id: string
  to_email: string
  to_name: string
  subject: string
  status: string
  sent_at: string | null
  company_id: string | null
  contact_id: string | null
  is_followup: boolean
  sequence_step: number
  body_text: string | null
}

export interface RunCompany {
  id: string
  name: string
  industry: string | null
  employee_count: number | null
  stage: string
}

export interface AgentRunDetail extends AgentRun {
  agent_id: string
  started_at: string | null
  steps_log: StepLogEntry[]
  current_step: string | null
  output_data: Record<string, unknown>
  companies: RunCompany[]
  emails: RunEmail[]
}

export interface Company {
  id: string
  name: string
  domain: string | null
  industry: string | null
  employee_count: number | null
  funding_stage: string | null
  stage: string
  tech_stack: string[]
  hiring_needs: string[]
  headquarters: string | null
  remote_friendly: boolean
  source: string
  confidence_score: number
  created_at: string
  last_enriched_at: string | null
}

export interface CompanyDetail extends Company {
  linkedin_url: string | null
  description: string | null
  total_funding_usd: number | null
  pipeline_probability: number
  pain_points: string[]
  growth_signals: string[]
  locations: string[]
  investors: string[]
  competitors: string[]
  recent_news: Record<string, unknown>[]
  crm_company_id: string | null
  contacts: Contact[]
  emails: EmailLog[]
  deals: PipelineDeal[]
  updated_at: string
}

export interface Contact {
  id: string
  company_id: string
  first_name: string
  last_name: string
  full_name: string
  email: string | null
  title: string
  seniority: string | null
  is_decision_maker: boolean
  is_hiring_manager: boolean
  linkedin_url: string | null
  engagement_score: number
  emails_sent: number
  emails_opened: number
  emails_replied: number
}

export interface OutreachCampaign {
  id: string
  agent_id: string
  name: string
  sequence_name: string
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed'
  emails_sent: number
  emails_opened: number
  emails_replied: number
  emails_bounced: number
  open_rate: number
  reply_rate: number
  created_at: string
  started_at: string | null
}

export interface PipelineDeal {
  id: string
  company_id: string
  contact_id: string | null
  name: string
  stage: string
  probability: number
  value_usd: number | null
  expected_close_date: string | null
  source: string
  created_at: string
  stage_changed_at: string
}

export interface PipelineOverview {
  by_stage: Record<string, { count: number; value: number }>
  total_deals: number
  total_value: number
}

export interface EmailLog {
  id: string
  subject: string
  status: string
  sent_at: string | null
  opened_at: string | null
  replied_at: string | null
  sequence_step: number
  is_followup: boolean
}

export interface AnalyticsOverview {
  period_days: number
  email: {
    total: number
    sent: number
    opened: number
    clicked: number
    replied: number
    bounced: number
    open_rate: number
    click_rate: number
    reply_rate: number
    bounce_rate: number
  }
  pipeline: {
    deals_created: number
    pipeline_value: number
  }
  calls: {
    booked: number
  }
}

export interface PaginatedResponse<T> {
  total: number
  limit: number
  offset: number
  [key: string]: unknown
}
