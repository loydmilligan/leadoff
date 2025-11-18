/**
 * Lead API Integration Tests
 * Tests complete request/response cycles for lead endpoints
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { server } from '../../src/server'
import { PrismaClient } from '@prisma/client'
import { Stage } from '@leadoff/types'

const prisma = new PrismaClient()

// Test data
const testLead = {
  companyName: 'Test Corp',
  contactName: 'John Doe',
  phone: '555-1234',
  email: 'john@testcorp.com',
  contactTitle: 'CEO',
}

describe('Lead API Endpoints', () => {
  beforeAll(async () => {
    // Server is already started in server.ts
    // Wait for it to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.lead.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    })
  })

  afterAll(async () => {
    // Clean up and close connections
    await prisma.lead.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    })
    await prisma.$disconnect()
  })

  describe('POST /api/v1/leads', () => {
    it('should create a new lead with INQUIRY stage', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/leads',
        payload: testLead,
      })

      expect(response.statusCode).toBe(201)
      const lead = JSON.parse(response.body)
      expect(lead.companyName).toBe(testLead.companyName)
      expect(lead.contactName).toBe(testLead.contactName)
      expect(lead.email).toBe(testLead.email)
      expect(lead.currentStage).toBe(Stage.INQUIRY)
      expect(lead.id).toBeDefined()
    })

    it('should return 400 for invalid email', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/leads',
        payload: {
          ...testLead,
          email: 'invalid-email',
        },
      })

      expect(response.statusCode).toBe(400)
      const error = JSON.parse(response.body)
      expect(error.error).toBe('VALIDATION_ERROR')
    })

    it('should return 400 for missing required fields', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/leads',
        payload: {
          companyName: 'Test',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('GET /api/v1/leads', () => {
    beforeEach(async () => {
      // Create test leads
      await prisma.lead.create({ data: testLead })
      await prisma.lead.create({
        data: {
          ...testLead,
          email: 'jane@testcorp.com',
          contactName: 'Jane Smith',
          currentStage: Stage.QUALIFICATION,
        },
      })
    })

    it('should return paginated list of leads', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/leads',
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.body)
      expect(result.leads).toBeDefined()
      expect(Array.isArray(result.leads)).toBe(true)
      expect(result.total).toBeGreaterThanOrEqual(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    it('should filter leads by search term', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/leads?search=Jane',
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.body)
      expect(result.leads.length).toBeGreaterThan(0)
      expect(result.leads[0].contactName).toContain('Jane')
    })

    it('should filter leads by stage', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/leads?stage=${Stage.QUALIFICATION}`,
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.body)
      expect(result.leads.every((lead: any) => lead.currentStage === Stage.QUALIFICATION)).toBe(true)
    })

    it('should support pagination', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/leads?page=1&limit=1',
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.body)
      expect(result.leads.length).toBeLessThanOrEqual(1)
      expect(result.limit).toBe(1)
    })
  })

  describe('GET /api/v1/leads/:id', () => {
    let createdLeadId: string

    beforeEach(async () => {
      const lead = await prisma.lead.create({ data: testLead })
      createdLeadId = lead.id
    })

    it('should return single lead by ID', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/leads/${createdLeadId}`,
      })

      expect(response.statusCode).toBe(200)
      const lead = JSON.parse(response.body)
      expect(lead.id).toBe(createdLeadId)
      expect(lead.companyName).toBe(testLead.companyName)
      expect(lead.activities).toBeDefined()
      expect(lead.stageHistory).toBeDefined()
    })

    it('should return 404 for non-existent lead', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/leads/non-existent-id',
      })

      expect(response.statusCode).toBe(404)
      const error = JSON.parse(response.body)
      expect(error.error).toBe('NOT_FOUND')
    })
  })

  describe('PATCH /api/v1/leads/:id/stage', () => {
    let createdLeadId: string

    beforeEach(async () => {
      const lead = await prisma.lead.create({ data: testLead })
      createdLeadId = lead.id

      // Create initial stage history
      await prisma.stageHistory.create({
        data: {
          leadId: lead.id,
          fromStage: null,
          toStage: Stage.INQUIRY,
        },
      })
    })

    it('should update lead stage', async () => {
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/v1/leads/${createdLeadId}/stage`,
        payload: {
          stage: Stage.QUALIFICATION,
          note: 'Initial qualification call completed',
        },
      })

      expect(response.statusCode).toBe(200)
      const lead = JSON.parse(response.body)
      expect(lead.currentStage).toBe(Stage.QUALIFICATION)

      // Verify stage history was created
      const history = await prisma.stageHistory.findMany({
        where: { leadId: createdLeadId },
        orderBy: { changedAt: 'desc' },
      })
      expect(history.length).toBeGreaterThan(0)
      expect(history[0]?.toStage).toBe(Stage.QUALIFICATION)
      expect(history[0]?.fromStage).toBe(Stage.INQUIRY)
    })

    it('should return 404 for non-existent lead', async () => {
      const response = await server.inject({
        method: 'PATCH',
        url: '/api/v1/leads/non-existent-id/stage',
        payload: {
          stage: Stage.QUALIFICATION,
        },
      })

      expect(response.statusCode).toBe(404)
    })

    it('should return 400 for invalid stage', async () => {
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/v1/leads/${createdLeadId}/stage`,
        payload: {
          stage: 'INVALID_STAGE',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('DELETE /api/v1/leads/:id', () => {
    let createdLeadId: string

    beforeEach(async () => {
      const lead = await prisma.lead.create({ data: testLead })
      createdLeadId = lead.id
    })

    it('should delete lead', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: `/api/v1/leads/${createdLeadId}`,
      })

      expect(response.statusCode).toBe(204)

      // Verify lead is deleted
      const deletedLead = await prisma.lead.findUnique({
        where: { id: createdLeadId },
      })
      expect(deletedLead).toBeNull()
    })
  })
})
