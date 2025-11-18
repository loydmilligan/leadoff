/**
 * ProposalForm Component
 * Form for creating and managing proposals with currency formatting
 */

import React, { useState, useEffect } from 'react'
import { useUpdateProposal, UpdateProposalInput, Proposal } from '../services/leadHooks'

export interface ProposalFormProps {
  leadId: string
  initialData?: Proposal
  onSuccess?: () => void
}

interface ProposalFormData {
  proposalDate: string
  estimatedValue: number
  products: string
  contractTerm: string
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  notes: string
}

export const ProposalForm: React.FC<ProposalFormProps> = ({ leadId, initialData, onSuccess }) => {
  const updateProposal = useUpdateProposal()

  const [formData, setFormData] = useState<ProposalFormData>({
    proposalDate: (initialData ? new Date(initialData.proposalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) as string,
    estimatedValue: initialData?.estimatedValue || 0,
    products: (initialData?.products || '') as string,
    contractTerm: (initialData?.contractTerm || '') as string,
    status: initialData?.status || 'DRAFT',
    notes: (initialData?.notes || '') as string,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        proposalDate: new Date(initialData.proposalDate).toISOString().split('T')[0] as string,
        estimatedValue: initialData.estimatedValue,
        products: (initialData.products || '') as string,
        contractTerm: (initialData.contractTerm || '') as string,
        status: initialData.status,
        notes: (initialData.notes || '') as string,
      })
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.proposalDate) {
      newErrors.proposalDate = 'Proposal date is required'
    } else {
      const proposalDate = new Date(formData.proposalDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (proposalDate > today) {
        newErrors.proposalDate = 'Proposal date cannot be in the future'
      }
    }

    if (!formData.estimatedValue || formData.estimatedValue <= 0) {
      newErrors.estimatedValue = 'Estimated value is required and must be positive'
    }

    if (formData.products && formData.products.length > 1000) {
      newErrors.products = 'Products must be 1000 characters or less'
    }

    if (formData.contractTerm && formData.contractTerm.length > 200) {
      newErrors.contractTerm = 'Contract term must be 200 characters or less'
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

    const cleanedData: UpdateProposalInput = {
      proposalDate: new Date(formData.proposalDate).toISOString(),
      estimatedValue: formData.estimatedValue,
      status: formData.status,
    }

    if (formData.products) cleanedData.products = formData.products
    if (formData.contractTerm) cleanedData.contractTerm = formData.contractTerm
    if (formData.notes) cleanedData.notes = formData.notes

    updateProposal.mutate(
      { leadId, data: cleanedData },
      {
        onSuccess: () => {
          onSuccess?.()
        },
      }
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'estimatedValue') {
      const numValue = value === '' ? 0 : Number(value)
      setFormData((prev) => ({ ...prev, [name]: numValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Proposal Information</h3>
      <p className="text-sm text-gray-600 mb-6">
        Create and track proposals with estimated deal value and status.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Proposal Date */}
        <div>
          <label htmlFor="proposalDate" className="block text-sm font-medium text-gray-700 mb-1">
            Proposal Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="proposalDate"
            name="proposalDate"
            value={formData.proposalDate}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Cannot be in the future</p>
          {errors.proposalDate && <p className="mt-1 text-sm text-red-600">{errors.proposalDate}</p>}
        </div>

        {/* Estimated Value */}
        <div>
          <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Value <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="estimatedValue"
              name="estimatedValue"
              value={formData.estimatedValue}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {formData.estimatedValue > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Formatted: {formatCurrency(formData.estimatedValue)}
            </p>
          )}
          {errors.estimatedValue && <p className="mt-1 text-sm text-red-600">{errors.estimatedValue}</p>}
        </div>

        {/* Products */}
        <div>
          <label htmlFor="products" className="block text-sm font-medium text-gray-700 mb-1">
            Products/Services
          </label>
          <textarea
            id="products"
            name="products"
            value={formData.products}
            onChange={handleChange}
            rows={3}
            placeholder="List the products or services included in this proposal..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.products && <p className="mt-1 text-sm text-red-600">{errors.products}</p>}
        </div>

        {/* Contract Term */}
        <div>
          <label htmlFor="contractTerm" className="block text-sm font-medium text-gray-700 mb-1">
            Contract Term
          </label>
          <input
            type="text"
            id="contractTerm"
            name="contractTerm"
            value={formData.contractTerm}
            onChange={handleChange}
            placeholder="e.g., 12 months, 3 years, Monthly subscription"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.contractTerm && <p className="mt-1 text-sm text-red-600">{errors.contractTerm}</p>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="VIEWED">Viewed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>
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
            placeholder="Internal notes about this proposal..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={updateProposal.isPending}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProposal.isPending ? (
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
              'Save Proposal'
            )}
          </button>
        </div>

        {/* Error Message */}
        {updateProposal.isError && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">
              Failed to save proposal. Please try again.
            </p>
          </div>
        )}

        {/* Success Message */}
        {updateProposal.isSuccess && (
          <div className="rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-800">Proposal saved successfully!</p>
          </div>
        )}
      </form>
    </div>
  )
}

export default ProposalForm
