/**
 * DemoForm Component
 * Form for scheduling demos and recording outcomes
 */

import React, { useState, useEffect } from 'react'
import { useUpdateDemo, UpdateDemoInput, DemoDetails } from '../services/leadHooks'

export interface DemoFormProps {
  leadId: string
  initialData?: DemoDetails
  onSuccess?: () => void
}

export const DemoForm: React.FC<DemoFormProps> = ({ leadId, initialData, onSuccess }) => {
  const updateDemo = useUpdateDemo()

  const [formData, setFormData] = useState<UpdateDemoInput>({
    demoDate: initialData?.demoDate ? new Date(initialData.demoDate).toISOString().slice(0, 16) : '',
    demoType: initialData?.demoType || 'ONLINE',
    attendees: initialData?.attendees || '',
    demoOutcome: initialData?.demoOutcome || undefined,
    userCountEstimate: initialData?.userCountEstimate || undefined,
    followUpRequired: initialData?.followUpRequired || false,
    notes: initialData?.notes || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        demoDate: initialData.demoDate ? new Date(initialData.demoDate).toISOString().slice(0, 16) : '',
        demoType: initialData.demoType || 'ONLINE',
        attendees: initialData.attendees || '',
        demoOutcome: initialData.demoOutcome || undefined,
        userCountEstimate: initialData.userCountEstimate || undefined,
        followUpRequired: initialData.followUpRequired || false,
        notes: initialData.notes || '',
      })
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.demoDate) {
      newErrors.demoDate = 'Demo date and time is required'
    }

    if (formData.userCountEstimate !== undefined && formData.userCountEstimate <= 0) {
      newErrors.userCountEstimate = 'User count must be positive'
    }

    if (formData.attendees && formData.attendees.length > 500) {
      newErrors.attendees = 'Attendees must be 500 characters or less'
    }

    if (formData.notes && formData.notes.length > 2000) {
      newErrors.notes = 'Notes must be 2000 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Convert datetime-local to ISO string
    const demoDateISO = new Date(formData.demoDate).toISOString()

    const cleanedData: UpdateDemoInput = {
      demoDate: demoDateISO,
      demoType: formData.demoType,
      followUpRequired: formData.followUpRequired,
    }

    if (formData.attendees) cleanedData.attendees = formData.attendees
    if (formData.demoOutcome) cleanedData.demoOutcome = formData.demoOutcome
    if (formData.userCountEstimate !== undefined) cleanedData.userCountEstimate = formData.userCountEstimate
    if (formData.notes) cleanedData.notes = formData.notes

    updateDemo.mutate(
      { leadId, data: cleanedData },
      {
        onSuccess: () => {
          onSuccess?.()
        },
      }
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (name === 'userCountEstimate') {
      const numValue = value === '' ? undefined : Number(value)
      setFormData((prev) => ({ ...prev, [name]: numValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Check if demo date is in the past
  const isDemoPast = formData.demoDate ? new Date(formData.demoDate) < new Date() : false

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Demo Details</h3>
      <p className="text-sm text-gray-600 mb-6">
        Schedule a demo or record the outcome of a completed demo.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Demo Date and Time */}
        <div>
          <label htmlFor="demoDate" className="block text-sm font-medium text-gray-700 mb-1">
            Demo Date and Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="demoDate"
            name="demoDate"
            value={formData.demoDate}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.demoDate && <p className="mt-1 text-sm text-red-600">{errors.demoDate}</p>}
        </div>

        {/* Demo Type */}
        <div>
          <label htmlFor="demoType" className="block text-sm font-medium text-gray-700 mb-1">
            Demo Type <span className="text-red-500">*</span>
          </label>
          <select
            id="demoType"
            name="demoType"
            value={formData.demoType}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ONLINE">Online</option>
            <option value="IN_PERSON">In Person</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        {/* Attendees */}
        <div>
          <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-1">
            Attendees
          </label>
          <input
            type="text"
            id="attendees"
            name="attendees"
            value={formData.attendees}
            onChange={handleChange}
            placeholder="e.g., John Smith (CTO), Jane Doe (VP Operations)"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">List key attendees and their roles</p>
          {errors.attendees && <p className="mt-1 text-sm text-red-600">{errors.attendees}</p>}
        </div>

        {/* Demo Outcome - Only show if demo date is in the past */}
        {isDemoPast && (
          <div>
            <label htmlFor="demoOutcome" className="block text-sm font-medium text-gray-700 mb-1">
              Demo Outcome
            </label>
            <select
              id="demoOutcome"
              name="demoOutcome"
              value={formData.demoOutcome || ''}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select outcome...</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
              <option value="NO_SHOW">No Show</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Record the outcome after the demo completes</p>
          </div>
        )}

        {/* User Count Estimate */}
        <div>
          <label htmlFor="userCountEstimate" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated User Count
          </label>
          <input
            type="number"
            id="userCountEstimate"
            name="userCountEstimate"
            value={formData.userCountEstimate || ''}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 25"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">How many users will use the system?</p>
          {errors.userCountEstimate && <p className="mt-1 text-sm text-red-600">{errors.userCountEstimate}</p>}
        </div>

        {/* Follow-up Required */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="followUpRequired"
              name="followUpRequired"
              checked={formData.followUpRequired}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="followUpRequired" className="font-medium text-gray-700">
              Follow-up required
            </label>
            <p className="text-gray-500">Check if additional follow-up is needed after the demo</p>
          </div>
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
            rows={4}
            placeholder="Key points discussed, questions asked, action items..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={updateDemo.isPending}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateDemo.isPending ? (
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
              'Save Demo Details'
            )}
          </button>
        </div>

        {/* Error Message */}
        {updateDemo.isError && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">
              Failed to save demo details. Please try again.
            </p>
          </div>
        )}

        {/* Success Message */}
        {updateDemo.isSuccess && (
          <div className="rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-800">Demo details saved successfully!</p>
          </div>
        )}
      </form>
    </div>
  )
}

export default DemoForm
