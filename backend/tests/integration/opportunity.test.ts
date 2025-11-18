/**
 * Integration tests for opportunity tracking endpoints
 * Tests: Organization, Demo, Proposal endpoints
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { DemoType, DemoOutcome, ProposalStatus } from '@leadoff/types';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

describe('Opportunity Tracking Integration Tests', () => {
  let testLeadId: string;

  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create test lead
    const response = await fetch(`${BASE_URL}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Test Opportunity Corp',
        contactName: 'Jane Doe',
        phone: '555-0100',
        email: 'jane@testopportunity.com',
      }),
    });

    const lead = await response.json() as any;
    testLeadId = lead.id;
  });

  beforeEach(async () => {
    // Clean up related data before each test
    if (testLeadId) {
      await prisma.organizationInfo.deleteMany({ where: { leadId: testLeadId } });
      await prisma.demoDetails.deleteMany({ where: { leadId: testLeadId } });
      await prisma.proposal.deleteMany({ where: { leadId: testLeadId } });
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testLeadId) {
      await prisma.lead.delete({ where: { id: testLeadId } });
    }
    await prisma.$disconnect();
  });

  describe('PUT /api/v1/leads/:id/organization', () => {
    it('should create organization info for a lead', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/organization`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCount: 250,
          annualRevenue: 5000000,
          industry: 'Software',
          decisionMaker: 'John Smith',
          decisionMakerRole: 'CTO',
          currentSolution: 'Excel spreadsheets',
          painPoints: 'Manual processes, data fragmentation',
          budget: 50000,
          timeline: 'Q1 2025',
        }),
      });

      expect(response.status).toBe(200);
      const organizationInfo = await response.json() as any;
      expect(organizationInfo.leadId).toBe(testLeadId);
      expect(organizationInfo.employeeCount).toBe(250);
      expect(organizationInfo.industry).toBe('Software');
      expect(organizationInfo.decisionMaker).toBe('John Smith');
    });

    it('should update existing organization info', async () => {
      // First create
      await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/organization`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: 'Software',
          employeeCount: 250,
        }),
      });

      // Then update
      const response = await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/organization`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCount: 300,
          budget: 75000,
        }),
      });

      expect(response.status).toBe(200);
      const organizationInfo = await response.json() as any;
      expect(organizationInfo.employeeCount).toBe(300);
      expect(organizationInfo.budget).toBe(75000);
      expect(organizationInfo.industry).toBe('Software');
    });

    it('should return 404 for non-existent lead', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/leads/non-existent-id/organization`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: 'Software',
        }),
      });

      expect(response.status).toBe(404);
      const error = await response.json() as any;
      expect(error.error).toBe('NOT_FOUND');
    });

    it('should validate employee count is positive', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/organization`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCount: -10,
        }),
      });

      expect(response.status).toBe(400);
      const error = await response.json() as any;
      expect(error.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/v1/leads/:id/demo', () => {
    it('should create demo details for a lead', async () => {
      const demoDate = new Date('2025-02-01T14:00:00Z');

      const response = await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/demo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoDate: demoDate.toISOString(),
          demoType: DemoType.ONLINE,
          attendees: 'John Smith (CTO), Jane Doe (VP Engineering)',
          userCountEstimate: 50,
          followUpRequired: true,
          notes: 'Interested in API integration module',
        }),
      });

      expect(response.status).toBe(200);
      const demoDetails = await response.json() as any;
      expect(demoDetails.leadId).toBe(testLeadId);
      expect(demoDetails.demoType).toBe(DemoType.ONLINE);
      expect(demoDetails.userCountEstimate).toBe(50);
      expect(demoDetails.followUpRequired).toBe(true);
    });

    it('should update demo details with outcome', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/demo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoDate: new Date('2025-02-01T14:00:00Z').toISOString(),
          demoType: DemoType.ONLINE,
          demoOutcome: DemoOutcome.POSITIVE,
          notes: 'Very engaged, ready to move forward with proposal',
        }),
      });

      expect(response.status).toBe(200);
      const demoDetails = await response.json() as any;
      expect(demoDetails.demoOutcome).toBe(DemoOutcome.POSITIVE);
    });

    it('should validate demo date format', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/demo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoDate: 'invalid-date',
        }),
      });

      expect(response.status).toBe(400);
      const error = await response.json() as any;
      expect(error.error).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent lead', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/leads/non-existent-id/demo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoDate: new Date().toISOString(),
        }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/leads/:id/proposal', () => {
    it('should create proposal for a lead', async () => {
      const proposalDate = new Date('2025-01-15T10:00:00Z');

      const response = await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/proposal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalDate: proposalDate.toISOString(),
          estimatedValue: 75000,
          products: 'Enterprise Plan, API Access, Premium Support',
          contractTerm: '12 months',
          status: ProposalStatus.SENT,
          notes: 'Custom pricing for first year',
        }),
      });

      expect(response.status).toBe(200);
      const proposal = await response.json() as any;
      expect(proposal.leadId).toBe(testLeadId);
      expect(proposal.estimatedValue).toBe(75000);
      expect(proposal.status).toBe(ProposalStatus.SENT);
      expect(proposal.products).toBe('Enterprise Plan, API Access, Premium Support');
      expect(proposal.contractTerm).toBe('12 months');
    });

    it('should update proposal status', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/proposal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalDate: new Date('2025-01-15T10:00:00Z').toISOString(),
          estimatedValue: 75000,
          status: ProposalStatus.ACCEPTED,
        }),
      });

      expect(response.status).toBe(200);
      const proposal = await response.json() as any;
      expect(proposal.status).toBe(ProposalStatus.ACCEPTED);
    });

    it('should update lead estimated value when proposal is created', async () => {
      // First create a proposal
      await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/proposal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalDate: new Date('2025-01-15T10:00:00Z').toISOString(),
          estimatedValue: 75000,
        }),
      });

      // Then fetch the lead to verify
      const leadResponse = await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}`);
      const lead = await leadResponse.json() as any;
      expect(lead.estimatedValue).toBe(75000);
    });

    it('should reject future proposal dates', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const response = await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/proposal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalDate: futureDate.toISOString(),
          estimatedValue: 50000,
        }),
      });

      expect(response.status).toBe(400);
      const error = await response.json() as any;
      expect(error.error).toBe('VALIDATION_ERROR');
      expect(error.message).toContain('future');
    });

    it('should validate estimated value is positive', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/proposal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalDate: new Date().toISOString(),
          estimatedValue: -1000,
        }),
      });

      expect(response.status).toBe(400);
      const error = await response.json() as any;
      expect(error.error).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent lead', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/leads/non-existent-id/proposal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalDate: new Date().toISOString(),
          estimatedValue: 50000,
        }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Qualification Score Calculation', () => {
    it('should calculate correct qualification score', async () => {
      // Create complete opportunity data
      await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/organization`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: 'Software',
          budget: 75000,
          decisionMaker: 'John Smith',
        }),
      });

      await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/demo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoDate: new Date('2025-02-01T14:00:00Z').toISOString(),
          demoType: DemoType.ONLINE,
        }),
      });

      await fetch(`${BASE_URL}/api/v1/leads/${testLeadId}/proposal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalDate: new Date('2025-01-15T10:00:00Z').toISOString(),
          estimatedValue: 75000,
        }),
      });

      // Import and test qualification scoring
      const { OrganizationService } = await import('../../src/services/organizationService');
      const score = await OrganizationService.calculateQualificationScore(testLeadId);

      // With organization info (+20), budget (+20), decision maker (+20), demo (+20), proposal (+20)
      expect(score).toBe(100);
    });
  });
});
