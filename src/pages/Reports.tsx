import React, { useState } from 'react'
import {
  FileBarChart,
  Printer,
  FileSpreadsheet,
  Target,
  Users,
  AlertTriangle,
  TrendingUp,
  FileText,
  DollarSign,
  ShieldCheck,
  Briefcase,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import StatusBadge from '../components/dashboard/StatusBadge'
import { useKPIs } from '../hooks/useKPIs'
import { useSupervisorData } from '../hooks/useSupervisorData'
import { useVacancies } from '../hooks/useVacancies'
import {
  exportToCSV,
  ExecutiveReportHeader,
  ExecutiveReportFooter,
  ExecutiveSignatures,
} from '../components/reports/ReportExport'
import { formatCurrency, formatPercent } from '../lib/utils'
import { MOCK_CORRECTIVE_ACTIONS } from '../lib/mockData'

export default function Reports() {
  const [reportType, setReportType] = useState<'kpi_summary' | 'supervisors' | 'actions' | 'vacancies'>(
    'kpi_summary'
  )
  const { kpiDefinitions, kpiRecords, kpiSummary } = useKPIs()
  const { ranking } = useSupervisorData()
  const { vacancies, slaAnalysis } = useVacancies()

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    if (reportType === 'kpi_summary') {
      exportToCSV(
        kpiDefinitions.map((k) => {
          const rec = kpiRecords.find((r) => r.kpi_definition_id === k.id)
          return {
            codigo: k.code,
            indicador: k.name,
            frecuencia: k.frequency,
            meta: `${k.target_operator} ${k.target_value} ${k.target_unit}`,
            real: rec ? `${rec.actual_value} ${k.target_unit}` : 'N/A',
            variacion: rec ? `${rec.variance} ${k.target_unit}` : 'N/A',
            estado: rec?.status ?? 'N/A',
            responsable: k.responsible_role,
          }
        }),
        'Informe_Ejecutivo_16_KPIs_ISOPAN',
        [
          { header: 'Código', accessor: (i) => i.codigo },
          { header: 'Indicador', accessor: (i) => i.indicador },
          { header: 'Frecuencia', accessor: (i) => i.frecuencia },
          { header: 'Meta', accessor: (i) => i.meta },
          { header: 'Resultado Real', accessor: (i) => i.real },
          { header: 'Variación', accessor: (i) => i.variacion },
          { header: 'Estado', accessor: (i) => i.estado },
          { header: 'Responsable', accessor: (i) => i.responsable },
        ]
      )
    } else if (reportType === 'supervisors') {
      exportToCSV(
        ranking.map((s, idx) => ({
          posicion: idx + 1,
          supervisor: s.supervisor_name,
          departamento: s.department_name,
          cierre: `${s.payroll_closure_pct}%`,
          biometrico: `${s.biometric_justification_pct}%`,
          entrevistas: `${s.interview_response_days} días`,
          puntaje: s.overall_score,
          estado: s.status,
        })),
        'Auditoria_Jefes_Inmediatos_ISOPAN',
        [
          { header: 'Posición', accessor: (i) => i.posicion },
          { header: 'Supervisor', accessor: (i) => i.supervisor },
          { header: 'Departamento', accessor: (i) => i.departamento },
          { header: 'Cierre Planilla %', accessor: (i) => i.cierre },
          { header: 'Biométrico <24h %', accessor: (i) => i.biometrico },
          { header: 'Resp. Entrevistas (días)', accessor: (i) => i.entrevistas },
          { header: 'Puntuación Global', accessor: (i) => i.puntaje },
          { header: 'Semáforo', accessor: (i) => i.estado },
        ]
      )
    } else if (reportType === 'vacancies') {
      exportToCSV(
        vacancies.map((v) => ({
          no: v.sequence_no,
          jefe: v.supervisor_name,
          plaza: v.position_name,
          sustitucion: v.replacement_for || 'Plaza Nueva',
          estatus: v.status,
          totalDias: v.total_days,
          diasRH: v.hr_days,
          diasJefe: v.supervisor_days,
          balon: v.current_owner === 'supervisor' ? 'Jefe Directo (Esperando respuesta)' : 'RR.HH.',
          candidato: v.candidate_in_process || 'N/A',
          observaciones: v.observations || '',
        })),
        'Auditoria_SLA_Vacantes_Jefaturas_ISOPAN',
        [
          { header: 'No.', accessor: (i) => i.no },
          { header: 'Jefe Directo', accessor: (i) => i.jefe },
          { header: 'Plaza Requerida', accessor: (i) => i.plaza },
          { header: 'Sustitución / Plaza Nueva', accessor: (i) => i.sustitucion },
          { header: 'Estatus', accessor: (i) => i.estatus },
          { header: 'Días Totales', accessor: (i) => `${i.totalDias} días` },
          { header: 'Días RR.HH.', accessor: (i) => `${i.diasRH} días` },
          { header: 'Días Espera Jefe', accessor: (i) => `${i.diasJefe} días` },
          { header: 'Balón / Responsable Actual', accessor: (i) => i.balon },
          { header: 'Candidato en Prueba / Entrevista', accessor: (i) => i.candidato },
          { header: 'Observaciones', accessor: (i) => i.observaciones },
        ]
      )
    } else if (reportType === 'actions') {
      exportToCSV(
        MOCK_CORRECTIVE_ACTIONS.map((ca) => ({
          kpi: `${ca.kpi_code} — ${ca.kpi_name}`,
          descripcion: ca.description,
          fechaCompromiso: ca.due_date,
          estado: ca.status,
          evidencia: ca.evidence_notes || '',
        })),
        'Acciones_Correctivas_Auditoria_ISOPAN',
        [
          { header: 'Indicador', accessor: (i) => i.kpi },
          { header: 'Plan de Acción Correctiva', accessor: (i) => i.descripcion },
          { header: 'Fecha Límite', accessor: (i) => i.fechaCompromiso },
          { header: 'Estado', accessor: (i) => i.estado },
          { header: 'Evidencia', accessor: (i) => i.evidencia },
        ]
      )
    }
  }

  const complianceRate =
    kpiDefinitions.length > 0 ? Math.round((kpiSummary.green / kpiDefinitions.length) * 100) : 0

  return (
    <Layout title="Centro de Reportes Gerenciales">
      <div className="space-y-6">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white p-1 border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
              <img src="/isopan-logo.png" alt="ISOPAN" className="h-full w-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-[#6B1D2F]" />
                Emisión de Informes Ejecutivos Oficiales
              </h2>
              <p className="text-xs text-gray-500">
                Formato institucional membretado para presentación a Dirección General y Comité de Auditoría
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar Datos (CSV)
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#6B1D2F] hover:bg-[#521624] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Printer className="w-4 h-4" /> Imprimir / Guardar en PDF
            </button>
          </div>
        </div>

        {/* Report Selector Pills (Hidden when printing) */}
        <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setReportType('kpi_summary')}
            className={`p-4 rounded-xl border text-left transition-all ${
              reportType === 'kpi_summary'
                ? 'bg-red-50/70 border-[#6B1D2F] shadow-sm'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Target className="w-5 h-5 text-[#6B1D2F] mb-2" />
            <h4 className="font-bold text-gray-900 text-sm">1. Dictamen de 16 KPIs</h4>
            <p className="text-xs text-gray-500 mt-1">
              Estado de metas, resultados reales y variaciones.
            </p>
          </button>

          <button
            onClick={() => setReportType('supervisors')}
            className={`p-4 rounded-xl border text-left transition-all ${
              reportType === 'supervisors'
                ? 'bg-red-50/70 border-[#6B1D2F] shadow-sm'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5 text-[#6B1D2F] mb-2" />
            <h4 className="font-bold text-gray-900 text-sm">2. Auditoría de Jefes</h4>
            <p className="text-xs text-gray-500 mt-1">
              Pre-cierre de planilla, marcajes y entrevistas.
            </p>
          </button>

          <button
            onClick={() => setReportType('vacancies')}
            className={`p-4 rounded-xl border text-left transition-all ${
              reportType === 'vacancies'
                ? 'bg-red-50/70 border-[#6B1D2F] shadow-sm'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="w-5 h-5 text-[#6B1D2F] mb-2" />
            <h4 className="font-bold text-gray-900 text-sm">3. Plazas y SLA de Jefes</h4>
            <p className="text-xs text-gray-500 mt-1">
              Auditoría de 31 plazas y retraso por falta de respuesta.
            </p>
          </button>

          <button
            onClick={() => setReportType('actions')}
            className={`p-4 rounded-xl border text-left transition-all ${
              reportType === 'actions'
                ? 'bg-red-50/70 border-[#6B1D2F] shadow-sm'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 mb-2" />
            <h4 className="font-bold text-gray-900 text-sm">4. Acciones Correctivas</h4>
            <p className="text-xs text-gray-500 mt-1">
              Planes de acción por desviaciones de meta.
            </p>
          </button>
        </div>

        {/* =========================================================================
            HOJA MEMBRETADA GERENCIAL (DOCUMENTO EJECUTIVO DE IMPRESIÓN Y VISTA PREVIA)
            ========================================================================= */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:m-0 max-w-5xl mx-auto">
          {/* Membrete Oficial */}
          <ExecutiveReportHeader
            title={
              reportType === 'kpi_summary'
                ? 'INFORME MENSUAL DE RESULTADOS: 16 INDICADORES DE GESTIÓN HUMANA'
                : reportType === 'supervisors'
                ? 'AUDITORÍA PREDICTIVA DE CUMPLIMIENTO POR LÍDER DE ÁREA (PRE-CIERRE PLANILLA)'
                : reportType === 'vacancies'
                ? 'AUDITORÍA DE GESTIÓN DE VACANTES Y CUMPLIMIENTO SLA DE JEFATURAS (31 PLAZAS)'
                : 'MATRIZ DE SEGUIMIENTO A PLANES DE ACCIÓN CORRECTIVA Y DESVIACIONES CRÍTICAS'
            }
            subtitle="Compañía de Alimentos ISOPAN S.A. | Planta Central Mixco, Guatemala"
            period="Noviembre 2026"
            reportCode={
              reportType === 'kpi_summary'
                ? 'ISOPAN-RH-REP-2026-11'
                : reportType === 'supervisors'
                ? 'ISOPAN-RH-AUD-2026-11'
                : reportType === 'vacancies'
                ? 'ISOPAN-RH-VAC-2026-11'
                : 'ISOPAN-RH-PAC-2026-11'
            }
          />

          {/* Resumen Ejecutivo C-Level (Cards con borde vino tinto) */}
          {reportType === 'vacancies' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="p-3.5 bg-gray-50 rounded-xl border-t-4 border-[#6B1D2F] border-x border-b border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Plazas Activas</span>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{vacancies.length}</p>
                <span className="text-[10px] text-gray-500 font-medium">Reclutamiento 2026</span>
              </div>

              <div className="p-3.5 bg-red-50/60 rounded-xl border-t-4 border-red-600 border-x border-b border-red-200">
                <span className="text-[10px] uppercase font-bold text-red-800 block">Plazas Críticas (&gt; 15 días)</span>
                <p className="text-2xl font-black text-red-700 mt-0.5">{slaAnalysis.criticalCount}</p>
                <span className="text-[10px] text-red-700 font-bold">Fuera de SLA corporativo</span>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-xl border-t-4 border-amber-600 border-x border-b border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-900 block">% Retraso por Jefaturas</span>
                <p className="text-2xl font-black text-amber-700 mt-0.5">{slaAnalysis.supervisorDelayPct}%</p>
                <span className="text-[10px] text-amber-800 font-bold">Falta de respuesta/entrevistas</span>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border-t-4 border-emerald-600 border-x border-b border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Tiempo Eficaz RR.HH.</span>
                <p className="text-2xl font-black text-emerald-700 mt-0.5">{slaAnalysis.avgHRDays} días</p>
                <span className="text-[10px] text-emerald-700 font-bold">Dentro de meta (&le; 15 días)</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="p-3.5 bg-gray-50 rounded-xl border-t-4 border-[#6B1D2F] border-x border-b border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Indicadores</span>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{kpiDefinitions.length}</p>
                <span className="text-[10px] text-gray-500 font-medium">100% Auditados</span>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border-t-4 border-emerald-600 border-x border-b border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Cumplen Meta (Verde)</span>
                <p className="text-2xl font-black text-emerald-700 mt-0.5">{kpiSummary.green}</p>
                <span className="text-[10px] text-emerald-700 font-bold">{complianceRate}% Eficacia Global</span>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-xl border-t-4 border-amber-500 border-x border-b border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">En Alerta (Amarillo)</span>
                <p className="text-2xl font-black text-amber-700 mt-0.5">{kpiSummary.yellow}</p>
                <span className="text-[10px] text-amber-700 font-semibold">&le; 10% Tolerancia</span>
              </div>

              <div className="p-3.5 bg-red-50/60 rounded-xl border-t-4 border-red-600 border-x border-b border-red-200">
                <span className="text-[10px] uppercase font-bold text-red-800 block">Desviación Crítica (Rojo)</span>
                <p className="text-2xl font-black text-red-700 mt-0.5">{kpiSummary.red}</p>
                <span className="text-[10px] text-red-700 font-bold">Requieren Plan de Acción</span>
              </div>
            </div>
          )}

          {/* Dictamen Analítico Institucional */}
          <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 text-xs mb-8 text-gray-700 leading-relaxed">
            {reportType === 'vacancies' ? (
              <>
                <strong className="text-gray-900 uppercase tracking-wide block mb-1">
                  Dictamen Forense de Reclutamiento y Tiempos de Respuesta (SLA Operativo):
                </strong>
                <p>
                  El análisis forense de las <strong>{vacancies.length} plazas activas</strong> revela que el{' '}
                  <strong>{slaAnalysis.supervisorDelayPct}% del tiempo acumulado de demora</strong> (promedio de{' '}
                  <strong>{slaAnalysis.avgSupervisorDays} días por vacante</strong>) corresponde a tiempo muerto
                  esperando respuesta, confirmación de terna o evaluación técnica de los <strong>jefes inmediatos</strong>.
                  El equipo de Reclutamiento y Selección de Recursos Humanos completó su ciclo de reclutamiento,
                  evaluación psicométrica y envío de expedientes en un promedio de <strong>{slaAnalysis.avgHRDays} días</strong>{' '}
                  (plenamente dentro del umbral corporativo de &le; 15 días). En consecuencia, <strong>el desfase en el KPI de
                  Tiempo de Contratación no constituye negligencia de RR.HH.</strong>, sino un cuello de botella atribuible a las
                  jefaturas operativas solicitantes.
                </p>
              </>
            ) : (
              <>
                <strong className="text-gray-900 uppercase tracking-wide block mb-1">
                  Dictamen de la Gerencia de Recursos Humanos y Auditoría Interna:
                </strong>
                <p>
                  Durante el período de <strong>Noviembre 2026</strong>, el Departamento de Recursos Humanos de
                  ISOPAN S.A. alcanzó una efectividad consolidada del <strong>{complianceRate}%</strong> en sus
                  indicadores de gestión. Destaca el cumplimiento documental al 100% de expedientes con
                  tarjetas de salud vigentes y una contención efectiva de la rotación voluntaria en líneas de pan
                  francés y molde. Se mantiene monitoreo prioritario sobre el costo total de horas extras derivado
                  del pico de producción de fin de año, coordinando planes de acción con los supervisores de turno.
                </p>
              </>
            )}
          </div>

          {/* TABLA PRINCIPAL DEL REPORTE 1: 16 KPIS */}
          {reportType === 'kpi_summary' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
                  <thead className="bg-[#1e3a5f] text-white uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 w-16">Código</th>
                      <th className="py-2.5 px-3">Indicador Clave de RR.HH.</th>
                      <th className="py-2.5 px-2 text-center">Frecuencia</th>
                      <th className="py-2.5 px-3 text-right">Meta Pactada</th>
                      <th className="py-2.5 px-3 text-right">Resultado Real</th>
                      <th className="py-2.5 px-3 text-right">Variación</th>
                      <th className="py-2.5 px-2 text-center">Estado</th>
                      <th className="py-2.5 px-3">Responsable Operativo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-[11px]">
                    {kpiDefinitions.map((kpi, idx) => {
                      const record = kpiRecords.find((r) => r.kpi_definition_id === kpi.id)
                      const actual = record?.actual_value ?? 0
                      const target = kpi.target_value
                      const variance = record?.variance ?? (actual - target)
                      const status = record?.status ?? 'green'

                      const isFavorable =
                        (kpi.target_operator === '<=' && actual <= target) ||
                        (kpi.target_operator === '>=' && actual >= target) ||
                        (kpi.target_operator === '=' && actual === target)

                      const formatVal = (val: number) => {
                        if (kpi.target_unit === 'Q') return formatCurrency(val)
                        if (kpi.target_unit === '%') return formatPercent(val)
                        return `${val.toLocaleString()} ${kpi.target_unit}`
                      }

                      return (
                        <tr key={kpi.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
                          <td className="py-2 px-3 font-mono font-black text-gray-900">{kpi.code}</td>
                          <td className="py-2 px-3 font-bold text-gray-900">{kpi.name}</td>
                          <td className="py-2 px-2 text-center text-gray-600 capitalize">
                            {kpi.frequency === 'weekly'
                              ? 'Semanal'
                              : kpi.frequency === 'monthly'
                              ? 'Mensual'
                              : 'Semestral'}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-gray-700">
                            {kpi.target_operator} {formatVal(target)}
                          </td>
                          <td className="py-2 px-3 text-right font-black text-gray-900">
                            {record ? formatVal(actual) : '—'}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-bold ${
                              isFavorable ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {record ? `${variance > 0 ? `+${variance}` : variance} ${kpi.target_unit}` : '—'}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                status === 'green'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : status === 'yellow'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {status === 'green' ? 'Cumple' : status === 'yellow' ? 'Alerta' : 'Desviación'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-gray-600 truncate max-w-[150px]">
                            {kpi.responsible_role}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABLA DEL REPORTE 2: SUPERVISORES */}
          {reportType === 'supervisors' && (
            <div className="space-y-6">
              <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
                <thead className="bg-[#1e3a5f] text-white uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">Pos.</th>
                    <th className="py-2.5 px-3">Líder de Área</th>
                    <th className="py-2.5 px-3">Departamento</th>
                    <th className="py-2.5 px-3 text-center">Cierre Planilla</th>
                    <th className="py-2.5 px-3 text-center">Biométrico &lt; 24h</th>
                    <th className="py-2.5 px-3 text-center">Resp. Entrevistas</th>
                    <th className="py-2.5 px-3 text-center">Puntaje Global</th>
                    <th className="py-2.5 px-2 text-center">Calificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-[11px]">
                  {ranking.map((s, idx) => (
                    <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
                      <td className="py-2 px-3 text-center font-black">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-gray-900">{s.supervisor_name}</td>
                      <td className="py-2 px-3 text-gray-700">{s.department_name}</td>
                      <td className="py-2 px-3 text-center font-medium">{s.payroll_closure_pct}%</td>
                      <td className="py-2 px-3 text-center">{s.biometric_justification_pct}%</td>
                      <td className="py-2 px-3 text-center">{s.interview_response_days} días</td>
                      <td className="py-2 px-3 text-center font-black text-blue-900 text-xs">
                        {s.overall_score} pts
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.status === 'green'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'yellow'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {s.status === 'green' ? 'Excelente' : s.status === 'yellow' ? 'Regular' : 'Crítico'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLA DEL REPORTE 3: VACANTES Y SLA DE JEFES */}
          {reportType === 'vacancies' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
                  <thead className="bg-[#1e3a5f] text-white uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-2 text-center w-10">No.</th>
                      <th className="py-2.5 px-3">Jefe Directo</th>
                      <th className="py-2.5 px-3">Nombre de la Plaza</th>
                      <th className="py-2.5 px-3">Sustitución / Plaza Nueva</th>
                      <th className="py-2.5 px-2 text-center">Estatus</th>
                      <th className="py-2.5 px-2 text-center">Total Días</th>
                      <th className="py-2.5 px-2 text-center text-emerald-300">Días RR.HH.</th>
                      <th className="py-2.5 px-2 text-center text-amber-300">Espera Jefe</th>
                      <th className="py-2.5 px-2 text-center">Balón / SLA</th>
                      <th className="py-2.5 px-3">Candidato en Prueba</th>
                      <th className="py-2.5 px-3">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-[11px]">
                    {vacancies.map((v, idx) => (
                      <tr key={v.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
                        <td className="py-2 px-2 text-center font-mono font-bold text-gray-500">
                          {v.sequence_no}
                        </td>
                        <td className="py-2 px-3 font-bold text-gray-900 whitespace-nowrap">
                          {v.supervisor_name}
                        </td>
                        <td className="py-2 px-3 font-semibold text-gray-900">{v.position_name}</td>
                        <td className="py-2 px-3 text-gray-600 italic">
                          {v.replacement_for ? v.replacement_for : 'Plaza Nueva'}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              v.status === 'VIGENTE'
                                ? 'bg-blue-100 text-blue-800'
                                : v.status === 'EN_PRUEBA'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-black text-gray-900">
                          <span
                            className={
                              v.total_days > 30
                                ? 'text-red-700 font-black'
                                : v.total_days > 15
                                ? 'text-amber-700 font-bold'
                                : 'text-gray-900'
                            }
                          >
                            {v.total_days} d
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30">
                          {v.hr_days} d
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-amber-800 bg-amber-50/30">
                          {v.supervisor_days} d
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                              v.current_owner === 'supervisor'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {v.current_owner === 'supervisor' ? 'Jefe (En espera)' : 'RR.HH.'}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium text-gray-800">
                          {v.candidate_in_process || <span className="text-gray-400 italic">Sin candidato</span>}
                        </td>
                        <td className="py-2 px-3 text-gray-600 text-[10px] max-w-[200px] truncate">
                          {v.observations || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABLA DEL REPORTE 4: ACCIONES CORRECTIVAS */}
          {reportType === 'actions' && (
            <div className="space-y-4">
              <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
                <thead className="bg-[#1e3a5f] text-white uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-28">Indicador</th>
                    <th className="py-2.5 px-4">Plan de Acción Correctiva</th>
                    <th className="py-2.5 px-3 text-center">Fecha Límite</th>
                    <th className="py-2.5 px-2 text-center">Estado</th>
                    <th className="py-2.5 px-4">Evidencia y Criterio de Verificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-[11px]">
                  {MOCK_CORRECTIVE_ACTIONS.map((ca, idx) => (
                    <tr key={ca.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
                      <td className="py-2 px-3 font-bold text-gray-900">{ca.kpi_code}</td>
                      <td className="py-2 px-4 font-semibold text-gray-800">{ca.description}</td>
                      <td className="py-2 px-3 text-center font-mono font-medium">{ca.due_date}</td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ca.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ca.status === 'completed' ? 'Cerrada' : 'En Curso'}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-gray-600 italic">{ca.evidence_notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bloque Oficial de Firmas Tripartitas */}
          <ExecutiveSignatures />

          {/* Pie de Página Institucional */}
          <ExecutiveReportFooter />
        </div>
      </div>
    </Layout>
  )
}
