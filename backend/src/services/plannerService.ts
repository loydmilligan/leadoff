import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getPlannerData() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const weekEnd = new Date(todayStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  // Overdue items
  const overdue = await prisma.lead.findMany({
    where: {
      isArchived: false,
      nextActionDueDate: {
        lt: todayStart,
      },
    },
    orderBy: { nextActionDueDate: 'asc' },
  })

  // Today's items
  const today = await prisma.lead.findMany({
    where: {
      isArchived: false,
      nextActionDueDate: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
    orderBy: { nextActionDueDate: 'asc' },
  })

  // This week's items
  const thisWeek = await prisma.lead.findMany({
    where: {
      isArchived: false,
      nextActionDueDate: {
        gte: todayEnd,
        lt: weekEnd,
      },
    },
    orderBy: { nextActionDueDate: 'asc' },
  })

  // No date set (warning)
  const noDate = await prisma.lead.findMany({
    where: {
      isArchived: false,
      currentStage: {
        notIn: ['CLOSED_WON', 'CLOSED_LOST', 'NURTURE_30_DAY', 'NURTURE_90_DAY'],
      },
      OR: [
        { nextActionDueDate: null },
        { nextFollowUpDate: null },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  })

  return {
    overdue,
    today,
    thisWeek,
    noDate,
  }
}
