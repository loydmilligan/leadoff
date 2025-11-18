import { useQuery } from '@tanstack/react-query'
import { api } from './api'

export function usePlannerData() {
  return useQuery({
    queryKey: ['planner'],
    queryFn: async () => {
      return await api.get('/planner')
    },
    refetchInterval: 60000, // Refresh every minute
  })
}
