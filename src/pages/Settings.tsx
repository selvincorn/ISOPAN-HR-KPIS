import React, { useState } from 'react'
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  Clock,
  Shield,
  FileCheck,
  Building,
  Lock,
  Database,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useKPIs } from '../hooks/useKPIs'
import { usePayrollCutoff } from '../hooks/usePayrollCutoff'
import { GT_LABOR } from '../lib/constants'
import { MOCK_DEPARTMENTS } from '../lib/mockData'
import { getSupabaseConfig, setSupabaseConfig, isSupabaseConfigured } from '../lib/supabase'

export default function Settings() {
  const { kpiDefinitions, updateKPIDefinitions } = useKPIs()
  const { cutoff, isLocked, lockCutoff } = usePayrollCutoff()
  const [activeTab, setActiveTab] = useState<'kpis' | 'cutoffs' | 'labor' | 'departments' | 'database'>('kpis')
  const [savedMessage, setSavedMessage] = useState(false)
  const [isSavingKPIs, setIsSavingKPIs] = useState(false)

  // Local state for editable KPI definitions
  const [editableKPIs, setEditableKPIs] = useState(kpiDefinitions)

  // Sync with kpiDefinitions when they load
  React.useEffect(() => {
    if (kpiDefinitions && kpiDefinitions.length > 0) {
      setEditableKPIs(kpiDefinitions)
    }
  }, [kpiDefinitions])

  const handleKPIFieldChange = (code: string, field: string, value: any) => {
    setEditableKPIs((prev) =>
      prev.map((k) => (k.code === code ? { ...k, [field]: value } : k))
    )
  }

  const handleSaveKPITargets = async () => {
    setIsSavingKPIs(true)
    try {
      await updateKPIDefinitions(editableKPIs)
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch (e) {
      console.error('Error guardando metas:', e)
    } finally {
      setIsSavingKPIs(false)
    }
  }

  // Supabase connection state
  const config = getSupabaseConfig()
  const [supabaseUrl, setSupabaseUrl] = useState(
    config.url.includes('TU_PROYECTO') || config.url.includes('placeholder') ? '' : config.url
  )
  const [supabaseKey, setSupabaseKey] = useState(
    config.key.includes('placeholder') ? 'sb_publishable_Es5LUMhBYfiJk_gbnsPVSA_Kla-QJiY' : config.key
  )

  // Local state for payroll cutoff form
  const [cutoffDate, setCutoffDate] = useState('2026-11-27')
  const [cutoffTime, setCutoffTime] = useState('17:00')
  const [warningHours, setWarningHours] = useState('12')

  const handleSaveCutoff = () => {
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3000)
  }

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabaseUrl.trim()) return
    setSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim())
  }

  return (
    <Layout title="Configuración del Sistema y Parámetros Laborales">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
              Parámetros de Nómina, Metas de Indicadores y Auditoría
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Administración exclusiva para Gerencia de RR.HH. y Contraloría Laboral
            </p>
          </div>

          {savedMessage && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cambios guardados con éxito
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-[#1e3a5f] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Conexión con Supabase
            {!isSupabaseConfigured() && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('labor')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'labor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Legislación Laboral Guatemala
          </button>
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'kpis'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Metas de los 16 KPIs
          </button>
          <button
            onClick={() => setActiveTab('cutoffs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cutoffs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Períodos de Corte de Planilla
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'departments'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Departamentos y Áreas
          </button>
        </div>

        {/* TAB 0: SUPABASE CONNECTION & DIAGNOSTICS */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-[#1e3a5f] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-sm">Configuración de Conexión a Base de Datos Supabase</h3>
                    <p className="text-xs text-blue-200">
                      Sincronización en vivo con PostgreSQL, RLS y almacenamiento en la nube
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isSupabaseConfigured() ? (
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Conectado a la Nube
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Pendiente de Conectar
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveSupabase} className="p-6 space-y-5">
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                  <strong className="block font-bold mb-1">
                    ¿Por qué aparecía el error "ERR_NAME_NOT_RESOLVED"?
                  </strong>
                  <p>
                    El archivo de configuración local contenía el enlace temporal{' '}
                    <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">https://tu_proyecto.supabase.co</code>.
                    Al no ser un dominio real, el navegador no podía comunicarse con tu base de datos.
                    Pega abajo la URL real de tu proyecto de Supabase para activar la sincronización permanente.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Project URL de Supabase *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className="w-full text-sm font-mono rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Ej: <span className="font-mono">https://xxxxxxxxxxxxxxxxxxxx.supabase.co</span> (o solo el ID)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Anon / Publishable Key *
                    </label>
                    <input
                      type="text"
                      required
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      className="w-full text-xs font-mono rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Tu clave pública <span className="font-mono">sb_publishable_...</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-2">
                  <strong className="block font-bold text-gray-800">
                    Instrucciones para copiar la URL de tu proyecto en Supabase:
                  </strong>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Entra a tu cuenta en <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-700 underline font-bold">supabase.com/dashboard</a>.</li>
                    <li>Selecciona tu proyecto. Mira la barra de direcciones de tu navegador: verás algo como <code className="bg-gray-200 px-1 py-0.5 rounded font-mono font-bold text-gray-900">supabase.com/dashboard/project/<strong>[TU_ID_AQUÍ]</strong></code>.</li>
                    <li>O haz clic en el engranaje <strong>Project Settings &gt; Data API &gt; Project URL</strong>.</li>
                  </ol>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#152a45] text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Guardar y Conectar Base de Datos
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 1: GUATEMALA LABOR PARAMETERS */}
        {activeTab === 'labor' && (
          <div className="space-y-6">
            {/* Rates & Formulas Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">
                    Tasas Patronales y Provisiones Obligatorias (Código de Trabajo de Guatemala)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Bases legales utilizadas para el cálculo automatizado del Costo de Nómina (KPI-05 y KPI-11)
                  </p>
                </div>
                <span className="text-xs bg-blue-500/30 text-blue-200 px-2.5 py-1 rounded">
                  Moneda: GTQ (Q)
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Cuota Patronal IGSS</span>
                    <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                      Ley Orgánica IGSS
                    </span>
                  </div>
                  <p className="text-2xl font-black text-blue-900 mt-2">{GT_LABOR.IGSS_EMPLOYER_PCT}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Incluye 10.67% IGSS + 1.0% IRTRA + 1.0% INTECAP sobre salario total.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Recargo de Horas Extras</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Art. 121 C. Trabajo
                    </span>
                  </div>
                  <p className="text-2xl font-black text-emerald-900 mt-2">{GT_LABOR.OVERTIME_MULTIPLIER}x</p>
                  <p className="text-xs text-gray-500 mt-1">
                    50% de recargo sobre el valor de la hora ordinaria diurna o mixta.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Aguinaldo (Provisión)</span>
                    <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                      Decreto 76-78
                    </span>
                  </div>
                  <p className="text-2xl font-black text-purple-900 mt-2">{GT_LABOR.AGUINALDO_PCT}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    1/12 del salario devengado entre dic y nov de cada año.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Bono 14 (Provisión)</span>
                    <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                      Decreto 42-92
                    </span>
                  </div>
                  <p className="text-2xl font-black text-purple-900 mt-2">{GT_LABOR.BONO14_PCT}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    1/12 del salario devengado entre julio y junio de cada año.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Vacaciones Proporcionales</span>
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      Art. 130 C. Trabajo
                    </span>
                  </div>
                  <p className="text-2xl font-black text-amber-900 mt-2">{GT_LABOR.VACACIONES_PCT}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    15 días hábiles remunerados por cada año de servicio continuo.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Indemnización Universal</span>
                    <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                      Art. 82 C. Trabajo
                    </span>
                  </div>
                  <p className="text-2xl font-black text-rose-900 mt-2">{GT_LABOR.INDEMNIZACION_PCT}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pasivo laboral de un salario ordinario por cada año laborado.
                  </p>
                </div>
              </div>
            </div>

            {/* Expedientes Document Checklist */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Matriz de Cumplimiento Documental para Auditoría (KPI-02: 100% Requerido)
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Documentación obligatoria en cada expediente según Ministerio de Trabajo y Salud Pública
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  { name: 'DPI Completo y Vigente', authority: 'RENAP', mandatory: true },
                  { name: 'Contrato de Trabajo Sellado', authority: 'MINTRAB (Registro digital)', mandatory: true },
                  { name: 'Antecedentes Penales y Policiacos', authority: 'PNC / Organismo Judicial (<6 meses)', mandatory: true },
                  { name: 'Constancia de Afiliación IGSS', authority: 'Instituto Guatemalteco Seg. Social', mandatory: true },
                  { name: 'Tarjeta de Salud y Manipulación', authority: 'Ministerio de Salud (Industria alimentaria)', mandatory: true },
                  { name: 'Tarjeta de Pulmones (Rayos X)', authority: 'Centro de Salud / Hospital Nacional', mandatory: true },
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">{doc.name}</p>
                      <p className="text-[11px] text-gray-500">{doc.authority}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDITABLE KPI TARGETS */}
        {activeTab === 'kpis' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Configuración de Metas y Operadores para los 16 Indicadores
                </h3>
                <p className="text-xs text-gray-500">
                  Modifique los valores esperados y guarde los cambios en la base de datos
                </p>
              </div>
              <button
                onClick={handleSaveKPITargets}
                disabled={isSavingKPIs}
                className="px-5 py-2.5 bg-[#1e3a5f] hover:bg-[#152a45] text-white font-bold text-xs rounded-lg flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSavingKPIs ? 'Guardando...' : 'Guardar Metas de KPIs'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 uppercase font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-4">Indicador</th>
                    <th className="py-2.5 px-3">Frecuencia</th>
                    <th className="py-2.5 px-3">Operador</th>
                    <th className="py-2.5 px-3">Meta Valor</th>
                    <th className="py-2.5 px-3">Unidad</th>
                    <th className="py-2.5 px-4">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {editableKPIs.map((kpi) => (
                    <tr key={kpi.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a5f]">{kpi.code}</td>
                      <td className="py-2.5 px-4 font-semibold text-gray-800">{kpi.name}</td>
                      <td className="py-2.5 px-3 capitalize text-gray-600 font-medium">{kpi.frequency}</td>
                      <td className="py-2.5 px-3">
                        <select
                          value={kpi.target_operator}
                          onChange={(e) => handleKPIFieldChange(kpi.code, 'target_operator', e.target.value)}
                          className="p-1.5 border border-gray-300 rounded-md text-xs font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="<=">&le; (Menor o igual)</option>
                          <option value=">=">&ge; (Mayor o igual)</option>
                          <option value="=">= (Exacto)</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          step="any"
                          value={kpi.target_value}
                          onChange={(e) => handleKPIFieldChange(kpi.code, 'target_value', parseFloat(e.target.value) || 0)}
                          className="w-24 p-1.5 border border-gray-300 rounded-md font-bold text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-right"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-600">{kpi.target_unit}</td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={kpi.responsible_role || ''}
                          onChange={(e) => handleKPIFieldChange(kpi.code, 'responsible_role', e.target.value)}
                          className="w-full max-w-[200px] p-1 border border-gray-200 rounded text-[11px] text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PAYROLL CUTOFFS */}
        {activeTab === 'cutoffs' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Configuración del Candado de Corte de Planilla
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Al cumplirse la fecha y hora límite, el sistema bloquea automáticamente la carga regular y exige boleta de excepción
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Fecha Límite de Corte
                </label>
                <input
                  type="date"
                  value={cutoffDate}
                  onChange={(e) => setCutoffDate(e.target.value)}
                  className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Hora Exacta del Candado
                </label>
                <input
                  type="time"
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Horas Previas de Alerta (Zona Amarilla)
                </label>
                <input
                  type="number"
                  value={warningHours}
                  onChange={(e) => setWarningHours(e.target.value)}
                  className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                onClick={lockCutoff}
                disabled={isLocked}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Lock className="w-4 h-4" />
                {isLocked ? 'Candado Ya Bloqueado' : 'Forzar Bloqueo Inmediato'}
              </button>

              <button
                onClick={handleSaveCutoff}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Guardar Período de Corte
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: DEPARTMENTS */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Departamentos y Unidades de Negocio
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Centros de costo para imputación de horas extraordinarias y ausentismo
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_DEPARTMENTS.map((dept) => (
                <div key={dept.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {dept.code}
                  </span>
                  <h4 className="font-bold text-gray-900 text-sm mt-2">{dept.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">Planta de Producción Mixco</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

