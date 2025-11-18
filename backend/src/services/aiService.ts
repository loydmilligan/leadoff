import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function summarizeActivityNotes(
  activityId: string
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  })

  if (!activity || !activity.notes) {
    throw new Error('Activity not found or has no notes')
  }

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: `Summarize this CRM activity note in 1-2 sentences, focusing on key outcomes and next steps:\n\n${activity.notes}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const summary = response.data.choices[0].message.content

    // Save summary to database
    await prisma.activity.update({
      where: { id: activityId },
      data: { aiSummary: summary },
    })

    return summary
  } catch (error: any) {
    console.error('OpenRouter API error:', error.response?.data || error.message)
    throw new Error('Failed to generate AI summary')
  }
}
