/**
 * Dashboard Page
 * Main lead management interface with quick entry, search, and list view
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLeads } from '../services/leadHooks'
import { NarrowScreenLayout } from '../layouts/NarrowScreenLayout'
import { LeadForm } from '../components/LeadForm'
import { LeadCard } from '../components/LeadCard'
import { SearchBar } from '../components/SearchBar'
import { FocusView } from '../components/FocusView'
import { Stage } from '@leadoff/types'

export function Dashboard() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState<Stage | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, isError, refetch } = useLeads({
    search: searchTerm || undefined,
    stage: selectedStage,
    page: currentPage,
    limit: 20,
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleStageFilter = (stage: Stage | '') => {
    setSelectedStage(stage === '' ? undefined : stage)
    setCurrentPage(1)
  }

  const handleLeadCreated = () => {
    refetch()
  }

  return (
    <NarrowScreenLayout>
      <div className="space-y-6">
        {/* Focus View - Top Priority Leads */}
        <FocusView maxLeads={10} onLeadClick={(leadId) => navigate(`/leads/${leadId}`)} />

        {/* Lead Entry Form */}
        <LeadForm onSuccess={handleLeadCreated} />

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Leads</h2>

          <SearchBar onSearch={handleSearch} />

          {/* Stage Filter */}
          <div>
            <label htmlFor="stageFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Stage
            </label>
            <select
              id="stageFilter"
              value={selectedStage || ''}
              onChange={(e) => handleStageFilter(e.target.value as Stage | '')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Stages</option>
              <option value={Stage.INQUIRY}>Inquiry</option>
              <option value={Stage.QUALIFICATION}>Qualification</option>
              <option value={Stage.OPPORTUNITY}>Opportunity</option>
              <option value={Stage.DEMO_SCHEDULED}>Demo Scheduled</option>
              <option value={Stage.DEMO_COMPLETE}>Demo Complete</option>
              <option value={Stage.PROPOSAL_SENT}>Proposal Sent</option>
              <option value={Stage.NEGOTIATION}>Negotiation</option>
              <option value={Stage.CLOSED_WON}>Closed Won</option>
              <option value={Stage.CLOSED_LOST}>Closed Lost</option>
            </select>
          </div>
        </div>

        {/* Lead List */}
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-12">
              <svg
                className="animate-spin h-8 w-8 mx-auto text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Loading leads...</p>
            </div>
          )}

          {isError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">
                Failed to load leads. Please try again.
              </p>
            </div>
          )}

          {data && data.leads.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try a different search term' : 'Get started by creating a new lead'}
              </p>
            </div>
          )}

          {data && data.leads.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4">
                {data.leads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data.total > data.limit && (
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage * data.limit >= data.total}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{(currentPage - 1) * data.limit + 1}</span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * data.limit, data.total)}
                        </span>{' '}
                        of <span className="font-medium">{data.total}</span> results
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="relative inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700">
                        Page {currentPage}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={currentPage * data.limit >= data.total}
                        className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </NarrowScreenLayout>
  )
}

export default Dashboard
