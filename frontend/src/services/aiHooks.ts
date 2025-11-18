import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

export function useSummarizeActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityId: string) => {
      return await api.post(`/activities/${activityId}/summarize`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}
