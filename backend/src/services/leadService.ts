/**
 * Lead Service - Business Logic Layer
 * Handles lead operations with validation and audit trail
 */

import { z } from 'zod'
import { Lead, PrismaClient } from '@prisma/client'
import { Stage, LostReasonCategory } from '@leadoff/types'
import { LeadModel, LeadSearchParams } from '../models/lead'
import { calculateNextFollowUp, getFollowUpStatus } from '../utils/followUpCalculator'
import { LostReasonService } from './lostReasonService.js'

const prisma = new PrismaClient()

// Zod validation schemas
export const createLeadSchema = z.object({
  companyName: z.string().min(2).max(200),
  contactName: z.string().min(2).max(100),
  phone: z.string().min(1),
  email: z.string().email(),
  contactTitle: z.string().optional(),
  companyDescription: z.string().optional(),
  leadSource: z.string().optional(),
  estimatedValue: z.number().positive().optional(),
})

export const updateLeadSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  contactName: z.string().min(2).max(100).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  contactTitle: z.string().optional(),
  companyDescription: z.string().optional(),
  leadSource: z.string().optional(),
  estimatedValue: z.number().positive().optional(),
  nextFollowUpDate: z.date().optional(),
})

export const updateStageSchema = z.object({
  stage: z.nativeEnum(Stage),
  note: z.string().optional(),
  demoDate: z.date().optional(),
  // Lost reason fields (required for CLOSED_LOST)
  lostReason: z.nativeEnum(LostReasonCategory).optional(),
  competitorName: z.string().optional(),
  lostReasonNotes: z.string().optional(),
})

export class LeadService {
  /**
   * Create a new lead with automatic Inquiry stage and follow-up date
   */
  static async createLead(input: unknown): Promise<Lead> {
    // Validate input
    const validatedData = createLeadSchema.parse(input)

    // Calculate automatic follow-up date for INQUIRY stage (+24 hours)
    const nextFollowUpDate = calculateNextFollowUp({ stage: Stage.INQUIRY })

    // Create lead
    const lead = await LeadModel.create({
      ...validatedData,
      currentStage: Stage.INQUIRY,
      nextFollowUpDate: nextFollowUpDate || undefined,
    })

    // Create stage history entry
    await prisma.stageHistory.create({
      data: {
        leadId: lead.id,
        fromStage: null,
        toStage: Stage.INQUIRY,
        note: 'Lead created',
      },
    })

    return lead
  }

  /**
   * Get leads with pagination and search
   */
  static async getLeads(params: LeadSearchParams) {
    return LeadModel.findAll(params)
  }

  /**
   * Get single lead by ID
   */
  static async getLeadById(id: string): Promise<Lead | null> {
    return LeadModel.findById(id)
  }

  /**
   * Update lead stage with audit trail and recalculated follow-up date
   */
  static async updateLeadStage(
    id: string,
    input: {
      stage: Stage
      note?: string
      demoDate?: Date
      lostReason?: LostReasonCategory
      competitorName?: string
      lostReasonNotes?: string
    }
  ): Promise<Lead> {
    // Validate input
    const { stage, note, demoDate, lostReason, competitorName, lostReasonNotes } =
      updateStageSchema.parse(input)

    // Get current lead
    const currentLead = await LeadModel.findById(id)
    if (!currentLead) {
      throw new Error('Lead not found')
    }

    // Validate CLOSED_LOST requires lost reason
    if (stage === Stage.CLOSED_LOST && !lostReason) {
      throw new Error('Lost reason is required when closing lead as lost')
    }

    // Validate CLOSED_WON and CLOSED_LOST are terminal stages (no further changes allowed)
    if (
      (currentLead.currentStage === Stage.CLOSED_WON ||
        currentLead.currentStage === Stage.CLOSED_LOST) &&
      currentLead.currentStage !== stage
    ) {
      throw new Error('Cannot change stage of closed deals')
    }

    // Calculate new follow-up date based on new stage (null for closed stages)
    const nextFollowUpDate =
      stage === Stage.CLOSED_WON || stage === Stage.CLOSED_LOST
        ? null
        : calculateNextFollowUp({ stage, demoDate })

    // Update lead stage
    const updatedLead = await LeadModel.update(id, {
      currentStage: stage,
      lastActivityDate: new Date(),
      nextFollowUpDate: nextFollowUpDate === null ? null : (nextFollowUpDate || undefined),
    })

    // Create stage history entry
    await prisma.stageHistory.create({
      data: {
        leadId: id,
        fromStage: currentLead.currentStage,
        toStage: stage,
        note: note || `Stage changed from ${currentLead.currentStage} to ${stage}`,
      },
    })

    // Create lost reason if moving to CLOSED_LOST
    if (stage === Stage.CLOSED_LOST && lostReason) {
      await LostReasonService.upsert(id, {
        leadId: id,
        reason: lostReason,
        competitorName: competitorName,
        lostDate: new Date(),
        notes: lostReasonNotes,
      })
    }

    return updatedLead
  }

  /**
   * Update lead details
   */
  static async updateLead(id: string, input: unknown): Promise<Lead> {
    // Validate input
    const validatedData = updateLeadSchema.parse(input)

    // Update lead
    return LeadModel.update(id, validatedData)
  }

  /**
   * Delete lead
   */
  static async deleteLead(id: string): Promise<Lead> {
    return LeadModel.delete(id)
  }

  /**
   * Search leads for duplicate detection
   */
  static async searchSimilarLeads(
    companyName: string,
    contactName: string,
    email: string
  ): Promise<Lead[]> {
    // Check for exact email match
    const emailMatch = await LeadModel.findByEmail(email)
    if (emailMatch) {
      return [emailMatch]
    }

    // Check for name similarity
    return LeadModel.searchByName(companyName, contactName)
  }

  /**
   * Get leads categorized by follow-up urgency
   * Returns leads with nextFollowUpDate categorized as overdue, today, or upcoming
   */
  static async getFollowUpLeads(): Promise<{
    overdue: Lead[]
    today: Lead[]
    upcoming: Lead[]
  }> {
    const now = new Date()

    // Get all active leads with follow-up dates (not closed)
    const leads = await prisma.lead.findMany({
      where: {
        nextFollowUpDate: {
          not: null,
        },
        currentStage: {
          notIn: ['CLOSED_WON', 'CLOSED_LOST'],
        },
      },
      orderBy: {
        nextFollowUpDate: 'asc',
      },
      include: {
        activities: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    // Categorize leads by follow-up status
    const overdue: Lead[] = []
    const today: Lead[] = []
    const upcoming: Lead[] = []

    for (const lead of leads) {
      const status = getFollowUpStatus(lead.nextFollowUpDate, now)

      switch (status) {
        case 'overdue':
          overdue.push(lead)
          break
        case 'today':
          today.push(lead)
          break
        case 'upcoming':
          // Only include upcoming leads within next 7 days
          if (lead.nextFollowUpDate && lead.nextFollowUpDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            upcoming.push(lead)
          }
          break
      }
    }

    return {
      overdue,
      today,
      upcoming,
    }
  }
}

export default LeadService
