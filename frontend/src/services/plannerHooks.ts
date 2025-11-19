import { useQuery } from '@tanstack/react-query'
import { api } from './api'
import type { Lead } from './leadHooks'

export interface PlannerData {
  overdue: Lead[]
  today: Lead[]
  thisWeek: Lead[]
  noDate: Lead[]
}

export function usePlannerData() {
  return useQuery<PlannerData>({
    queryKey: ['planner'],
    queryFn: async () => {
      return await api.get('/planner')
    },
    refetchInterval: 60000, // Refresh every minute
  })
}
