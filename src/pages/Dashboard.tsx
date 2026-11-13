import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Users, Calendar, Plus, ExternalLink, ArrowRight, TrendingUp } from 'lucide-react'
import Layout from '../components/layout/Layout'
import DashboardSummary from '../components/dashboard/DashboardSummary'
import KPICard from '../components/dashboard/KPICard'
import TrendChart from '../components/dashboard/TrendChart'
import CutoffCountdown from '../components/supervisors/CutoffCountdown'
import SupervisorRanking from '../components/supervisors/SupervisorRanking'
import { useKPIs } from '../hooks/useKPIs'
import { useSupervisorData } from '../hooks/useSupervisorData'
import { MOCK_TRENDS_DATA } from '../lib/mockData'

export default function Dashboard() {
  const navigate = useNavigate()
  const [selectedYear, setSelectedYear] = useState(2026)
  const [selectedMonth, setSelectedMonth] = useState(11)

  const { kpiDefinitions, kpiRecords, kpiSummary, loading } = useKPIs(selectedYear, selectedMonth)
  const { ranking } = useSupervisorData(selectedYear, selectedMonth)

  // Show top 8 critical KPIs on main executive dashboard
  const topKPIs = kpiDefinitions.slice(0, 8)

  return (
    <Layout title="Dashboard Ejecutivo de RR.HH.">
      <div className="space-y-6">
        {/* Top Control Bar: Period & Quick Nav */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              ISOPAN HR KPI Control — Panel de Mando
            </h2>
            <p className="text-xs text-gray-500">
              Monitoreo predictivo de indicadores, costos de planilla y gestión de supervisores
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Período: Noviembre 2026</span>
            </div>
            <button
              onClick={() => navigate('/kpis')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1"
            >
              <Target className="w-3.5 h-3.5" />
              Matriz Completa (16 KPIs)
            </button>
          </div>
        </div>

        {/* Real-time Payroll Cutoff Countdown Banner */}
        <CutoffCountdown />

        {/* Global Executive Status Summary */}
        <DashboardSummary summary={kpiSummary} />

        {/* Executive KPI Grid (Top 8 Core Indicators) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Indicadores Prioritarios de Gestión
              </h3>
              <p className="text-xs text-gray-500">
                Monitoreo en tiempo real de los KPIs de mayor impacto en costos y continuidad operativa
              </p>
            </div>
            <button
              onClick={() => navigate('/kpis')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
            >
              Ver los 16 Indicadores <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topKPIs.map((kpi) => {
              const record = kpiRecords.find((r) => r.kpi_definition_id === kpi.id)
              return <KPICard key={kpi.id} kpi={kpi} record={record} />
            })}
          </div>
        </div>

        {/* 4 Executive Trend Charts (6-month history) */}
        <div>
          <div className="mb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Tendencias Históricas Clave (Junio - Noviembre 2026)
            </h3>
            <p className="text-xs text-gray-500">
              Comportamiento mensual versus meta aprobada para control predictivo de desviaciones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TrendChart
              title="Índice de Rotación de Personal (%)"
              description="Meta mensual: &le; 3.0% sobre headcount promedio"
              unit="%"
              data={MOCK_TRENDS_DATA.rotacion}
            />
            <TrendChart
              title="Índice de Ausentismo No Justificado (%)"
              description="Meta semanal: &le; 2.5% de horas programadas"
              unit="%"
              data={MOCK_TRENDS_DATA.ausentismo}
            />
            <TrendChart
              title="Costo Total de Nómina (GTQ)"
              description="Meta mensual: &le; Q 850,000.00 presupuestados"
              unit="Q"
              data={MOCK_TRENDS_DATA.costoNomina}
            />
            <TrendChart
              title="Horas Extras s/ Horas Ordinarias (%)"
              description="Meta: &le; 5.0% de horas ordinarias trabajadas"
              unit="%"
              data={MOCK_TRENDS_DATA.horasExtras}
            />
          </div>
        </div>

        {/* Leading Indicators: Supervisor Pre-Closing Ranking */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Desempeño y Control de Jefes Inmediatos (Leading Indicators)
              </h3>
              <p className="text-xs text-gray-500">
                Calificación anticipada que previene retrasos y reprocesos en el cierre de planilla
              </p>
            </div>
            <button
              onClick={() => navigate('/supervisors')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
            >
              Ir al Portal de Supervisores <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <SupervisorRanking ranking={ranking} />
        </div>
      </div>
    </Layout>
  )
}
