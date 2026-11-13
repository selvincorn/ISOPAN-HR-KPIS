import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react'
import type { KPIDefinition, KPIRecord } from '../../types/database'
import { formatCurrency, formatPercent } from '../../lib/utils'
import StatusBadge from './StatusBadge'

interface KPICardProps {
  kpi: KPIDefinition
  record?: KPIRecord
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, record }) => {
  const navigate = useNavigate()

  const formatValue = (val: number, unit: string) => {
    if (unit === 'Q') return formatCurrency(val)
    if (unit === '%') return formatPercent(val)
    return `${val.toLocaleString()} ${unit}`
  }

  const actual = record?.actual_value ?? 0
  const target = kpi.target_value
  const variance = record?.variance ?? (actual - target)
  const status = record?.status ?? 'green'

  const isFavorable =
    (kpi.target_operator === '<=' && actual <= target) ||
    (kpi.target_operator === '>=' && actual >= target) ||
    (kpi.target_operator === '=' && actual === target)

  return (
    <div
      onClick={() => navigate(`/kpis/${kpi.id}`)}
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group"
    >
      {/* Top Bar indicator */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          status === 'green'
            ? 'bg-emerald-500'
            : status === 'yellow'
            ? 'bg-amber-500'
            : 'bg-red-500'
        }`}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
            {kpi.code}
          </span>
          <StatusBadge status={status} />
        </div>

        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-700 transition-colors">
          {kpi.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{kpi.category}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Resultado Real</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">
              {formatValue(actual, kpi.target_unit)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">Meta ({kpi.target_operator})</p>
            <p className="text-sm font-bold text-gray-600 mt-0.5">
              {formatValue(target, kpi.target_unit)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1 font-semibold">
            {variance > 0 ? (
              <ArrowUpRight
                className={`w-3.5 h-3.5 ${isFavorable ? 'text-emerald-600' : 'text-red-600'}`}
              />
            ) : variance < 0 ? (
              <ArrowDownRight
                className={`w-3.5 h-3.5 ${isFavorable ? 'text-emerald-600' : 'text-red-600'}`}
              />
            ) : (
              <Minus className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className={isFavorable ? 'text-emerald-700' : 'text-red-600'}>
              Var: {variance > 0 ? `+${variance}` : variance} {kpi.target_unit}
            </span>
          </div>

          {status === 'red' && (
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Acción Req.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default KPICard

