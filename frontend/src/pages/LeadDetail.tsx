/**
 * LeadDetail Page
 * Displays detailed lead information with tabbed interface for organization, demo, and proposal data
 */

import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useLead } from '../services/leadHooks'
import { NarrowScreenLayout } from '../layouts/NarrowScreenLayout'
import { FollowUpIndicator } from '../components/FollowUpIndicator'
import { ActivityLogForm } from '../components/ActivityLogForm'
import { OrganizationForm } from '../components/OrganizationForm'
import { DemoForm } from '../components/DemoForm'
import { ProposalForm } from '../components/ProposalForm'
import { OpportunitySummary } from '../components/OpportunitySummary'
import { format } from 'date-fns'

type TabType = 'overview' | 'organization' | 'demo' | 'proposal'

export function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Get active tab from URL or default to 'overview'
  const activeTabFromUrl = (searchParams.get('tab') as TabType) || 'overview'
  const [activeTab, setActiveTab] = useState<TabType>(activeTabFromUrl)

  const { data: lead, isLoading, isError, refetch } = useLead(id!)

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  if (isLoading) {
    return (
      <NarrowScreenLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading lead details...</span>
        </div>
      </NarrowScreenLayout>
    )
  }

  if (isError || !lead) {
    return (
      <NarrowScreenLayout>
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">Failed to load lead. Please try again.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </button>
        </div>
      </NarrowScreenLayout>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'organization', label: 'Organization' },
    { id: 'demo', label: 'Demo' },
    { id: 'proposal', label: 'Proposal' },
  ]

  return (
    <NarrowScreenLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </button>

        {/* Lead Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lead.companyName}</h1>
              <p className="text-lg text-gray-600">{lead.contactName}</p>
              {lead.contactTitle && (
                <p className="text-sm text-gray-500">{lead.contactTitle}</p>
              )}
            </div>
            <FollowUpIndicator nextFollowUpDate={lead.nextFollowUpDate} />
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 gap-3 mt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Stage:</span>
              <span className="font-medium text-gray-900">{lead.currentStage.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium text-gray-900">{lead.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone:</span>
              <span className="font-medium text-gray-900">{lead.phone}</span>
            </div>
            {lead.estimatedValue && (
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Value:</span>
                <span className="font-semibold text-gray-900">${lead.estimatedValue.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Company Description */}
                {lead.companyDescription && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Company Description</h3>
                    <p className="text-sm text-gray-900">{lead.companyDescription}</p>
                  </div>
                )}

                {/* Activity History */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Activity History</h2>
                  {lead.activities && lead.activities.length > 0 ? (
                    <div className="space-y-4">
                      {lead.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="border-l-4 border-blue-500 pl-4 py-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{activity.subject}</h4>
                              <p className="text-sm text-gray-600">
                                {activity.type.replace(/_/g, ' ')}
                              </p>
                              {activity.notes && (
                                <p className="mt-1 text-sm text-gray-700">{activity.notes}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(activity.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No activities recorded yet</p>
                    </div>
                  )}
                </div>

                {/* Activity Log Form */}
                <ActivityLogForm leadId={lead.id} onSuccess={() => refetch()} />

                {/* Stage History */}
                {lead.stageHistory && lead.stageHistory.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Stage History</h2>
                    <div className="space-y-3">
                      {lead.stageHistory.map((history) => (
                        <div key={history.id} className="flex items-start text-sm">
                          <div className="flex-shrink-0 w-24 text-gray-500">
                            {format(new Date(history.changedAt), 'MMM d, yyyy')}
                          </div>
                          <div className="flex-1">
                            {history.fromStage ? (
                              <span>
                                <span className="text-gray-700">{history.fromStage}</span>
                                <span className="mx-2 text-gray-400">→</span>
                                <span className="font-medium text-gray-900">{history.toStage}</span>
                              </span>
                            ) : (
                              <span className="font-medium text-gray-900">
                                Created as {history.toStage}
                              </span>
                            )}
                            {history.note && (
                              <p className="mt-1 text-gray-600 text-xs">{history.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === 'organization' && (
              <div className="space-y-6">
                <OpportunitySummary lead={lead} />
                <OrganizationForm
                  leadId={lead.id}
                  initialData={lead.organizationInfo}
                  onSuccess={() => refetch()}
                />
              </div>
            )}

            {/* Demo Tab */}
            {activeTab === 'demo' && (
              <div>
                <DemoForm
                  leadId={lead.id}
                  initialData={lead.demoDetails}
                  onSuccess={() => refetch()}
                />
              </div>
            )}

            {/* Proposal Tab */}
            {activeTab === 'proposal' && (
              <div>
                <ProposalForm
                  leadId={lead.id}
                  initialData={lead.proposal}
                  onSuccess={() => refetch()}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </NarrowScreenLayout>
  )
}

export default LeadDetail
