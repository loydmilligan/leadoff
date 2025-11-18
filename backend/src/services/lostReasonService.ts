/**
 * LostReason Service
 * Business logic for lost reason tracking and analysis
 */

import { z } from 'zod';
import { LostReasonCategory } from '@leadoff/types';
import { LostReasonModel, CreateLostReasonInput } from '../models/lostReason.js';

// Validation schemas
export const createLostReasonSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  reason: z.nativeEnum(LostReasonCategory, {
    errorMap: () => ({ message: 'Invalid lost reason category' }),
  }),
  competitorName: z.string().optional(),
  lostDate: z.coerce.date(),
  notes: z.string().max(5000, 'Notes cannot exceed 5000 characters').optional(),
});

export const updateLostReasonSchema = z.object({
  reason: z.nativeEnum(LostReasonCategory).optional(),
  competitorName: z.string().optional(),
  lostDate: z.coerce.date().optional(),
  notes: z.string().max(5000).optional(),
});

export class LostReasonService {
  /**
   * Create a new lost reason
   */
  static async create(data: CreateLostReasonInput) {
    // Validate input
    const validated = createLostReasonSchema.parse(data);

    // Validate that competitor name is provided if reason is COMPETITOR
    if (validated.reason === LostReasonCategory.COMPETITOR && !validated.competitorName) {
      throw new Error('Competitor name is required when lost reason is COMPETITOR');
    }

    return LostReasonModel.create(validated);
  }

  /**
   * Get lost reason by lead ID
   */
  static async getByLeadId(leadId: string) {
    if (!leadId || typeof leadId !== 'string') {
      throw new Error('Valid lead ID is required');
    }

    return LostReasonModel.findByLeadId(leadId);
  }

  /**
   * Update lost reason
   */
  static async update(leadId: string, data: Partial<CreateLostReasonInput>) {
    if (!leadId || typeof leadId !== 'string') {
      throw new Error('Valid lead ID is required');
    }

    const validated = updateLostReasonSchema.parse(data);

    // Validate competitor name if reason is being updated to COMPETITOR
    if (validated.reason === LostReasonCategory.COMPETITOR && !validated.competitorName) {
      throw new Error('Competitor name is required when lost reason is COMPETITOR');
    }

    return LostReasonModel.update(leadId, validated);
  }

  /**
   * Upsert lost reason (create or update)
   */
  static async upsert(leadId: string, data: CreateLostReasonInput) {
    const validated = createLostReasonSchema.parse({ ...data, leadId });

    // Validate competitor name for COMPETITOR reason
    if (validated.reason === LostReasonCategory.COMPETITOR && !validated.competitorName) {
      throw new Error('Competitor name is required when lost reason is COMPETITOR');
    }

    return LostReasonModel.upsert(leadId, validated);
  }

  /**
   * Delete lost reason
   */
  static async delete(leadId: string) {
    if (!leadId || typeof leadId !== 'string') {
      throw new Error('Valid lead ID is required');
    }

    return LostReasonModel.delete(leadId);
  }

  /**
   * Get all lost reasons with lead details
   */
  static async getAll() {
    return LostReasonModel.findAll();
  }

  /**
   * Get lost reason statistics for analytics
   */
  static async getStatistics() {
    const reasonCounts = await LostReasonModel.countByReason();

    // Calculate total and percentages
    const total = reasonCounts.reduce((sum, item) => sum + item._count, 0);

    return reasonCounts.map((item) => ({
      reason: item.reason,
      count: item._count,
      percentage: total > 0 ? ((item._count / total) * 100).toFixed(1) : '0.0',
    }));
  }
}
