/**
 * Reports Page
 * Business intelligence dashboard with analytics and export capabilities
 */

import { useState } from 'react'
import { usePipelineValue, useLeadAge, useWeeklySummary, useWinLoss } from '../services/reportHooks'
import { PipelineValueChart } from '../components/reports/PipelineValueChart'
import { LeadAgeTable } from '../components/reports/LeadAgeTable'
import { WeeklySummaryCard } from '../components/reports/WeeklySummaryCard'
import { WinLossChart } from '../components/reports/WinLossChart'

export function Reports() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  const pipelineValue = usePipelineValue()
  const leadAge = useLeadAge()
  const weeklySummary = useWeeklySummary()
  const winLoss = useWinLoss(dateRange.start, dateRange.end)

  const isLoading = pipelineValue.isLoading || leadAge.isLoading || weeklySummary.isLoading || winLoss.isLoading
  const hasError = pipelineValue.isError || leadAge.isError || weeklySummary.isError || winLoss.isError

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Business intelligence and performance metrics</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Loading reports...</p>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-800">
            Failed to load one or more reports. Please try again.
          </p>
        </div>
      )}

      {/* Reports Grid */}
      {!isLoading && !hasError && (
        <div className="space-y-6">
          {/* Weekly Summary */}
          {weeklySummary.data && (
            <WeeklySummaryCard data={weeklySummary.data} />
          )}

          {/* Pipeline Value Chart */}
          {pipelineValue.data && (
            <PipelineValueChart data={pipelineValue.data} />
          )}

          {/* Win/Loss Analysis */}
          {winLoss.data && (
            <WinLossChart data={winLoss.data} />
          )}

          {/* Stale Leads Table */}
          {leadAge.data && (
            <LeadAgeTable data={leadAge.data} />
          )}
        </div>
      )}
    </div>
  )
}

export default Reports
