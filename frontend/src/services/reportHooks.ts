/**
 * React Query Hooks for Reports and Analytics
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { api } from './api'
import { Stage } from '@leadoff/types'

// Report Types
export interface PipelineValueReport {
  totalValue: number
  stages: {
    stage: Stage
    count: number
    totalValue: number
    avgValue: number
    conversionRate: number
  }[]
  generatedAt: string
}

export interface LeadAgeReport {
  staleLeads: {
    id: string
    companyName: string
    contactName: string
    currentStage: Stage
    daysInStage: number
    lastActivity: string | null
  }[]
  summary: {
    total: number
    over14Days: number
    over30Days: number
    over60Days: number
  }
  generatedAt: string
}

export interface WeeklySummaryReport {
  week: {
    start: string
    end: string
  }
  metrics: {
    leadsCreated: number
    leadsConverted: number
    leadsLost: number
    activitiesLogged: number
    averageResponseTime: number
  }
  topPerformers: {
    mostActive: {
      leadId: string
      companyName: string
      activityCount: number
    }[]
  }
  generatedAt: string
}

export interface WinLossReport {
  period: {
    start: string
    end: string
  }
  metrics: {
    won: number
    lost: number
    winRate: number
    totalValue: number
    wonValue: number
    lostValue: number
  }
  lossReasons: {
    reason: string
    count: number
    percentage: number
  }[]
  avgDealCycle: {
    won: number
    lost: number
  }
  generatedAt: string
}

/**
 * Fetch pipeline value report
 */
export function usePipelineValue(): UseQueryResult<PipelineValueReport, Error> {
  return useQuery({
    queryKey: ['reports', 'pipeline-value'],
    queryFn: async () => {
      return await api.get<PipelineValueReport>('/reports/pipeline-value')
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch lead age report
 */
export function useLeadAge(): UseQueryResult<LeadAgeReport, Error> {
  return useQuery({
    queryKey: ['reports', 'lead-age'],
    queryFn: async () => {
      return await api.get<LeadAgeReport>('/reports/lead-age')
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch weekly summary report
 */
export function useWeeklySummary(
  startDate?: string,
  endDate?: string
): UseQueryResult<WeeklySummaryReport, Error> {
  return useQuery({
    queryKey: ['reports', 'weekly-summary', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      return await api.get<WeeklySummaryReport>(`/reports/weekly-summary?${params}`)
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch win/loss analysis report
 */
export function useWinLoss(
  startDate?: string,
  endDate?: string
): UseQueryResult<WinLossReport, Error> {
  return useQuery({
    queryKey: ['reports', 'win-loss', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      return await api.get<WinLossReport>(`/reports/win-loss?${params}`)
    },
    staleTime: 5 * 60 * 1000,
  })
}
