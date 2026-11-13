// ── KPI Status Colors ──────────────────────────────────────────────
export const KPI_STATUS_COLORS = {
  green: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400', dot: 'bg-emerald-500' },
  yellow: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-400', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400', dot: 'bg-red-500' },
} as const

export type KPIStatusKey = keyof typeof KPI_STATUS_COLORS

// ── Role Labels (Spanish) ─────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  analyst: 'Analista',
  supervisor: 'Supervisor',
}

// ── Department Names ──────────────────────────────────────────────
export const DEPARTMENT_NAMES: Record<string, string> = {
  produccion: 'Producción',
  ventas: 'Ventas',
  logistica: 'Logística',
  administracion: 'Administración',
  rrhh: 'Recursos Humanos',
  calidad: 'Calidad',
  mantenimiento: 'Mantenimiento',
}

// ── Frequency Labels ──────────────────────────────────────────────
export const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Semanal',
  monthly: 'Mensual',
  semi_annual: 'Semestral',
}

// ── Guatemala Labor Constants ─────────────────────────────────────
export const GT_LABOR = {
  /** Cuota patronal IGSS */
  IGSS_EMPLOYER_PCT: 12.67,
  /** Aguinaldo – Decreto 76-78 */
  AGUINALDO_PCT: 8.33,
  /** Bono 14 – Decreto 42-92 */
  BONO14_PCT: 8.33,
  /** Vacaciones (15 días / 365) */
  VACACIONES_PCT: 4.17,
  /** Indemnización */
  INDEMNIZACION_PCT: 8.33,
  /** Multiplicador horas extra */
  OVERTIME_MULTIPLIER: 1.5,
} as const

// ── Months (Spanish) ──────────────────────────────────────────────
export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const

// ── Navigation Items ──────────────────────────────────────────────
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/kpis', label: 'KPIs', icon: 'Target' },
  { path: '/supervisors', label: 'Supervisores', icon: 'Users' },
  { path: '/reports', label: 'Reportes', icon: 'FileBarChart' },
  { path: '/settings', label: 'Configuración', icon: 'Settings' },
] as const

// ── Theme Colors ──────────────────────────────────────────────────
export const THEME = {
  primary: '#1e3a5f',
  primaryLight: '#2a4f7f',
  primaryDark: '#152a45',
  accent: '#3b82f6',
} as const
