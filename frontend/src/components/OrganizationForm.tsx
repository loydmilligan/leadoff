/**
 * OrganizationForm Component
 * Form for capturing organization details and stakeholder information
 */

import React, { useState, useEffect } from 'react'
import { useUpdateOrganization, UpdateOrganizationInput, OrganizationInfo } from '../services/leadHooks'

export interface OrganizationFormProps {
  leadId: string
  initialData?: OrganizationInfo
  onSuccess?: () => void
}

export const OrganizationForm: React.FC<OrganizationFormProps> = ({ leadId, initialData, onSuccess }) => {
  const updateOrganization = useUpdateOrganization()

  const [formData, setFormData] = useState<UpdateOrganizationInput>({
    industry: initialData?.industry || '',
    employeeCount: initialData?.employeeCount || undefined,
    annualRevenue: initialData?.annualRevenue || undefined,
    decisionMaker: initialData?.decisionMaker || '',
    decisionMakerRole: initialData?.decisionMakerRole || '',
    currentSolution: initialData?.currentSolution || '',
    painPoints: initialData?.painPoints || '',
    budget: initialData?.budget || undefined,
    timeline: initialData?.timeline || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        industry: initialData.industry || '',
        employeeCount: initialData.employeeCount || undefined,
        annualRevenue: initialData.annualRevenue || undefined,
        decisionMaker: initialData.decisionMaker || '',
        decisionMakerRole: initialData.decisionMakerRole || '',
        currentSolution: initialData.currentSolution || '',
        painPoints: initialData.painPoints || '',
        budget: initialData.budget || undefined,
        timeline: initialData.timeline || '',
      })
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Industry is recommended but not required
    if (formData.industry && formData.industry.length > 200) {
      newErrors.industry = 'Industry must be 200 characters or less'
    }

    if (formData.employeeCount !== undefined && formData.employeeCount <= 0) {
      newErrors.employeeCount = 'Employee count must be positive'
    }

    if (formData.annualRevenue !== undefined && formData.annualRevenue <= 0) {
      newErrors.annualRevenue = 'Annual revenue must be positive'
    }

    if (formData.budget !== undefined && formData.budget <= 0) {
      newErrors.budget = 'Budget must be positive'
    }

    if (formData.decisionMaker && formData.decisionMaker.length > 200) {
      newErrors.decisionMaker = 'Decision maker name must be 200 characters or less'
    }

    if (formData.decisionMakerRole && formData.decisionMakerRole.length > 200) {
      newErrors.decisionMakerRole = 'Decision maker role must be 200 characters or less'
    }

    if (formData.currentSolution && formData.currentSolution.length > 1000) {
      newErrors.currentSolution = 'Current solution must be 1000 characters or less'
    }

    if (formData.painPoints && formData.painPoints.length > 2000) {
      newErrors.painPoints = 'Pain points must be 2000 characters or less'
    }

    if (formData.timeline && formData.timeline.length > 200) {
      newErrors.timeline = 'Timeline must be 200 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Filter out empty strings and undefined values
    const cleanedData: UpdateOrganizationInput = {}

    if (formData.industry) cleanedData.industry = formData.industry
    if (formData.employeeCount !== undefined) cleanedData.employeeCount = formData.employeeCount
    if (formData.annualRevenue !== undefined) cleanedData.annualRevenue = formData.annualRevenue
    if (formData.decisionMaker) cleanedData.decisionMaker = formData.decisionMaker
    if (formData.decisionMakerRole) cleanedData.decisionMakerRole = formData.decisionMakerRole
    if (formData.currentSolution) cleanedData.currentSolution = formData.currentSolution
    if (formData.painPoints) cleanedData.painPoints = formData.painPoints
    if (formData.budget !== undefined) cleanedData.budget = formData.budget
    if (formData.timeline) cleanedData.timeline = formData.timeline

    updateOrganization.mutate(
      { leadId, data: cleanedData },
      {
        onSuccess: () => {
          onSuccess?.()
        },
      }
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'employeeCount' || name === 'annualRevenue' || name === 'budget') {
      const numValue = value === '' ? undefined : Number(value)
      setFormData((prev) => ({ ...prev, [name]: numValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Organization Information</h3>
      <p className="text-sm text-gray-600 mb-6">
        Capture details about the organization to better qualify this opportunity.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="e.g., Healthcare, Manufacturing, Retail"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
        </div>

        {/* Employee Count */}
        <div>
          <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 mb-1">
            Employee Count
          </label>
          <input
            type="number"
            id="employeeCount"
            name="employeeCount"
            value={formData.employeeCount || ''}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 50"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.employeeCount && <p className="mt-1 text-sm text-red-600">{errors.employeeCount}</p>}
        </div>

        {/* Annual Revenue */}
        <div>
          <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700 mb-1">
            Annual Revenue ($)
          </label>
          <input
            type="number"
            id="annualRevenue"
            name="annualRevenue"
            value={formData.annualRevenue || ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="e.g., 5000000"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.annualRevenue && <p className="mt-1 text-sm text-red-600">{errors.annualRevenue}</p>}
        </div>

        {/* Decision Maker */}
        <div>
          <label htmlFor="decisionMaker" className="block text-sm font-medium text-gray-700 mb-1">
            Decision Maker
          </label>
          <input
            type="text"
            id="decisionMaker"
            name="decisionMaker"
            value={formData.decisionMaker}
            onChange={handleChange}
            placeholder="e.g., John Smith"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.decisionMaker && <p className="mt-1 text-sm text-red-600">{errors.decisionMaker}</p>}
        </div>

        {/* Decision Maker Role */}
        <div>
          <label htmlFor="decisionMakerRole" className="block text-sm font-medium text-gray-700 mb-1">
            Decision Maker Role
          </label>
          <input
            type="text"
            id="decisionMakerRole"
            name="decisionMakerRole"
            value={formData.decisionMakerRole}
            onChange={handleChange}
            placeholder="e.g., VP of Operations"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.decisionMakerRole && <p className="mt-1 text-sm text-red-600">{errors.decisionMakerRole}</p>}
        </div>

        {/* Current Solution */}
        <div>
          <label htmlFor="currentSolution" className="block text-sm font-medium text-gray-700 mb-1">
            Current Solution
          </label>
          <textarea
            id="currentSolution"
            name="currentSolution"
            value={formData.currentSolution}
            onChange={handleChange}
            rows={3}
            placeholder="What are they currently using?"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.currentSolution && <p className="mt-1 text-sm text-red-600">{errors.currentSolution}</p>}
        </div>

        {/* Pain Points */}
        <div>
          <label htmlFor="painPoints" className="block text-sm font-medium text-gray-700 mb-1">
            Pain Points
          </label>
          <textarea
            id="painPoints"
            name="painPoints"
            value={formData.painPoints}
            onChange={handleChange}
            rows={3}
            placeholder="What problems are they experiencing?"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.painPoints && <p className="mt-1 text-sm text-red-600">{errors.painPoints}</p>}
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
            Budget ($)
          </label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget || ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="e.g., 50000"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
        </div>

        {/* Timeline */}
        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
            Decision Timeline
          </label>
          <input
            type="text"
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            placeholder="e.g., Q1 2025"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.timeline && <p className="mt-1 text-sm text-red-600">{errors.timeline}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={updateOrganization.isPending}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateOrganization.isPending ? (
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
              'Save Organization Info'
            )}
          </button>
        </div>

        {/* Error Message */}
        {updateOrganization.isError && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">
              Failed to save organization information. Please try again.
            </p>
          </div>
        )}

        {/* Success Message */}
        {updateOrganization.isSuccess && (
          <div className="rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-800">Organization information saved successfully!</p>
          </div>
        )}
      </form>
    </div>
  )
}

export default OrganizationForm
