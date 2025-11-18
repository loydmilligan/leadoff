/**
 * LeadOff CRM - Database Seed Script
 * Creates realistic sample data for development and testing
 */

import { PrismaClient } from '@prisma/client'
import { addDays, subDays, addHours } from 'date-fns'

const prisma = new PrismaClient()

// Sample data generators
const companies = [
  'Acme Corp', 'TechStart Industries', 'Global Solutions Inc', 'Innovate LLC',
  'Pacific Systems', 'Metro Services', 'Summit Technologies', 'Apex Partners',
  'Pioneer Group', 'Quantum Dynamics', 'Nexus Enterprises', 'Stellar Corp',
  'Horizon Tech', 'Fusion Industries', 'Velocity Systems', 'Cascade Group',
  'Eclipse Solutions', 'Vertex Corp', 'Atlas Services', 'Meridian Tech',
  'Zenith Industries', 'Orbit Systems', 'Pinnacle Group', 'Titan Corp',
  'Vanguard Tech', 'Nova Industries', 'Synergy Group', 'Optima Systems',
  'Unity Solutions', 'Prism Tech'
]

const contacts = [
  { name: 'John Smith', title: 'Operations Manager', email: 'jsmith' },
  { name: 'Sarah Johnson', title: 'CTO', email: 'sjohnson' },
  { name: 'Michael Brown', title: 'Director of IT', email: 'mbrown' },
  { name: 'Emily Davis', title: 'VP Operations', email: 'edavis' },
  { name: 'David Wilson', title: 'COO', email: 'dwilson' },
  { name: 'Lisa Anderson', title: 'CFO', email: 'landerson' },
  { name: 'Robert Taylor', title: 'General Manager', email: 'rtaylor' },
  { name: 'Jennifer Martinez', title: 'IT Director', email: 'jmartinez' },
  { name: 'William Garcia', title: 'VP Technology', email: 'wgarcia' },
  { name: 'Mary Rodriguez', title: 'Operations Lead', email: 'mrodriguez' },
]

