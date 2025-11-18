import { useState } from 'react'
import { useCloseAsWon } from '../../services/leadActionHooks'

interface CloseAsWonModalProps {
  leadId: string
  companyName: string
  isOpen: boolean
  onClose: () => void
}

export function CloseAsWonModal({
  leadId,
  companyName,
  isOpen,
  onClose,
}: CloseAsWonModalProps) {
  const [notes, setNotes] = useState('')
  const closeAsWon = useCloseAsWon()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notes.trim()) return

    await closeAsWon.mutateAsync({ leadId, notes })
    onClose()
    setNotes('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Close as Won - {companyName}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (required)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="Describe how the deal was won..."
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <p className="text-sm text-blue-900">
              This will:
              <ul className="list-disc ml-5 mt-1">
                <li>Mark lead as CLOSED_WON</li>
                <li>Create handoff workflow next action (7 days)</li>
                <li>Log activity with your notes</li>
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
              disabled={!notes.trim() || closeAsWon.isPending}
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {closeAsWon.isPending ? 'Saving...' : 'Close as Won'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
