import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { PayrollCutoff } from '../types/database'
import { MOCK_PAYROLL_CUTOFF } from '../lib/mockData'

export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  totalSeconds: number
}

export function usePayrollCutoff(selectedYear = 2026, selectedMonth = 11) {
  const [cutoff, setCutoff] = useState<PayrollCutoff>(MOCK_PAYROLL_CUTOFF)
  const [loading, setLoading] = useState(true)

  const fetchCutoff = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('payroll_cutoffs')
        .select('*')
        .eq('period_year', selectedYear)
        .eq('period_month', selectedMonth)
        .maybeSingle()

      if (data) {
        setCutoff(data as PayrollCutoff)
      } else {
        setCutoff(MOCK_PAYROLL_CUTOFF)
      }
    } catch {
      setCutoff(MOCK_PAYROLL_CUTOFF)
    } finally {
      setLoading(false)
    }
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    fetchCutoff()
  }, [fetchCutoff])

  // Real-time calculation of time remaining
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    totalSeconds: 0,
  })

  useEffect(() => {
    if (!cutoff?.cutoff_datetime) return

    const calculate = () => {
      const now = new Date().getTime()
      const target = new Date(cutoff.cutoff_datetime).getTime()
      const difference = target - now

      if (difference <= 0 || cutoff.is_locked) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          totalSeconds: 0,
        })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      const totalSeconds = Math.floor(difference / 1000)

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        totalSeconds,
      })
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [cutoff])

  const isWarningPeriod =
    !timeRemaining.isExpired &&
    timeRemaining.totalSeconds <= (cutoff?.warning_hours_before ?? 12) * 3600

  const lockCutoff = async () => {
    try {
      await supabase
        .from('payroll_cutoffs')
        .update({ is_locked: true, locked_at: new Date().toISOString() })
        .eq('id', cutoff.id)
    } catch {
      // Local fallback
    }
    setCutoff((prev) => ({ ...prev, is_locked: true, locked_at: new Date().toISOString() }))
  }

  return {
    cutoff,
    timeRemaining,
    isWarningPeriod,
    isLocked: cutoff?.is_locked || timeRemaining.isExpired,
    loading,
    lockCutoff,
    refetch: fetchCutoff,
  }
}

