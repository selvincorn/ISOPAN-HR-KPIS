import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { SupervisorKPI, SupervisorSubmission } from '../types/database'
import { MOCK_SUPERVISOR_KPIS, MOCK_SUBMISSIONS } from '../lib/mockData'

export interface SupervisorRankingItem extends SupervisorKPI {
  department_name: string
  supervisor_name: string
}

const LOCAL_SUBMISSIONS_KEY = 'ISOPAN_LOCAL_SUPERVISOR_SUBMISSIONS'

const getLocalSubmissions = (): SupervisorSubmission[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_SUBMISSIONS_KEY) : null
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveLocalSubmissions = (subs: SupervisorSubmission[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(subs))
    }
  } catch (e) {
    console.warn('Error al guardar submissions en localStorage:', e)
  }
}

export function useSupervisorData(selectedYear = 2026, selectedMonth = 11) {
  const [supervisorKPIs, setSupervisorKPIs] = useState<SupervisorRankingItem[]>(MOCK_SUPERVISOR_KPIS)
  const [submissions, setSubmissions] = useState<SupervisorSubmission[]>(() => {
    const locals = getLocalSubmissions()
    return locals.length > 0 ? [...locals, ...MOCK_SUBMISSIONS] : MOCK_SUBMISSIONS
  })
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)

    if (!isSupabaseConfigured()) {
      setSupervisorKPIs(MOCK_SUPERVISOR_KPIS)
      const locals = getLocalSubmissions()
      setSubmissions(locals.length > 0 ? [...locals, ...MOCK_SUBMISSIONS] : MOCK_SUBMISSIONS)
      setLoading(false)
      return
    }

    try {
      const { data: kpis } = await supabase
        .from('supervisor_kpis')
        .select(`
          *,
          departments:department_id(name),
          profiles:supervisor_id(full_name)
        `)
        .eq('period_year', selectedYear)
        .eq('period_month', selectedMonth)

      if (kpis && kpis.length > 0) {
        const formatted: SupervisorRankingItem[] = kpis.map((k: any) => ({
          ...k,
          department_name: k.departments?.name ?? 'General',
          supervisor_name: k.profiles?.full_name ?? 'Líder de Área',
        }))
        setSupervisorKPIs(formatted)
      } else {
        setSupervisorKPIs(MOCK_SUPERVISOR_KPIS)
      }

      const { data: subs } = await supabase
        .from('supervisor_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      const locals = getLocalSubmissions()

      if (subs && subs.length > 0) {
        setSubmissions([...locals, ...(subs as SupervisorSubmission[])])
      } else {
        setSubmissions(locals.length > 0 ? [...locals, ...MOCK_SUBMISSIONS] : MOCK_SUBMISSIONS)
      }
    } catch (err: any) {
      console.warn('Usando datos de respaldo para supervisores:', err?.message || err)
      setSupervisorKPIs(MOCK_SUPERVISOR_KPIS)
      const locals = getLocalSubmissions()
      setSubmissions(locals.length > 0 ? [...locals, ...MOCK_SUBMISSIONS] : MOCK_SUBMISSIONS)
    } finally {
      setLoading(false)
    }
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Ranking ordenado por puntuación global descendente
  const ranking = [...supervisorKPIs].sort((a, b) => b.overall_score - a.overall_score)

  const addSubmission = async (newSub: Partial<SupervisorSubmission>) => {
    const mockSub: SupervisorSubmission = {
      id: `sub-${Date.now()}`,
      payroll_cutoff_id: 'cutoff-curr',
      supervisor_id: 'user-curr',
      department_id: newSub.department_id ?? 'dept-01',
      submission_type: newSub.submission_type ?? 'overtime',
      status: newSub.is_exception ? 'late' : 'submitted',
      submitted_at: new Date().toISOString(),
      is_exception: Boolean(newSub.is_exception),
      exception_reason: newSub.exception_reason ?? null,
      data_json: newSub.data_json ?? {},
      approved_by: null,
      approved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 1. Guardar localmente siempre
    const currentLocals = getLocalSubmissions()
    saveLocalSubmissions([mockSub, ...currentLocals])
    setSubmissions((prev) => [mockSub, ...prev])

    // 2. Si Supabase está configurado, sincronizar
    if (isSupabaseConfigured()) {
      try {
        let cutoffId = newSub.payroll_cutoff_id
        if (!cutoffId) {
          const { data: activeCutoff } = await supabase
            .from('payroll_cutoffs')
            .select('id')
            .eq('period_year', selectedYear)
            .eq('period_month', selectedMonth)
            .maybeSingle()

          cutoffId = activeCutoff?.id
        }

        const insertPayload: any = {
          department_id: newSub.department_id,
          submission_type: newSub.submission_type,
          payroll_cutoff_id: cutoffId || null,
          is_exception: Boolean(newSub.is_exception),
          exception_reason: newSub.exception_reason || null,
          data_json: newSub.data_json || {},
          status: newSub.is_exception ? 'late' : 'submitted',
          submitted_at: new Date().toISOString(),
        }

        const { data } = await supabase
          .from('supervisor_submissions')
          .insert(insertPayload)
          .select()
          .maybeSingle()

        if (data) {
          setSubmissions((prev) => [data as SupervisorSubmission, ...prev.filter((s) => s.id !== mockSub.id)])
          return data
        }
      } catch (err: any) {
        console.warn('Novedad guardada localmente (sincronización con Supabase pendiente):', err?.message || err)
      }
    }

    return mockSub
  }

  const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    // Actualizar local
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    )

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('supervisor_submissions')
          .update({
            status,
            approved_at: status === 'approved' ? new Date().toISOString() : null,
          })
          .eq('id', id)
      } catch (err: any) {
        console.warn('Estado actualizado localmente:', err)
      }
    }
  }

  return {
    supervisorKPIs,
    ranking,
    submissions,
    loading,
    refetch: fetchData,
    addSubmission,
    updateSubmissionStatus,
  }
}
