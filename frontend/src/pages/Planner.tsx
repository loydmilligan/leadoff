import { Link } from 'react-router-dom'
import { usePlannerData } from '../services/plannerHooks'

export function Planner() {
  const { data, isLoading } = usePlannerData()

  if (isLoading) {
    return <div className="p-8">Loading planner...</div>
  }

  const { overdue, today, thisWeek, noDate } = data || {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Planner</h1>
        <p className="mt-2 text-gray-600">Your upcoming actions and follow-ups</p>
      </div>

      {/* Overdue Section */}
      {overdue && overdue.length > 0 && (
        <div className="mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-2">
            <h2 className="text-lg font-semibold text-red-900">
              Overdue ({overdue.length})
            </h2>
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {overdue.map((lead: any) => (
              <PlannerLeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      )}

      {/* Today Section */}
      <div className="mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-2">
          <h2 className="text-lg font-semibold text-blue-900">
            Today ({today?.length || 0})
          </h2>
        </div>
        {today && today.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {today.map((lead: any) => (
              <PlannerLeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">
            No actions due today
          </div>
        )}
      </div>

      {/* This Week Section */}
      <div className="mb-6">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-2">
          <h2 className="text-lg font-semibold text-green-900">
            This Week ({thisWeek?.length || 0})
          </h2>
        </div>
        {thisWeek && thisWeek.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {thisWeek.map((lead: any) => (
              <PlannerLeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">
            No actions this week
          </div>
        )}
      </div>

      {/* No Date Set Section */}
      {noDate && noDate.length > 0 && (
        <div className="mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-2">
            <h2 className="text-lg font-semibold text-yellow-900">
              No Date Set - Needs Attention ({noDate.length})
            </h2>
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {noDate.map((lead: any) => (
              <PlannerLeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlannerLeadRow({ lead }: { lead: any }) {
  return (
    <Link
      to={`/leads/${lead.id}`}
      className="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-900">{lead.companyName}</p>
          <p className="text-sm text-gray-600">{lead.contactName}</p>
          {lead.nextActionDescription && (
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">{lead.nextActionType}:</span>{' '}
              {lead.nextActionDescription}
            </p>
          )}
        </div>
        <div className="text-right">
          {lead.nextActionDueDate && (
            <p className="text-sm text-gray-600">
              {new Date(lead.nextActionDueDate).toLocaleDateString()}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{lead.currentStage}</p>
        </div>
      </div>
    </Link>
  )
}
