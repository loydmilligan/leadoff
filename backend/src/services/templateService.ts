import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTemplates(type?: string) {
  return await prisma.template.findMany({
    where: {
      isActive: true,
      ...(type && { type }),
    },
    orderBy: { name: 'asc' },
  })
}

export async function getTemplate(id: string) {
  return await prisma.template.findUnique({
    where: { id },
  })
}

export function replacePlaceholders(
  template: string,
  lead: any
): string {
  let result = template

  const replacements: Record<string, string> = {
    '{{companyName}}': lead.companyName || '',
    '{{contactName}}': lead.contactName || '',
    '{{contactTitle}}': lead.contactTitle || '',
    '{{currentStage}}': lead.currentStage || '',
    '{{estimatedValue}}': lead.estimatedValue
      ? `$${lead.estimatedValue.toLocaleString()}`
      : '',
  }

  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder, 'g'), value)
  }

  return result
}
