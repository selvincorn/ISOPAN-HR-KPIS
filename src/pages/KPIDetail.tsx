import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Target,
  FileText,
  Calculator,
  User,
  Database,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import StatusBadge from '../components/dashboard/StatusBadge'
import TrendChart from '../components/dashboard/TrendChart'
import Modal from '../components/ui/Modal'
import KPIRecordForm from '../components/kpis/KPIRecordForm'
import CorrectiveActionModal from '../components/kpis/CorrectiveActionModal'
import { useKPIs } from '../hooks/useKPIs'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatPercent } from '../lib/utils'
import { MOCK_CORRECTIVE_ACTIONS } from '../lib/mockData'

export default function KPIDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { kpiDefinitions, kpiRecords, saveKPIRecord } = useKPIs()

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [correctiveActions, setCorrectiveActions] = useState(MOCK_CORRECTIVE_ACTIONS)

  const kpi = kpiDefinitions.find((k) => k.id === id) || kpiDefinitions[0]
  const record = kpiRecords.find((r) => r.kpi_definition_id === kpi?.id)

  if (!kpi) {
    return (
      <Layout title="Indicador No Encontrado">
        <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">El indicador solicitado no existe.</p>
          <button
            onClick={() => navigate('/kpis')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
          >
            Volver a la Matriz
          </button>
        </div>
      </Layout>
    )
  }

  const actual = record?.actual_value ?? kpi.target_value
  const target = kpi.target_value
  const variance = record?.variance ?? (actual - target)
  const status = record?.status ?? 'green'

  const formatValue = (val: number, unit: string) => {
    if (unit === 'Q') return formatCurrency(val)
    if (unit === '%') return formatPercent(val)
    return `${val.toLocaleString()} ${unit}`
  }

  // 6 month synthetic trend data for this KPI
  const trendData = [
    { month: 'Jun', actual: Number((actual * 1.15).toFixed(1)), target: target },
    { month: 'Jul', actual: Number((actual * 1.08).toFixed(1)), target: target },
    { month: 'Ago', actual: Number((actual * 0.98).toFixed(1)), target: target },
    { month: 'Sep', actual: Number((actual * 0.95).toFixed(1)), target: target },
    { month: 'Oct', actual: Number((actual * 1.04).toFixed(1)), target: target },
    { month: 'Nov', actual: actual, target: target },
  ]

  const handleAddAction = async (action: any) => {
    // 1. Intentar persistir en Supabase
    try {
      const payload = {
        kpi_record_id: record?.id,
        description: action.description,
        due_date: action.dueDate,
        status: 'in_progress',
        evidence_notes: action.evidenceNotes || null,
      }
      const { data, error } = await supabase
        .from('corrective_actions')
        .insert(payload)
        .select()
        .maybeSingle()

      if (error) {
        console.error('Error insertando en corrective_actions:', error)
      } else if (data) {
        setCorrectiveActions((prev) => [
          {
            ...data,
            kpi_code: kpi.code,
            kpi_name: kpi.name,
          } as any,
          ...prev,
        ])
        return
      }
    } catch (err) {
      console.warn('Aviso al guardar acción correctiva en Supabase:', err)
    }

    // 2. Fallback de estado local
    const newAction = {
      id: `ca-${Date.now()}`,
      kpi_record_id: record?.id ?? 'rec-curr',
      description: action.description,
      responsible_user_id: action.responsible,
      due_date: action.dueDate,
      status: 'in_progress' as const,
      completion_date: null,
      evidence_notes: action.evidenceNotes ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      kpi_code: kpi.code,
      kpi_name: kpi.name,
    }
    setCorrectiveActions((prev) => [newAction, ...prev])
  }

  return (
    <Layout title={`Ficha Técnica: ${kpi.code} — ${kpi.name}`}>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/kpis')}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              title="Volver a la Matriz de KPIs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded">
                  {kpi.code}
                </span>
                <span className="text-xs font-semibold text-gray-500">{kpi.category}</span>
                <StatusBadge status={status} />
              </div>
              <h1 className="text-xl font-black text-gray-900 mt-1">{kpi.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Registrar Nuevo Valor
            </button>
            {(status === 'yellow' || status === 'red') && (
              <button
                onClick={() => setIsActionModalOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm animate-pulse"
              >
                <AlertTriangle className="w-4 h-4" /> Registrar Acción Correctiva
              </button>
            )}
          </div>
        </div>

        {/* FICHA MAESTRA: 9 CAMPOS OBLIGATORIOS */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Ficha Maestra de Control Estructurado (9 Campos Normativos)
            </span>
            <span className="text-xs text-slate-300">Auditoría ISOPAN Guatemala</span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Campo 1, 2, 8: Definición y Fuente */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-blue-600" /> 1. Objetivo del Indicador
                </label>
                <p className="text-sm font-semibold text-gray-800 mt-1">{kpi.objective}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-blue-600" /> 2. Fórmula de Cálculo
                </label>
                <div className="mt-1 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs font-mono text-gray-800">
                  {kpi.formula}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" /> 8. Fuente de Información
                </label>
                <p className="text-sm font-semibold text-gray-800 mt-1">{kpi.data_source}</p>
              </div>
            </div>

            {/* Campo 3, 4, 5: Mediciones y Variación */}
            <div className="space-y-4 md:pl-6 pt-4 md:pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                  <label className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                    3. Meta ({kpi.target_operator})
                  </label>
                  <p className="text-lg font-black text-blue-900 mt-0.5">
                    {formatValue(target, kpi.target_unit)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                    4. Resultado Real
                  </label>
                  <p className="text-lg font-black text-gray-900 mt-0.5">
                    {formatValue(actual, kpi.target_unit)}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  5. Variación Automática y Estado
                </label>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base font-black text-gray-900">
                    {variance > 0 ? `+${variance}` : variance} {kpi.target_unit}
                  </span>
                  <StatusBadge status={status} />
                </div>
                {record?.notes && (
                  <p className="text-xs text-gray-600 italic mt-2 border-t border-gray-200 pt-1.5">
                    "{record.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Campo 6, 7, 9: Gestión, Responsable y Acción Correctiva */}
            <div className="space-y-4 md:pl-6 pt-4 md:pt-0">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> 6. Frecuencia de Medición
                </label>
                <p className="text-sm font-semibold text-gray-800 mt-1 capitalize">
                  {kpi.frequency === 'weekly'
                    ? 'Semanal'
                    : kpi.frequency === 'monthly'
                    ? 'Mensual'
                    : 'Semestral'}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" /> 7. Responsable del Indicador
                </label>
                <p className="text-sm font-semibold text-gray-800 mt-1">{kpi.responsible_role}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> 9. Estado de Acción Correctiva
                </label>
                {status === 'green' ? (
                  <div className="mt-1 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>En meta. No se requiere plan correctivo.</span>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Plan correctivo activo requerido por auditoría.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 6-Month Historical Chart */}
        <TrendChart
          title={`Historial de Tendencia: ${kpi.name}`}
          description={`Evolución de los últimos 6 meses (Junio a Noviembre 2026) frente a la meta (${kpi.target_operator} ${kpi.target_value} ${kpi.target_unit})`}
          unit={kpi.target_unit}
          data={trendData}
        />

        {/* Planes de Acción Correctiva Registrados */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Planes de Acción Correctiva Auditados
              </h3>
              <p className="text-xs text-gray-500">
                Seguimiento de compromisos asumidos cuando la variación fue desfavorable
              </p>
            </div>
            <button
              onClick={() => setIsActionModalOpen(true)}
              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-md border border-amber-200 transition-colors"
            >
              + Nueva Acción
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {correctiveActions.map((action) => (
              <div key={action.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          action.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {action.status === 'completed' ? 'Completada' : 'En Progreso'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Compromiso: <strong>{action.due_date}</strong>
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{action.description}</p>
                    {action.evidence_notes && (
                      <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded border border-gray-100">
                        <strong>Evidencia:</strong> {action.evidence_notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Record Form */}
        {isRecordModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsRecordModalOpen(false)}
            title="Registrar Nuevo Valor de Indicador"
          >
            <KPIRecordForm
              kpi={kpi}
              onClose={() => setIsRecordModalOpen(false)}
              onSubmit={async (val, notes, week) => {
                await saveKPIRecord(kpi.id, val, notes, week)
              }}
            />
          </Modal>
        )}

        {/* Modal: Corrective Action Form */}
        {isActionModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsActionModalOpen(false)}
            title="Asignar Plan de Acción Correctiva"
          >
            <CorrectiveActionModal
              kpiCode={kpi.code}
              kpiName={kpi.name}
              onClose={() => setIsActionModalOpen(false)}
              onSubmit={handleAddAction}
            />
          </Modal>
        )}
      </div>
    </Layout>
  )
}

