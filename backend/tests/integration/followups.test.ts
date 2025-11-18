/**
 * Follow-ups Endpoint Integration Tests
 * Tests GET /api/v1/leads/follow-ups categorization
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { server } from '../../src/server'
import { addDays, subDays } from 'date-fns'

const prisma = new PrismaClient()

describe('Follow-ups API Endpoint', () => {
  beforeAll(async () => {
    // Server is already started in server.ts
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Clean up test database
    await prisma.stageHistory.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.lead.deleteMany()

    // Create test leads with different follow-up dates
    const now = new Date()

    // Overdue leads (2 leads)
    await prisma.lead.create({
      data: {
        companyName: 'Overdue Corp 1',
        contactName: 'Late Larry',
        phone: '555-0001',
        email: 'larry@overdue1.com',
        currentStage: 'INQUIRY',
        nextFollowUpDate: subDays(now, 3), // 3 days overdue
      },
    })

    await prisma.lead.create({
      data: {
        companyName: 'Overdue Corp 2',
        contactName: 'Delayed Dana',
        phone: '555-0002',
        email: 'dana@overdue2.com',
        currentStage: 'QUALIFICATION',
        nextFollowUpDate: subDays(now, 1), // 1 day overdue
      },
    })

    // Today leads (2 leads)
    await prisma.lead.create({
      data: {
        companyName: 'Today Corp 1',
        contactName: 'Timely Tom',
        phone: '555-0003',
        email: 'tom@today1.com',
        currentStage: 'OPPORTUNITY',
        nextFollowUpDate: now, // Today
      },
    })

    await prisma.lead.create({
      data: {
        companyName: 'Today Corp 2',
        contactName: 'Current Carol',
        phone: '555-0004',
        email: 'carol@today2.com',
        currentStage: 'DEMO_SCHEDULED',
        nextFollowUpDate: now, // Today
      },
    })

    // Upcoming leads within 7 days (2 leads)
    await prisma.lead.create({
      data: {
        companyName: 'Soon Corp 1',
        contactName: 'Future Frank',
        phone: '555-0005',
        email: 'frank@soon1.com',
        currentStage: 'PROPOSAL_SENT',
        nextFollowUpDate: addDays(now, 2), // 2 days from now
      },
    })

    await prisma.lead.create({
      data: {
        companyName: 'Soon Corp 2',
        contactName: 'Next Nancy',
        phone: '555-0006',
        email: 'nancy@soon2.com',
        currentStage: 'NEGOTIATION',
        nextFollowUpDate: addDays(now, 5), // 5 days from now
      },
    })

    // Upcoming lead beyond 7 days (should NOT be included)
    await prisma.lead.create({
      data: {
        companyName: 'Far Future Corp',
        contactName: 'Distant Dave',
        phone: '555-0007',
        email: 'dave@farfuture.com',
        currentStage: 'OPPORTUNITY',
        nextFollowUpDate: addDays(now, 10), // 10 days from now (excluded)
      },
    })

    // Closed lead with follow-up date (should be excluded)
    await prisma.lead.create({
      data: {
        companyName: 'Closed Corp',
        contactName: 'Won William',
        phone: '555-0008',
        email: 'william@closed.com',
        currentStage: 'CLOSED_WON',
        nextFollowUpDate: subDays(now, 5), // Should be ignored
      },
    })

    // Lead with no follow-up date (should be excluded)
    await prisma.lead.create({
      data: {
        companyName: 'No Follow-up Corp',
        contactName: 'Silent Sam',
        phone: '555-0009',
        email: 'sam@nofollow.com',
        currentStage: 'INQUIRY',
        nextFollowUpDate: null,
      },
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should categorize leads by follow-up status', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/leads/follow-ups',
    })

    expect(response.statusCode).toBe(200)

    const data = JSON.parse(response.body)

    // Verify structure
    expect(data).toHaveProperty('overdue')
    expect(data).toHaveProperty('today')
    expect(data).toHaveProperty('upcoming')

    // Verify counts
    expect(data.overdue).toHaveLength(2)
    expect(data.today).toHaveLength(2)
    expect(data.upcoming).toHaveLength(2)

    // Verify overdue leads
    const overdueNames = data.overdue.map((l: any) => l.companyName)
    expect(overdueNames).toContain('Overdue Corp 1')
    expect(overdueNames).toContain('Overdue Corp 2')

    // Verify today leads
    const todayNames = data.today.map((l: any) => l.companyName)
    expect(todayNames).toContain('Today Corp 1')
    expect(todayNames).toContain('Today Corp 2')

    // Verify upcoming leads
    const upcomingNames = data.upcoming.map((l: any) => l.companyName)
    expect(upcomingNames).toContain('Soon Corp 1')
    expect(upcomingNames).toContain('Soon Corp 2')

    // Verify excluded leads
    const allNames = [
      ...data.overdue.map((l: any) => l.companyName),
      ...data.today.map((l: any) => l.companyName),
      ...data.upcoming.map((l: any) => l.companyName),
    ]
    expect(allNames).not.toContain('Far Future Corp') // >7 days
    expect(allNames).not.toContain('Closed Corp') // Closed stage
    expect(allNames).not.toContain('No Follow-up Corp') // No follow-up date
  })

  it('should order overdue leads by follow-up date (oldest first)', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/leads/follow-ups',
    })

    expect(response.statusCode).toBe(200)

    const data = JSON.parse(response.body)

    // Verify ordering: oldest overdue first
    expect(data.overdue[0].companyName).toBe('Overdue Corp 1') // 3 days overdue
    expect(data.overdue[1].companyName).toBe('Overdue Corp 2') // 1 day overdue
  })

  it('should include activity history with follow-up leads', async () => {
    // Add an activity to one of the leads
    const lead = await prisma.lead.findFirst({
      where: { companyName: 'Today Corp 1' },
    })

    await prisma.activity.create({
      data: {
        leadId: lead!.id,
        type: 'CALL',
        subject: 'Follow-up call',
        notes: 'Discussed next steps',
      },
    })

    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/leads/follow-ups',
    })

    expect(response.statusCode).toBe(200)

    const data = JSON.parse(response.body)
    const todayLead = data.today.find((l: any) => l.companyName === 'Today Corp 1')

    expect(todayLead).toBeDefined()
    expect(todayLead.activities).toBeDefined()
    expect(todayLead.activities.length).toBeGreaterThan(0)
    expect(todayLead.activities[0].subject).toBe('Follow-up call')
  })

  it('should return empty arrays when no follow-ups exist', async () => {
    // Clean up all leads
    await prisma.stageHistory.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.lead.deleteMany()

    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/leads/follow-ups',
    })

    expect(response.statusCode).toBe(200)

    const data = JSON.parse(response.body)

    expect(data.overdue).toHaveLength(0)
    expect(data.today).toHaveLength(0)
    expect(data.upcoming).toHaveLength(0)
  })
})
