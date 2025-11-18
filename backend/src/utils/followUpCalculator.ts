/**
 * Follow-up Date Calculator
 *
 * Calculates automatic follow-up dates based on lead stage per FR-009:
 * - Inquiry: +24 hours
 * - Qualification: +48 hours
 * - Opportunity: +3 days
 * - Demo Scheduled: +1 day (before demo)
 * - Demo Complete: +1 day
 * - Proposal Sent: +3 days
 * - Negotiation: +2 days
 * - Closed-Won/Lost: null (no follow-up needed)
 */

import { addHours, addDays, startOfDay } from 'date-fns';

export type Stage =
  | 'INQUIRY'
  | 'QUALIFICATION'
  | 'OPPORTUNITY'
  | 'DEMO_SCHEDULED'
  | 'DEMO_COMPLETE'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface FollowUpCalculationOptions {
  stage: Stage;
  baseDate?: Date;
  demoDate?: Date; // Required for DEMO_SCHEDULED stage
}

/**
 * Calculate next follow-up date based on stage
 *
 * @param options - Stage and optional base date
 * @returns Date object for next follow-up, or null for closed stages
 */
export function calculateNextFollowUp(options: FollowUpCalculationOptions): Date | null {
  const { stage, baseDate = new Date(), demoDate } = options;

  switch (stage) {
    case 'INQUIRY':
      // +24 hours from now
      return addHours(baseDate, 24);

    case 'QUALIFICATION':
      // +48 hours from now
      return addHours(baseDate, 48);

    case 'OPPORTUNITY':
      // +3 days from now
      return addDays(baseDate, 3);

    case 'DEMO_SCHEDULED':
      // 1 day before demo date (if provided), otherwise +1 day from now
      if (demoDate) {
        return addDays(startOfDay(demoDate), -1);
      }
      return addDays(baseDate, 1);

    case 'DEMO_COMPLETE':
      // +1 day from now
      return addDays(baseDate, 1);

    case 'PROPOSAL_SENT':
      // +3 days from now
      return addDays(baseDate, 3);

    case 'NEGOTIATION':
      // +2 days from now
      return addDays(baseDate, 2);

    case 'CLOSED_WON':
    case 'CLOSED_LOST':
      // No follow-up needed for closed stages
      return null;

    default:
      // Unknown stage - default to +1 day
      console.warn(`Unknown stage "${stage}", defaulting to +1 day follow-up`);
      return addDays(baseDate, 1);
  }
}

/**
 * Get the number of days between two dates
 *
 * @param date1 - First date
 * @param date2 - Second date (defaults to now)
 * @returns Number of days (positive if date1 is in past, negative if in future)
 */
export function getDaysFromNow(date: Date, now: Date = new Date()): number {
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Determine follow-up status based on date
 *
 * @param followUpDate - The scheduled follow-up date
 * @param now - Current date (defaults to now)
 * @returns Status: 'overdue' | 'today' | 'upcoming' | 'none'
 */
export function getFollowUpStatus(
  followUpDate: Date | null | undefined,
  now: Date = new Date()
): 'overdue' | 'today' | 'upcoming' | 'none' {
  if (!followUpDate) {
    return 'none';
  }

  const todayStart = startOfDay(now);
  const followUpStart = startOfDay(followUpDate);

  if (followUpDate < todayStart) {
    return 'overdue';
  }

  if (followUpStart.getTime() === todayStart.getTime()) {
    return 'today';
  }

  return 'upcoming';
}
