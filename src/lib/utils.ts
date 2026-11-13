import { clsx, type ClassValue } from 'clsx'
import { KPI_STATUS_COLORS, type KPIStatusKey } from './constants'

/**
 * Merge Tailwind class names (wrapper around clsx).
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/**
 * Format a number as Guatemalan Quetzales.
 * @example formatCurrency(1234.5) → "Q 1,234.50"
 */
export function formatCurrency(amount: number): string {
  return `Q ${amount.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format a number as a percentage string.
 * @example formatPercent(85.5) → "85.50%"
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Get Tailwind classes for a KPI status color.
 */
export function getStatusColor(status: KPIStatusKey) {
  return KPI_STATUS_COLORS[status] ?? KPI_STATUS_COLORS.green
}

/**
 * Get human-readable label for a KPI status.
 */
export function getStatusLabel(status: KPIStatusKey): string {
  const labels: Record<KPIStatusKey, string> = {
    green: 'En Meta',
    yellow: 'Precaución',
    red: 'Fuera de Meta',
  }
  return labels[status] ?? status
}

/**
 * Calculate variance between actual and target values.
 */
export function calculateVariance(actual: number, target: number): number {
  return actual - target
}

/**
 * Determine the variance status based on actual value, target, and operator.
 */
export function getVarianceStatus(
  actual: number,
  target: number,
  operator: '<=' | '>=' | '='
): KPIStatusKey {
  const variance = Math.abs(actual - target)
  const threshold = target * 0.1 // 10% tolerance for yellow

  switch (operator) {
    case '>=':
      if (actual >= target) return 'green'
      if (actual >= target - threshold) return 'yellow'
      return 'red'
    case '<=':
      if (actual <= target) return 'green'
      if (actual <= target + threshold) return 'yellow'
      return 'red'
    case '=':
      if (variance === 0) return 'green'
      if (variance <= threshold) return 'yellow'
      return 'red'
    default:
      return 'green'
  }
}
