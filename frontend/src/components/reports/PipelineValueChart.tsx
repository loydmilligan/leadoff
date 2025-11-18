/**
 * Pipeline Value Chart Component
 * Visualizes stage-by-stage pipeline economics
 */

import { PipelineValueReport } from '../../services/reportHooks'

interface PipelineValueChartProps {
  data: PipelineValueReport
}

export function PipelineValueChart({ data }: PipelineValueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Pipeline Value by Stage</h2>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold text-gray-900">{formatCurrency(data.totalValue)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {data.stages.map((stage) => (
          <div key={stage.stage} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{stage.stage}</h3>
              <span className="text-sm text-gray-600">{stage.count} leads</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Value</div>
                <div className="font-semibold text-gray-900">{formatCurrency(stage.totalValue)}</div>
              </div>
              <div>
                <div className="text-gray-500">Avg Value</div>
                <div className="font-semibold text-gray-900">{formatCurrency(stage.avgValue)}</div>
              </div>
              <div>
                <div className="text-gray-500">Conv. Rate</div>
                <div className="font-semibold text-gray-900">{formatPercent(stage.conversionRate)}</div>
              </div>
            </div>

            {/* Visual bar */}
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(stage.totalValue / data.totalValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Generated: {new Date(data.generatedAt).toLocaleString()}
      </div>
    </div>
  )
}
