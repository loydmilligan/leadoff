/**
 * Pipeline Page
 * Kanban-style pipeline visualization for sales process management
 */

import { useNavigate } from 'react-router-dom';
import { Stage } from '@leadoff/types';
import { useLeads, useUpdateLeadStage } from '../services/leadHooks';
import { PipelineBoard } from '../components/PipelineBoard';
import { StagePromptData } from '../components/StagePromptModal';

export function Pipeline() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useLeads();
  const updateStage = useUpdateLeadStage();

  const handleStageUpdate = async (
    leadId: string,
    newStage: Stage,
    promptData?: StagePromptData
  ) => {
    await updateStage.mutateAsync({
      id: leadId,
      stage: newStage,
      ...promptData,
    });
  };

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error loading pipeline</p>
          <p className="text-sm">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const leads = data?.leads || [];

  // Filter out closed leads from main pipeline view
  const activeLeads = leads.filter(
    (lead) =>
      lead.currentStage !== Stage.CLOSED_WON &&
      lead.currentStage !== Stage.CLOSED_LOST
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sales Pipeline
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {activeLeads.length} active lead
              {activeLeads.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="p-6">
        {activeLeads.length === 0 ? (
          <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">No active leads</p>
              <p className="text-sm">
                Create a new lead to get started with your pipeline
              </p>
            </div>
          </div>
        ) : (
          <PipelineBoard
            leads={activeLeads}
            onStageUpdate={handleStageUpdate}
            onLeadClick={handleLeadClick}
          />
        )}
      </div>
    </div>
  );
}
