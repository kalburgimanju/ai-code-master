import api from './client'
import type {
  Agent,
  AgentDetail,
  AgentRun,
  AgentRunDetail,
  Company,
  CompanyDetail,
  Contact,
  OutreachCampaign,
  PipelineDeal,
  PipelineOverview,
  AnalyticsOverview,
} from '../types'

// Agents
export const getAgents = () => api.get<{ agents: Agent[] }>('/agents')
export const getAgent = (id: string) => api.get<AgentDetail>(`/agents/${id}`)
export const createAgent = (data: { name: string; type?: string; persona?: string }) =>
  api.post<{ id: string; name: string; status: string; created_at: string }>('/agents', data)
export const runAgent = (id: string, data: { mode?: string; dry_run?: boolean }) =>
  api.post<{ success: boolean; run_id: string; items_processed: number; items_succeeded: number; items_failed: number; duration_seconds: number }>(
    `/agents/${id}/run`,
    data
  )
export const getAgentRuns = (id: string, limit?: number) =>
  api.get<{ runs: AgentRun[] }>(`/agents/${id}/runs`, { params: { limit } })
export const getAgentRunDetail = (agentId: string, runId: string) =>
  api.get<AgentRunDetail>(`/agents/${agentId}/runs/${runId}`)

// Companies
export const getCompanies = (params?: { stage?: string; agent_id?: string; limit?: number; offset?: number }) =>
  api.get<{ companies: Company[]; total: number }>('/companies', { params })
export const getCompany = (id: string) => api.get<CompanyDetail>(`/companies/${id}`)

// Contacts
export const getContacts = (params?: { company_id?: string; is_decision_maker?: boolean; limit?: number; offset?: number }) =>
  api.get<{ contacts: Contact[]; total: number }>('/contacts', { params })

// Campaigns
export const getCampaigns = (params?: { agent_id?: string }) =>
  api.get<{ campaigns: OutreachCampaign[] }>('/campaigns', { params })
export const createCampaign = (data: { name: string; agent_id: string; sequence_name?: string }) =>
  api.post<{ id: string; name: string; status: string; created_at: string }>('/campaigns', data)
export const launchCampaign = (id: string, dry_run?: boolean) =>
  api.post<{ success: boolean; emails_sent: number; emails_failed: number }>(`/campaigns/${id}/launch`, null, {
    params: { dry_run },
  })

// Pipeline
export const getPipeline = (params?: { agent_id?: string }) =>
  api.get<PipelineOverview>('/pipeline', { params })
export const getDeals = (params?: { stage?: string; agent_id?: string; limit?: number; offset?: number }) =>
  api.get<{ deals: PipelineDeal[]; total: number }>('/pipeline/deals', { params })

// Analytics
export const getAnalyticsOverview = (days?: number) =>
  api.get<AnalyticsOverview>('/analytics/overview', { params: { days } })

// Health
export const getHealth = () => api.get<{ status: string; version: string }>('/health')
export const getApiHealth = () => api.get('/health')
