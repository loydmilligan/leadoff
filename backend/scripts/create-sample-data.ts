/**
 * Sample Data Generation Script
 * Creates 20 diverse sample leads for testing and demos
 */

import { PrismaClient } from '@prisma/client'
import {
  Stage,
  LeadSource,
  ActivityType,
  ProposalStatus,
  LostReasonCategory,
} from '@leadoff/types'

const prisma = new PrismaClient()

// Helper to generate random date
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

// Helper to get date offset from now
function dateFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

const companies = [
  {
    name: 'Acme Corporation',
    contact: 'John Smith',
    title: 'IT Director',
    email: 'john.smith@acme.com',
    phone: '555-0101',
    description: 'Manufacturing company looking to modernize operations',
  },
  {
    name: 'TechStart Inc',
    contact: 'Sarah Johnson',
    title: 'CEO',
    email: 'sarah@techstart.io',
    phone: '555-0102',
    description: 'Fast-growing tech startup',
  },
  {
    name: 'Global Retail Solutions',
    contact: 'Michael Chen',
    title: 'VP of Operations',
    email: 'mchen@globalretail.com',
    phone: '555-0103',
    description: 'Large retail chain with 200+ locations',
  },
  {
    name: 'Healthcare Partners',
    contact: 'Emily Rodriguez',
    title: 'CIO',
    email: 'e.rodriguez@healthpartners.org',
    phone: '555-0104',
    description: 'Regional healthcare provider',
  },
  {
    name: 'Financial Services Group',
    contact: 'David Kim',
    title: 'Director of Technology',
    email: 'dkim@finservices.com',
    phone: '555-0105',
    description: 'Financial services firm with compliance requirements',
  },
  {
    name: 'Education Tech Solutions',
    contact: 'Lisa Thompson',
    title: 'Head of IT',
    email: 'lthompson@edtech.edu',
    phone: '555-0106',
    description: 'Educational institution',
  },
  {
    name: 'Manufacturing Dynamics',
    contact: 'Robert Martinez',
    title: 'Operations Manager',
    email: 'rmartinez@mfgdynamics.com',
    phone: '555-0107',
    description: 'Industrial manufacturer',
  },
  {
    name: 'Logistics Pro',
    contact: 'Jennifer Lee',
    title: 'IT Manager',
    email: 'jlee@logisticspro.com',
    phone: '555-0108',
    description: 'Logistics and transportation company',
  },
  {
    name: 'Creative Agency Co',
    contact: 'Alex Brown',
    title: 'Creative Director',
    email: 'alex@creativeagency.com',
    phone: '555-0109',
    description: 'Marketing and creative services',
  },
  {
    name: 'Real Estate Partners',
    contact: 'Jessica White',
    title: 'Managing Partner',
    email: 'jwhite@realestatepartners.com',
    phone: '555-0110',
    description: 'Commercial real estate firm',
  },
  {
    name: 'Software Solutions Ltd',
    contact: 'Chris Anderson',
    title: 'CTO',
    email: 'canderson@softwaresolutions.com',
    phone: '555-0111',
    description: 'Software development company',
  },
  {
    name: 'Construction Group',
    contact: 'Maria Garcia',
    title: 'Project Manager',
    email: 'mgarcia@constructiongroup.com',
    phone: '555-0112',
    description: 'Large construction company',
  },
  {
    name: 'Hospitality Services',
    contact: 'James Wilson',
    title: 'GM',
    email: 'jwilson@hospitalityservices.com',
    phone: '555-0113',
    description: 'Hotel and hospitality management',
  },
  {
    name: 'Legal Associates',
    contact: 'Patricia Davis',
    title: 'Managing Partner',
    email: 'pdavis@legalassociates.com',
    phone: '555-0114',
    description: 'Law firm',
  },
  {
    name: 'Energy Solutions',
    contact: 'Daniel Moore',
    title: 'VP of Technology',
    email: 'dmoore@energysolutions.com',
    phone: '555-0115',
    description: 'Energy and utilities company',
  },
  {
    name: 'Insurance Group',
    contact: 'Karen Taylor',
    title: 'IT Director',
    email: 'ktaylor@insurancegroup.com',
    phone: '555-0116',
    description: 'Insurance provider',
  },
  {
    name: 'Consulting Partners',
    contact: 'Steven Harris',
    title: 'Principal',
    email: 'sharris@consultingpartners.com',
    phone: '555-0117',
    description: 'Management consulting firm',
  },
  {
    name: 'Media Corporation',
    contact: 'Amanda Clark',
    title: 'VP of Digital',
    email: 'aclark@mediacorp.com',
    phone: '555-0118',
    description: 'Media and publishing company',
  },
  {
    name: 'Pharma Research',
    contact: 'Thomas Lewis',
    title: 'Director of IT',
    email: 'tlewis@pharmaresearch.com',
    phone: '555-0119',
    description: 'Pharmaceutical research company',
  },
  {
    name: 'Nonprofit Foundation',
    contact: 'Michelle Walker',
    title: 'Executive Director',
    email: 'mwalker@nonprofitfoundation.org',
    phone: '555-0120',
    description: 'Charitable organization',
  },
]

