import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { Lead } from './leadHooks'

export function useArchivedLeads() {
  return useQuery<Lead[]>({
    queryKey: ['archive'],
    queryFn: async () => {
      return await api.get('/archive')
    },
  })
}

export function useArchiveLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ leadId, reason }: { leadId: string; reason?: string }) => {
      return await api.post(`/leads/${leadId}/archive`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['archive'] })
    },
  })
}

export function useRestoreLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (leadId: string) => {
      return await api.post(`/leads/${leadId}/restore`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['archive'] })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (leadId: string) => {
      return await api.delete(`/leads/${leadId}/permanent`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive'] })
    },
  })
}
