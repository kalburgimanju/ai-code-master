import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api'
import type { AgentRun } from '../types'

// Agents
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => api.getAgents().then((r) => r.data.agents),
  })
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agents', id],
    queryFn: () => api.getAgent(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createAgent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function useRunAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; mode?: string; dry_run?: boolean }) =>
      api.runAgent(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })
}

// Companies
export function useCompanies(params?: { stage?: string; limit?: number }) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => api.getCompanies(params).then((r) => r.data),
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => api.getCompany(id).then((r) => r.data),
    enabled: !!id,
  })
}

// Contacts
export function useContacts(params?: { company_id?: string; limit?: number }) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => api.getContacts(params).then((r) => r.data),
  })
}

// Campaigns
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.getCampaigns().then((r) => r.data.campaigns),
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createCampaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function useLaunchCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dry_run }: { id: string; dry_run?: boolean }) =>
      api.launchCampaign(id, dry_run),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

// Pipeline
export function usePipeline() {
  return useQuery({
    queryKey: ['pipeline'],
    queryFn: () => api.getPipeline().then((r) => r.data),
  })
}

export function useDeals(params?: { stage?: string; limit?: number }) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: () => api.getDeals(params).then((r) => r.data),
  })
}

// Analytics
export function useAnalyticsOverview(days?: number) {
  return useQuery({
    queryKey: ['analytics', days],
    queryFn: () => api.getAnalyticsOverview(days).then((r) => r.data),
  })
}

// Agent Runs with polling
export function useAgentRuns(agentId: string, enabled = true) {
  return useQuery({
    queryKey: ['agents', agentId, 'runs'],
    queryFn: () => api.getAgentRuns(agentId, 20).then((r) => r.data.runs),
    enabled,
    refetchInterval: (query) => {
      const runs = query.state.data as AgentRun[] | undefined
      if (runs?.some((r) => r.status === 'running' || r.status === 'pending')) {
        return 3000
      }
      return false
    },
  })
}

export function useAgentRunDetail(agentId: string, runId: string, enabled = true) {
  return useQuery({
    queryKey: ['agents', agentId, 'runs', runId],
    queryFn: () => api.getAgentRunDetail(agentId, runId).then((r) => r.data),
    enabled: enabled && !!agentId && !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'running' || status === 'pending') {
        return 3000
      }
      return false
    },
  })
}