const activityNotes = {
  email: [
    'Sent introductory email with product overview and pricing guide',
    'Followed up on previous conversation about implementation timeline',
    'Shared case study from similar industry client',
    'Sent meeting agenda and calendar invite',
  ],
  call: [
    'Initial discovery call - discussed current pain points and needs',
    'Follow-up call to answer technical questions',
    'Spoke with decision maker about budget and timeline',
    'Quick check-in call to see if they had any questions',
  ],
  meeting: [
    'In-person meeting at their office - great rapport building',
    'Virtual meeting with key stakeholders - very engaged',
    'Discovery session to understand their workflow',
    'Kick-off meeting to discuss implementation plan',
  ],
  note: [
    'Competitor mentioned: Salesforce - concerned about complexity',
    'Budget approved for Q1 - ready to move forward',
    'Waiting on legal review of contract terms',
    'Decision pushed to next quarter due to budget freeze',
  ],
}

async function createSampleData() {
  console.log('Starting sample data generation...')

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.stageHistory.deleteMany()
  await prisma.lostReason.deleteMany()
  await prisma.proposal.deleteMany()
  await prisma.demoDetails.deleteMany()
  await prisma.organizationInfo.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.lead.deleteMany()

  const stages = [
    Stage.INQUIRY,
    Stage.QUALIFICATION,
    Stage.OPPORTUNITY,
    Stage.DEMO_SCHEDULED,
    Stage.DEMO_COMPLETE,
    Stage.PROPOSAL_SENT,
    Stage.NEGOTIATION,
    Stage.CLOSED_WON,
    Stage.CLOSED_LOST,
    Stage.NURTURE_30_DAY,
    Stage.NURTURE_90_DAY,
  ]

  const leadSources = Object.values(LeadSource)
  const nextActionTypes = ['CALL', 'EMAIL', 'MEETING', 'PROPOSAL', 'FOLLOW_UP']

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i]
    const stage = stages[i % stages.length]
    const source = leadSources[i % leadSources.length]

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        companyName: company.name,
        contactName: company.contact,
        contactTitle: company.title,
        email: company.email,
        phone: company.phone,
        companyDescription: company.description,
        leadSource: source,
        currentStage: stage,
        estimatedValue: Math.random() > 0.5 ? Math.floor(Math.random() * 100000) + 10000 : null,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      },
    })

    console.log(`Created lead: ${company.name} (${stage})`)

    // Add next action for active leads (not closed or some nurture)
    if (
      ![Stage.CLOSED_WON, Stage.CLOSED_LOST].includes(stage) &&
      Math.random() > 0.3
    ) {
      const isOverdue = Math.random() > 0.6
      const daysOffset = isOverdue
        ? -Math.floor(Math.random() * 5) - 1 // 1-5 days overdue
        : Math.floor(Math.random() * 7) + 1 // 1-7 days in future

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          nextActionType: nextActionTypes[i % nextActionTypes.length],
          nextActionDescription: `Follow up on ${company.name} regarding pricing and timeline`,
          nextActionDueDate: dateFromNow(daysOffset),
        },
      })
    }

    // Add activities (2-5 per lead)
    const activityCount = Math.floor(Math.random() * 4) + 2
    for (let j = 0; j < activityCount; j++) {
      const activityTypes = [ActivityType.EMAIL, ActivityType.PHONE_CALL, ActivityType.MEETING, ActivityType.NOTE]
      const type = activityTypes[j % activityTypes.length]

      let notes = ''
      if (type === ActivityType.EMAIL) notes = activityNotes.email[j % activityNotes.email.length]
      else if (type === ActivityType.PHONE_CALL) notes = activityNotes.call[j % activityNotes.call.length]
      else if (type === ActivityType.MEETING) notes = activityNotes.meeting[j % activityNotes.meeting.length]
      else notes = activityNotes.note[j % activityNotes.note.length]

      await prisma.activity.create({
        data: {
          leadId: lead.id,
          type,
          subject: `${type} - ${company.name}`,
          notes,
          completed: true,
          completedAt: randomDate(lead.createdAt, new Date()),
          createdAt: randomDate(lead.createdAt, new Date()),
        },
      })
    }

    // Add proposals for appropriate stages
    if (
      [
        Stage.PROPOSAL_SENT,
        Stage.NEGOTIATION,
        Stage.CLOSED_WON,
        Stage.CLOSED_LOST,
      ].includes(stage)
    ) {
      const proposalStatuses = [ProposalStatus.SENT, ProposalStatus.VIEWED, ProposalStatus.ACCEPTED, ProposalStatus.REJECTED]
      await prisma.proposal.create({
        data: {
          leadId: lead.id,
          proposalDate: randomDate(lead.createdAt, new Date()),
          estimatedValue: lead.estimatedValue || 50000,
          products: 'Enterprise Plan + Professional Services',
          contractTerm: '12 months',
          status: stage === Stage.CLOSED_WON
            ? ProposalStatus.ACCEPTED
            : stage === Stage.CLOSED_LOST
            ? ProposalStatus.REJECTED
            : proposalStatuses[i % proposalStatuses.length],
          notes: 'Standard enterprise proposal with custom integrations',
        },
      })
    }

    // Add lost reason for closed lost
    if (stage === Stage.CLOSED_LOST) {
      const reasons = Object.values(LostReasonCategory)
      await prisma.lostReason.create({
        data: {
          leadId: lead.id,
          reason: reasons[i % reasons.length],
          competitorName: i % 3 === 0 ? 'Salesforce' : i % 3 === 1 ? 'HubSpot' : null,
          lostDate: randomDate(lead.createdAt, new Date()),
          notes: 'Price was main concern, went with competitor',
        },
      })
    }

    // Add organization info for qualified leads
    if (
      [
        Stage.QUALIFICATION,
        Stage.OPPORTUNITY,
        Stage.DEMO_SCHEDULED,
        Stage.DEMO_COMPLETE,
        Stage.PROPOSAL_SENT,
        Stage.NEGOTIATION,
        Stage.CLOSED_WON,
      ].includes(stage)
    ) {
      await prisma.organizationInfo.create({
        data: {
          leadId: lead.id,
          employeeCount: Math.floor(Math.random() * 1000) + 50,
          annualRevenue: Math.floor(Math.random() * 10000000) + 1000000,
          industry: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail'][i % 5],
          decisionMaker: company.contact,
          decisionMakerRole: company.title,
          currentSolution: ['Manual processes', 'Spreadsheets', 'Legacy CRM', 'Competitor solution'][i % 4],
          painPoints: 'Looking for better automation and reporting capabilities',
          budget: lead.estimatedValue,
          timeline: ['Q1 2025', 'Q2 2025', 'Next 3 months', 'ASAP'][i % 4],
        },
      })
    }

    // Add stage history
    await prisma.stageHistory.create({
      data: {
        leadId: lead.id,
        fromStage: null,
        toStage: Stage.INQUIRY,
        changedAt: lead.createdAt,
        note: 'Initial lead created',
      },
    })

    if (stage !== Stage.INQUIRY) {
      await prisma.stageHistory.create({
        data: {
          leadId: lead.id,
          fromStage: Stage.INQUIRY,
          toStage: stage,
          changedAt: randomDate(lead.createdAt, new Date()),
          note: `Moved to ${stage}`,
        },
      })
    }
  }

  // Create some templates
  const templates = [
    {
      type: 'EMAIL',
      name: 'Initial Outreach',
      subject: 'Introduction to LeadOff CRM',
      body: 'Hi {{contactName}},\n\nI wanted to reach out to introduce LeadOff CRM and see if it might be a good fit for {{companyName}}.\n\nWe help companies like yours streamline their sales process and close more deals.\n\nWould you be interested in a quick 15-minute call to discuss?\n\nBest regards',
    },
    {
      type: 'EMAIL',
      name: 'Follow-up After Demo',
      subject: 'Thanks for the demo - {{companyName}}',
      body: 'Hi {{contactName}},\n\nThank you for taking the time for the demo today. I hope you found it valuable.\n\nAs discussed, I will send over the proposal by end of week.\n\nPlease let me know if you have any questions in the meantime.\n\nBest regards',
    },
    {
      type: 'PHONE_CALL',
      name: 'Discovery Call Script',
      subject: 'Discovery Call',
      body: '1. Introduction and rapport building\n2. Ask about current process and pain points\n3. Discuss decision timeline and budget\n4. Schedule demo if qualified\n5. Send follow-up email',
    },
    {
      type: 'TEXT_MESSAGE',
      name: 'Quick Check-in',
      subject: 'Quick check-in',
      body: 'Hi {{contactName}}, just wanted to check in and see if you had any questions about our proposal for {{companyName}}. Let me know if you need anything!',
    },
  ]

  for (const template of templates) {
    await prisma.template.create({
      data: template,
    })
  }

  console.log('Sample data generation completed!')
  console.log(`Created ${companies.length} leads with activities, proposals, and related data`)
  console.log(`Created ${templates.length} communication templates`)
}

createSampleData()
  .catch((e) => {
    console.error('Error creating sample data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
