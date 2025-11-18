/**
 * Activity Service - Business Logic Layer
 * Handles activity logging and tracking
 */

import { z } from 'zod'
import { Activity, PrismaClient } from '@prisma/client'
import { ActivityType } from '@leadoff/types'
import { ActivityModel } from '../models/activity'

const prisma = new PrismaClient()

// Zod validation schemas
export const createActivitySchema = z.object({
  leadId: z.string(),
  type: z.nativeEnum(ActivityType),
  subject: z.string().min(1).max(500),
  notes: z.string().optional(),
  dueDate: z.date().optional(),
})

export const updateActivitySchema = z.object({
  type: z.nativeEnum(ActivityType).optional(),
  subject: z.string().min(1).max(500).optional(),
  notes: z.string().optional(),
  dueDate: z.date().optional(),
  completed: z.boolean().optional(),
})

export class ActivityService {
  /**
   * Log a new activity
   */
  static async logActivity(input: unknown): Promise<Activity> {
    // Validate input
    const validatedData = createActivitySchema.parse(input)

    // Create activity
    const activity = await ActivityModel.create(validatedData)

    // Update lead's lastActivityDate
    await prisma.lead.update({
      where: { id: validatedData.leadId },
      data: { lastActivityDate: new Date() },
    })

    return activity
  }

  /**
   * Get all activities for a lead
   */
  static async getActivitiesByLead(leadId: string): Promise<Activity[]> {
    return ActivityModel.findByLeadId(leadId)
  }

  /**
   * Get activity by ID
   */
  static async getActivityById(id: string): Promise<Activity | null> {
    return ActivityModel.findById(id)
  }

  /**
   * Update activity
   */
  static async updateActivity(id: string, input: unknown): Promise<Activity> {
    // Validate input
    const validatedData = updateActivitySchema.parse(input)

    return ActivityModel.update(id, validatedData)
  }

  /**
   * Mark activity as completed
   */
  static async completeActivity(id: string): Promise<Activity> {
    return ActivityModel.markCompleted(id)
  }

  /**
   * Delete activity
   */
  static async deleteActivity(id: string): Promise<Activity> {
    return ActivityModel.delete(id)
  }
}

export default ActivityService
