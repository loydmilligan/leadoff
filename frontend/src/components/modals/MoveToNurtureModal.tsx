import { useState } from 'react'
import { useMoveToNurture } from '../../services/leadActionHooks'

interface MoveToNurtureModalProps {
  leadId: string
  companyName: string
  isOpen: boolean
  onClose: () => void
}

export function MoveToNurtureModal({
  leadId,
  companyName,
  isOpen,
  onClose,
}: MoveToNurtureModalProps) {
  const [nurturePeriod, setNurturePeriod] = useState<30 | 90>(30)
  const [notes, setNotes] = useState('')
  const moveToNurture = useMoveToNurture()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notes.trim()) return

    await moveToNurture.mutateAsync({
      leadId,
      nurturePeriod,
      notes,
    })
    onClose()
    setNurturePeriod(30)
    setNotes('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          Move to Nurture - {companyName}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-up Period
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={30}
                  checked={nurturePeriod === 30}
                  onChange={() => setNurturePeriod(30)}
                  className="mr-2"
                />
                <span>30 days (short nurture)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={90}
                  checked={nurturePeriod === 90}
                  onChange={() => setNurturePeriod(90)}
                  className="mr-2"
                />
                <span>90 days (long nurture)</span>
              </label>
            </div>
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
              placeholder="Why are we nurturing this lead? What should we focus on when we follow up?"
              required
            />
          </div>

          <div className="bg-purple-50 p-3 rounded-md mb-4">
            <p className="text-sm text-purple-900">
              This will:
              <ul className="list-disc ml-5 mt-1">
                <li>
                  Move lead to NURTURE_{nurturePeriod}_DAY stage
                </li>
                <li>Set follow-up date for {nurturePeriod} days from now</li>
                <li>Remove from active pipeline</li>
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
              disabled={!notes.trim() || moveToNurture.isPending}
              className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {moveToNurture.isPending ? 'Saving...' : 'Move to Nurture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
