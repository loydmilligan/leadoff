import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { ProposalStatus } from '@leadoff/types';

const prisma = new PrismaClient();

/**
 * Proposal Service
 * Handles proposal creation, tracking, and status management
 */

// Validation schema for proposal
export const proposalSchema = z.object({
  proposalDate: z.string().datetime().or(z.date()).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  estimatedValue: z.number().positive(),
  products: z.string().max(1000).optional(),
  contractTerm: z.string().max(200).optional(),
  status: z.nativeEnum(ProposalStatus).default(ProposalStatus.DRAFT),
  notes: z.string().max(2000).optional(),
});

export type ProposalInput = z.infer<typeof proposalSchema>;

export class ProposalService {
  /**
   * Create or update proposal for a lead (upsert)
   * @param leadId - Lead ID
   * @param data - Proposal data
   * @returns Created/updated proposal
   */
  static async upsert(leadId: string, data: ProposalInput) {
    // Validate input
    const validatedData = proposalSchema.parse(data);

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Validate proposal date is not in the future
    const now = new Date();
    if (validatedData.proposalDate > now) {
      throw new Error('Proposal date cannot be in the future');
    }

    // Upsert proposal
    const proposal = await prisma.proposal.upsert({
      where: { leadId },
      create: {
        leadId,
        proposalDate: validatedData.proposalDate,
        estimatedValue: validatedData.estimatedValue,
        products: validatedData.products,
        contractTerm: validatedData.contractTerm,
        status: validatedData.status,
        notes: validatedData.notes,
      },
      update: {
        proposalDate: validatedData.proposalDate,
        estimatedValue: validatedData.estimatedValue,
        products: validatedData.products,
        contractTerm: validatedData.contractTerm,
        status: validatedData.status,
        notes: validatedData.notes,
      },
    });

    // Update lead's estimated value to match proposal
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        estimatedValue: validatedData.estimatedValue,
      },
    });

    return proposal;
  }

  /**
   * Get proposal by lead ID
   * @param leadId - Lead ID
   * @returns Proposal or null
   */
  static async getByLeadId(leadId: string) {
    const proposal = await prisma.proposal.findUnique({
      where: { leadId },
    });

    return proposal;
  }

  /**
   * Update proposal status
   * @param leadId - Lead ID
   * @param status - New proposal status
   * @returns Updated proposal
   */
  static async updateStatus(leadId: string, status: ProposalStatus) {
    const proposal = await prisma.proposal.update({
      where: { leadId },
      data: { status },
    });

    return proposal;
  }

  /**
   * Delete proposal for a lead
   * @param leadId - Lead ID
   * @returns Deleted proposal
   */
  static async delete(leadId: string) {
    const proposal = await prisma.proposal.delete({
      where: { leadId },
    });

    return proposal;
  }

  /**
   * Get all proposals by status
   * @param status - Proposal status
   * @returns List of proposals with lead info
   */
  static async getByStatus(status: ProposalStatus) {
    const proposals = await prisma.proposal.findMany({
      where: { status },
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
        proposalDate: 'desc',
      },
    });

    return proposals;
  }

  /**
   * Calculate total pipeline value from all active proposals
   * @returns Total estimated value
   */
  static async calculatePipelineValue(): Promise<number> {
    const activeProposals = await prisma.proposal.findMany({
      where: {
        status: {
          in: [ProposalStatus.SENT, ProposalStatus.VIEWED],
        },
      },
    });

    const totalValue = activeProposals.reduce(
      (sum, proposal) => sum + proposal.estimatedValue,
      0
    );

    return totalValue;
  }
}
