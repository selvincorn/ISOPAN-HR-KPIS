// ── Database TypeScript Interfaces ──────────────────────────────────
// Matches the 10 tables in the Supabase schema.

export interface Department {
  id: string
  name: string
  code: string | null
  manager_id: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'analyst' | 'supervisor'
  department_id: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface KPIDefinition {
  id: string
  code: string
  name: string
  objective: string | null
  formula: string | null
  formula_key: string | null
  target_value: number
  target_operator: '<=' | '>=' | '='
  target_unit: string
  frequency: 'weekly' | 'monthly' | 'semi_annual'
  responsible_role: string | null
  data_source: string | null
  category: string | null
  sort_order: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface KPIRecord {
  id: string
  kpi_definition_id: string
  period_year: number
  period_month: number
  period_week: number | null
  actual_value: number
  target_value: number
  target_operator: string
  variance: number
  status: 'green' | 'yellow' | 'red'
  department_id: string | null
  recorded_by: string
  notes: string | null
  is_locked: boolean
  created_at?: string
  updated_at?: string
}

export interface CorrectiveAction {
  id: string
  kpi_record_id: string
  description: string
  responsible_user_id: string
  due_date: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  completion_date: string | null
  evidence_notes: string | null
  created_at: string
  updated_at: string
}

export interface PayrollCutoff {
  id: string
  period_year: number
  period_month: number
  cutoff_datetime: string
  warning_hours_before: number
  is_locked: boolean
  locked_at: string | null
  locked_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SupervisorSubmission {
  id: string
  payroll_cutoff_id: string
  supervisor_id: string
  department_id: string
  submission_type: 'overtime' | 'bonus' | 'absence' | 'biometric_justification' | 'general'
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'late'
  submitted_at: string | null
  is_exception: boolean
  exception_reason: string | null
  data_json: Record<string, unknown>
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface OperationalMetric {
  id: string
  department_id: string
  period_year: number
  period_month: number
  period_week: number | null
  metric_type: string
  value: number
  notes: string | null
  recorded_by: string | null
  created_at: string
  updated_at: string
}

export interface SupervisorKPI {
  id: string
  supervisor_id: string
  department_id: string
  period_year: number
  period_month: number
  payroll_closure_pct: number
  biometric_justification_pct: number
  interview_response_days: number | null
  evaluation_progress_pct: number
  training_progress_pct: number
  overall_score: number
  status: 'green' | 'yellow' | 'red'
  rank?: number | null
  created_at?: string
  updated_at?: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  table_name: string | null
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface RecruitmentVacancy {
  id: string
  sequence_no: number
  position_name: string
  supervisor_name: string
  supervisor_id?: string | null
  department_name?: string | null
  vacancy_type: string
  replacement_for?: string | null
  status: 'VIGENTE' | 'EN_PRUEBA' | 'CERRADA' | 'CONGELADA'
  requested_date: string
  closed_date?: string | null
  total_days: number
  hr_days: number
  supervisor_days: number
  current_owner: 'hr' | 'supervisor'
  candidate_in_process?: string | null
  hired_candidate?: string | null
  observations?: string | null
  created_at?: string
  updated_at?: string
}
