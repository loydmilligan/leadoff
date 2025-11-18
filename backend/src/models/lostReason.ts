/**
 * LostReason Model
 * Data access layer for lost reason tracking
 */

import { PrismaClient } from '@prisma/client';
import { LostReasonCategory } from '@leadoff/types';

const prisma = new PrismaClient();

export interface CreateLostReasonInput {
  leadId: string;
  reason: LostReasonCategory;
  competitorName?: string;
  lostDate: Date;
  notes?: string;
}

export interface UpdateLostReasonInput {
  reason?: LostReasonCategory;
  competitorName?: string;
  lostDate?: Date;
  notes?: string;
}

export class LostReasonModel {
  /**
   * Create a new lost reason record
   */
  static async create(data: CreateLostReasonInput) {
    return prisma.lostReason.create({
      data: {
        leadId: data.leadId,
        reason: data.reason,
        competitorName: data.competitorName,
        lostDate: data.lostDate,
        notes: data.notes,
      },
    });
  }

  /**
   * Find lost reason by lead ID
   */
  static async findByLeadId(leadId: string) {
    return prisma.lostReason.findUnique({
      where: { leadId },
    });
  }

  /**
   * Update lost reason
   */
  static async update(leadId: string, data: UpdateLostReasonInput) {
    return prisma.lostReason.update({
      where: { leadId },
      data,
    });
  }

  /**
   * Upsert lost reason (create or update)
   */
  static async upsert(leadId: string, data: CreateLostReasonInput) {
    return prisma.lostReason.upsert({
      where: { leadId },
      create: {
        leadId: data.leadId,
        reason: data.reason,
        competitorName: data.competitorName,
        lostDate: data.lostDate,
        notes: data.notes,
      },
      update: {
        reason: data.reason,
        competitorName: data.competitorName,
        lostDate: data.lostDate,
        notes: data.notes,
      },
    });
  }

  /**
   * Delete lost reason
   */
  static async delete(leadId: string) {
    return prisma.lostReason.delete({
      where: { leadId },
    });
  }

  /**
   * Get all lost reasons (for reporting)
   */
  static async findAll() {
    return prisma.lostReason.findMany({
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            estimatedValue: true,
          },
        },
      },
      orderBy: {
        lostDate: 'desc',
      },
    });
  }

  /**
   * Get lost reasons by category (for analytics)
   */
  static async countByReason() {
    return prisma.lostReason.groupBy({
      by: ['reason'],
      _count: true,
    });
  }
}
