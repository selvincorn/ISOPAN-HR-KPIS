import React from 'react'

export interface CSVColumn<T> {
  header: string
  accessor: (item: T) => string | number | null | undefined
}

export function exportToCSV<T>(
  data: T[],
  filename: string,
  columns: CSVColumn<T>[]
) {
  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',')
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const val = col.accessor(item)
        if (val === null || val === undefined) return '""'
        return `"${String(val).replace(/"/g, '""')}"`
      })
      .join(',')
  )

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

interface ExecutiveHeaderProps {
  title: string
  subtitle: string
  reportCode?: string
  period?: string
  classification?: string
}

export const ExecutiveReportHeader: React.FC<ExecutiveHeaderProps> = ({
  title,
  subtitle,
  reportCode = 'ISOPAN-RH-INF-2026-11',
  period = 'Noviembre 2026',
  classification = 'CONFIDENCIAL GERENCIAL',
}) => {
  return (
    <div className="border-b-2 border-[#6B1D2F] pb-4 mb-6">
      {/* Top Banner with Logo and Document Control Block */}
      <div className="flex items-start justify-between gap-4">
        {/* Logo and Company Branding */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-white p-1 rounded-lg border border-gray-200 shadow-sm shrink-0 flex items-center justify-center">
            <img src="/isopan-logo.png" alt="ISOPAN S.A." className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-[#6B1D2F] tracking-tight">ISOPAN, S.A.</span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono font-bold">
                GUATEMALA
              </span>
            </div>
            <p className="text-xs font-bold text-gray-800">
              Gerencia de Recursos Humanos y Relaciones Laborales
            </p>
            <p className="text-[11px] text-gray-500">
              Planta Central Mixco | Sistema de Control y Auditoría de KPIs
            </p>
          </div>
        </div>

        {/* Document Control Table (Right) */}
        <div className="border border-gray-300 rounded-lg overflow-hidden text-[11px] bg-gray-50/50 min-w-[220px]">
          <div className="grid grid-cols-2 border-b border-gray-300">
            <span className="px-2 py-1 font-bold text-gray-600 bg-gray-100 border-r border-gray-300">
              Código Doc:
            </span>
            <span className="px-2 py-1 font-mono font-black text-gray-900">{reportCode}</span>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-300">
            <span className="px-2 py-1 font-bold text-gray-600 bg-gray-100 border-r border-gray-300">
              Período:
            </span>
            <span className="px-2 py-1 font-bold text-blue-900">{period}</span>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-300">
            <span className="px-2 py-1 font-bold text-gray-600 bg-gray-100 border-r border-gray-300">
              Fecha Emisión:
            </span>
            <span className="px-2 py-1 text-gray-700 font-medium">
              {new Date().toLocaleDateString('es-GT', { dateStyle: 'short' })}
            </span>
          </div>
          <div className="grid grid-cols-2">
            <span className="px-2 py-1 font-bold text-gray-600 bg-gray-100 border-r border-gray-300">
              Nivel:
            </span>
            <span className="px-2 py-1 font-bold text-red-700 text-[10px] tracking-wider uppercase">
              {classification}
            </span>
          </div>
        </div>
      </div>

      {/* Main Report Title Banner */}
      <div className="mt-4 pt-3 border-t border-gray-200 flex items-baseline justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">{title}</h1>
          <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold text-gray-500 italic">
          Valores auditados bajo legislación laboral vigente de Guatemala (GTQ)
        </span>
      </div>
    </div>
  )
}

export const ExecutiveReportFooter: React.FC = () => {
  return (
    <div className="mt-10 pt-4 border-t border-gray-300 text-xs text-gray-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <img src="/isopan-logo.png" alt="ISOPAN" className="h-4 w-4 object-contain" />
          <span className="font-bold text-gray-800">ISOPAN S.A.</span>
          <span>— Todos los derechos reservados.</span>
        </div>
        <div>
          <span>Documento generado oficialmente por el Sistema <strong>ISOPAN HR KPI Control</strong></span>
        </div>
        <div className="text-right font-mono font-bold text-gray-600">
          Página 1 de 1 | Copia Controlada
        </div>
      </div>
    </div>
  )
}

export const ExecutiveSignatures: React.FC = () => {
  return (
    <div className="mt-12 pt-6 border-t-2 border-dashed border-gray-300 break-inside-avoid">
      <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-6 text-center">
        Bloque Oficial de Aprobación y Responsabilidad Gerencial
      </p>

      <div className="grid grid-cols-3 gap-6 text-center text-xs">
        {/* Signature 1 */}
        <div className="flex flex-col items-center">
          <div className="w-full border-b border-gray-400 pb-12 mb-2" />
          <p className="font-bold text-gray-900 text-xs">Lic. Carlos Morales</p>
          <p className="text-[11px] text-gray-600 font-semibold">Analista de Compensaciones y Nómina</p>
          <p className="text-[10px] text-gray-400">Elaboró y Consolidó Datos</p>
        </div>

        {/* Signature 2 */}
        <div className="flex flex-col items-center">
          <div className="w-full border-b border-gray-400 pb-12 mb-2" />
          <p className="font-bold text-gray-900 text-xs">Licda. Andrea De León</p>
          <p className="text-[11px] text-gray-600 font-semibold">Gerente de Recursos Humanos</p>
          <p className="text-[10px] text-gray-400">Revisó y Dictaminó Indicadores</p>
        </div>

        {/* Signature 3 */}
        <div className="flex flex-col items-center">
          <div className="w-full border-b border-gray-400 pb-12 mb-2" />
          <p className="font-bold text-gray-900 text-xs">Ing. Roberto Santizo</p>
          <p className="text-[11px] text-gray-600 font-semibold">Director General de Operaciones</p>
          <p className="text-[10px] text-gray-400">Visto Bueno y Aprobación Final</p>
        </div>
      </div>
    </div>
  )
}
