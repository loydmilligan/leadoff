/**
 * FocusView Component
 * Displays top 5-10 most urgent leads requiring immediate attention
 * Prioritizes: overdue follow-ups, high value, approaching deadlines
 */

import React from 'react'
import { useFollowUps, Lead } from '../services/leadHooks'
import { FollowUpIndicator } from './FollowUpIndicator'

export interface FocusViewProps {
  maxLeads?: number
  onLeadClick?: (leadId: string) => void
}

/**
 * Calculate priority score for lead ranking
 * Higher score = higher priority
 */
function calculatePriority(lead: Lead, status: 'overdue' | 'today' | 'upcoming'): number {
  let score = 0

  // Base priority by status
  if (status === 'overdue') {
    score += 1000 // Highest priority
    // Add days overdue to score
    if (lead.nextFollowUpDate) {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(lead.nextFollowUpDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      score += daysOverdue * 10
    }
  } else if (status === 'today') {
    score += 500 // Medium-high priority
  } else {
    score += 100 // Lower priority for upcoming
  }

  // Add value-based priority
  if (lead.estimatedValue) {
    score += Math.min(lead.estimatedValue / 1000, 100) // Max 100 points from value
  }

  // Add stage-based priority (later stages = higher priority)
  const stageWeights: Record<string, number> = {
    INQUIRY: 1,
    QUALIFICATION: 2,
    OPPORTUNITY: 3,
    DEMO_SCHEDULED: 4,
    DEMO_COMPLETE: 5,
    PROPOSAL_SENT: 6,
    NEGOTIATION: 10, // Highest stage priority
  }
  score += stageWeights[lead.currentStage] || 0

  return score
}

export const FocusView: React.FC<FocusViewProps> = ({ maxLeads = 10, onLeadClick }) => {
  const { data, isLoading, error } = useFollowUps()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Focus: Leads Requiring Attention</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading urgent leads...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Focus: Leads Requiring Attention</h2>
        <div className="text-red-600">
          Error loading follow-ups: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  // Combine and prioritize leads
  const prioritizedLeads = [
    ...data.overdue.map((lead) => ({ lead, status: 'overdue' as const, priority: calculatePriority(lead, 'overdue') })),
    ...data.today.map((lead) => ({ lead, status: 'today' as const, priority: calculatePriority(lead, 'today') })),
    ...data.upcoming.map((lead) => ({ lead, status: 'upcoming' as const, priority: calculatePriority(lead, 'upcoming') })),
  ]
    .sort((a, b) => b.priority - a.priority) // Sort by priority descending
    .slice(0, maxLeads) // Take top N leads

  const totalCount = data.overdue.length + data.today.length + data.upcoming.length

  if (prioritizedLeads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Focus: Leads Requiring Attention</h2>
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="font-medium">All caught up!</p>
          <p className="text-sm mt-1">No urgent follow-ups at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Focus: Leads Requiring Attention</h2>
        <span className="text-sm text-gray-600">
          Showing top {prioritizedLeads.length} of {totalCount}
        </span>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 mb-4">
        {data.overdue.length > 0 && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <span className="mr-1">{data.overdue.length}</span> Overdue
          </div>
        )}
        {data.today.length > 0 && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <span className="mr-1">{data.today.length}</span> Due Today
          </div>
        )}
        {data.upcoming.length > 0 && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <span className="mr-1">{data.upcoming.length}</span> Upcoming
          </div>
        )}
      </div>

      {/* Lead cards */}
      <div className="space-y-3">
        {prioritizedLeads.map(({ lead, status }) => (
          <div
            key={lead.id}
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
              status === 'overdue' ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
            onClick={() => onLeadClick?.(lead.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{lead.companyName}</h3>
                <p className="text-sm text-gray-600">{lead.contactName}</p>
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <span className="text-gray-500">
                    Stage: <span className="font-medium text-gray-700">{lead.currentStage}</span>
                  </span>
                  {lead.estimatedValue && (
                    <span className="text-gray-500">
                      Value: <span className="font-medium text-gray-700">${lead.estimatedValue.toLocaleString()}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4">
                <FollowUpIndicator nextFollowUpDate={lead.nextFollowUpDate} />
              </div>
            </div>

            {/* Show latest activity if available */}
            {lead.activities && lead.activities.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Last activity: {lead.activities[0]?.subject || 'N/A'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FocusView
