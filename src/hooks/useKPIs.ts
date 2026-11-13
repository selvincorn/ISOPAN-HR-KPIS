import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { KPIDefinition, KPIRecord } from '../types/database'
import type { Frequency, KPIStatus } from '../types/kpi'
import { MOCK_KPIS, MOCK_RECORDS } from '../lib/mockData'
import { determineKPIStatus, calculateKPIVariance } from '../lib/kpi-calculator'

export interface KPISummaryData {
  total: number
  green: number
  yellow: number
  red: number
}

const LOCAL_STORAGE_KEY = 'ISOPAN_LOCAL_KPI_RECORDS'
const LOCAL_DEFS_KEY = 'ISOPAN_LOCAL_KPI_DEFINITIONS'

const getLocalDefinitions = (): KPIDefinition[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_DEFS_KEY) : null
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveLocalDefinitions = (defs: KPIDefinition[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_DEFS_KEY, JSON.stringify(defs))
    }
  } catch (e) {
    console.warn('Error al guardar definiciones en localStorage:', e)
  }
}

const getLocalRecords = (): KPIRecord[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveLocalRecords = (records: KPIRecord[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records))
    }
  } catch (e) {
    console.warn('Error al guardar registros en localStorage:', e)
  }
}

export function useKPIs(selectedYear = 2026, selectedMonth = 11) {
  const [kpiDefinitions, setKpiDefinitions] = useState<KPIDefinition[]>(() => {
    const local = getLocalDefinitions()
    return local.length > 0 ? local : MOCK_KPIS
  })
  const [kpiRecords, setKpiRecords] = useState<KPIRecord[]>(() => {
    const local = getLocalRecords()
    if (local.length > 0) {
      const mergedMap = new Map<string, KPIRecord>()
      MOCK_RECORDS.forEach((r) => mergedMap.set(r.kpi_definition_id, r))
      local.forEach((r) => mergedMap.set(r.kpi_definition_id, r))
      return Array.from(mergedMap.values())
    }
    return MOCK_RECORDS
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Si Supabase no está configurado (tiene url placeholder), usamos caché local + mock data
    if (!isSupabaseConfigured()) {
      const localDefs = getLocalDefinitions()
      setKpiDefinitions(localDefs.length > 0 ? localDefs : MOCK_KPIS)
      const local = getLocalRecords()
      if (local.length > 0) {
        const mergedMap = new Map<string, KPIRecord>()
        MOCK_RECORDS.forEach((r) => mergedMap.set(r.kpi_definition_id, r))
        local.forEach((r) => mergedMap.set(r.kpi_definition_id, r))
        setKpiRecords(Array.from(mergedMap.values()))
      } else {
        const filteredMock = MOCK_RECORDS.filter(
          (r) => r.period_year === selectedYear && r.period_month === selectedMonth
        )
        setKpiRecords(filteredMock.length > 0 ? filteredMock : MOCK_RECORDS.slice(0, 16))
      }
      setLoading(false)
      return
    }

    try {
      // 1. Obtener definiciones de KPIs de Supabase
      const { data: defs } = await supabase
        .from('kpi_definitions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (defs && defs.length > 0) {
        setKpiDefinitions(defs as KPIDefinition[])
        saveLocalDefinitions(defs as KPIDefinition[])
      } else {
        const localDefs = getLocalDefinitions()
        setKpiDefinitions(localDefs.length > 0 ? localDefs : MOCK_KPIS)
      }

      // 2. Obtener registros del período
      const { data: recs } = await supabase
        .from('kpi_records')
        .select('*')
        .eq('period_year', selectedYear)
        .eq('period_month', selectedMonth)

      const local = getLocalRecords()

      if (recs && recs.length > 0) {
        const mergedMap = new Map<string, KPIRecord>()
        recs.forEach((r) => mergedMap.set(r.kpi_definition_id, r as KPIRecord))
        local.forEach((r) => mergedMap.set(r.kpi_definition_id, r))
        setKpiRecords(Array.from(mergedMap.values()))
      } else {
        const mergedMap = new Map<string, KPIRecord>()
        MOCK_RECORDS.forEach((r) => mergedMap.set(r.kpi_definition_id, r))
        local.forEach((r) => mergedMap.set(r.kpi_definition_id, r))
        setKpiRecords(Array.from(mergedMap.values()))
      }
    } catch (err: any) {
      console.warn('Conexión con Supabase no completada:', err?.message || err)
      const local = getLocalRecords()
      const mergedMap = new Map<string, KPIRecord>()
      MOCK_RECORDS.forEach((r) => mergedMap.set(r.kpi_definition_id, r))
      local.forEach((r) => mergedMap.set(r.kpi_definition_id, r))
      setKpiRecords(Array.from(mergedMap.values()))
    } finally {
      setLoading(false)
    }
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Resumen de estado de KPIs
  const kpiSummary: KPISummaryData = {
    total: kpiDefinitions.length,
    green: kpiRecords.filter((r) => r.status === 'green').length,
    yellow: kpiRecords.filter((r) => r.status === 'yellow').length,
    red: kpiRecords.filter((r) => r.status === 'red').length,
  }

  // Filtrado de KPIs
  const getFilteredKPIs = (frequencyFilter?: Frequency | 'all', statusFilter?: KPIStatus | 'all', search = '') => {
    return kpiDefinitions.filter((kpi) => {
      const matchesFreq = !frequencyFilter || frequencyFilter === 'all' || kpi.frequency === frequencyFilter
      const record = kpiRecords.find((r) => r.kpi_definition_id === kpi.id)
      const matchesStatus = !statusFilter || statusFilter === 'all' || (record && record.status === statusFilter)
      const matchesSearch =
        !search ||
        kpi.name.toLowerCase().includes(search.toLowerCase()) ||
        kpi.code.toLowerCase().includes(search.toLowerCase()) ||
        (kpi.category && kpi.category.toLowerCase().includes(search.toLowerCase()))

      return matchesFreq && matchesStatus && matchesSearch
    })
  }

  // Guardar registro de KPI en Supabase y LocalStorage
  const saveKPIRecord = async (
    kpiId: string,
    actualValue: number,
    notes = '',
    periodWeek: number | null = null
  ) => {
    const kpi = kpiDefinitions.find((k) => k.id === kpiId)
    if (!kpi) throw new Error('KPI no encontrado')

    const variance = calculateKPIVariance(actualValue, kpi.target_value)
    const status = determineKPIStatus(actualValue, kpi.target_value, kpi.target_operator)

    const payload = {
      kpi_definition_id: kpiId,
      period_year: selectedYear,
      period_month: selectedMonth,
      period_week: periodWeek,
      actual_value: actualValue,
      target_value: kpi.target_value,
      target_operator: kpi.target_operator,
      variance,
      status,
      notes,
    }

    // 1. Guardar de forma inmediata en LocalStorage (NUNCA SE PIERDE LA INFORMACIÓN)
    const localNewRecord: KPIRecord = {
      id: `local-rec-${kpiId}-${Date.now()}`,
      ...payload,
      department_id: null,
      recorded_by: 'current-user',
      is_locked: false,
      created_at: new Date().toISOString(),
    }

    const currentLocals = getLocalRecords()
    const updatedLocals = [
      localNewRecord,
      ...currentLocals.filter((r) => r.kpi_definition_id !== kpiId),
    ]
    saveLocalRecords(updatedLocals)

    // Actualizar estado en memoria
    setKpiRecords((prev) => [
      localNewRecord,
      ...prev.filter((r) => r.kpi_definition_id !== kpiId),
    ])

    // 2. Si Supabase está configurado, sincronizar con la nube
    if (isSupabaseConfigured()) {
      try {
        let checkQuery = supabase
          .from('kpi_records')
          .select('id')
          .eq('kpi_definition_id', kpiId)
          .eq('period_year', selectedYear)
          .eq('period_month', selectedMonth)

        if (periodWeek !== null && periodWeek !== undefined) {
          checkQuery = checkQuery.eq('period_week', periodWeek)
        } else {
          checkQuery = checkQuery.is('period_week', null)
        }

        const { data: existing } = await checkQuery.maybeSingle()

        let savedRecord: KPIRecord | null = null

        if (existing?.id) {
          const { data, error: updateError } = await supabase
            .from('kpi_records')
            .update(payload)
            .eq('id', existing.id)
            .select()
            .maybeSingle()

          if (updateError) throw updateError
          savedRecord = data as KPIRecord
        } else {
          const { data, error: insertError } = await supabase
            .from('kpi_records')
            .insert(payload)
            .select()
            .maybeSingle()

          if (insertError) throw insertError
          savedRecord = data as KPIRecord
        }

        if (savedRecord) {
          setKpiRecords((prev) => [
            savedRecord!,
            ...prev.filter((r) => r.id !== savedRecord!.id && r.kpi_definition_id !== kpiId),
          ])
          return savedRecord
        }
      } catch (err: any) {
        console.warn('Registro guardado localmente (sincronización Supabase pendiente):', err?.message || err)
      }
    }

    return localNewRecord
  }

  // Actualizar configuración y metas de KPIs
  const updateKPIDefinitions = async (updatedDefs: KPIDefinition[]) => {
    setKpiDefinitions(updatedDefs)
    saveLocalDefinitions(updatedDefs)

    if (isSupabaseConfigured()) {
      try {
        for (const def of updatedDefs) {
          await supabase
            .from('kpi_definitions')
            .update({
              target_value: def.target_value,
              target_operator: def.target_operator,
              responsible_role: def.responsible_role,
            })
            .eq('code', def.code)
        }
      } catch (err: any) {
        console.warn('Metas guardadas localmente (sincronización con Supabase pendiente):', err)
      }
    }
  }

  return {
    kpiDefinitions,
    kpiRecords,
    kpiSummary,
    loading,
    error,
    refetch: fetchData,
    getFilteredKPIs,
    saveKPIRecord,
    updateKPIDefinitions,
  }
}
