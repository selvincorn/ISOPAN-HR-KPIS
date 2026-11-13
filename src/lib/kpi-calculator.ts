import type { OperationalMetric } from '../types/database'
import type { KPIStatusKey } from './constants'

/**
 * Motor de Cálculo Automatizado de KPIs para ISOPAN Guatemala
 */
export function calculateKPI(
  formulaKey: string,
  metrics: Record<string, number> | OperationalMetric[]
): number | null {
  // Normalize metrics map
  const map: Record<string, number> = {}
  if (Array.isArray(metrics)) {
    metrics.forEach((m) => {
      map[m.metric_type] = Number(m.value)
    })
  } else {
    Object.assign(map, metrics)
  }

  switch (formulaKey) {
    case 'avg_hiring_days': {
      // (Suma de días transcurridos) / Total contrataciones
      const totalDays = map.total_hiring_days ?? 0
      const totalHires = map.hires ?? 1
      return totalHires > 0 ? Number((totalDays / totalHires).toFixed(1)) : 0
    }

    case 'docs_compliance_pct': {
      // (Expedientes completos / Total colaboradores) * 100
      const complete = map.docs_complete ?? 0
      const total = map.docs_required ?? map.headcount ?? 1
      return total > 0 ? Number(((complete / total) * 100).toFixed(1)) : 100
    }

    case 'absenteeism_rate': {
      // (Total horas ausencia / Total horas laborables) * 100
      const absenceHours = map.absence_hours ?? 0
      const scheduledHours = map.scheduled_hours ?? map.ordinary_hours ?? 1
      return scheduledHours > 0 ? Number(((absenceHours / scheduledHours) * 100).toFixed(2)) : 0
    }

    case 'payroll_accuracy_pct': {
      // ((Total transacciones - Reclamos) / Total transacciones) * 100
      const errors = map.payroll_errors ?? 0
      const total = map.payroll_transactions ?? 1
      return total > 0 ? Number((((total - errors) / total) * 100).toFixed(2)) : 100
    }

    case 'total_payroll_cost': {
      // Suma sueldos + horas extra + bonos + patronal IGSS (12.67%) + provisión prestaciones (29.16%)
      const baseSalaries = map.base_salaries ?? 0
      const overtimePay = map.overtime_pay ?? 0
      const bonuses = map.bonuses ?? 0
      const subtotal = baseSalaries + overtimePay + bonuses
      // Provisión patronal IGSS + IRTRA + INTECAP = 12.67%
      const patronal = subtotal * 0.1267
      // Provisión Aguinaldo (8.33%) + Bono 14 (8.33%) + Vacaciones (4.17%) + Indemnización (8.33%) = 29.16%
      const pasivos = subtotal * 0.2916
      return Math.round(subtotal + patronal + pasivos)
    }

    case 'payroll_vs_sales_pct': {
      // (Costo total de nómina / Ventas netas) * 100
      const payroll = map.payroll_total ?? 0
      const sales = map.sales_total ?? 1
      return sales > 0 ? Number(((payroll / sales) * 100).toFixed(1)) : 0
    }

    case 'turnover_rate': {
      // ((Renuncias + Despidos) / Headcount promedio) * 100
      const terminations = map.terminations ?? 0
      const headcount = map.headcount ?? 1
      return headcount > 0 ? Number(((terminations / headcount) * 100).toFixed(2)) : 0
    }

    case 'labor_incidents_count': {
      return map.incidents ?? 0
    }

    case 'incentive_achievement_pct': {
      // (Alcanzaron bono / Elegibles) * 100
      const achieved = map.incentive_achieved ?? 0
      const planned = map.incentive_planned ?? 1
      return planned > 0 ? Number(((achieved / planned) * 100).toFixed(1)) : 0
    }

    case 'overtime_pct_ordinary': {
      // (Horas extras / Horas ordinarias) * 100
      const overtimeHours = map.overtime_hours ?? 0
      const ordinaryHours = map.ordinary_hours ?? 1
      return ordinaryHours > 0 ? Number(((overtimeHours / ordinaryHours) * 100).toFixed(2)) : 0
    }

    case 'overtime_cost_pct_payroll': {
      // (Monto horas extra / Monto nómina ordinaria) * 100
      const overtimeAmount = map.overtime_amount ?? 0
      const basePayroll = map.base_payroll ?? 1
      return basePayroll > 0 ? Number(((overtimeAmount / basePayroll) * 100).toFixed(2)) : 0
    }

    case 'productivity_per_worker': {
      // Unidades producidas / Colaboradores directos
      const units = map.units_produced ?? 0
      const workers = map.production_headcount ?? map.headcount ?? 1
      return workers > 0 ? Math.round(units / workers) : 0
    }

    case 'critical_vacancies_over_15d': {
      return map.critical_vacancies_over_15d ?? 0
    }

    case 'overdue_liquidations_count': {
      return map.overdue_liquidations ?? 0
    }

    case 'training_compliance_pct': {
      // (Horas impartidas / Horas programadas) * 100
      const completed = map.training_completed ?? 0
      const planned = map.training_planned ?? 1
      return planned > 0 ? Number(((completed / planned) * 100).toFixed(1)) : 0
    }

    case 'performance_eval_compliance_pct': {
      // (Evaluaciones completadas / Programadas) * 100
      const completed = map.evaluations_completed ?? 0
      const planned = map.evaluations_planned ?? 1
      return planned > 0 ? Number(((completed / planned) * 100).toFixed(1)) : 0
    }

    default:
      return null
  }
}

/**
 * Determina el estado del semáforo (green, yellow, red) según meta y tolerancia de alerta (10%)
 */
export function determineKPIStatus(
  actual: number,
  target: number,
  operator: '<=' | '>=' | '=' | string
): KPIStatusKey {
  if (operator === '<=') {
    if (actual <= target) return 'green'
    if (actual <= target * 1.10) return 'yellow' // Dentro del 10% de tolerancia
    return 'red'
  }

  if (operator === '>=') {
    if (actual >= target) return 'green'
    if (actual >= target * 0.90) return 'yellow' // Dentro del 10% de tolerancia
    return 'red'
  }

  // '='
  if (Math.abs(actual - target) < 0.001) return 'green'
  if (Math.abs(actual - target) <= target * 0.05) return 'yellow'
  return 'red'
}

/**
 * Calcula la variación automática
 */
export function calculateKPIVariance(actual: number, target: number): number {
  return Number((actual - target).toFixed(2))
}

