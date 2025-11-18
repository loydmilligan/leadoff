import { PrismaClient } from '@prisma/client'
import { Stage, ActivityType } from '@leadoff/types'

const prisma = new PrismaClient()

export interface CloseAsWonInput {
  leadId: string
  notes: string
}

export interface CloseAsLostInput {
  leadId: string
  competitorName: string
  reason: string
  notes: string
}

export interface MoveToNurtureInput {
  leadId: string
  nurturePeriod: 30 | 90
  notes: string
}

export async function closeAsWon(input: CloseAsWonInput) {
  const { leadId, notes } = input

  // Update lead to CLOSED_WON
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      currentStage: Stage.CLOSED_WON,
      nextActionType: ActivityType.TASK,
      nextActionDescription: 'Complete handoff workflow',
      nextActionDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  // Create activity record
  await prisma.activity.create({
    data: {
      leadId,
      type: ActivityType.NOTE,
      subject: 'Deal Closed - Won',
      notes,
      completed: true,
      completedAt: new Date(),
    },
  })

  // Create stage history
  await prisma.stageHistory.create({
    data: {
      leadId,
      fromStage: lead.currentStage,
      toStage: Stage.CLOSED_WON,
      note: notes,
    },
  })

  return lead
}

export async function closeAsLost(input: CloseAsLostInput) {
  const { leadId, competitorName, reason, notes } = input

  // Update lead to CLOSED_LOST
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      currentStage: Stage.CLOSED_LOST,
      nextActionType: ActivityType.EMAIL,
      nextActionDescription: 'Follow up to check if situation changed',
      nextActionDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    },
  })

  // Create/update lost reason
  await prisma.lostReason.upsert({
    where: { leadId },
    create: {
      leadId,
      reason,
      competitorName,
      lostDate: new Date(),
      notes,
    },
    update: {
      reason,
      competitorName,
      lostDate: new Date(),
      notes,
    },
  })

  // Create activity record
  await prisma.activity.create({
    data: {
      leadId,
      type: ActivityType.NOTE,
      subject: 'Deal Closed - Lost',
      notes: `Lost to: ${competitorName}\nReason: ${reason}\n\n${notes}`,
      completed: true,
      completedAt: new Date(),
    },
  })

  // Create stage history
  await prisma.stageHistory.create({
    data: {
      leadId,
      fromStage: lead.currentStage,
      toStage: Stage.CLOSED_LOST,
      note: notes,
    },
  })

  return lead
}

export async function moveToNurture(input: MoveToNurtureInput) {
  const { leadId, nurturePeriod, notes } = input

  const newStage = nurturePeriod === 30 ? Stage.NURTURE_30_DAY : Stage.NURTURE_90_DAY
  const followUpDate = new Date(Date.now() + nurturePeriod * 24 * 60 * 60 * 1000)

  // Update lead to nurture stage
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      currentStage: newStage,
      nextActionType: ActivityType.EMAIL,
      nextActionDescription: 'Check in to see if timing has improved',
      nextActionDueDate: followUpDate,
      nextFollowUpDate: followUpDate,
    },
  })

  // Create activity record
  await prisma.activity.create({
    data: {
      leadId,
      type: ActivityType.NOTE,
      subject: `Moved to Nurture (${nurturePeriod} days)`,
      notes,
      completed: true,
      completedAt: new Date(),
    },
  })

  // Create stage history
  await prisma.stageHistory.create({
    data: {
      leadId,
      fromStage: lead.currentStage,
      toStage: newStage,
      note: notes,
    },
  })

  return lead
}
