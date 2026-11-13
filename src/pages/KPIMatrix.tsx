import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target,
  Search,
  Filter,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import KPICard from '../components/dashboard/KPICard'
import StatusBadge from '../components/dashboard/StatusBadge'
import Modal from '../components/ui/Modal'
import KPIRecordForm from '../components/kpis/KPIRecordForm'
import { useKPIs } from '../hooks/useKPIs'
import type { Frequency, KPIStatus } from '../types/kpi'
import type { KPIDefinition } from '../types/database'
import { formatCurrency, formatPercent } from '../lib/utils'
import { exportToCSV } from '../components/reports/ReportExport'

export default function KPIMatrix() {
  const navigate = useNavigate()
  const { kpiDefinitions, kpiRecords, kpiSummary, saveKPIRecord } = useKPIs()

  const [frequencyFilter, setFrequencyFilter] = useState<Frequency | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<KPIStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // Modal to record KPI
  const [selectedKpiForRecord, setSelectedKpiForRecord] = useState<KPIDefinition | null>(null)

  // Filtered KPIs
  const filteredKPIs = kpiDefinitions.filter((kpi) => {
    const matchesFreq = frequencyFilter === 'all' || kpi.frequency === frequencyFilter
    const record = kpiRecords.find((r) => r.kpi_definition_id === kpi.id)
    const matchesStatus = statusFilter === 'all' || (record && record.status === statusFilter)
    const matchesSearch =
      !search ||
      kpi.name.toLowerCase().includes(search.toLowerCase()) ||
      kpi.code.toLowerCase().includes(search.toLowerCase()) ||
      (kpi.category && kpi.category.toLowerCase().includes(search.toLowerCase())) ||
      (kpi.responsible_role && kpi.responsible_role.toLowerCase().includes(search.toLowerCase()))

    return matchesFreq && matchesStatus && matchesSearch
  })

  const formatValue = (val: number, unit: string) => {
    if (unit === 'Q') return formatCurrency(val)
    if (unit === '%') return formatPercent(val)
    return `${val.toLocaleString()} ${unit}`
  }

  const handleExportCSV = () => {
    exportToCSV(
      filteredKPIs.map((k) => {
        const rec = kpiRecords.find((r) => r.kpi_definition_id === k.id)
        return {
          code: k.code,
          name: k.name,
          category: k.category,
          frequency: k.frequency,
          target: `${k.target_operator} ${k.target_value} ${k.target_unit}`,
          actual: rec ? `${rec.actual_value} ${k.target_unit}` : 'N/A',
          variance: rec ? `${rec.variance} ${k.target_unit}` : 'N/A',
          status: rec?.status ?? 'N/A',
          responsible: k.responsible_role,
        }
      }),
      'Matriz_16_KPIs_ISOPAN',
      [
        { header: 'Código', accessor: (i) => i.code },
        { header: 'Indicador', accessor: (i) => i.name },
        { header: 'Categoría', accessor: (i) => i.category },
        { header: 'Frecuencia', accessor: (i) => i.frequency },
        { header: 'Meta', accessor: (i) => i.target },
        { header: 'Resultado Real', accessor: (i) => i.actual },
        { header: 'Variación', accessor: (i) => i.variance },
        { header: 'Estado', accessor: (i) => i.status },
        { header: 'Responsable', accessor: (i) => i.responsible },
      ]
    )
  }

  return (
    <Layout title="Ficha Maestra de los 16 KPIs de RR.HH.">
      <div className="space-y-5">
        {/* Top Header Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Catálogo Integral de Indicadores Laborales y RR.HH.
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Ficha de control estructurada con 9 campos obligatorios, cálculo automatizado y auditoría de variaciones
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Exportar Matriz (CSV)
            </button>
            <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                  viewMode === 'table' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vista Tabla"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vista Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por código, indicador, categoría o responsable..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos ({kpiDefinitions.length})
              </button>
              <button
                onClick={() => setStatusFilter('green')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  statusFilter === 'green'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> En Meta ({kpiSummary.green})
              </button>
              <button
                onClick={() => setStatusFilter('yellow')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  statusFilter === 'yellow'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Alerta ({kpiSummary.yellow})
              </button>
              <button
                onClick={() => setStatusFilter('red')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  statusFilter === 'red'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" /> Desviación ({kpiSummary.red})
              </button>
            </div>
          </div>

          {/* Frequency Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="font-semibold text-gray-500">Frecuencia:</span>
            {(
              [
                { id: 'all', label: 'Todas las Frecuencias' },
                { id: 'weekly', label: 'Semanal (3)' },
                { id: 'monthly', label: 'Mensual (12)' },
                { id: 'semi_annual', label: 'Semestral (1)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFrequencyFilter(tab.id as Frequency | 'all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  frequencyFilter === tab.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredKPIs.map((kpi) => {
              const record = kpiRecords.find((r) => r.kpi_definition_id === kpi.id)
              return <KPICard key={kpi.id} kpi={kpi} record={record} />
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 uppercase font-bold border-b border-gray-200 tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-16">Código</th>
                    <th className="py-3 px-4">Indicador de RR.HH.</th>
                    <th className="py-3 px-3">Frecuencia</th>
                    <th className="py-3 px-3 text-right">Meta</th>
                    <th className="py-3 px-3 text-right">Resultado Real</th>
                    <th className="py-3 px-3 text-right">Variación</th>
                    <th className="py-3 px-3 text-center">Semáforo</th>
                    <th className="py-3 px-4">Responsable</th>
                    <th className="py-3 px-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredKPIs.map((kpi) => {
                    const record = kpiRecords.find((r) => r.kpi_definition_id === kpi.id)
                    const actual = record?.actual_value ?? 0
                    const target = kpi.target_value
                    const variance = record?.variance ?? (actual - target)
                    const status = record?.status ?? 'green'

                    const isFavorable =
                      (kpi.target_operator === '<=' && actual <= target) ||
                      (kpi.target_operator === '>=' && actual >= target) ||
                      (kpi.target_operator === '=' && actual === target)

                    return (
                      <tr
                        key={kpi.id}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/kpis/${kpi.id}`)}
                      >
                        <td className="py-3 px-3 font-black text-blue-900">
                          <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            {kpi.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900 text-sm">{kpi.name}</p>
                          <p className="text-gray-500 text-[11px] mt-0.5">{kpi.category}</p>
                        </td>
                        <td className="py-3 px-3 text-gray-600 font-medium">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                            {kpi.frequency === 'weekly'
                              ? 'Semanal'
                              : kpi.frequency === 'monthly'
                              ? 'Mensual'
                              : 'Semestral'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-gray-700">
                          {kpi.target_operator} {formatValue(target, kpi.target_unit)}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-gray-900 text-sm">
                          {record ? formatValue(actual, kpi.target_unit) : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-bold">
                          {record ? (
                            <span
                              className={`inline-flex items-center gap-0.5 ${
                                isFavorable ? 'text-emerald-700' : 'text-red-600'
                              }`}
                            >
                              {variance > 0 ? `+${variance}` : variance} {kpi.target_unit}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <StatusBadge status={status} />
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-[11px]">
                          {kpi.responsible_role}
                        </td>
                        <td
                          className="py-3 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedKpiForRecord(kpi)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold rounded-md transition-colors"
                          >
                            Registrar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Record KPI Form */}
        {selectedKpiForRecord && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedKpiForRecord(null)}
            title="Registrar / Actualizar Valor de Indicador"
          >
            <KPIRecordForm
              kpi={selectedKpiForRecord}
              onClose={() => setSelectedKpiForRecord(null)}
              onSubmit={async (val, notes, week) => {
                await saveKPIRecord(selectedKpiForRecord.id, val, notes, week)
              }}
            />
          </Modal>
        )}
      </div>
    </Layout>
  )
}
