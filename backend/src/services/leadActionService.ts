/**
 * Lead Action Service
 *
 * Handles lead stage transitions and associated business logic:
 * - Close as Won: Marks deal as successfully closed
 * - Close as Lost: Records lost deal with competitor and reason
 * - Move to Nurture: Places lead in nurture workflow
 *
 * Each action updates lead stage, creates activity records, and maintains stage history.
 */

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

/**
 * Closes a lead as won.
 *
 * Updates the lead to CLOSED_WON stage, creates a completion activity,
 * and records stage history with the original stage as fromStage.
 *
 * @param input - Lead ID and notes for the closure
 * @returns Updated lead record
 * @throws Error if lead is not found
 */
export async function closeAsWon(input: CloseAsWonInput) {
  const { leadId, notes } = input

  // Fetch lead BEFORE updating to capture original stage
  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
  })

  if (!existingLead) {
    throw new Error(`Lead with ID ${leadId} not found`)
  }

  const originalStage = existingLead.currentStage

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

  // Create stage history with ORIGINAL stage as fromStage
  await prisma.stageHistory.create({
    data: {
      leadId,
      fromStage: originalStage,
      toStage: Stage.CLOSED_WON,
      note: notes,
    },
  })

  return lead
}

/**
 * Closes a lead as lost.
 *
 * Updates the lead to CLOSED_LOST stage, records lost reason with competitor,
 * creates an activity, and maintains stage history with the original stage.
 *
 * @param input - Lead ID, competitor name, reason, and notes
 * @returns Updated lead record
 * @throws Error if lead is not found
 */
export async function closeAsLost(input: CloseAsLostInput) {
  const { leadId, competitorName, reason, notes } = input

  // Fetch lead BEFORE updating to capture original stage
  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
  })

  if (!existingLead) {
    throw new Error(`Lead with ID ${leadId} not found`)
  }

  const originalStage = existingLead.currentStage

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

  // Create stage history with ORIGINAL stage as fromStage
  await prisma.stageHistory.create({
    data: {
      leadId,
      fromStage: originalStage,
      toStage: Stage.CLOSED_LOST,
      note: notes,
    },
  })

  return lead
}

/**
 * Moves a lead to nurture workflow.
 *
 * Updates the lead to either NURTURE_30_DAY or NURTURE_90_DAY stage based on
 * the nurture period, schedules follow-up activity, and records stage history.
 *
 * @param input - Lead ID, nurture period (30 or 90 days), and notes
 * @returns Updated lead record
 * @throws Error if lead is not found
 */
export async function moveToNurture(input: MoveToNurtureInput) {
  const { leadId, nurturePeriod, notes } = input

  const newStage = nurturePeriod === 30 ? Stage.NURTURE_30_DAY : Stage.NURTURE_90_DAY
  const followUpDate = new Date(Date.now() + nurturePeriod * 24 * 60 * 60 * 1000)

  // Fetch lead BEFORE updating to capture original stage
  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
  })

  if (!existingLead) {
    throw new Error(`Lead with ID ${leadId} not found`)
  }

  const originalStage = existingLead.currentStage

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

  // Create stage history with ORIGINAL stage as fromStage
  await prisma.stageHistory.create({
    data: {
      leadId,
      fromStage: originalStage,
      toStage: newStage,
      note: notes,
    },
  })

  return lead
}
