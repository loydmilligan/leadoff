import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTemplates() {
  const templates = [
    {
      type: 'EMAIL',
      name: 'Initial Inquiry Response',
      subject: 'Re: Your inquiry about our services',
      body: `Hi {{contactName}},

Thank you for reaching out to us at {{companyName}}!

I'd love to learn more about your needs and see how we can help. Would you be available for a brief 15-minute call this week to discuss?

Looking forward to connecting!

Best regards`,
      isActive: true,
    },
    {
      type: 'PHONE_CALL',
      name: 'Demo Scheduling Call Script',
      subject: null,
      body: `**Opening:**
Hi {{contactName}}, this is [Your Name] from [Company]. How are you today?

**Purpose:**
I'm calling to schedule a personalized demo of our platform for {{companyName}}.

**Discovery Questions:**
1. What challenges are you currently facing with [problem area]?
2. How many users would need access to the system?
3. What's your timeline for making a decision?
4. Who else should be involved in the demo?

**Schedule Demo:**
Great! I have availability [dates/times]. What works best for you?

**Closing:**
Perfect! I'll send a calendar invite with the demo link. Looking forward to showing you what we can do for {{companyName}}!`,
      isActive: true,
    },
    {
      type: 'EMAIL',
      name: 'Proposal Follow-up',
      subject: 'Following up on your proposal',
      body: `Hi {{contactName}},

I wanted to follow up on the proposal I sent over for {{companyName}}.

Have you had a chance to review it? I'd be happy to schedule a call to discuss any questions or address any concerns.

The proposal includes:
- [Key feature 1]
- [Key feature 2]
- [Key feature 3]

Total investment: {{estimatedValue}}

What questions can I answer for you?

Best regards`,
      isActive: true,
    },
    {
      type: 'TEXT_MESSAGE',
      name: 'Check-in Text',
      subject: null,
      body: `Hi {{contactName}}! Just checking in to see if you had any questions about our conversation. Let me know if you'd like to schedule a follow-up call. - [Your Name]`,
      isActive: true,
    },
    {
      type: 'PHONE_CALL',
      name: 'Lost Deal Follow-up Script',
      subject: null,
      body: `**Opening:**
Hi {{contactName}}, this is [Your Name]. I hope things are going well at {{companyName}}.

**Purpose:**
I wanted to reach out because it's been 6 months since we last spoke. I understand you went with [competitor] at the time.

**Check-in Questions:**
1. How is [competitor's solution] working out for you?
2. Are there any gaps or challenges that have come up?
3. Has anything changed in your requirements or priorities?

**Value Proposition:**
We've added [new features] that specifically address [pain points you mentioned].

**Next Steps:**
Would it make sense to schedule a quick demo to show you what's new?

**Closing:**
Great talking with you! I'll send over some information and follow up next week.`,
      isActive: true,
    },
  ]

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: 'temp-' + template.name.replace(/\s/g, '-').toLowerCase() },
      update: template,
      create: template,
    })
  }

  console.log('Templates seeded successfully')
}

seedTemplates()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
