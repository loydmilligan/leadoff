/**
 * StagePromptModal Component
 * Stage-specific modals for capturing required data during stage transitions
 * - DEMO_SCHEDULED: Prompt for demo date
 * - CLOSED_LOST: Prompt for lost reason
 */

import { useState } from 'react';
import { Stage, LostReasonCategory } from '@leadoff/types';

interface StagePromptModalProps {
  stage: Stage;
  leadName: string;
  onConfirm: (data: StagePromptData) => void;
  onCancel: () => void;
}

export interface StagePromptData {
  demoDate?: Date;
  lostReason?: LostReasonCategory;
  competitorName?: string;
  lostReasonNotes?: string;
}

const LOST_REASON_LABELS: Record<LostReasonCategory, string> = {
  [LostReasonCategory.PRICE]: 'Price too high',
  [LostReasonCategory.COMPETITOR]: 'Chose competitor',
  [LostReasonCategory.NO_RESPONSE]: 'No response from prospect',
  [LostReasonCategory.NOT_QUALIFIED]: 'Not qualified',
  [LostReasonCategory.TIMING]: 'Timing not right',
  [LostReasonCategory.OTHER]: 'Other reason',
};

export function StagePromptModal({
  stage,
  leadName,
  onConfirm,
  onCancel,
}: StagePromptModalProps) {
  const [demoDate, setDemoDate] = useState('');
  const [lostReason, setLostReason] = useState<LostReasonCategory | ''>('');
  const [competitorName, setCompetitorName] = useState('');
  const [lostReasonNotes, setLostReasonNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: StagePromptData = {};

    if (stage === Stage.DEMO_SCHEDULED && demoDate) {
      data.demoDate = new Date(demoDate);
    }

    if (stage === Stage.CLOSED_LOST && lostReason) {
      data.lostReason = lostReason;
      if (competitorName) data.competitorName = competitorName;
      if (lostReasonNotes) data.lostReasonNotes = lostReasonNotes;
    }

    onConfirm(data);
  };

  const isValid = () => {
    if (stage === Stage.DEMO_SCHEDULED) {
      return demoDate !== '';
    }
    if (stage === Stage.CLOSED_LOST) {
      if (lostReason === '') return false;
      if (lostReason === LostReasonCategory.COMPETITOR && !competitorName)
        return false;
      return true;
    }
    return true;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {stage === Stage.DEMO_SCHEDULED && 'Schedule Demo'}
            {stage === Stage.CLOSED_LOST && 'Close as Lost'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">{leadName}</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Demo Scheduled: Date Picker */}
          {stage === Stage.DEMO_SCHEDULED && (
            <div>
              <label
                htmlFor="demoDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Demo Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="demoDate"
                value={demoDate}
                onChange={(e) => setDemoDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Closed Lost: Reason Selection */}
          {stage === Stage.CLOSED_LOST && (
            <>
              <div>
                <label
                  htmlFor="lostReason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Lost Reason <span className="text-red-500">*</span>
                </label>
                <select
                  id="lostReason"
                  value={lostReason}
                  onChange={(e) =>
                    setLostReason(e.target.value as LostReasonCategory)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select reason...</option>
                  {Object.entries(LOST_REASON_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Competitor Name (shown if COMPETITOR selected) */}
              {lostReason === LostReasonCategory.COMPETITOR && (
                <div>
                  <label
                    htmlFor="competitorName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Competitor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="competitorName"
                    value={competitorName}
                    onChange={(e) => setCompetitorName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter competitor name"
                    required
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label
                  htmlFor="lostReasonNotes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes (optional)
                </label>
                <textarea
                  id="lostReasonNotes"
                  value={lostReasonNotes}
                  onChange={(e) => setLostReasonNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional details..."
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
