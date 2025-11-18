/**
 * Weekly Summary Card Component
 * Displays team productivity metrics
 */

import { WeeklySummaryReport } from '../../services/reportHooks'

interface WeeklySummaryCardProps {
  data: WeeklySummaryReport
}

export function WeeklySummaryCard({ data }: WeeklySummaryCardProps) {
  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Weekly Summary</h2>
        <p className="text-sm text-gray-500">
          {new Date(data.week.start).toLocaleDateString()} - {new Date(data.week.end).toLocaleDateString()}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Leads Created</div>
          <div className="text-3xl font-bold text-blue-700">{data.metrics.leadsCreated}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Converted</div>
          <div className="text-3xl font-bold text-green-700">{data.metrics.leadsConverted}</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Lost</div>
          <div className="text-3xl font-bold text-red-700">{data.metrics.leadsLost}</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Activities</div>
          <div className="text-3xl font-bold text-purple-700">{data.metrics.activitiesLogged}</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Avg Response</div>
          <div className="text-3xl font-bold text-yellow-700">{formatHours(data.metrics.averageResponseTime)}</div>
        </div>
      </div>

      {/* Top Performers */}
      {data.topPerformers.mostActive.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Most Active Leads</h3>
          <div className="space-y-2">
            {data.topPerformers.mostActive.map((lead, index) => (
              <div key={lead.leadId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{lead.companyName}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {lead.activityCount} {lead.activityCount === 1 ? 'activity' : 'activities'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Generated: {new Date(data.generatedAt).toLocaleString()}
      </div>
    </div>
  )
}
