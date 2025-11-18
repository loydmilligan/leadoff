/**
 * ReportService
 * Business intelligence and analytics for LeadOff CRM
 */

import { PrismaClient } from '@prisma/client'
import { Stage } from '@leadoff/types'

const prisma = new PrismaClient()

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
 * Get pipeline value report showing total value and breakdown by stage
 */
export async function pipelineValue(): Promise<PipelineValueReport> {
  // Get all active leads (not closed)
  const activeLeads = await prisma.lead.findMany({
    where: {
      currentStage: {
        notIn: [Stage.CLOSED_WON, Stage.CLOSED_LOST],
      },
    },
    select: {
      currentStage: true,
      estimatedValue: true,
    },
  })

  // Get all leads for conversion rate calculation
  const totalLeadsCount = await prisma.lead.count()
  const closedWonCount = await prisma.lead.count({
    where: { currentStage: Stage.CLOSED_WON },
  })

  const conversionRate = totalLeadsCount > 0 ? (closedWonCount / totalLeadsCount) * 100 : 0

  // Calculate metrics by stage
  const stageMetrics = new Map<
    Stage,
    { count: number; totalValue: number; leads: number }
  >()

  // Initialize all active stages
  const activeStages = [
    Stage.INQUIRY,
    Stage.QUALIFICATION,
    Stage.DEMO_SCHEDULED,
    Stage.DEMO_COMPLETE,
    Stage.PROPOSAL_SENT,
    Stage.NEGOTIATION,
  ]

  activeStages.forEach((stage) => {
    stageMetrics.set(stage, { count: 0, totalValue: 0, leads: 0 })
  })

  // Aggregate data
  activeLeads.forEach((lead) => {
    const stage = lead.currentStage as Stage
    const metrics = stageMetrics.get(stage)
    if (metrics) {
      metrics.count++
      metrics.leads++
      metrics.totalValue += lead.estimatedValue || 0
    }
  })

  // Calculate total value
  const totalValue = Array.from(stageMetrics.values()).reduce(
    (sum, m) => sum + m.totalValue,
    0
  )

  // Build stage reports
  const stages = activeStages.map((stage) => {
    const metrics = stageMetrics.get(stage)!
    const avgValue = metrics.count > 0 ? metrics.totalValue / metrics.count : 0

    return {
      stage,
      count: metrics.count,
      totalValue: metrics.totalValue,
      avgValue,
      conversionRate,
    }
  })

  return {
    totalValue,
    stages,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Get lead age report showing stale leads (>14 days in current stage)
 */
export async function leadAge(): Promise<LeadAgeReport> {
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  // Get all active leads with their stage history and activities
  const leads = await prisma.lead.findMany({
    where: {
      currentStage: {
        notIn: [Stage.CLOSED_WON, Stage.CLOSED_LOST],
      },
    },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      stageHistory: {
        orderBy: { changedAt: 'desc' },
        take: 1,
      },
    },
  })

  const now = new Date()

  const staleLeads = leads
    .map((lead) => {
      // Get stage change date or creation date
      const stageChangeDate = lead.stageHistory[0]
        ? new Date(lead.stageHistory[0].changedAt)
        : new Date(lead.createdAt)

      const daysInStage = Math.floor(
        (now.getTime() - stageChangeDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      const lastActivity = lead.activities[0]
        ? new Date(lead.activities[0].createdAt).toISOString()
        : null

      return {
        id: lead.id,
        companyName: lead.companyName,
        contactName: lead.contactName,
        currentStage: lead.currentStage as Stage,
        daysInStage,
        lastActivity,
        stageChangeDate,
      }
    })
    .filter((lead) => lead.daysInStage > 14)
    .sort((a, b) => b.daysInStage - a.daysInStage)

  // Calculate summary
  const summary = {
    total: staleLeads.length,
    over14Days: staleLeads.filter((l) => l.daysInStage > 14).length,
    over30Days: staleLeads.filter((l) => l.daysInStage > 30).length,
    over60Days: staleLeads.filter((l) => l.daysInStage > 60).length,
  }

  return {
    staleLeads: staleLeads.map(({ stageChangeDate, ...lead }) => lead),
    summary,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Get weekly summary report
 */
export async function weeklySummary(
  startDate?: string,
  endDate?: string
): Promise<WeeklySummaryReport> {
  const end = endDate ? new Date(endDate) : new Date()
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Get leads created this week
  const leadsCreated = await prisma.lead.count({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  })

  // Get leads converted (CLOSED_WON) this week
  const leadsConverted = await prisma.stageHistory.count({
    where: {
      toStage: Stage.CLOSED_WON,
      changedAt: {
        gte: start,
        lte: end,
      },
    },
  })

  // Get leads lost (CLOSED_LOST) this week
  const leadsLost = await prisma.stageHistory.count({
    where: {
      toStage: Stage.CLOSED_LOST,
      changedAt: {
        gte: start,
        lte: end,
      },
    },
  })

  // Get activities logged this week
  const activitiesLogged = await prisma.activity.count({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  })

  // Calculate average response time (simplified - time from lead creation to first activity)
  const leadsWithActivities = await prisma.lead.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      activities: {
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
  })

  const responseTimes = leadsWithActivities
    .filter((l) => l.activities.length > 0)
    .map((l) => {
      const leadCreated = new Date(l.createdAt).getTime()
      const firstActivity = new Date(l.activities[0].createdAt).getTime()
      return (firstActivity - leadCreated) / (1000 * 60 * 60) // hours
    })

  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0

  // Get top performers (most active leads)
  const topPerformers = await prisma.lead.findMany({
    include: {
      _count: {
        select: { activities: true },
      },
    },
    orderBy: {
      activities: {
        _count: 'desc',
      },
    },
    take: 5,
  })

  return {
    week: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    metrics: {
      leadsCreated,
      leadsConverted,
      leadsLost,
      activitiesLogged,
      averageResponseTime,
    },
    topPerformers: {
      mostActive: topPerformers.map((lead) => ({
        leadId: lead.id,
        companyName: lead.companyName,
        activityCount: lead._count.activities,
      })),
    },
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Get win/loss analysis report
 */
export async function winLossAnalysis(
  startDate?: string,
  endDate?: string
): Promise<WinLossReport> {
  const end = endDate ? new Date(endDate) : new Date()
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days

  // Get won deals
  const wonLeads = await prisma.lead.findMany({
    where: {
      currentStage: Stage.CLOSED_WON,
      updatedAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      stageHistory: {
        orderBy: { changedAt: 'asc' },
      },
    },
  })

  // Get lost deals
  const lostLeads = await prisma.lead.findMany({
    where: {
      currentStage: Stage.CLOSED_LOST,
      updatedAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      lostReason: true,
      stageHistory: {
        orderBy: { changedAt: 'asc' },
      },
    },
  })

  const wonValue = wonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
  const lostValue = lostLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)

  const totalDeals = wonLeads.length + lostLeads.length
  const winRate = totalDeals > 0 ? (wonLeads.length / totalDeals) * 100 : 0

  // Calculate loss reasons
  const lossReasonCounts = new Map<string, number>()
  lostLeads.forEach((lead) => {
    const reason = lead.lostReason?.reason || 'Unknown'
    lossReasonCounts.set(reason, (lossReasonCounts.get(reason) || 0) + 1)
  })

  const lossReasons = Array.from(lossReasonCounts.entries())
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: totalDeals > 0 ? (count / lostLeads.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Calculate average deal cycle
  const calculateDealCycle = (leads: typeof wonLeads) => {
    const cycles = leads
      .filter((l) => l.stageHistory.length > 0)
      .map((l) => {
        const firstStage = new Date(l.stageHistory[0].changedAt).getTime()
        const lastStage = new Date(
          l.stageHistory[l.stageHistory.length - 1].changedAt
        ).getTime()
        return (lastStage - firstStage) / (1000 * 60 * 60 * 24) // days
      })

    return cycles.length > 0
      ? cycles.reduce((sum, c) => sum + c, 0) / cycles.length
      : 0
  }

  const avgDealCycle = {
    won: calculateDealCycle(wonLeads),
    lost: calculateDealCycle(lostLeads),
  }

  return {
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    metrics: {
      won: wonLeads.length,
      lost: lostLeads.length,
      winRate,
      totalValue: wonValue + lostValue,
      wonValue,
      lostValue,
    },
    lossReasons,
    avgDealCycle,
    generatedAt: new Date().toISOString(),
  }
}
