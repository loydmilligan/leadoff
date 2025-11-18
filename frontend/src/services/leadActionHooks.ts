import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

interface CloseAsWonInput {
  leadId: string
  notes: string
}

interface CloseAsLostInput {
  leadId: string
  competitorName: string
  reason: string
  notes: string
}

interface MoveToNurtureInput {
  leadId: string
  nurturePeriod: 30 | 90
  notes: string
}

export function useCloseAsWon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CloseAsWonInput) => {
      return await api.post(`/leads/${input.leadId}/close-won`, {
        notes: input.notes,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useCloseAsLost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CloseAsLostInput) => {
      return await api.post(`/leads/${input.leadId}/close-lost`, {
        competitorName: input.competitorName,
        reason: input.reason,
        notes: input.notes,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useMoveToNurture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: MoveToNurtureInput) => {
      return await api.post(`/leads/${input.leadId}/nurture`, {
        nurturePeriod: input.nurturePeriod,
        notes: input.notes,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
