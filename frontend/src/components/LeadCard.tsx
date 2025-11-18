/**
 * LeadCard Component
 * Display lead information in a card format
 */

import { Lead } from '../services/leadHooks'
import { Stage } from '@leadoff/types'
import { FollowUpIndicator } from './FollowUpIndicator'

interface LeadCardProps {
  lead: Lead
  onClick?: () => void
}

const STAGE_COLORS: Record<Stage, string> = {
  [Stage.INQUIRY]: 'bg-gray-100 text-gray-800',
  [Stage.QUALIFICATION]: 'bg-blue-100 text-blue-800',
  [Stage.OPPORTUNITY]: 'bg-purple-100 text-purple-800',
  [Stage.DEMO_SCHEDULED]: 'bg-indigo-100 text-indigo-800',
  [Stage.DEMO_COMPLETE]: 'bg-cyan-100 text-cyan-800',
  [Stage.PROPOSAL_SENT]: 'bg-yellow-100 text-yellow-800',
  [Stage.NEGOTIATION]: 'bg-orange-100 text-orange-800',
  [Stage.CLOSED_WON]: 'bg-green-100 text-green-800',
  [Stage.CLOSED_LOST]: 'bg-red-100 text-red-800',
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const stageColor = STAGE_COLORS[lead.currentStage as Stage] || STAGE_COLORS[Stage.INQUIRY]

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{lead.companyName}</h3>
          <p className="text-sm text-gray-600">{lead.contactName}</p>
          {lead.contactTitle && (
            <p className="text-xs text-gray-500">{lead.contactTitle}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColor}`}
          >
            {lead.currentStage.replace(/_/g, ' ')}
          </span>
          <FollowUpIndicator nextFollowUpDate={lead.nextFollowUpDate} compact />
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {lead.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          {lead.phone}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div>
          {lead.lastActivityDate ? (
            <span>Last activity: {formatDate(lead.lastActivityDate)}</span>
          ) : (
            <span>No recent activity</span>
          )}
        </div>
        {lead.estimatedValue && (
          <div className="font-semibold text-gray-700">
            ${lead.estimatedValue.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}

export default LeadCard
