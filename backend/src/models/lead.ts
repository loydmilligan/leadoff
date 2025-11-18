/**
 * Lead Model - Data Access Layer
 * Type-safe CRUD operations for Lead entity using Prisma
 */

import { PrismaClient, Lead, Prisma } from '@prisma/client'
import { Stage } from '@leadoff/types'

const prisma = new PrismaClient()

export interface LeadCreateInput {
  companyName: string
  contactName: string
  phone: string
  email: string
  contactTitle?: string
  companyDescription?: string
  leadSource?: string
  currentStage?: Stage
  estimatedValue?: number
  nextFollowUpDate?: Date
}

export interface LeadUpdateInput {
  companyName?: string
  contactName?: string
  phone?: string
  email?: string
  contactTitle?: string
  companyDescription?: string
  leadSource?: string
  currentStage?: string
  estimatedValue?: number
  nextFollowUpDate?: Date | null
  lastActivityDate?: Date
}

export interface LeadSearchParams {
  search?: string
  stage?: Stage
  page?: number
  limit?: number
}

export class LeadModel {
  /**
   * Create a new lead
   */
  static async create(data: LeadCreateInput): Promise<Lead> {
    return prisma.lead.create({
      data: {
        ...data,
        currentStage: data.currentStage || Stage.INQUIRY,
      },
    })
  }

  /**
   * Find all leads with optional filtering and pagination
   */
  static async findAll(params: LeadSearchParams = {}): Promise<{
    leads: Lead[]
    total: number
    page: number
    limit: number
  }> {
    const { search, stage, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.LeadWhereInput = {
      isArchived: false,
    }

    if (stage) {
      where.currentStage = stage
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { contactName: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          activities: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.lead.count({ where }),
    ])

    return {
      leads,
      total,
      page,
      limit,
    }
  }

  /**
   * Find lead by ID
   */
  static async findById(id: string): Promise<Lead | null> {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
        },
        organizationInfo: true,
        demoDetails: true,
        proposal: true,
        lostReason: true,
        stageHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    })
  }

  /**
   * Find lead by email
   */
  static async findByEmail(email: string): Promise<Lead | null> {
    return prisma.lead.findFirst({
      where: { email },
    })
  }

  /**
   * Update lead by ID
   */
  static async update(id: string, data: LeadUpdateInput): Promise<Lead> {
    return prisma.lead.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete lead by ID
   */
  static async delete(id: string): Promise<Lead> {
    return prisma.lead.delete({
      where: { id },
    })
  }

  /**
   * Search leads by name similarity (for duplicate detection)
   */
  static async searchByName(
    companyName: string,
    contactName: string
  ): Promise<Lead[]> {
    return prisma.lead.findMany({
      where: {
        OR: [
          { companyName: { contains: companyName } },
          { contactName: { contains: contactName } },
        ],
      },
      take: 5,
    })
  }
}

export default LeadModel
