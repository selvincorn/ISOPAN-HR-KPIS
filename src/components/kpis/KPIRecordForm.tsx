import React, { useState } from 'react'
import type { KPIDefinition } from '../../types/database'
import { determineKPIStatus, calculateKPIVariance } from '../../lib/kpi-calculator'
import StatusBadge from '../dashboard/StatusBadge'
import { AlertCircle } from 'lucide-react'

interface KPIRecordFormProps {
  kpi: KPIDefinition
  onSubmit: (actualValue: number, notes: string, week?: number | null) => Promise<void>
  onClose: () => void
}

export const KPIRecordForm: React.FC<KPIRecordFormProps> = ({ kpi, onSubmit, onClose }) => {
  const [actualValue, setActualValue] = useState<string>(String(kpi.target_value))
  const [notes, setNotes] = useState<string>('')
  const [week, setWeek] = useState<string>('46')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const numVal = parseFloat(actualValue) || 0
  const previewVariance = calculateKPIVariance(numVal, kpi.target_value)
  const previewStatus = determineKPIStatus(numVal, kpi.target_value, kpi.target_operator)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    try {
      await onSubmit(numVal, notes, kpi.frequency === 'weekly' ? parseInt(week) : null)
      onClose()
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'No se pudo persistir en Supabase. Verifique que VITE_SUPABASE_URL esté configurado correctamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Error al guardar en Supabase:</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-800 uppercase">{kpi.code}</span>
          <h4 className="font-bold text-gray-900 text-sm mt-0.5">{kpi.name}</h4>
          <p className="text-xs text-gray-600">
            Meta Vigente: <strong>{kpi.target_operator} {kpi.target_value} {kpi.target_unit}</strong>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium">Estado Proyectado</p>
          <div className="mt-1">
            <StatusBadge status={previewStatus} />
          </div>
        </div>
      </div>

      {kpi.frequency === 'weekly' && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Semana del Año
          </label>
          <input
            type="number"
            min="1"
            max="52"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Resultado Real Obtenido ({kpi.target_unit}) *
        </label>
        <div className="relative">
          <input
            type="number"
            step="any"
            required
            value={actualValue}
            onChange={(e) => setActualValue(e.target.value)}
            className="w-full text-lg font-bold rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-14"
          />
          <span className="absolute right-3 top-3 text-sm font-semibold text-gray-400">
            {kpi.target_unit}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>
            Variación: <strong>{previewVariance > 0 ? `+${previewVariance}` : previewVariance} {kpi.target_unit}</strong>
          </span>
          <span className="italic">Cálculo de tolerancia 10% automático</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Observaciones / Justificación de la Variación
        </label>
        <textarea
          rows={3}
          placeholder="Describa el contexto operativo que justificó este resultado..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          {loading ? 'Guardando en Supabase...' : 'Guardar y Auditar Registro'}
        </button>
      </div>
    </form>
  )
}

export default KPIRecordForm
