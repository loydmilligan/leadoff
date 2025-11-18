/**
 * ActivityLogForm Component
 * Form for logging activities and updating follow-up dates
 */

import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { leadKeys } from '../services/leadHooks'

export interface ActivityLogFormProps {
  leadId: string
  onSuccess?: () => void
}

interface ActivityInput {
  type: string
  subject: string
  notes?: string
  dueDate?: string
}

const ACTIVITY_TYPES = [
  { value: 'CALL', label: 'Phone Call' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'NOTE', label: 'Note' },
  { value: 'TASK', label: 'Task' },
]

export const ActivityLogForm: React.FC<ActivityLogFormProps> = ({ leadId, onSuccess }) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<ActivityInput>({
    type: 'NOTE',
    subject: '',
    notes: '',
    dueDate: '',
  })

  const createActivityMutation = useMutation({
    mutationFn: (data: ActivityInput) => api.post(`/leads/${leadId}/activities`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(leadId) })
      queryClient.invalidateQueries({ queryKey: leadKeys.followUps() })
      setFormData({ type: 'NOTE', subject: '', notes: '', dueDate: '' })
      onSuccess?.()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject.trim()) {
      return
    }

    createActivityMutation.mutate(formData)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Log Activity</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Activity Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Activity Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {ACTIVITY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="Brief description of activity"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Additional details..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Next Follow-up Date */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Next Follow-up Date (optional)
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            If set, this will update the lead's follow-up date
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={createActivityMutation.isPending || !formData.subject.trim()}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createActivityMutation.isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Saving...
              </>
            ) : (
              'Log Activity'
            )}
          </button>
        </div>

        {/* Error Message */}
        {createActivityMutation.isError && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">
              Failed to log activity. Please try again.
            </p>
          </div>
        )}

        {/* Success Message */}
        {createActivityMutation.isSuccess && (
          <div className="rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-800">Activity logged successfully!</p>
          </div>
        )}
      </form>
    </div>
  )
}

export default ActivityLogForm
