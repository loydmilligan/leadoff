/**
 * FollowUpIndicator Component
 * Displays visual follow-up status badges with color-coding:
 * - Red: Overdue (past nextFollowUpDate)
 * - Yellow: Due today
 * - Green: Upcoming (future date)
 * - Gray: No follow-up scheduled
 */

import React from 'react'
import { format, differenceInDays, startOfDay } from 'date-fns'

export interface FollowUpIndicatorProps {
  nextFollowUpDate?: string | null
  compact?: boolean
}

export type FollowUpStatus = 'overdue' | 'today' | 'upcoming' | 'none'

/**
 * Determine follow-up status based on date
 */
function getFollowUpStatus(dateString: string | null | undefined): FollowUpStatus {
  if (!dateString) {
    return 'none'
  }

  const now = new Date()
  const followUpDate = new Date(dateString)
  const todayStart = startOfDay(now)
  const followUpStart = startOfDay(followUpDate)

  if (followUpDate < todayStart) {
    return 'overdue'
  }

  if (followUpStart.getTime() === todayStart.getTime()) {
    return 'today'
  }

  return 'upcoming'
}

/**
 * Get days difference for overdue leads
 */
function getDaysOverdue(dateString: string): number {
  const now = new Date()
  const followUpDate = new Date(dateString)
  return differenceInDays(now, followUpDate)
}

/**
 * Get badge styling based on status
 */
function getBadgeStyles(status: FollowUpStatus): string {
  const baseStyles = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium'

  switch (status) {
    case 'overdue':
      return `${baseStyles} bg-red-100 text-red-800 border border-red-200`
    case 'today':
      return `${baseStyles} bg-yellow-100 text-yellow-800 border border-yellow-200`
    case 'upcoming':
      return `${baseStyles} bg-green-100 text-green-800 border border-green-200`
    case 'none':
      return `${baseStyles} bg-gray-100 text-gray-600 border border-gray-200`
    default:
      return baseStyles
  }
}

/**
 * Get badge text based on status
 */
function getBadgeText(status: FollowUpStatus, dateString?: string | null, compact?: boolean): string {
  if (!dateString) {
    return compact ? 'No f/u' : 'No follow-up'
  }

  const followUpDate = new Date(dateString)

  switch (status) {
    case 'overdue':
      const daysOverdue = getDaysOverdue(dateString)
      return compact ? `${daysOverdue}d overdue` : `Overdue: ${daysOverdue} days`
    case 'today':
      return compact ? 'Due today' : 'Due Today'
    case 'upcoming':
      const formattedDate = format(followUpDate, 'MMM d')
      return compact ? formattedDate : `Due ${formattedDate}`
    case 'none':
      return compact ? 'No f/u' : 'No follow-up'
    default:
      return 'Unknown'
  }
}

export const FollowUpIndicator: React.FC<FollowUpIndicatorProps> = ({
  nextFollowUpDate,
  compact = false,
}) => {
  const status = getFollowUpStatus(nextFollowUpDate)
  const badgeText = getBadgeText(status, nextFollowUpDate, compact)
  const badgeStyles = getBadgeStyles(status)

  return (
    <span className={badgeStyles} data-status={status}>
      {badgeText}
    </span>
  )
}

export default FollowUpIndicator
