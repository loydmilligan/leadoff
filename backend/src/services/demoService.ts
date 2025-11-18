import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { DemoType, DemoOutcome } from '@leadoff/types';

const prisma = new PrismaClient();

/**
 * DemoDetails Service
 * Handles demo scheduling and outcome tracking
 */

// Validation schema for demo details
export const demoDetailsSchema = z.object({
  demoDate: z.string().datetime().or(z.date()).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  demoType: z.nativeEnum(DemoType).default(DemoType.ONLINE),
  attendees: z.string().max(500).optional(),
  demoOutcome: z.nativeEnum(DemoOutcome).optional(),
  userCountEstimate: z.number().int().positive().optional(),
  followUpRequired: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
});

export type DemoDetailsInput = z.infer<typeof demoDetailsSchema>;

export class DemoService {
  /**
   * Create or update demo details for a lead (upsert)
   * @param leadId - Lead ID
   * @param data - Demo details
   * @returns Created/updated demo details
   */
  static async upsert(leadId: string, data: DemoDetailsInput) {
    // Validate input
    const validatedData = demoDetailsSchema.parse(data);

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Upsert demo details
    const demoDetails = await prisma.demoDetails.upsert({
      where: { leadId },
      create: {
        leadId,
        demoDate: validatedData.demoDate,
        demoType: validatedData.demoType,
        attendees: validatedData.attendees,
        demoOutcome: validatedData.demoOutcome,
        userCountEstimate: validatedData.userCountEstimate,
        followUpRequired: validatedData.followUpRequired,
        notes: validatedData.notes,
      },
      update: {
        demoDate: validatedData.demoDate,
        demoType: validatedData.demoType,
        attendees: validatedData.attendees,
        demoOutcome: validatedData.demoOutcome,
        userCountEstimate: validatedData.userCountEstimate,
        followUpRequired: validatedData.followUpRequired,
        notes: validatedData.notes,
      },
    });

    return demoDetails;
  }

  /**
   * Get demo details by lead ID
   * @param leadId - Lead ID
   * @returns Demo details or null
   */
  static async getByLeadId(leadId: string) {
    const demoDetails = await prisma.demoDetails.findUnique({
      where: { leadId },
    });

    return demoDetails;
  }

  /**
   * Delete demo details for a lead
   * @param leadId - Lead ID
   * @returns Deleted demo details
   */
  static async delete(leadId: string) {
    const demoDetails = await prisma.demoDetails.delete({
      where: { leadId },
    });

    return demoDetails;
  }

  /**
   * Check if demo is complete (date in past and outcome recorded)
   * @param leadId - Lead ID
   * @returns True if demo is complete
   */
  static async isDemoComplete(leadId: string): Promise<boolean> {
    const demoDetails = await this.getByLeadId(leadId);

    if (!demoDetails) {
      return false;
    }

    const now = new Date();
    const demoInPast = demoDetails.demoDate < now;
    const hasOutcome = !!demoDetails.demoOutcome;

    return demoInPast && hasOutcome;
  }

  /**
   * Get upcoming demos (scheduled in the future)
   * @returns List of upcoming demos with lead info
   */
  static async getUpcomingDemos() {
    const now = new Date();

    const upcomingDemos = await prisma.demoDetails.findMany({
      where: {
        demoDate: {
          gte: now,
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            currentStage: true,
          },
        },
      },
      orderBy: {
        demoDate: 'asc',
      },
    });

    return upcomingDemos;
  }
}
