import { PrismaClient } from '@prisma/client'
import Papa from 'papaparse'
import { Stage, LeadSource, ActivityType } from '@leadoff/types'

const prisma = new PrismaClient()

interface ImportRow {
  companyName: string
  contactName: string
  phone: string
  email: string
  contactTitle?: string
  currentStage?: string
  estimatedValue?: string
  nextActionType?: string
  nextActionDescription?: string
  nextFollowUpDate?: string
  leadSource?: string
  notes?: string
}

export async function importLeadsFromCSV(csvContent: string) {
  const results = Papa.parse<ImportRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  })

  const imported: any[] = []
  const failed: { row: number; reason: string; data: ImportRow }[] = []

  for (let i = 0; i < results.data.length; i++) {
    const row = results.data[i]
    const rowNumber = i + 2 // +2 because row 1 is header, array is 0-indexed

    // Skip if row is undefined
    if (!row) {
      continue
    }

    try {
      // Validate required fields
      if (!row.companyName || !row.contactName || !row.phone || !row.email) {
        failed.push({
          row: rowNumber,
          reason: 'Missing required fields (companyName, contactName, phone, email)',
          data: row,
        })
        continue
      }

      // Parse optional fields
      const currentStage = row.currentStage || Stage.INQUIRY
      const estimatedValue = row.estimatedValue
        ? parseFloat(row.estimatedValue)
        : null
      const leadSource = row.leadSource || LeadSource.OTHER
      const nextFollowUpDate = row.nextFollowUpDate
        ? new Date(row.nextFollowUpDate)
        : null

      // Create lead
      const lead = await prisma.lead.create({
        data: {
          companyName: row.companyName,
          contactName: row.contactName,
          phone: row.phone,
          email: row.email,
          contactTitle: row.contactTitle,
          currentStage,
          estimatedValue,
          leadSource,
          nextActionType: row.nextActionType,
          nextActionDescription: row.nextActionDescription,
          nextActionDueDate: nextFollowUpDate,
          nextFollowUpDate,
        },
      })

      // Create initial activity if notes provided
      if (row.notes && row.notes.trim().length > 0) {
        await prisma.activity.create({
          data: {
            leadId: lead.id,
            type: ActivityType.NOTE,
            subject: 'Import Notes',
            notes: row.notes,
            completed: true,
            completedAt: new Date(),
          },
        })
      }

      imported.push(lead)
    } catch (error: any) {
      failed.push({
        row: rowNumber,
        reason: error.message || 'Unknown error',
        data: row,
      })
    }
  }

  return {
    imported: imported.length,
    failed: failed.length,
    failedRows: failed,
  }
}
