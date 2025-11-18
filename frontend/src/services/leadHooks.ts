/**
 * React Query Hooks for Lead Management
 * Server state management with caching and synchronization
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { api } from './api'
import { Stage, LostReasonCategory } from '@leadoff/types'

// Types
export interface Lead {
  id: string
  companyName: string
  contactName: string
  phone: string
  email: string
  contactTitle?: string
  companyDescription?: string
  leadSource: string
  currentStage: Stage
  estimatedValue?: number
  nextFollowUpDate?: string
  lastActivityDate?: string
  createdAt: string
  updatedAt: string
  activities?: Activity[]
  stageHistory?: StageHistory[]
  organizationInfo?: OrganizationInfo
  demoDetails?: DemoDetails
  proposal?: Proposal
  qualificationScore?: number
}

export interface Activity {
  id: string
  leadId: string
  type: string
  subject: string
  notes?: string
  completed: boolean
  dueDate?: string
  completedAt?: string
  createdAt: string
}

export interface StageHistory {
  id: string
  leadId: string
  fromStage?: string
  toStage: string
  changedAt: string
  note?: string
}

export interface LeadsResponse {
  leads: Lead[]
  total: number
  page: number
  limit: number
}

export interface CreateLeadInput {
  companyName: string
  contactName: string
  phone: string
  email: string
  contactTitle?: string
  companyDescription?: string
  leadSource?: string
  estimatedValue?: number
}

export interface UpdateLeadStageInput {
  id: string
  stage: Stage
  note?: string
  demoDate?: Date
  lostReason?: LostReasonCategory
  competitorName?: string
  lostReasonNotes?: string
}

export interface LeadSearchParams {
  search?: string
  stage?: Stage
  page?: number
  limit?: number
  [key: string]: string | Stage | number | undefined
}

export interface FollowUpLeads {
  overdue: Lead[]
  today: Lead[]
  upcoming: Lead[]
}

// Query keys
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (params: LeadSearchParams) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  followUps: () => [...leadKeys.all, 'follow-ups'] as const,
}

/**
 * Fetch paginated list of leads with search/filter
 */
export function useLeads(params: LeadSearchParams = {}): UseQueryResult<LeadsResponse> {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => api.get<LeadsResponse>('/leads', params),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Fetch single lead by ID
 */
export function useLead(id: string): UseQueryResult<Lead> {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => api.get<Lead>(`/leads/${id}`),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Create new lead mutation
 */
export function useCreateLead(): UseMutationResult<Lead, Error, CreateLeadInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeadInput) => api.post<Lead>('/leads', data),
    onSuccess: () => {
      // Invalidate lead lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
    },
  })
}

/**
 * Update lead stage mutation
 */
export function useUpdateLeadStage(): UseMutationResult<Lead, Error, UpdateLeadStageInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateLeadStageInput) => {
      const { id, ...payload } = data
      return api.patch<Lead>(`/leads/${id}/stage`, payload)
    },
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: leadKeys.detail(newData.id) })

      // Snapshot previous value
      const previousLead = queryClient.getQueryData<Lead>(leadKeys.detail(newData.id))

      // Optimistically update
      if (previousLead) {
        queryClient.setQueryData<Lead>(leadKeys.detail(newData.id), {
          ...previousLead,
          currentStage: newData.stage,
        })
      }

      return { previousLead }
    },
    onError: (_err, newData, context) => {
      // Rollback on error
      if (context?.previousLead) {
        queryClient.setQueryData(leadKeys.detail(newData.id), context.previousLead)
      }
    },
    onSuccess: (_data, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
    },
  })
}

/**
 * Delete lead mutation
 */
export function useDeleteLead(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
    },
  })
}

/**
 * Search leads with debouncing
 */
export function useSearchLeads(searchTerm: string): UseQueryResult<LeadsResponse> {
  return useQuery({
    queryKey: leadKeys.list({ search: searchTerm }),
    queryFn: () => api.get<LeadsResponse>('/leads', { search: searchTerm }),
    enabled: searchTerm.length > 0,
    staleTime: 60000,
    // Debouncing handled by component state
  })
}

/**
 * Fetch follow-up leads categorized by urgency
 * Refetches every 5 minutes to keep dashboard current
 */
export function useFollowUps(): UseQueryResult<FollowUpLeads> {
  return useQuery({
    queryKey: leadKeys.followUps(),
    queryFn: () => api.get<FollowUpLeads>('/leads/follow-ups'),
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // Auto-refetch every 5 minutes
  })
}

// Organization, Demo, and Proposal types
export interface OrganizationInfo {
  id: string
  leadId: string
  employeeCount?: number
  annualRevenue?: number
  industry?: string
  decisionMaker?: string
  decisionMakerRole?: string
  currentSolution?: string
  painPoints?: string
  budget?: number
  timeline?: string
  createdAt: string
  updatedAt: string
}

export interface DemoDetails {
  id: string
  leadId: string
  demoDate: string
  demoType: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  attendees?: string
  demoOutcome?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'NO_SHOW'
  userCountEstimate?: number
  followUpRequired: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Proposal {
  id: string
  leadId: string
  proposalDate: string
  estimatedValue: number
  products?: string
  contractTerm?: string
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateOrganizationInput {
  employeeCount?: number
  annualRevenue?: number
  industry?: string
  decisionMaker?: string
  decisionMakerRole?: string
  currentSolution?: string
  painPoints?: string
  budget?: number
  timeline?: string
}

export interface UpdateDemoInput {
  demoDate: string
  demoType: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  attendees?: string
  demoOutcome?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'NO_SHOW'
  userCountEstimate?: number
  followUpRequired?: boolean
  notes?: string
}

export interface UpdateProposalInput {
  proposalDate: string
  estimatedValue: number
  products?: string
  contractTerm?: string
  status?: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  notes?: string
}

/**
 * Update organization information for a lead
 */
export function useUpdateOrganization(): UseMutationResult<OrganizationInfo, Error, { leadId: string; data: UpdateOrganizationInput }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leadId, data }) => api.put<OrganizationInfo>(`/leads/${leadId}/organization`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.leadId) })
    },
  })
}

/**
 * Update demo details for a lead
 */
export function useUpdateDemo(): UseMutationResult<DemoDetails, Error, { leadId: string; data: UpdateDemoInput }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leadId, data }) => api.put<DemoDetails>(`/leads/${leadId}/demo`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.leadId) })
    },
  })
}

/**
 * Update proposal for a lead
 */
export function useUpdateProposal(): UseMutationResult<Proposal, Error, { leadId: string; data: UpdateProposalInput }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leadId, data }) => api.put<Proposal>(`/leads/${leadId}/proposal`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.leadId) })
    },
  })
}
