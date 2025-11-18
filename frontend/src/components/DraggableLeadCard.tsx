/**
 * DraggableLeadCard Component
 * A draggable lead card for kanban pipeline
 * Uses @dnd-kit for drag-and-drop functionality
 */

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  estimatedValue?: number | null;
  currentStage: string;
  createdAt: string;
  nextFollowUpDate?: string | null;
}

interface DraggableLeadCardProps {
  lead: Lead;
  onClick?: () => void;
}

export function DraggableLeadCard({ lead, onClick }: DraggableLeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: lead.id,
      data: {
        lead,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  // Calculate days in current stage
  const createdDate = new Date(lead.createdAt);
  const now = new Date();
  const daysInStage = Math.floor(
    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Format estimated value
  const formattedValue = lead.estimatedValue
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(lead.estimatedValue)
    : null;

  // Calculate follow-up status
  const followUpDate = lead.nextFollowUpDate
    ? new Date(lead.nextFollowUpDate)
    : null;
  let followUpStatus = '';
  let followUpColor = '';

  if (followUpDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUpDay = new Date(followUpDate);
    followUpDay.setHours(0, 0, 0, 0);

    if (followUpDay < today) {
      const daysOverdue = Math.floor(
        (today.getTime() - followUpDay.getTime()) / (1000 * 60 * 60 * 24)
      );
      followUpStatus = `Overdue ${daysOverdue}d`;
      followUpColor = 'text-red-600 bg-red-50';
    } else if (followUpDay.getTime() === today.getTime()) {
      followUpStatus = 'Due Today';
      followUpColor = 'text-yellow-600 bg-yellow-50';
    } else {
      followUpStatus = formatDistanceToNow(followUpDate, { addSuffix: true });
      followUpColor = 'text-green-600 bg-green-50';
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-move ${
        isDragging ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing"
      >
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900 truncate">
            {lead.companyName}
          </h4>
          <p className="text-xs text-gray-600 truncate">{lead.contactName}</p>
        </div>
        <svg
          className="w-5 h-5 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      {/* Card Details */}
      <div className="space-y-1">
        {formattedValue && (
          <div className="text-sm font-medium text-gray-900">
            {formattedValue}
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">{daysInStage}d in stage</span>
          {followUpStatus && (
            <span
              className={`px-2 py-1 rounded-full font-medium ${followUpColor}`}
            >
              {followUpStatus}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
