import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

/**
 * OrganizationInfo Service
 * Handles organization details (company context, decision-makers, budget, timeline)
 * for qualified opportunities.
 */

// Validation schema for organization info
export const organizationInfoSchema = z.object({
  employeeCount: z.number().int().positive().optional(),
  annualRevenue: z.number().positive().optional(),
  industry: z.string().min(1).max(200).optional(),
  decisionMaker: z.string().min(1).max(200).optional(),
  decisionMakerRole: z.string().min(1).max(200).optional(),
  currentSolution: z.string().max(1000).optional(),
  painPoints: z.string().max(2000).optional(),
  budget: z.number().positive().optional(),
  timeline: z.string().min(1).max(200).optional(),
});

export type OrganizationInfoInput = z.infer<typeof organizationInfoSchema>;

export class OrganizationService {
  /**
   * Create or update organization info for a lead (upsert)
   * @param leadId - Lead ID
   * @param data - Organization information
   * @returns Created/updated organization info
   */
  static async upsert(leadId: string, data: OrganizationInfoInput) {
    // Validate input
    const validatedData = organizationInfoSchema.parse(data);

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Upsert organization info
    const organizationInfo = await prisma.organizationInfo.upsert({
      where: { leadId },
      create: {
        leadId,
        ...validatedData,
      },
      update: validatedData,
    });

    return organizationInfo;
  }

  /**
   * Get organization info by lead ID
   * @param leadId - Lead ID
   * @returns Organization info or null
   */
  static async getByLeadId(leadId: string) {
    const organizationInfo = await prisma.organizationInfo.findUnique({
      where: { leadId },
    });

    return organizationInfo;
  }

  /**
   * Delete organization info for a lead
   * @param leadId - Lead ID
   * @returns Deleted organization info
   */
  static async delete(leadId: string) {
    const organizationInfo = await prisma.organizationInfo.delete({
      where: { leadId },
    });

    return organizationInfo;
  }

  /**
   * Calculate qualification score for a lead based on organization info
   * @param leadId - Lead ID
   * @returns Qualification score (0-100)
   */
  static async calculateQualificationScore(leadId: string): Promise<number> {
    const organizationInfo = await this.getByLeadId(leadId);
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        demoDetails: true,
        proposal: true,
      },
    });

    if (!lead) {
      return 0;
    }

    let score = 0;

    // Has organization info: +20 points
    if (organizationInfo) {
      score += 20;
    }

    // Has budget defined: +20 points
    if (organizationInfo?.budget) {
      score += 20;
    }

    // Has decision maker identified: +20 points
    if (organizationInfo?.decisionMaker) {
      score += 20;
    }

    // Has demo scheduled/completed: +20 points
    if (lead.demoDetails) {
      score += 20;
    }

    // Has proposal sent: +20 points
    if (lead.proposal) {
      score += 20;
    }

    return score;
  }
}
