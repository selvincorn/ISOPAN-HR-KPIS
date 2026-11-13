import React, { useState } from 'react'
import { PlusCircle, AlertCircle, FileWarning, Check } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { MOCK_DEPARTMENTS } from '../../lib/mockData'

interface SubmissionFormProps {
  isLocked: boolean
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ isLocked, onSubmit, onClose }) => {
  const [submissionType, setSubmissionType] = useState('overtime')
  const [departmentId, setDepartmentId] = useState(MOCK_DEPARTMENTS[0].id)
  const [employee, setEmployee] = useState('')
  const [hours, setHours] = useState('2.5')
  const [amount, setAmount] = useState('300')
  const [bonusType, setBonusType] = useState('Productividad y Rendimiento')
  const [date, setDate] = useState('2026-11-12')
  const [reason, setReason] = useState('')
  const [exceptionReason, setExceptionReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      department_id: departmentId,
      submission_type: submissionType,
      is_exception: isLocked,
      exception_reason: isLocked ? exceptionReason : null,
      data_json: {
        employee,
        date,
        hours: submissionType === 'overtime' ? Number(hours) : undefined,
        amount: submissionType === 'bonus' ? Number(amount) : undefined,
        bonus_type: submissionType === 'bonus' ? bonusType : undefined,
        reason,
      },
    }

    try {
      await onSubmit(payload)
      onClose()
    } catch (err: any) {
      alert(`Aviso de guardado: ${err?.message || 'Se guardó en memoria local provisionalmente.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Alert if locked */}
      {isLocked && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <FileWarning className="w-4 h-4 text-red-600" />
            <span>SOLICITUD FUERA DE CORTE (BOLETA DE EXCEPCIÓN)</span>
          </div>
          <p>
            El período regular está cerrado. Este registro se procesará como excepción auditada y
            penalizará el KPI de cumplimiento de su jefatura.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Tipo de Novedad
          </label>
          <select
            value={submissionType}
            onChange={(e) => setSubmissionType(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="overtime">Horas Extras (Recargo 1.5x)</option>
            <option value="bonus">Bonificación por Productividad</option>
            <option value="biometric_justification">Justificación de Marcaje Biométrico</option>
            <option value="absence">Permiso / Ausencia Justificada</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Departamento
          </label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {MOCK_DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Colaborador (Nombre y Código)
        </label>
        <input
          type="text"
          required
          placeholder="Ej. Juan Carlos Meza (Op. 1042)"
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
          className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {submissionType === 'overtime' && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Horas Extras Solicitadas
            </label>
            <input
              type="number"
              step="0.5"
              required
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {submissionType === 'bonus' && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Monto en Quetzales (Q)
            </label>
            <input
              type="number"
              step="10"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Motivo / Justificación Operativa
        </label>
        <textarea
          rows={3}
          required
          placeholder="Describa la necesidad operativa o sustento técnico..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {isLocked && (
        <div>
          <label className="block text-xs font-bold text-red-700 mb-1">
            Motivo de Extemporaneidad (Obligatorio para Excepción Fuera de Corte) *
          </label>
          <textarea
            rows={2}
            required
            placeholder="Explique detalladamente por qué no se presentó antes de la fecha límite..."
            value={exceptionReason}
            onChange={(e) => setExceptionReason(e.target.value)}
            className="w-full text-sm rounded-lg border border-red-300 p-2 focus:ring-2 focus:ring-red-500 focus:outline-none bg-red-50/50"
          />
        </div>
      )}

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
          className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 ${
            isLocked
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            'Guardando...'
          ) : isLocked ? (
            <>
              <FileWarning className="w-4 h-4" />
              Enviar Boleta de Excepción
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Registrar Novedad
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default SubmissionForm

