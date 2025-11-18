/**
 * OpportunitySummary Component
 * Displays qualification score and key opportunity metrics
 */

import React from 'react'
import { Lead } from '../services/leadHooks'

export interface OpportunitySummaryProps {
  lead: Lead
}

export const OpportunitySummary: React.FC<OpportunitySummaryProps> = ({ lead }) => {
  // Calculate qualification score (0-100) based on available data
  const calculateQualificationScore = (): number => {
    let score = 0
    let maxScore = 0

    // Organization info exists (20 points)
    maxScore += 20
    if (lead.organizationInfo) {
      score += 20
    }

    // Has budget (15 points)
    maxScore += 15
    if (lead.organizationInfo?.budget) {
      score += 15
    }

    // Has decision maker (15 points)
    maxScore += 15
    if (lead.organizationInfo?.decisionMaker) {
      score += 15
    }

    // Has industry (10 points)
    maxScore += 10
    if (lead.organizationInfo?.industry) {
      score += 10
    }

    // Has timeline (10 points)
    maxScore += 10
    if (lead.organizationInfo?.timeline) {
      score += 10
    }

    // Demo scheduled/completed (15 points)
    maxScore += 15
    if (lead.demoDetails) {
      score += 15
    }

    // Has proposal (15 points)
    maxScore += 15
    if (lead.proposal) {
      score += 15
    }

    // Return score as percentage (0-100)
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  }

  const qualificationScore = lead.qualificationScore !== undefined ? lead.qualificationScore : calculateQualificationScore()

  // Determine color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 71) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 41) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 71) return 'Strong'
    if (score >= 41) return 'Medium'
    return 'Weak'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Opportunity Qualification</h3>

      {/* Qualification Score Badge */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center px-4 py-2 border-2 rounded-lg ${getScoreColor(qualificationScore)}`}>
            <span className="text-2xl font-bold">{qualificationScore}</span>
            <span className="text-sm ml-2">/ 100</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Qualification Level</p>
            <p className="text-lg font-semibold">{getScoreLabel(qualificationScore)}</p>
          </div>
        </div>
      </div>

      {/* Checklist of Key Metrics */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Qualifiers</h4>

        {/* Has Organization Info */}
        <div className="flex items-center gap-2">
          {lead.organizationInfo ? (
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className={`text-sm ${lead.organizationInfo ? 'text-gray-900' : 'text-gray-500'}`}>
            Organization details captured
          </span>
        </div>

        {/* Has Budget */}
        <div className="flex items-center gap-2">
          {lead.organizationInfo?.budget ? (
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className={`text-sm ${lead.organizationInfo?.budget ? 'text-gray-900' : 'text-gray-500'}`}>
            Budget identified
            {lead.organizationInfo?.budget && (
              <span className="ml-1 font-medium">
                (${lead.organizationInfo.budget.toLocaleString()})
              </span>
            )}
          </span>
        </div>

        {/* Has Decision Maker */}
        <div className="flex items-center gap-2">
          {lead.organizationInfo?.decisionMaker ? (
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className={`text-sm ${lead.organizationInfo?.decisionMaker ? 'text-gray-900' : 'text-gray-500'}`}>
            Decision maker identified
            {lead.organizationInfo?.decisionMaker && (
              <span className="ml-1 font-medium">
                ({lead.organizationInfo.decisionMaker})
              </span>
            )}
          </span>
        </div>

        {/* Has Demo */}
        <div className="flex items-center gap-2">
          {lead.demoDetails ? (
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className={`text-sm ${lead.demoDetails ? 'text-gray-900' : 'text-gray-500'}`}>
            Demo scheduled/completed
          </span>
        </div>

        {/* Has Proposal */}
        <div className="flex items-center gap-2">
          {lead.proposal ? (
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className={`text-sm ${lead.proposal ? 'text-gray-900' : 'text-gray-500'}`}>
            Proposal created
            {lead.proposal && (
              <span className="ml-1 font-medium">
                (${lead.proposal.estimatedValue.toLocaleString()})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Recommendations */}
      {qualificationScore < 71 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h5 className="text-sm font-semibold text-blue-900 mb-2">Next Steps to Improve Qualification</h5>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            {!lead.organizationInfo && <li>Complete organization details</li>}
            {!lead.organizationInfo?.budget && <li>Identify and document budget</li>}
            {!lead.organizationInfo?.decisionMaker && <li>Identify decision maker and stakeholders</li>}
            {!lead.demoDetails && <li>Schedule a product demo</li>}
            {!lead.proposal && <li>Create a proposal with estimated value</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

export default OpportunitySummary
