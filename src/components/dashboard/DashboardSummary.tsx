import React from 'react'
import { Target, CheckCircle2, AlertTriangle, XCircle, TrendingUp } from 'lucide-react'
import type { KPISummaryData } from '../../hooks/useKPIs'

interface DashboardSummaryProps {
  summary: KPISummaryData
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ summary }) => {
  const complianceRate =
    summary.total > 0 ? Math.round((summary.green / summary.total) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total KPIs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Indicadores
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-gray-900">{summary.total}</span>
            <span className="text-xs text-gray-500">fichas activas</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{complianceRate}% Cumplimiento Global</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
          <Target className="w-6 h-6" />
        </div>
      </div>

      {/* En Meta (Green) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            En Meta (Verde)
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-emerald-700">{summary.green}</span>
            <span className="text-xs text-emerald-600 font-medium">
              ({summary.total > 0 ? Math.round((summary.green / summary.total) * 100) : 0}%)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Operación dentro de parámetro</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Alerta (Yellow) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            En Alerta (Amarillo)
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-amber-700">{summary.yellow}</span>
            <span className="text-xs text-amber-600 font-medium">
              ({summary.total > 0 ? Math.round((summary.yellow / summary.total) * 100) : 0}%)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Tolerancia &le; 10% desviación</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      {/* Desviación Crítica (Red) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
            Desviación Crítica (Rojo)
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-red-700">{summary.red}</span>
            <span className="text-xs text-red-600 font-medium">
              ({summary.total > 0 ? Math.round((summary.red / summary.total) * 100) : 0}%)
            </span>
          </div>
          <p className="text-xs text-red-600 font-medium mt-2">Acción correctiva obligatoria</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <XCircle className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

export default DashboardSummary

