/**
 * StageSelect Component
 * Dropdown for updating lead stage with optimistic updates
 */

import { Stage } from '@leadoff/types'
import { useUpdateLeadStage } from '../services/leadHooks'

interface StageSelectProps {
  leadId: string
  currentStage: Stage
  onSuccess?: () => void
}

const STAGES = [
  { value: Stage.INQUIRY, label: 'Inquiry' },
  { value: Stage.QUALIFICATION, label: 'Qualification' },
  { value: Stage.OPPORTUNITY, label: 'Opportunity' },
  { value: Stage.DEMO_SCHEDULED, label: 'Demo Scheduled' },
  { value: Stage.DEMO_COMPLETE, label: 'Demo Complete' },
  { value: Stage.PROPOSAL_SENT, label: 'Proposal Sent' },
  { value: Stage.NEGOTIATION, label: 'Negotiation' },
  { value: Stage.CLOSED_WON, label: 'Closed Won' },
  { value: Stage.CLOSED_LOST, label: 'Closed Lost' },
]

export function StageSelect({ leadId, currentStage, onSuccess }: StageSelectProps) {
  const updateStage = useUpdateLeadStage()

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = event.target.value as Stage
    try {
      await updateStage.mutateAsync({ id: leadId, stage: newStage })
      onSuccess?.()
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  return (
    <div className="relative">
      <select
        value={currentStage}
        onChange={handleChange}
        disabled={updateStage.isPending}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {STAGES.map((stage) => (
          <option key={stage.value} value={stage.value}>
            {stage.label}
          </option>
        ))}
      </select>
      {updateStage.isPending && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
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
        </div>
      )}
    </div>
  )
}

export default StageSelect
