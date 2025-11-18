import { useState } from 'react'
import { useArchivedLeads, useRestoreLead, useDeleteLead } from '../services/archiveHooks'

export function Archive() {
  const { data: leads, isLoading } = useArchivedLeads()
  const restoreLead = useRestoreLead()
  const deleteLead = useDeleteLead()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  if (isLoading) {
    return <div className="p-8">Loading archived leads...</div>
  }

  const handleRestore = async (leadId: string) => {
    await restoreLead.mutateAsync(leadId)
  }

  const handleDelete = async (leadId: string) => {
    if (deleteConfirmId === leadId) {
      await deleteLead.mutateAsync(leadId)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(leadId)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Archived Leads</h1>
        <p className="mt-2 text-gray-600">
          {leads?.length || 0} archived lead(s)
        </p>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No archived leads</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Archived Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead: any) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lead.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.contactName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.currentStage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.archivedAt
                      ? new Date(lead.archivedAt).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {lead.archiveReason || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRestore(lead.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      disabled={restoreLead.isPending}
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className={`${
                        deleteConfirmId === lead.id
                          ? 'text-red-800 font-bold'
                          : 'text-red-600 hover:text-red-900'
                      }`}
                      disabled={deleteLead.isPending}
                    >
                      {deleteConfirmId === lead.id ? 'Confirm Delete?' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
