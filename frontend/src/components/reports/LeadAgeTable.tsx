/**
 * Lead Age Table Component
 * Displays stale leads requiring attention
 */

import { useNavigate } from 'react-router-dom'
import { LeadAgeReport } from '../../services/reportHooks'

interface LeadAgeTableProps {
  data: LeadAgeReport
}

export function LeadAgeTable({ data }: LeadAgeTableProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Stale Leads (&gt;14 Days)</h2>
        <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 rounded p-3">
            <div className="text-gray-500">Total Stale</div>
            <div className="text-2xl font-bold text-gray-900">{data.summary.total}</div>
          </div>
          <div className="bg-yellow-50 rounded p-3">
            <div className="text-gray-500">&gt; 14 Days</div>
            <div className="text-2xl font-bold text-yellow-700">{data.summary.over14Days}</div>
          </div>
          <div className="bg-orange-50 rounded p-3">
            <div className="text-gray-500">&gt; 30 Days</div>
            <div className="text-2xl font-bold text-orange-700">{data.summary.over30Days}</div>
          </div>
          <div className="bg-red-50 rounded p-3">
            <div className="text-gray-500">&gt; 60 Days</div>
            <div className="text-2xl font-bold text-red-700">{data.summary.over60Days}</div>
          </div>
        </div>
      </div>

      {data.staleLeads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No stale leads found. Great work!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days in Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.staleLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.companyName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{lead.contactName}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {lead.currentStage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`font-semibold ${
                        lead.daysInStage > 60
                          ? 'text-red-600'
                          : lead.daysInStage > 30
                          ? 'text-orange-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {lead.daysInStage} days
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {lead.lastActivity ? new Date(lead.lastActivity).toLocaleDateString() : 'None'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Generated: {new Date(data.generatedAt).toLocaleString()}
      </div>
    </div>
  )
}
