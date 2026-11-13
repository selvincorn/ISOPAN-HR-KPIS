import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrency, formatPercent } from '../../lib/utils'

interface TrendPoint {
  month: string
  actual: number
  target: number
}

interface TrendChartProps {
  data: TrendPoint[]
  title: string
  unit: string
  description?: string
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, title, unit, description }) => {
  const formatYAxis = (val: number) => {
    if (unit === 'Q') {
      if (val >= 1000000) return `Q ${(val / 1000000).toFixed(1)}M`
      if (val >= 1000) return `Q ${(val / 1000).toFixed(0)}k`
      return `Q ${val}`
    }
    if (unit === '%') return `${val}%`
    return `${val}`
  }

  const formatTooltipValue = (value: number) => {
    if (unit === 'Q') return formatCurrency(value)
    if (unit === '%') return formatPercent(value)
    return `${value} ${unit}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
          Unidad: {unit}
        </span>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
            <YAxis tickFormatter={formatYAxis} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatTooltipValue(value),
                name === 'actual' ? 'Resultado Real' : 'Meta Aprobada',
              ]}
              labelFormatter={(label) => `Mes: ${label}`}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
            />
            <Legend
              formatter={(value) => (value === 'actual' ? 'Resultado Real' : 'Meta Aprobada')}
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#DC2626"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default TrendChart

