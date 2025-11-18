/**
 * LeadForm Component
 * Quick lead entry form with validation
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateLead, CreateLeadInput } from '../services/leadHooks'

const leadSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(200),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters').max(100),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email format'),
  contactTitle: z.string().optional(),
  companyDescription: z.string().optional(),
})

type LeadFormData = z.infer<typeof leadSchema>

interface LeadFormProps {
  onSuccess?: () => void
}

export function LeadForm({ onSuccess }: LeadFormProps) {
  const createLead = useCreateLead()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  })

  const onSubmit = async (data: LeadFormData) => {
    try {
      await createLead.mutateAsync(data as CreateLeadInput)
      reset()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create lead:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900">Quick Lead Entry</h2>

      {/* Company Name */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
          Company Name *
        </label>
        <input
          {...register('companyName')}
          id="companyName"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Acme Corp"
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
        )}
      </div>

      {/* Contact Name */}
      <div>
        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
          Contact Name *
        </label>
        <input
          {...register('contactName')}
          id="contactName"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="John Doe"
        />
        {errors.contactName && (
          <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>
        )}
      </div>

      {/* Contact Title */}
      <div>
        <label htmlFor="contactTitle" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          {...register('contactTitle')}
          id="contactTitle"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="CEO"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email *
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="john@acme.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone *
        </label>
        <input
          {...register('phone')}
          id="phone"
          type="tel"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="555-1234"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      {/* Company Description */}
      <div>
        <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          {...register('companyDescription')}
          id="companyDescription"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Quick notes about this lead..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || createLead.isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting || createLead.isPending ? 'Creating...' : 'Create Lead'}
      </button>

      {createLead.isError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Failed to create lead. Please try again.
          </p>
        </div>
      )}

      {createLead.isSuccess && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">Lead created successfully!</p>
        </div>
      )}
    </form>
  )
}

export default LeadForm
