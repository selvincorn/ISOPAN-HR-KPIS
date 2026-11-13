import React, { useState } from 'react'
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  FileWarning,
  Lock,
  ShieldCheck,
  Check,
  X,
  Filter,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import CutoffCountdown from '../components/supervisors/CutoffCountdown'
import SupervisorRanking from '../components/supervisors/SupervisorRanking'
import SubmissionForm from '../components/supervisors/SubmissionForm'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/dashboard/StatusBadge'
import { useSupervisorData } from '../hooks/useSupervisorData'
import { usePayrollCutoff } from '../hooks/usePayrollCutoff'
import { useAuth } from '../hooks/useAuth'
import { MOCK_DEPARTMENTS } from '../lib/mockData'

export default function SupervisorPortal() {
  const { profile } = useAuth()
  const { isLocked } = usePayrollCutoff()
  const { submissions, ranking, addSubmission, updateSubmissionStatus } = useSupervisorData()

  const [activeTab, setActiveTab] = useState<'my_panel' | 'traffic_light' | 'exceptions'>('my_panel')
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState('all')

  // Submissions summary
  const mySubmissions = submissions
  const pendingCount = mySubmissions.filter((s) => s.status === 'submitted' || s.status === 'pending').length
  const approvedCount = mySubmissions.filter((s) => s.status === 'approved').length
  const lateCount = mySubmissions.filter((s) => s.is_exception || s.status === 'late').length

  const exceptionSubmissions = submissions.filter((s) => s.is_exception || s.status === 'late')

  return (
    <Layout title="Módulo Predictivo y Control de Jefes Inmediatos">
      <div className="space-y-6">
        {/* Real-time Payroll Cutoff Countdown */}
        <CutoffCountdown />

        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('my_panel')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'my_panel'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Mi Panel de Supervisor
            </button>
            <button
              onClick={() => setActiveTab('traffic_light')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'traffic_light'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tablero Semáforo de Pre-Cierre
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'exceptions'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileWarning className="w-3.5 h-3.5 text-red-500" />
              Boletas de Excepción Fuera de Corte ({exceptionSubmissions.length})
            </button>
          </div>

          <button
            onClick={() => setIsSubmissionModalOpen(true)}
            className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all ${
              isLocked
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLocked ? (
              <>
                <FileWarning className="w-4 h-4" /> Registrar Boleta de Excepción
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Registrar Novedad de Planilla
              </>
            )}
          </button>
        </div>

        {/* TAB 1: MI PANEL DE SUPERVISOR */}
        {activeTab === 'my_panel' && (
          <div className="space-y-6">
            {/* Status Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Enviadas / En Revisión</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{pendingCount}</p>
                  <p className="text-xs text-gray-400 mt-1">Pendientes de auditoría RR.HH.</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase">Novedades Aprobadas</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{approvedCount}</p>
                  <p className="text-xs text-gray-400 mt-1">Incorporadas a nómina regular</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-red-700 uppercase">Excepciones Fuera de Corte</p>
                  <p className="text-2xl font-black text-red-700 mt-1">{lateCount}</p>
                  <p className="text-xs text-red-600 mt-1">Afectan KPI de cumplimiento</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <FileWarning className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* List of Submissions */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">
                  Registro de Novedades Enviadas (Planilla Noviembre 2026)
                </h3>
                <span className="text-xs text-gray-500">{submissions.length} registros</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4">Tipo de Novedad</th>
                      <th className="py-3 px-4">Colaborador</th>
                      <th className="py-3 px-4">Detalle / Cuantía</th>
                      <th className="py-3 px-4">Motivo / Justificación</th>
                      <th className="py-3 px-4 text-center">Tipo Carga</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {submissions.map((sub) => {
                      const data = sub.data_json as any
                      return (
                        <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-gray-900">
                            {sub.submission_type === 'overtime'
                              ? 'Horas Extras (1.5x)'
                              : sub.submission_type === 'bonus'
                              ? 'Bonificación'
                              : sub.submission_type === 'biometric_justification'
                              ? 'Justif. Biométrico'
                              : 'Ausencia'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-800">
                            {data.employee || 'Personal de Turno'}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-700">
                            {data.hours ? `${data.hours} hrs extras` : data.amount ? `Q ${data.amount}` : data.type || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                            {data.reason || data.justification || 'Operativo'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {sub.is_exception ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                <FileWarning className="w-3 h-3" /> Fuera de Corte
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Ordinario
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {sub.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Aprobada
                              </span>
                            ) : sub.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                <XCircle className="w-3 h-3" /> Rechazada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                <Clock className="w-3 h-3" /> En Revisión
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TABLERO SEMÁFORO DE PRE-CIERRE */}
        {activeTab === 'traffic_light' && (
          <div className="space-y-6">
            {/* Visual Semáforo Cards */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-3">
                Estado de Cumplimiento en Tiempo Real por Jefatura de Área
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ranking.map((leader) => (
                  <div
                    key={leader.id}
                    className={`p-5 rounded-xl border transition-all ${
                      leader.status === 'green'
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : leader.status === 'yellow'
                        ? 'bg-amber-50/50 border-amber-300'
                        : 'bg-red-50/50 border-red-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          {leader.department_name}
                        </span>
                        <h4 className="font-black text-gray-900 text-base mt-0.5">
                          {leader.supervisor_name}
                        </h4>
                      </div>
                      <StatusBadge status={leader.status} />
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/60 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cierre antes de Corte:</span>
                        <strong className="text-gray-900">{leader.payroll_closure_pct}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Justif. Biométrico &lt; 24h:</span>
                        <strong className="text-gray-900">{leader.biometric_justification_pct}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Resp. Entrevistas:</span>
                        <strong className="text-gray-900">{leader.interview_response_days} días</strong>
                      </div>
                      <div className="flex justify-between font-black text-sm pt-1 border-t border-gray-200">
                        <span className="text-gray-700">Puntaje Global:</span>
                        <span className="text-blue-700">{leader.overall_score} pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ranking Detail Table */}
            <SupervisorRanking ranking={ranking} />
          </div>
        )}

        {/* TAB 3: BOLETAS DE EXCEPCIÓN FUERA DE CORTE */}
        {activeTab === 'exceptions' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-3">
              <FileWarning className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">
                  Control de Cargas Extemporáneas (Auditoría de Planilla)
                </h4>
                <p className="mt-0.5">
                  Las boletas aquí listadas fueron ingresadas una vez vencido el candado de corte. Cada
                  aprobación requiere visto bueno de Gerencia y genera deducción de puntos en el
                  ranking predictivo del supervisor responsable.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">
                  Solicitudes Extemporáneas Pendientes de Resolución
                </h3>
                <span className="text-xs bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full">
                  {exceptionSubmissions.length} Excepciones
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {exceptionSubmissions.map((exc) => {
                  const data = exc.data_json as any
                  return (
                    <div key={exc.id} className="p-5 hover:bg-red-50/20 transition-colors">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded">
                              Excepción Fuera de Corte
                            </span>
                            <span className="text-xs text-gray-500">
                              Tipo: <strong>{exc.submission_type}</strong>
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            Colaborador: {data.employee}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            <strong>Cuantía:</strong> {data.hours ? `${data.hours} hrs extras` : `Q ${data.amount}`} |{' '}
                            <strong>Motivo Operativo:</strong> {data.reason}
                          </p>
                          {exc.exception_reason && (
                            <p className="text-xs text-red-800 bg-red-50 p-2 rounded mt-2 border border-red-200">
                              <strong>Justificación de Extemporaneidad:</strong> {exc.exception_reason}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {exc.status === 'approved' ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Aprobada por Gerencia
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => updateSubmissionStatus(exc.id, 'approved')}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
                              >
                                <Check className="w-4 h-4" /> Autorizar
                              </button>
                              <button
                                onClick={() => updateSubmissionStatus(exc.id, 'rejected')}
                                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
                              >
                                <X className="w-4 h-4" /> Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Submission Form */}
        {isSubmissionModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsSubmissionModalOpen(false)}
            title={isLocked ? 'Boleta de Excepción Fuera de Corte' : 'Registrar Novedad de Planilla'}
          >
            <SubmissionForm
              isLocked={isLocked}
              onClose={() => setIsSubmissionModalOpen(false)}
              onSubmit={async (sub) => {
                await addSubmission(sub)
              }}
            />
          </Modal>
        )}
      </div>
    </Layout>
  )
}

