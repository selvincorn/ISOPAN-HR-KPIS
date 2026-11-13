import React, { useState } from 'react'
import { AlertCircle, Calendar, UserCheck, CheckCircle2 } from 'lucide-react'

interface CorrectiveActionModalProps {
  kpiCode: string
  kpiName: string
  onSubmit: (action: {
    description: string
    responsible: string
    dueDate: string
    evidenceNotes?: string
  }) => Promise<void>
  onClose: () => void
}

export const CorrectiveActionModal: React.FC<CorrectiveActionModalProps> = ({
  kpiCode,
  kpiName,
  onSubmit,
  onClose,
}) => {
  const [description, setDescription] = useState('')
  const [responsible, setResponsible] = useState('Jefe de Operaciones / Supervisor de Turno')
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
  )
  const [evidenceNotes, setEvidenceNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        description,
        responsible,
        dueDate,
        evidenceNotes,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-[11px] block">
            Plan de Acción Correctiva Obligatorio
          </span>
          <p className="mt-0.5">
            El indicador <strong>{kpiCode} — {kpiName}</strong> presenta desviación respecto a la meta
            establecida. Registre las medidas inmediatas para restablecer el estándar.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Descripción de la Acción Correctiva *
        </label>
        <textarea
          rows={3}
          required
          placeholder="Ej. Reorganizar turnos de trabajo, enviar operarios a jornada médica de tarjetas de pulmones, rebalanceo de línea..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Responsable de Ejecución *
          </label>
          <input
            type="text"
            required
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Fecha Compromiso de Cierre *
          </label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Notas de Evidencia / Criterio de Verificación
        </label>
        <textarea
          rows={2}
          placeholder="Entregable esperado: Acta firmada, comprobante de citas médicas, reporte de reloj biométrico..."
          value={evidenceNotes}
          onChange={(e) => setEvidenceNotes(e.target.value)}
          className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
          className="px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all"
        >
          {loading ? 'Guardando...' : 'Asignar Acción Correctiva'}
        </button>
      </div>
    </form>
  )
}

export default CorrectiveActionModal

