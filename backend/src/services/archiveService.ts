import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function archiveLead(leadId: string, reason?: string) {
  return await prisma.lead.update({
    where: { id: leadId },
    data: {
      isArchived: true,
      archivedAt: new Date(),
      archiveReason: reason,
    },
  })
}

export async function restoreLead(leadId: string) {
  return await prisma.lead.update({
    where: { id: leadId },
    data: {
      isArchived: false,
      archivedAt: null,
      archiveReason: null,
    },
  })
}

export async function getArchivedLeads() {
  return await prisma.lead.findMany({
    where: { isArchived: true },
    orderBy: { archivedAt: 'desc' },
  })
}

export async function deleteLead(leadId: string) {
  // Hard delete - use with caution
  return await prisma.lead.delete({
    where: { id: leadId },
  })
}
