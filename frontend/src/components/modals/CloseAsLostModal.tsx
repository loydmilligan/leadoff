import { useState } from 'react'
import { useCloseAsLost } from '../../services/leadActionHooks'
import { LostReasonCategory } from '@leadoff/types'

interface CloseAsLostModalProps {
  leadId: string
  companyName: string
  isOpen: boolean
  onClose: () => void
}

export function CloseAsLostModal({
  leadId,
  companyName,
  isOpen,
  onClose,
}: CloseAsLostModalProps) {
  const [competitorName, setCompetitorName] = useState('')
  const [reason, setReason] = useState<string>(LostReasonCategory.PRICE)
  const [notes, setNotes] = useState('')
  const closeAsLost = useCloseAsLost()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!competitorName.trim() || !notes.trim()) return

    await closeAsLost.mutateAsync({
      leadId,
      competitorName,
      reason,
      notes,
    })
    onClose()
    setCompetitorName('')
    setReason(LostReasonCategory.PRICE)
    setNotes('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Close as Lost - {companyName}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competitor (or "Unknown")
            </label>
            <input
              type="text"
              value={competitorName}
              onChange={(e) => setCompetitorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Who did they choose?"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={LostReasonCategory.PRICE}>Price</option>
              <option value={LostReasonCategory.COMPETITOR}>
                Competitor Features
              </option>
              <option value={LostReasonCategory.NO_RESPONSE}>No Response</option>
              <option value={LostReasonCategory.NOT_QUALIFIED}>
                Not Qualified
              </option>
              <option value={LostReasonCategory.TIMING}>Timing</option>
              <option value={LostReasonCategory.OTHER}>Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (required)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="What was their specific reasoning? Any other context?"
              required
            />
          </div>

          <div className="bg-yellow-50 p-3 rounded-md mb-4">
            <p className="text-sm text-yellow-900">
              This will:
              <ul className="list-disc ml-5 mt-1">
                <li>Mark lead as CLOSED_LOST</li>
                <li>Set 6-month follow-up reminder</li>
                <li>Log activity with loss details</li>
              </ul>
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !competitorName.trim() ||
                !notes.trim() ||
                closeAsLost.isPending
              }
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {closeAsLost.isPending ? 'Saving...' : 'Close as Lost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
