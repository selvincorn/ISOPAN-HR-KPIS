import React, { useState } from 'react'
import {
  Briefcase,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Send,
  UserCheck,
  Building,
  FileSpreadsheet,
  PauseCircle,
  PlayCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useVacancies } from '../hooks/useVacancies'
import { exportToCSV } from '../components/reports/ReportExport'
import type { RecruitmentVacancy } from '../types/database'

export default function RecruitmentVacancies() {
  const {
    vacancies,
    slaAnalysis,
    transferOwnership,
    updateVacancyStatus,
    createVacancy,
  } = useVacancies()

  const [search, setSearch] = useState('')
  const [selectedSupervisor, setSelectedSupervisor] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VIGENTE' | 'EN_PRUEBA' | 'CRITICAS'>('ALL')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedVacancyForAction, setSelectedVacancyForAction] = useState<RecruitmentVacancy | null>(null)

  // New Vacancy Form State
  const [newPosition, setNewPosition] = useState('')
  const [newSupervisor, setNewSupervisor] = useState('Julio Lorenzana')
  const [newDepartment, setNewDepartment] = useState('Producción Panadería')
  const [newType, setNewType] = useState('Sustitución')
  const [newReplacement, setNewReplacement] = useState('')
  const [newObservations, setNewObservations] = useState('')

  // Unique list of supervisors for filter
  const supervisorsList = Array.from(new Set(vacancies.map((v) => v.supervisor_name))).sort()

  // Filtered Vacancies
  const filteredVacancies = vacancies.filter((v) => {
    const matchesSearch =
      !search ||
      v.position_name.toLowerCase().includes(search.toLowerCase()) ||
      v.supervisor_name.toLowerCase().includes(search.toLowerCase()) ||
      (v.candidate_in_process && v.candidate_in_process.toLowerCase().includes(search.toLowerCase())) ||
      (v.observations && v.observations.toLowerCase().includes(search.toLowerCase())) ||
      (v.replacement_for && v.replacement_for.toLowerCase().includes(search.toLowerCase()))

    const matchesSup = selectedSupervisor === 'all' || v.supervisor_name === selectedSupervisor

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'CRITICAS'
        ? v.total_days > 15 && v.status !== 'CERRADA'
        : v.status === statusFilter

    return matchesSearch && matchesSup && matchesStatus
  })

  const handleExportExcel = () => {
    exportToCSV(
      filteredVacancies.map((v) => ({
        no: v.sequence_no,
        jefe: v.supervisor_name,
        plaza: v.position_name,
        tipo: v.vacancy_type,
        sustitucion: v.replacement_for || 'Plaza Nueva',
        estatus: v.status,
        totalDias: `${v.total_days} días`,
        diasRH: `${v.hr_days} días`,
        diasJefe: `${v.supervisor_days} días`,
        responsableActual: v.current_owner === 'supervisor' ? 'Jefe Directo (Esperando respuesta)' : 'RR.HH. (Búsqueda/Filtro)',
        candidato: v.candidate_in_process || 'Sin candidato',
        observaciones: v.observations || '',
      })),
      'Tabla_General_Reclutamiento_2026_ISOPAN',
      [
        { header: 'No.', accessor: (i) => i.no },
        { header: 'Jefe Directo', accessor: (i) => i.jefe },
        { header: 'Nombre de la Plaza', accessor: (i) => i.plaza },
        { header: 'Tipo', accessor: (i) => i.tipo },
        { header: 'Sustitución / Plaza Nueva', accessor: (i) => i.sustitucion },
        { header: 'Estatus Plaza', accessor: (i) => i.estatus },
        { header: 'Tiempo Total', accessor: (i) => i.totalDias },
        { header: 'Días RR.HH.', accessor: (i) => i.diasRH },
        { header: 'Días Esperando al Jefe', accessor: (i) => i.diasJefe },
        { header: 'Responsable Actual (Cancha)', accessor: (i) => i.responsableActual },
        { header: 'Candidato en Prueba / Proceso', accessor: (i) => i.candidato },
        { header: 'Observaciones de la Plaza', accessor: (i) => i.observaciones },
      ]
    )
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createVacancy({
      position_name: newPosition,
      supervisor_name: newSupervisor,
      department_name: newDepartment,
      vacancy_type: newType,
      replacement_for: newReplacement || 'Plaza Nueva',
      observations: newObservations,
    })
    setIsNewModalOpen(false)
    setNewPosition('')
    setNewReplacement('')
    setNewObservations('')
  }

  return (
    <Layout title="Seguimiento de Reclutamiento y SLA de Jefaturas">
      <div className="space-y-6">
        {/* Top Control Bar with ISOPAN Logo */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white p-1 rounded-xl border border-gray-200 shadow-sm shrink-0 flex items-center justify-center">
              <img src="/isopan-logo.png" alt="ISOPAN" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B1D2F] bg-red-50 px-2 py-0.5 rounded">
                  Control de Reclutamiento y Selección 2026
                </span>
                <span className="text-xs text-gray-500 font-medium">Informe General de Plazas</span>
              </div>
              <h2 className="text-lg font-black text-gray-900 mt-0.5">
                Auditoría de Tiempos de Contratación: RR.HH. vs. Jefes Inmediatos
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Exportar Tabla General (Excel / CSV)
            </button>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 bg-[#6B1D2F] hover:bg-[#521624] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              + Nueva Requisición de Plaza
            </button>
          </div>
        </div>

        {/* SLA ACCOUNTABILITY PANEL: DESLINDAR A RRHH Y DEMOSTRAR DEMORAS DE JEFES */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Plazas */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-gray-400">Total Plazas Pendientes</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-gray-900">{slaAnalysis.totalPending}</span>
                <span className="text-xs text-gray-500 font-semibold">vacantes activas</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {slaAnalysis.inTrialCount} candidatos actualmente en período de prueba
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-blue-700 font-bold">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Plantilla operativa y administrativa</span>
            </div>
          </div>

          {/* Card 2: Plazas Críticas (> 15 días) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-red-600">Plazas en Desviación Crítica</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-red-600">{slaAnalysis.criticalCount}</span>
                <span className="text-xs text-red-500 font-bold">&gt; 15 días de antigüedad</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Inciden negativamente en KPI-01 y KPI-13
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-red-700 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{Math.round((slaAnalysis.criticalCount / (slaAnalysis.totalPending || 1)) * 100)}% de plazas superan la meta</span>
            </div>
          </div>

          {/* Card 3: Auditoría SLA: ¿De quién es la demora? */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-xl shadow-md lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Dictamen de Responsabilidad de Tiempos (SLA)
                </span>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-blue-200 font-mono">
                  Doble Cronómetro
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                  <span className="text-[11px] text-blue-200 block font-semibold">
                    1. Tiempo en Cancha de RR.HH.
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-emerald-400">{slaAnalysis.avgHRDays}</span>
                    <span className="text-xs text-white/70">días prom.</span>
                  </div>
                  <p className="text-[10px] text-emerald-300 mt-1">
                    &le; 15 días (RR.HH. cumple su meta interna)
                  </p>
                </div>

                <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                  <span className="text-[11px] text-amber-200 block font-semibold">
                    2. Esperando al Jefe Directo
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-amber-400">{slaAnalysis.avgSupervisorDays}</span>
                    <span className="text-xs text-white/70">días prom.</span>
                  </div>
                  <p className="text-[10px] text-amber-300 mt-1 font-bold">
                    {slaAnalysis.supervisorDelayPct}% del retraso total es de jefaturas
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/70 mt-3 pt-2 border-t border-white/10 italic">
              * Evidencia para Dirección General: La demora en plazas no proviene del reclutamiento inicial, sino de la falta de respuesta y validación de ternas por parte de los líderes de área.
            </p>
          </div>
        </div>

        {/* TOP JEFES CUELLO DE BOTELLA */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Cuellos de Botella: Jefes Inmediatos con Mayor Tiempo de Espera en Correos/Entrevistas
              </h3>
              <p className="text-xs text-gray-500">
                Líderes de área que tienen ternas pendientes de respuesta y están deteniendo el cierre de vacantes
              </p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-full border border-amber-200">
              Impacta directamente su Ranking
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {slaAnalysis.bottleneckSupervisors.slice(0, 5).map((sup, idx) => (
              <div
                key={sup.supervisorName}
                onClick={() => setSelectedSupervisor(sup.supervisorName)}
                className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-amber-50/50 hover:border-amber-300 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500">#{idx + 1} en demora</span>
                  <span className="text-xs bg-red-100 text-red-800 font-black px-1.5 py-0.5 rounded">
                    {sup.pendingPlazas} plazas
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-xs mt-1 truncate">{sup.supervisorName}</h4>
                <div className="mt-2 text-xs">
                  <span className="text-gray-500 text-[11px]">Espera acumulada:</span>
                  <p className="font-black text-amber-700 text-sm">{sup.totalWaitingDays} días total</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                    ({sup.avgWaitingDays} días prom. por plaza)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TABLA PRINCIPAL DE SEGUIMIENTO (REPLICA MEJORADA DEL EXCEL) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Table Filters */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por plaza, jefe, candidato o ubicación (ej. Panadero, Ruth Juárez, Zona 7)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todas ({vacancies.length})
                </button>
                <button
                  onClick={() => setStatusFilter('CRITICAS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    statusFilter === 'CRITICAS'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Críticas &gt; 15d ({slaAnalysis.criticalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('EN_PRUEBA')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    statusFilter === 'EN_PRUEBA'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  En Prueba ({slaAnalysis.inTrialCount})
                </button>
              </div>
            </div>

            {/* Filter by Supervisor */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs">
              <span className="font-semibold text-gray-500">Filtrar por Jefe Directo:</span>
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                className="text-xs p-1.5 rounded-lg border border-gray-300 font-semibold text-gray-800 focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none"
              >
                <option value="all">Todos los Jefes Inmediatos ({supervisorsList.length})</option>
                {supervisorsList.map((sup) => (
                  <option key={sup} value={sup}>
                    {sup}
                  </option>
                ))}
              </select>

              {selectedSupervisor !== 'all' && (
                <button
                  onClick={() => setSelectedSupervisor('all')}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  Quitar filtro de jefe
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1e3a5f] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">No.</th>
                  <th className="py-2.5 px-3">Jefe Directo</th>
                  <th className="py-2.5 px-3">Nombre de la Plaza</th>
                  <th className="py-2.5 px-3">Sustitución / Plaza Nueva</th>
                  <th className="py-2.5 px-2 text-center">Estatus</th>
                  <th className="py-2.5 px-3 text-center">Tiempo Total</th>
                  <th className="py-2.5 px-3 text-center">Días RR.HH.</th>
                  <th className="py-2.5 px-3 text-center">Días Jefe</th>
                  <th className="py-2.5 px-3 text-center">Cancha Actual</th>
                  <th className="py-2.5 px-3">Candidato en Prueba / Proceso</th>
                  <th className="py-2.5 px-4">Observaciones y Ubicación</th>
                  <th className="py-2.5 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-[11px]">
                {filteredVacancies.map((v, idx) => (
                  <tr
                    key={v.id}
                    className={`hover:bg-blue-50/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                    } ${v.total_days > 40 ? 'border-l-4 border-l-red-500' : ''}`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono font-black text-gray-700">
                      {v.sequence_no}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900 whitespace-nowrap">
                      {v.supervisor_name}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-blue-900">{v.position_name}</td>
                    <td className="py-2.5 px-3 text-gray-700">
                      <span className="font-medium text-gray-800">{v.replacement_for}</span>
                      <span className="text-[10px] text-gray-400 block">({v.vacancy_type})</span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          v.status === 'EN_PRUEBA'
                            ? 'bg-blue-100 text-blue-800'
                            : v.status === 'CERRADA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {v.status === 'EN_PRUEBA' ? 'En Prueba' : v.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-xs text-gray-900">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          v.total_days > 30
                            ? 'bg-red-100 text-red-800'
                            : v.total_days > 15
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {v.total_days} días
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-emerald-700 bg-emerald-50/30">
                      {v.hr_days} d
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-amber-800 bg-amber-50/30">
                      <span
                        className={
                          v.supervisor_days > 15
                            ? 'text-red-700 font-black'
                            : v.supervisor_days > 3
                            ? 'text-amber-700'
                            : 'text-gray-500'
                        }
                      >
                        {v.supervisor_days} d
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {v.current_owner === 'supervisor' ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-300">
                          <PauseCircle className="w-3 h-3 text-amber-700" />
                          Jefe Directo (Pausado RRHH)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 font-bold text-[10px] px-2 py-0.5 rounded-full border border-blue-300">
                          <PlayCircle className="w-3 h-3 text-blue-700" />
                          RR.HH. en Búsqueda
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">
                      {v.candidate_in_process ? (
                        <span className="text-gray-900 font-bold">{v.candidate_in_process}</span>
                      ) : (
                        <span className="text-gray-400 italic">En captación...</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 max-w-xs truncate" title={v.observations || ''}>
                      {v.observations || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedVacancyForAction(v)}
                        className="px-2.5 py-1 bg-[#6B1D2F] hover:bg-[#521624] text-white font-bold text-[10px] rounded transition-colors"
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: GESTIONAR PLAZA Y PAUSAR RELOJ DE RRHH */}
        {selectedVacancyForAction && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedVacancyForAction(null)}
            title={`Gestión de Plaza No. ${selectedVacancyForAction.sequence_no}: ${selectedVacancyForAction.position_name}`}
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {selectedVacancyForAction.position_name}
                    </h4>
                    <p className="text-gray-600">
                      Jefe Directo: <strong>{selectedVacancyForAction.supervisor_name}</strong>
                    </p>
                    <p className="text-gray-500 mt-0.5">
                      Sustitución de: {selectedVacancyForAction.replacement_for}
                    </p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 font-black px-2 py-1 rounded">
                    Total: {selectedVacancyForAction.total_days} días
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-200 text-center">
                  <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                    <span className="text-emerald-800 font-bold block">Tiempo RR.HH.</span>
                    <span className="text-base font-black text-emerald-900">
                      {selectedVacancyForAction.hr_days} días
                    </span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded border border-amber-100">
                    <span className="text-amber-800 font-bold block">Esperando al Jefe</span>
                    <span className="text-base font-black text-amber-900">
                      {selectedVacancyForAction.supervisor_days} días
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón Acción Clave: Transferir Responsabilidad / Pausar Reloj */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                <span className="font-bold text-blue-900 block">
                  Control de Responsabilidad de la Vacante (SLA):
                </span>
                <p className="text-gray-600 text-[11px]">
                  {selectedVacancyForAction.current_owner === 'hr'
                    ? '¿Ya enviaste los candidatos o terna al jefe por correo? Pásale la cancha al jefe para pausar el reloj de RR.HH.'
                    : 'La cancha está actualmente del lado del Jefe Directo. El reloj de RR.HH. se encuentra pausado.'}
                </p>

                <div className="flex gap-2 pt-1">
                  {selectedVacancyForAction.current_owner === 'hr' ? (
                    <button
                      onClick={() => {
                        transferOwnership(selectedVacancyForAction.id, 'supervisor')
                        setSelectedVacancyForAction(null)
                      }}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                    >
                      <PauseCircle className="w-4 h-4" />
                      Pasar Cancha al Jefe (Pausar Reloj de RR.HH.)
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        transferOwnership(selectedVacancyForAction.id, 'hr')
                        setSelectedVacancyForAction(null)
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Regresar Cancha a RR.HH. (Reactivar Búsqueda)
                    </button>
                  )}
                </div>
              </div>

              {/* Cambiar Estado */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800 block">Cambiar Estatus de la Plaza:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      updateVacancyStatus(selectedVacancyForAction.id, 'EN_PRUEBA')
                      setSelectedVacancyForAction(null)
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"
                  >
                    Marcar Candidato en Prueba (2 meses)
                  </button>
                  <button
                    onClick={() => {
                      updateVacancyStatus(selectedVacancyForAction.id, 'CERRADA', 'Contratación formalizada')
                      setSelectedVacancyForAction(null)
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md"
                  >
                    Cerrar Plaza (Contratación Final)
                  </button>
                  <button
                    onClick={() => {
                      updateVacancyStatus(selectedVacancyForAction.id, 'CONGELADA', 'Plaza en espera por decisión de gerencia')
                      setSelectedVacancyForAction(null)
                    }}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-md"
                  >
                    Congelar Plaza
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* MODAL: NUEVA REQUISICIÓN DE PLAZA */}
        {isNewModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsNewModalOpen(false)}
            title="Crear Nueva Requisición de Plaza / Vacante"
          >
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nombre de la Plaza *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Panadero (a), Auxiliar de Bodega, Mensajero Repartidor..."
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Jefe Directo Solicitante *</label>
                  <select
                    value={newSupervisor}
                    onChange={(e) => setNewSupervisor(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none"
                  >
                    {supervisorsList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tipo de Vacante</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none"
                  >
                    <option value="Sustitución">Sustitución (Renuncia / Despido)</option>
                    <option value="Plaza Nueva">Plaza Nueva (Aumento de plantilla)</option>
                    <option value="Temporal">Temporal (Temporada navideña / evento)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nombre de Sustitución / Referencia
                </label>
                <input
                  type="text"
                  placeholder="Nombre de la persona que causó la baja o 'Plaza Nueva'..."
                  value={newReplacement}
                  onChange={(e) => setNewReplacement(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Observaciones / Ubicación</label>
                <textarea
                  rows={2}
                  placeholder="Ubicación: Zona 7, Centro 8, San Lucas, horario, etc..."
                  value={newObservations}
                  onChange={(e) => setNewObservations(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6B1D2F] hover:bg-[#521624] text-white font-bold rounded-lg shadow-sm"
                >
                  Registrar Requisición
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  )
}

