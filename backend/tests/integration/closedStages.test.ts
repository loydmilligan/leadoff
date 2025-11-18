/**
 * Integration tests for closed stage handling (CLOSED_WON and CLOSED_LOST)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { Stage, LostReasonCategory } from '@leadoff/types';
import { LeadService } from '../../src/services/leadService.js';

const prisma = new PrismaClient();

describe('Closed Stages Integration Tests', () => {
  let testLeadId: string;

  beforeEach(async () => {
    // Create a test lead in NEGOTIATION stage
    const lead = await LeadService.createLead({
      companyName: 'Test Company',
      contactName: 'Test Contact',
      phone: '555-1234',
      email: 'test@example.com',
    });

    testLeadId = lead.id;

    // Move to NEGOTIATION stage
    await LeadService.updateLeadStage(testLeadId, {
      stage: Stage.NEGOTIATION,
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.lostReason.deleteMany({
      where: { leadId: testLeadId },
    });
    await prisma.stageHistory.deleteMany({
      where: { leadId: testLeadId },
    });
    await prisma.activity.deleteMany({
      where: { leadId: testLeadId },
    });
    await prisma.lead.deleteMany({
      where: { id: testLeadId },
    });
  });

  describe('CLOSED_WON transitions', () => {
    it('should successfully move lead to CLOSED_WON', async () => {
      const result = await LeadService.updateLeadStage(testLeadId, {
        stage: Stage.CLOSED_WON,
      });

      expect(result.currentStage).toBe(Stage.CLOSED_WON);
      expect(result.nextFollowUpDate).toBeNull();
    });

    it('should create stage history for CLOSED_WON transition', async () => {
      await LeadService.updateLeadStage(testLeadId, {
        stage: Stage.CLOSED_WON,
      });

      const history = await prisma.stageHistory.findMany({
        where: {
          leadId: testLeadId,
          toStage: Stage.CLOSED_WON,
        },
      });

      expect(history).toHaveLength(1);
      expect(history[0]?.fromStage).toBe(Stage.NEGOTIATION);
      expect(history[0]?.toStage).toBe(Stage.CLOSED_WON);
    });

    it('should not allow changing stage after CLOSED_WON', async () => {
      await LeadService.updateLeadStage(testLeadId, {
        stage: Stage.CLOSED_WON,
      });

      await expect(
        LeadService.updateLeadStage(testLeadId, {
          stage: Stage.NEGOTIATION,
        })
      ).rejects.toThrow('Cannot change stage of closed deals');
    });
  });

  describe('CLOSED_LOST transitions', () => {
    it('should require lost reason when moving to CLOSED_LOST', async () => {
      await expect(
        LeadService.updateLeadStage(testLeadId, {
          stage: Stage.CLOSED_LOST,
        })
      ).rejects.toThrow('Lost reason is required when closing lead as lost');
    });

    it('should successfully move lead to CLOSED_LOST with lost reason', async () => {
      const result = await LeadService.updateLeadStage(testLeadId, {
        stage: Stage.CLOSED_LOST,
        lostReason: LostReasonCategory.PRICE,
        lostReasonNotes: 'Price was too high',
      });

      expect(result.currentStage).toBe(Stage.CLOSED_LOST);
      expect(result.nextFollowUpDate).toBeNull();
    });

    it('should create lost reason record when moving to CLOSED_LOST', async () => {
      await LeadService.updateLeadStage(testLeadId, {
        stage: Stage.CLOSED_LOST,
        lostReason: LostReasonCategory.COMPETITOR,
        competitorName: 'Competitor X',
        lostReasonNotes: 'Went with competitor',
      });

      const lostReason = await prisma.lostReason.findUnique({
        where: { leadId: testLeadId },
      });

      expect(lostReason).toBeTruthy();
      expect(lostReason?.reason).toBe(LostReasonCategory.COMPETITOR);
      expect(lostReason?.competitorName).toBe('Competitor X');
      expect(lostReason?.notes).toBe('Went with competitor');
    });

    it('should create stage history for CLOSED_LOST transition', async () => {
      await LeadService.updateLeadStage(testLeadId, {
        stage: Stage.CLOSED_LOST,
        lostReason: LostReasonCategory.TIMING,
      });

      const history = await prisma.stageHistory.findMany({
        where: {
          leadId: testLeadId,
          toStage: Stage.CLOSED_LOST,
        },
      });

      expect(history).toHaveLength(1);
      expect(history[0]?.fromStage).toBe(Stage.NEGOTIATION);
      expect(history[0]?.toStage).toBe(Stage.CLOSED_LOST);
    });

    it('should not allow changing stage after CLOSED_LOST', async () => {
      await LeadService.updateLeadStage(testLeadId, {
        stage: Stage.CLOSED_LOST,
        lostReason: LostReasonCategory.NO_RESPONSE,
      });

      await expect(
        LeadService.updateLeadStage(testLeadId, {
          stage: Stage.NEGOTIATION,
        })
      ).rejects.toThrow('Cannot change stage of closed deals');
    });
  });

  describe('Lost reason categories', () => {
    it('should accept all valid lost reason categories', async () => {
      const categories = [
        LostReasonCategory.PRICE,
        LostReasonCategory.COMPETITOR,
        LostReasonCategory.NO_RESPONSE,
        LostReasonCategory.NOT_QUALIFIED,
        LostReasonCategory.TIMING,
        LostReasonCategory.OTHER,
      ];

      for (const category of categories) {
        // Create new test lead for each category
        const lead = await LeadService.createLead({
          companyName: `Test ${category}`,
          contactName: 'Test Contact',
          phone: '555-1234',
          email: `test-${category}@example.com`,
        });

        // Provide competitor name if category is COMPETITOR
        const stageUpdate: any = {
          stage: Stage.CLOSED_LOST,
          lostReason: category,
        };

        if (category === LostReasonCategory.COMPETITOR) {
          stageUpdate.competitorName = 'Test Competitor';
        }

        await LeadService.updateLeadStage(lead.id, stageUpdate);

        const lostReason = await prisma.lostReason.findUnique({
          where: { leadId: lead.id },
        });

        expect(lostReason?.reason).toBe(category);

        // Clean up
        await prisma.lostReason.deleteMany({ where: { leadId: lead.id } });
        await prisma.stageHistory.deleteMany({ where: { leadId: lead.id } });
        await prisma.lead.deleteMany({ where: { id: lead.id } });
      }
    });
  });
});