const leadSources = ['EMAIL', 'PHONE', 'WEBSITE', 'REFERRAL', 'TRADE_SHOW']
const stages = ['INQUIRY', 'QUALIFICATION', 'OPPORTUNITY', 'DEMO_SCHEDULED', 'DEMO_COMPLETE', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']

const activityTypes = ['EMAIL', 'PHONE_CALL', 'MEETING', 'NOTE', 'TASK']
const activitySubjects = [
  'Initial contact', 'Follow-up call', 'Demo discussion', 'Pricing inquiry',
  'Technical questions', 'Contract review', 'Implementation planning',
  'Product questions', 'Timeline discussion', 'Budget approval'
]

const industries = ['Manufacturing', 'Healthcare', 'Retail', 'Technology', 'Finance', 'Education', 'Logistics']
const lostReasons = ['PRICE', 'COMPETITOR', 'NO_RESPONSE', 'NOT_QUALIFIED', 'TIMING']
const demoOutcomes = ['POSITIVE', 'NEUTRAL', 'NEGATIVE']

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.stageHistory.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.lostReason.deleteMany()
  await prisma.proposal.deleteMany()
  await prisma.demoDetails.deleteMany()
  await prisma.organizationInfo.deleteMany()
  await prisma.lead.deleteMany()

  console.log('Creating leads across different stages...')

  // Create 30 leads distributed across pipeline stages
  const stageDistribution = [
    { stage: 'INQUIRY', count: 8 },
    { stage: 'QUALIFICATION', count: 6 },
    { stage: 'OPPORTUNITY', count: 5 },
    { stage: 'DEMO_SCHEDULED', count: 3 },
    { stage: 'DEMO_COMPLETE', count: 2 },
    { stage: 'PROPOSAL_SENT', count: 2 },
    { stage: 'NEGOTIATION', count: 1 },
    { stage: 'CLOSED_WON', count: 2 },
    { stage: 'CLOSED_LOST', count: 1 },
  ]

  let leadIndex = 0

  for (const { stage, count } of stageDistribution) {
    for (let i = 0; i < count; i++) {
      const company = companies[leadIndex % companies.length]
      const contact = contacts[leadIndex % contacts.length]
      const daysOld = Math.floor(Math.random() * 60) + 1

      const lead = await prisma.lead.create({
        data: {
          companyName: company,
          contactName: contact.name,
          contactTitle: contact.title,
          email: `${contact.email}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          companyDescription: `${company} is interested in our access control solutions.`,
          leadSource: leadSources[Math.floor(Math.random() * leadSources.length)],
          currentStage: stage,
          estimatedValue: stage !== 'INQUIRY' && stage !== 'QUALIFICATION'
            ? Math.floor(Math.random() * 50000) + 10000
            : null,
          nextFollowUpDate: ['CLOSED_WON', 'CLOSED_LOST'].includes(stage)
            ? null
            : addDays(new Date(), Math.floor(Math.random() * 14) - 7),
          lastActivityDate: subDays(new Date(), Math.floor(Math.random() * 7)),
          createdAt: subDays(new Date(), daysOld),
        },
      })

      // Create initial stage history
      await prisma.stageHistory.create({
        data: {
          leadId: lead.id,
          fromStage: null,
          toStage: 'INQUIRY',
          changedAt: lead.createdAt,
          note: 'Lead created',
        },
      })

      // If not in INQUIRY stage, create stage progression history
      if (stage !== 'INQUIRY') {
        const stageIndex = stages.indexOf(stage)
        for (let j = 1; j <= stageIndex; j++) {
          await prisma.stageHistory.create({
            data: {
              leadId: lead.id,
              fromStage: stages[j - 1],
              toStage: stages[j],
              changedAt: subDays(new Date(), daysOld - j * 5),
              note: `Progressed to ${stages[j]}`,
            },
          })
        }
      }

      // Create 2-5 activities per lead
      const activityCount = Math.floor(Math.random() * 4) + 2
      for (let j = 0; j < activityCount; j++) {
        await prisma.activity.create({
          data: {
            leadId: lead.id,
            type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
            subject: activitySubjects[Math.floor(Math.random() * activitySubjects.length)],
            notes: `Activity ${j + 1} for ${company}`,
            dueDate: addDays(new Date(), Math.floor(Math.random() * 10)),
            completed: Math.random() > 0.5,
            completedAt: Math.random() > 0.5 ? subDays(new Date(), Math.floor(Math.random() * 5)) : null,
          },
        })
      }

      // Add stage-specific data
      if (['OPPORTUNITY', 'DEMO_SCHEDULED', 'DEMO_COMPLETE', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'].includes(stage)) {
        await prisma.organizationInfo.create({
          data: {
            leadId: lead.id,
            industry: industries[Math.floor(Math.random() * industries.length)],
            employeeCount: [50, 100, 250, 500, 1000][Math.floor(Math.random() * 5)],
            decisionMaker: contact.name,
            decisionMakerRole: contact.title,
            annualRevenue: Math.floor(Math.random() * 10000000) + 1000000,
            timeline: ['Q1 2025', 'Q2 2025', 'H1 2025', 'Within 3 months'][Math.floor(Math.random() * 4)],
            painPoints: 'Current system is outdated and inefficient',
            currentSolution: 'Manual processes with spreadsheets',
          },
        })
      }

      if (['DEMO_SCHEDULED', 'DEMO_COMPLETE', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'].includes(stage)) {
        await prisma.demoDetails.create({
          data: {
            leadId: lead.id,
            demoDate: stage === 'DEMO_SCHEDULED' ? addDays(new Date(), 3) : subDays(new Date(), 5),
            demoType: 'ONLINE',
            attendees: `${contact.name}, Additional Stakeholders`,
            demoOutcome: stage !== 'DEMO_SCHEDULED'
              ? demoOutcomes[Math.floor(Math.random() * demoOutcomes.length)]
              : null,
            userCountEstimate: Math.floor(Math.random() * 100) + 10,
            followUpRequired: true,
            notes: 'Interested in access control and reporting features',
          },
        })
      }

      if (['PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'].includes(stage)) {
        await prisma.proposal.create({
          data: {
            leadId: lead.id,
            proposalDate: subDays(new Date(), 10),
            estimatedValue: lead.estimatedValue || 25000,
            products: 'Access Control System, Mobile App, Reporting Module',
            contractTerm: '12 months',
            status: stage === 'CLOSED_WON' ? 'ACCEPTED' : stage === 'CLOSED_LOST' ? 'REJECTED' : 'SENT',
            notes: 'Standard pricing with 10% discount for annual payment',
          },
        })
      }

      if (stage === 'CLOSED_LOST') {
        await prisma.lostReason.create({
          data: {
            leadId: lead.id,
            reason: lostReasons[Math.floor(Math.random() * lostReasons.length)],
            competitorName: Math.random() > 0.5 ? 'Competitor XYZ' : null,
            lostDate: subDays(new Date(), 3),
            notes: 'Lost to competitor / pricing concerns',
          },
        })
      }

      leadIndex++
    }
  }

  console.log(`✓ Created ${leadIndex} leads with complete data`)
  console.log('✓ Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
