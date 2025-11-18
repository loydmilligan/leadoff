/**
 * Duplicate Detection Service
 * Detects potential duplicate leads using email matching and name similarity
 */

import { Lead } from '@prisma/client'
import { LeadModel } from '../models/lead'

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy string matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  const costs: number[] = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1] ?? 0
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j] ?? 0) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue
    }
  }
  return costs[s2.length] ?? 0
}

/**
 * Calculate similarity percentage between two strings
 * Returns 0-100, where 100 is identical
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) {
    return 100
  }

  const distance = levenshteinDistance(longer, shorter)
  return ((longer.length - distance) / longer.length) * 100
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  matches: Lead[]
  reason?: 'EMAIL_MATCH' | 'NAME_SIMILARITY'
}

export class DuplicateDetectionService {
  /**
   * Check for duplicate leads
   * Returns matches if:
   * - Exact email match, OR
   * - Company name + contact name similarity > 80%
   */
  static async checkDuplicate(
    email: string,
    companyName: string,
    contactName: string
  ): Promise<DuplicateCheckResult> {
    // Check for exact email match
    const emailMatch = await LeadModel.findByEmail(email)
    if (emailMatch) {
      return {
        isDuplicate: true,
        matches: [emailMatch],
        reason: 'EMAIL_MATCH',
      }
    }

    // Check for name similarity
    const nameMatches = await LeadModel.searchByName(companyName, contactName)
    const similarLeads: Lead[] = []

    for (const lead of nameMatches) {
      const fullName1 = `${companyName} ${contactName}`.toLowerCase()
      const fullName2 = `${lead.companyName} ${lead.contactName}`.toLowerCase()
      const similarity = calculateSimilarity(fullName1, fullName2)

      if (similarity >= 80) {
        similarLeads.push(lead)
      }
    }

    if (similarLeads.length > 0) {
      return {
        isDuplicate: true,
        matches: similarLeads.slice(0, 5), // Max 5 results
        reason: 'NAME_SIMILARITY',
      }
    }

    return {
      isDuplicate: false,
      matches: [],
    }
  }
}

export default DuplicateDetectionService
