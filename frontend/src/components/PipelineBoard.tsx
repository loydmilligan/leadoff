/**
 * PipelineBoard Component
 * Kanban-style pipeline visualization with drag-and-drop
 * Shows all active stages (excludes CLOSED_WON and CLOSED_LOST)
 */

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Stage } from '@leadoff/types';
import { PipelineColumn } from './PipelineColumn';
import { DraggableLeadCard } from './DraggableLeadCard';
import {
  StagePromptModal,
  StagePromptData,
} from './StagePromptModal';
import { useQueryClient } from '@tanstack/react-query';

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  estimatedValue?: number | null;
  currentStage: string;
  createdAt: string;
  nextFollowUpDate?: string | null;
}

interface PipelineBoardProps {
  leads: Lead[];
  onStageUpdate: (
    leadId: string,
    newStage: Stage,
    data?: StagePromptData
  ) => Promise<void>;
  onLeadClick?: (leadId: string) => void;
}

// Active stages (exclude closed stages from kanban view)
const ACTIVE_STAGES: Stage[] = [
  Stage.INQUIRY,
  Stage.QUALIFICATION,
  Stage.OPPORTUNITY,
  Stage.DEMO_SCHEDULED,
  Stage.DEMO_COMPLETE,
  Stage.PROPOSAL_SENT,
  Stage.NEGOTIATION,
];

export function PipelineBoard({
  leads,
  onStageUpdate,
  onLeadClick,
}: PipelineBoardProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    leadId: string;
    newStage: Stage;
    lead: Lead;
  } | null>(null);

  const queryClient = useQueryClient();

  // Configure pointer sensor for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // Get currently dragged lead
  const activeLead = activeDragId
    ? leads.find((lead) => lead.id === activeDragId)
    : null;

  // Group leads by stage
  const leadsByStage: Record<string, Lead[]> = {};
  ACTIVE_STAGES.forEach((stage) => {
    leadsByStage[stage] = leads.filter((lead) => lead.currentStage === stage);
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as Stage;
    const lead = leads.find((l) => l.id === leadId);

    if (!lead) return;

    // Don't update if dropped on same stage
    if (lead.currentStage === newStage) return;

    // Check if prompt is needed for this stage
    if (newStage === Stage.DEMO_SCHEDULED || newStage === Stage.CLOSED_LOST) {
      setPendingUpdate({ leadId, newStage, lead });
      setShowPrompt(true);
    } else {
      // No prompt needed, update immediately
      handleStageUpdate(leadId, newStage);
    }
  };

  const handleStageUpdate = async (
    leadId: string,
    newStage: Stage,
    data?: StagePromptData
  ) => {
    try {
      // Optimistic update
      queryClient.setQueryData(['leads'], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          leads: oldData.leads.map((lead: Lead) =>
            lead.id === leadId ? { ...lead, currentStage: newStage } : lead
          ),
        };
      });

      await onStageUpdate(leadId, newStage, data);
    } catch (error) {
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      console.error('Failed to update stage:', error);
      alert('Failed to update stage. Please try again.');
    }
  };

  const handlePromptConfirm = async (data: StagePromptData) => {
    if (!pendingUpdate) return;

    setShowPrompt(false);
    await handleStageUpdate(pendingUpdate.leadId, pendingUpdate.newStage, data);
    setPendingUpdate(null);
  };

  const handlePromptCancel = () => {
    setShowPrompt(false);
    setPendingUpdate(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ACTIVE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              leads={leadsByStage[stage] || []}
            >
              {leadsByStage[stage]?.map((lead) => (
                <DraggableLeadCard
                  key={lead.id}
                  lead={lead}
                  onClick={onLeadClick ? () => onLeadClick(lead.id) : undefined}
                />
              ))}
            </PipelineColumn>
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="cursor-grabbing">
              <DraggableLeadCard lead={activeLead} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Stage-specific prompt modal */}
      {showPrompt && pendingUpdate && (
        <StagePromptModal
          stage={pendingUpdate.newStage}
          leadName={pendingUpdate.lead.companyName}
          onConfirm={handlePromptConfirm}
          onCancel={handlePromptCancel}
        />
      )}
    </>
  );
}
