import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { RecruitmentVacancy } from '../types/database'
import { MOCK_VACANCIES } from '../lib/mockData'

export interface VacancySLAAnalysis {
  totalPending: number
  criticalCount: number // > 15 days
  inTrialCount: number
  avgTotalDays: number
  avgHRDays: number
  avgSupervisorDays: number
  supervisorDelayPct: number // % of total delayed days attributable to supervisors
  bottleneckSupervisors: {
    supervisorName: string
    pendingPlazas: number
    avgWaitingDays: number
    totalWaitingDays: number
  }[]
}

const LOCAL_VACANCIES_KEY = 'ISOPAN_LOCAL_VACANCIES'

const getLocalVacancies = (): RecruitmentVacancy[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_VACANCIES_KEY) : null
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveLocalVacancies = (vacancies: RecruitmentVacancy[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_VACANCIES_KEY, JSON.stringify(vacancies))
    }
  } catch (e) {
    console.warn('Error al guardar vacantes en localStorage:', e)
  }
}

export function useVacancies() {
  const [vacancies, setVacancies] = useState<RecruitmentVacancy[]>(() => {
    const local = getLocalVacancies()
    return local.length > 0 ? local : MOCK_VACANCIES
  })
  const [loading, setLoading] = useState(true)

  const fetchVacancies = useCallback(async () => {
    setLoading(true)

    if (!isSupabaseConfigured()) {
      const local = getLocalVacancies()
      setVacancies(local.length > 0 ? local : MOCK_VACANCIES)
      setLoading(false)
      return
    }

    try {
      const { data } = await supabase
        .from('recruitment_vacancies')
        .select('*')
        .order('total_days', { ascending: false })

      if (data && data.length > 0) {
        setVacancies(data as RecruitmentVacancy[])
        saveLocalVacancies(data as RecruitmentVacancy[])
      } else {
        const local = getLocalVacancies()
        setVacancies(local.length > 0 ? local : MOCK_VACANCIES)
      }
    } catch {
      const local = getLocalVacancies()
      setVacancies(local.length > 0 ? local : MOCK_VACANCIES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVacancies()
  }, [fetchVacancies])

  // SLA Analysis
  const pendingVacancies = vacancies.filter((v) => v.status === 'VIGENTE' || v.status === 'EN_PRUEBA')
  const totalPending = pendingVacancies.length
  const criticalCount = pendingVacancies.filter((v) => v.total_days > 15).length
  const inTrialCount = vacancies.filter((v) => v.status === 'EN_PRUEBA').length

  const sumTotalDays = pendingVacancies.reduce((acc, v) => acc + v.total_days, 0)
  const sumHRDays = pendingVacancies.reduce((acc, v) => acc + v.hr_days, 0)
  const sumSupervisorDays = pendingVacancies.reduce((acc, v) => acc + v.supervisor_days, 0)

  const avgTotalDays = totalPending > 0 ? Math.round(sumTotalDays / totalPending) : 0
  const avgHRDays = totalPending > 0 ? Math.round(sumHRDays / totalPending) : 0
  const avgSupervisorDays = totalPending > 0 ? Math.round(sumSupervisorDays / totalPending) : 0

  const supervisorDelayPct =
    sumTotalDays > 0 ? Math.round((sumSupervisorDays / sumTotalDays) * 100) : 0

  // Group by supervisor to find bottlenecks
  const supervisorMap: Record<string, { count: number; totalDays: number }> = {}
  pendingVacancies.forEach((v) => {
    if (!supervisorMap[v.supervisor_name]) {
      supervisorMap[v.supervisor_name] = { count: 0, totalDays: 0 }
    }
    supervisorMap[v.supervisor_name].count += 1
    supervisorMap[v.supervisor_name].totalDays += v.supervisor_days
  })

  const bottleneckSupervisors = Object.entries(supervisorMap)
    .map(([name, stats]) => ({
      supervisorName: name,
      pendingPlazas: stats.count,
      totalWaitingDays: stats.totalDays,
      avgWaitingDays: stats.count > 0 ? Math.round(stats.totalDays / stats.count) : 0,
    }))
    .sort((a, b) => b.totalWaitingDays - a.totalWaitingDays)

  const slaAnalysis: VacancySLAAnalysis = {
    totalPending,
    criticalCount,
    inTrialCount,
    avgTotalDays,
    avgHRDays,
    avgSupervisorDays,
    supervisorDelayPct,
    bottleneckSupervisors,
  }

  // Transfer responsibility: RRHH -> Supervisor (pauses HR timer) or Supervisor -> RRHH
  const transferOwnership = async (vacancyId: string, newOwner: 'hr' | 'supervisor') => {
    const updated = vacancies.map((v) => {
      if (v.id === vacancyId) {
        return {
          ...v,
          current_owner: newOwner,
          observations:
            newOwner === 'supervisor'
              ? `${v.observations || ''} [${new Date().toLocaleDateString('es-GT')}: Terna transferida al jefe. Reloj de RR.HH. pausado]`.trim()
              : `${v.observations || ''} [${new Date().toLocaleDateString('es-GT')}: Devuelto a RR.HH. para nuevo filtro]`.trim(),
        }
      }
      return v
    })
    setVacancies(updated)
    saveLocalVacancies(updated)

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('recruitment_vacancies')
          .update({
            current_owner: newOwner,
          })
          .eq('id', vacancyId)
      } catch (e) {
        console.warn('Error al actualizar vacante en Supabase:', e)
      }
    }
  }

  // Update status (e.g. VIGENTE -> EN_PRUEBA -> CERRADA)
  const updateVacancyStatus = async (
    vacancyId: string,
    status: 'VIGENTE' | 'EN_PRUEBA' | 'CERRADA' | 'CONGELADA',
    extraNotes = ''
  ) => {
    const updated = vacancies.map((v) => {
      if (v.id === vacancyId) {
        return {
          ...v,
          status,
          observations: extraNotes ? `${v.observations || ''} | ${extraNotes}` : v.observations,
          closed_date: status === 'CERRADA' ? new Date().toISOString().split('T')[0] : v.closed_date,
        }
      }
      return v
    })
    setVacancies(updated)
    saveLocalVacancies(updated)

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('recruitment_vacancies')
          .update({
            status,
            closed_date: status === 'CERRADA' ? new Date().toISOString().split('T')[0] : null,
          })
          .eq('id', vacancyId)
      } catch (e) {
        console.warn('Error al actualizar estado en Supabase:', e)
      }
    }
  }

  // Create new vacancy
  const createVacancy = async (newVac: Partial<RecruitmentVacancy>) => {
    const id = `vac-${Date.now()}`
    const vac: RecruitmentVacancy = {
      id,
      sequence_no: vacancies.length > 0 ? Math.max(...vacancies.map((v) => v.sequence_no || 0)) + 1 : 1,
      position_name: newVac.position_name || 'Nueva Plaza',
      supervisor_name: newVac.supervisor_name || 'Supervisor Asignado',
      department_name: newVac.department_name || 'Operaciones',
      vacancy_type: newVac.vacancy_type || 'Sustitución',
      replacement_for: newVac.replacement_for || 'Plaza Nueva',
      status: 'VIGENTE',
      requested_date: new Date().toISOString().split('T')[0],
      total_days: 1,
      hr_days: 1,
      supervisor_days: 0,
      current_owner: 'hr',
      candidate_in_process: newVac.candidate_in_process || null,
      observations: newVac.observations || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updated = [vac, ...vacancies]
    setVacancies(updated)
    saveLocalVacancies(updated)

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('recruitment_vacancies').insert(vac)
      } catch (e) {
        console.warn('Error al insertar vacante en Supabase:', e)
      }
    }
  }

  return {
    vacancies,
    slaAnalysis,
    loading,
    refetch: fetchVacancies,
    transferOwnership,
    updateVacancyStatus,
    createVacancy,
  }
}
