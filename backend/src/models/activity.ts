/**
 * Activity Model - Data Access Layer
 * Type-safe CRUD operations for Activity entity using Prisma
 */

import { PrismaClient, Activity } from '@prisma/client'
import { ActivityType } from '@leadoff/types'

const prisma = new PrismaClient()

export interface ActivityCreateInput {
  leadId: string
  type: ActivityType
  subject: string
  notes?: string
  dueDate?: Date
  completed?: boolean
}

export interface ActivityUpdateInput {
  type?: ActivityType
  subject?: string
  notes?: string
  dueDate?: Date
  completed?: boolean
  completedAt?: Date
}

export class ActivityModel {
  /**
   * Create a new activity
   */
  static async create(data: ActivityCreateInput): Promise<Activity> {
    return prisma.activity.create({
      data: {
        ...data,
        type: data.type || ActivityType.NOTE,
      },
    })
  }

  /**
   * Find all activities for a lead
   */
  static async findByLeadId(leadId: string): Promise<Activity[]> {
    return prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find activity by ID
   */
  static async findById(id: string): Promise<Activity | null> {
    return prisma.activity.findUnique({
      where: { id },
      include: {
        lead: true,
      },
    })
  }

  /**
   * Update activity by ID
   */
  static async update(id: string, data: ActivityUpdateInput): Promise<Activity> {
    return prisma.activity.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete activity by ID
   */
  static async delete(id: string): Promise<Activity> {
    return prisma.activity.delete({
      where: { id },
    })
  }

  /**
   * Mark activity as completed
   */
  static async markCompleted(id: string): Promise<Activity> {
    return prisma.activity.update({
      where: { id },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    })
  }
}

export default ActivityModel
