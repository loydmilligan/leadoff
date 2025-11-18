/**
 * PipelineColumn Component
 * Displays a single stage column in the kanban pipeline view
 * Uses @dnd-kit for drag-and-drop functionality
 */

import { useDroppable } from '@dnd-kit/core';
import { Stage } from '@leadoff/types';

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  estimatedValue?: number | null;
  currentStage: string;
  createdAt: string;
  nextFollowUpDate?: string | null;
}

interface PipelineColumnProps {
  stage: Stage;
  leads: Lead[];
  children: React.ReactNode;
}

// Stage display names
const STAGE_LABELS: Record<Stage, string> = {
  [Stage.INQUIRY]: 'Inquiry',
  [Stage.QUALIFICATION]: 'Qualification',
  [Stage.OPPORTUNITY]: 'Opportunity',
  [Stage.DEMO_SCHEDULED]: 'Demo Scheduled',
  [Stage.DEMO_COMPLETE]: 'Demo Complete',
  [Stage.PROPOSAL_SENT]: 'Proposal Sent',
  [Stage.NEGOTIATION]: 'Negotiation',
  [Stage.CLOSED_WON]: 'Closed Won',
  [Stage.CLOSED_LOST]: 'Closed Lost',
};

// Stage color schemes
const STAGE_COLORS: Record<Stage, string> = {
  [Stage.INQUIRY]: 'bg-gray-100 border-gray-300',
  [Stage.QUALIFICATION]: 'bg-blue-50 border-blue-300',
  [Stage.OPPORTUNITY]: 'bg-indigo-50 border-indigo-300',
  [Stage.DEMO_SCHEDULED]: 'bg-purple-50 border-purple-300',
  [Stage.DEMO_COMPLETE]: 'bg-violet-50 border-violet-300',
  [Stage.PROPOSAL_SENT]: 'bg-yellow-50 border-yellow-300',
  [Stage.NEGOTIATION]: 'bg-orange-50 border-orange-300',
  [Stage.CLOSED_WON]: 'bg-green-50 border-green-300',
  [Stage.CLOSED_LOST]: 'bg-red-50 border-red-300',
};

// Header badge colors
const STAGE_BADGE_COLORS: Record<Stage, string> = {
  [Stage.INQUIRY]: 'bg-gray-200 text-gray-800',
  [Stage.QUALIFICATION]: 'bg-blue-200 text-blue-800',
  [Stage.OPPORTUNITY]: 'bg-indigo-200 text-indigo-800',
  [Stage.DEMO_SCHEDULED]: 'bg-purple-200 text-purple-800',
  [Stage.DEMO_COMPLETE]: 'bg-violet-200 text-violet-800',
  [Stage.PROPOSAL_SENT]: 'bg-yellow-200 text-yellow-800',
  [Stage.NEGOTIATION]: 'bg-orange-200 text-orange-800',
  [Stage.CLOSED_WON]: 'bg-green-200 text-green-800',
  [Stage.CLOSED_LOST]: 'bg-red-200 text-red-800',
};

export function PipelineColumn({ stage, leads, children }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  // Calculate total estimated value for this column
  const totalValue = leads.reduce((sum, lead) => {
    return sum + (lead.estimatedValue || 0);
  }, 0);

  const formattedValue =
    totalValue > 0
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(totalValue)
      : null;

  const columnColorClass = STAGE_COLORS[stage];
  const badgeColorClass = STAGE_BADGE_COLORS[stage];

  return (
    <div
      className={`flex flex-col min-w-[280px] max-w-[320px] rounded-lg border-2 ${columnColorClass} ${
        isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-gray-300">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm">
            {STAGE_LABELS[stage]}
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColorClass}`}
          >
            {leads.length}
          </span>
        </div>
        {formattedValue && (
          <div className="text-xs text-gray-600 font-medium">
            {formattedValue}
          </div>
        )}
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]"
      >
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            No leads
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
