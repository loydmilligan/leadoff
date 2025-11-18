/**
 * Win/Loss Chart Component
 * Displays deal closure metrics and loss patterns
 */

import { WinLossReport } from '../../services/reportHooks'

interface WinLossChartProps {
  data: WinLossReport
}

export function WinLossChart({ data }: WinLossChartProps) {
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

  const formatDays = (days: number) => {
    return `${days.toFixed(0)} days`
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Win/Loss Analysis</h2>
        <p className="text-sm text-gray-500">
          {new Date(data.period.start).toLocaleDateString()} - {new Date(data.period.end).toLocaleDateString()}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Deals Won</div>
          <div className="text-3xl font-bold text-green-700">{data.metrics.won}</div>
          <div className="text-sm text-gray-600 mt-1">{formatCurrency(data.metrics.wonValue)}</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Deals Lost</div>
          <div className="text-3xl font-bold text-red-700">{data.metrics.lost}</div>
          <div className="text-sm text-gray-600 mt-1">{formatCurrency(data.metrics.lostValue)}</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Win Rate</div>
          <div className="text-3xl font-bold text-blue-700">{formatPercent(data.metrics.winRate)}</div>
          <div className="text-sm text-gray-600 mt-1">{formatCurrency(data.metrics.totalValue)} total</div>
        </div>
      </div>

      {/* Deal Cycle Times */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Avg Won Cycle</div>
          <div className="text-2xl font-bold text-gray-900">{formatDays(data.avgDealCycle.won)}</div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Avg Lost Cycle</div>
          <div className="text-2xl font-bold text-gray-900">{formatDays(data.avgDealCycle.lost)}</div>
        </div>
      </div>

      {/* Loss Reasons */}
      {data.lossReasons.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Top Loss Reasons</h3>
          <div className="space-y-2">
            {data.lossReasons.slice(0, 5).map((reason) => (
              <div key={reason.reason} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{reason.reason}</div>
                  <div className="text-sm text-gray-600">
                    {reason.count} {reason.count === 1 ? 'loss' : 'losses'} ({reason.percentage.toFixed(1)}%)
                  </div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2 ml-4">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${reason.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Generated: {new Date(data.generatedAt).toLocaleString()}
      </div>
    </div>
  )
}
