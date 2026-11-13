-- ============================================================================
-- ISOPAN HR KPI Control System — Complete PostgreSQL Schema for Supabase
-- Generated: 2026-11-13
-- ============================================================================

-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. HELPER: updated_at trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- --------------------------------------------------------------------------
-- 2.1 departments
-- --------------------------------------------------------------------------
CREATE TABLE public.departments (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL UNIQUE,
  code        text        UNIQUE,
  manager_id  uuid,                           -- references profiles (added later via ALTER)
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- 2.2 profiles (extends auth.users)
-- --------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text,
  full_name     text,
  role          text        CHECK (role IN ('admin', 'analyst', 'supervisor')),
  department_id uuid        REFERENCES public.departments(id) ON DELETE SET NULL,
  avatar_url    text,
  is_active     boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Now add the FK from departments.manager_id -> profiles.id
ALTER TABLE public.departments
  ADD CONSTRAINT fk_departments_manager
  FOREIGN KEY (manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- --------------------------------------------------------------------------
-- 2.3 kpi_definitions
-- --------------------------------------------------------------------------
CREATE TABLE public.kpi_definitions (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  code            text        UNIQUE NOT NULL,
  name            text        NOT NULL,
  objective       text,
  formula         text,
  formula_key     text,
  target_value    numeric,
  target_operator text        CHECK (target_operator IN ('<=', '>=', '=')),
  target_unit     text,
  frequency       text        CHECK (frequency IN ('weekly', 'monthly', 'semi_annual')),
  responsible_role text,
  data_source     text,
  category        text,
  sort_order      int,
  is_active       boolean     DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- 2.4 kpi_records
-- --------------------------------------------------------------------------
CREATE TABLE public.kpi_records (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  kpi_definition_id   uuid        NOT NULL REFERENCES public.kpi_definitions(id) ON DELETE CASCADE,
  period_year         int         NOT NULL,
  period_month        int         NOT NULL,
  period_week         int,
  actual_value        numeric,
  target_value        numeric,
  target_operator     text,
  variance            numeric,
  status              text        CHECK (status IN ('green', 'yellow', 'red')),
  department_id       uuid        REFERENCES public.departments(id) ON DELETE SET NULL,
  recorded_by         uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes               text,
  is_locked           boolean     DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),

  CONSTRAINT uq_kpi_records_period
    UNIQUE (kpi_definition_id, period_year, period_month, period_week, department_id)
);

-- --------------------------------------------------------------------------
-- 2.5 corrective_actions
-- --------------------------------------------------------------------------
CREATE TABLE public.corrective_actions (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  kpi_record_id       uuid        NOT NULL REFERENCES public.kpi_records(id) ON DELETE CASCADE,
  description         text        NOT NULL,
  responsible_user_id uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date            date,
  status              text        CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')) DEFAULT 'pending',
  completion_date     date,
  evidence_notes      text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- 2.6 payroll_cutoffs
-- --------------------------------------------------------------------------
CREATE TABLE public.payroll_cutoffs (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  period_year           int         NOT NULL,
  period_month          int         NOT NULL,
  cutoff_datetime       timestamptz NOT NULL,
  warning_hours_before  int         DEFAULT 12,
  is_locked             boolean     DEFAULT false,
  locked_at             timestamptz,
  locked_by             uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes                 text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),

  CONSTRAINT uq_payroll_cutoffs_period
    UNIQUE (period_year, period_month)
);

-- --------------------------------------------------------------------------
-- 2.7 supervisor_submissions
-- --------------------------------------------------------------------------
CREATE TABLE public.supervisor_submissions (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_cutoff_id uuid        REFERENCES public.payroll_cutoffs(id) ON DELETE SET NULL,
  supervisor_id     uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  department_id     uuid        NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  submission_type   text        CHECK (submission_type IN ('overtime', 'bonus', 'absence', 'biometric_justification', 'general')),
  status            text        CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'late')) DEFAULT 'pending',
  submitted_at      timestamptz,
  is_exception      boolean     DEFAULT false,
  exception_reason  text,
  data_json         jsonb       DEFAULT '{}',
  approved_by       uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at       timestamptz,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- 2.8 operational_metrics
-- --------------------------------------------------------------------------
CREATE TABLE public.operational_metrics (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id uuid        NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  period_year   int         NOT NULL,
  period_month  int         NOT NULL,
  period_week   int,
  metric_type   text        NOT NULL,
  value         numeric     NOT NULL,
  notes         text,
  recorded_by   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),

  CONSTRAINT uq_operational_metrics_period
    UNIQUE (department_id, period_year, period_month, period_week, metric_type)
);

-- --------------------------------------------------------------------------
-- 2.9 supervisor_kpis
-- --------------------------------------------------------------------------
CREATE TABLE public.supervisor_kpis (
  id                          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  supervisor_id               uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  department_id               uuid        NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  period_year                 int         NOT NULL,
  period_month                int         NOT NULL,
  payroll_closure_pct         numeric     DEFAULT 0,
  biometric_justification_pct numeric     DEFAULT 0,
  interview_response_days     numeric,
  evaluation_progress_pct     numeric     DEFAULT 0,
  training_progress_pct       numeric     DEFAULT 0,
  overall_score               numeric     DEFAULT 0,
  status                      text        CHECK (status IN ('green', 'yellow', 'red')) DEFAULT 'red',
  created_at                  timestamptz DEFAULT now(),
  updated_at                  timestamptz DEFAULT now(),

  CONSTRAINT uq_supervisor_kpis_period
    UNIQUE (department_id, period_year, period_month)
);

-- --------------------------------------------------------------------------
-- 2.10 audit_log
-- --------------------------------------------------------------------------
CREATE TABLE public.audit_log (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      text,
  table_name  text,
  record_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  text,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. TRIGGERS — updated_at auto-update
-- ============================================================================
CREATE TRIGGER set_updated_at_departments
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_kpi_definitions
  BEFORE UPDATE ON public.kpi_definitions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_kpi_records
  BEFORE UPDATE ON public.kpi_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_corrective_actions
  BEFORE UPDATE ON public.corrective_actions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_payroll_cutoffs
  BEFORE UPDATE ON public.payroll_cutoffs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_supervisor_submissions
  BEFORE UPDATE ON public.supervisor_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_operational_metrics
  BEFORE UPDATE ON public.operational_metrics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_supervisor_kpis
  BEFORE UPDATE ON public.supervisor_kpis
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- profiles
CREATE INDEX idx_profiles_department  ON public.profiles(department_id);
CREATE INDEX idx_profiles_role        ON public.profiles(role);
CREATE INDEX idx_profiles_is_active   ON public.profiles(is_active);

-- kpi_definitions
CREATE INDEX idx_kpi_definitions_frequency ON public.kpi_definitions(frequency);
CREATE INDEX idx_kpi_definitions_category  ON public.kpi_definitions(category);
CREATE INDEX idx_kpi_definitions_active    ON public.kpi_definitions(is_active);

-- kpi_records
CREATE INDEX idx_kpi_records_definition   ON public.kpi_records(kpi_definition_id);
CREATE INDEX idx_kpi_records_period       ON public.kpi_records(period_year, period_month);
CREATE INDEX idx_kpi_records_status       ON public.kpi_records(status);
CREATE INDEX idx_kpi_records_department   ON public.kpi_records(department_id);
CREATE INDEX idx_kpi_records_recorded_by  ON public.kpi_records(recorded_by);
CREATE INDEX idx_kpi_records_locked       ON public.kpi_records(is_locked);

-- corrective_actions
CREATE INDEX idx_corrective_actions_record   ON public.corrective_actions(kpi_record_id);
CREATE INDEX idx_corrective_actions_user     ON public.corrective_actions(responsible_user_id);
CREATE INDEX idx_corrective_actions_status   ON public.corrective_actions(status);
CREATE INDEX idx_corrective_actions_due      ON public.corrective_actions(due_date);

-- payroll_cutoffs
CREATE INDEX idx_payroll_cutoffs_period     ON public.payroll_cutoffs(period_year, period_month);
CREATE INDEX idx_payroll_cutoffs_locked     ON public.payroll_cutoffs(is_locked);

-- supervisor_submissions
CREATE INDEX idx_supervisor_submissions_cutoff     ON public.supervisor_submissions(payroll_cutoff_id);
CREATE INDEX idx_supervisor_submissions_supervisor ON public.supervisor_submissions(supervisor_id);
CREATE INDEX idx_supervisor_submissions_dept       ON public.supervisor_submissions(department_id);
CREATE INDEX idx_supervisor_submissions_status     ON public.supervisor_submissions(status);
CREATE INDEX idx_supervisor_submissions_type       ON public.supervisor_submissions(submission_type);

-- operational_metrics
CREATE INDEX idx_operational_metrics_dept    ON public.operational_metrics(department_id);
CREATE INDEX idx_operational_metrics_period  ON public.operational_metrics(period_year, period_month);
CREATE INDEX idx_operational_metrics_type    ON public.operational_metrics(metric_type);

-- supervisor_kpis
CREATE INDEX idx_supervisor_kpis_supervisor ON public.supervisor_kpis(supervisor_id);
CREATE INDEX idx_supervisor_kpis_dept       ON public.supervisor_kpis(department_id);
CREATE INDEX idx_supervisor_kpis_period     ON public.supervisor_kpis(period_year, period_month);
CREATE INDEX idx_supervisor_kpis_status     ON public.supervisor_kpis(status);

-- audit_log
CREATE INDEX idx_audit_log_user       ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_table      ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_record     ON public.audit_log(record_id);
CREATE INDEX idx_audit_log_created    ON public.audit_log(created_at);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.departments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_definitions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_records           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrective_actions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_cutoffs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_metrics   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_kpis       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log             ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- Helper function: get the current user's role from profiles
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --------------------------------------------------------
-- Helper function: get the current user's department_id
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_department_id()
RETURNS uuid AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- 5.1 departments — RLS Policies
-- ============================================================================

-- Admin: full access
CREATE POLICY admin_all_departments ON public.departments
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- Analyst: read-only
CREATE POLICY analyst_select_departments ON public.departments
  FOR SELECT USING (public.get_user_role() = 'analyst');

-- Supervisor: read only their own department
CREATE POLICY supervisor_select_departments ON public.departments
  FOR SELECT USING (
    public.get_user_role() = 'supervisor'
    AND id = public.get_user_department_id()
  );

-- ============================================================================
-- 5.2 profiles — RLS Policies
-- ============================================================================

CREATE POLICY admin_all_profiles ON public.profiles
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY analyst_select_profiles ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'analyst');

CREATE POLICY supervisor_select_profiles ON public.profiles
  FOR SELECT USING (
    public.get_user_role() = 'supervisor'
    AND (
      id = auth.uid()
      OR department_id = public.get_user_department_id()
    )
  );

-- ============================================================================
-- 5.3 kpi_definitions — RLS Policies
-- ============================================================================

CREATE POLICY admin_all_kpi_definitions ON public.kpi_definitions
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY analyst_select_kpi_definitions ON public.kpi_definitions
  FOR SELECT USING (public.get_user_role() = 'analyst');

CREATE POLICY supervisor_select_kpi_definitions ON public.kpi_definitions
  FOR SELECT USING (public.get_user_role() = 'supervisor');

-- ============================================================================
-- 5.4 kpi_records — RLS Policies
-- ============================================================================

CREATE POLICY admin_all_kpi_records ON public.kpi_records
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- Analyst: SELECT + INSERT + UPDATE
CREATE POLICY analyst_select_kpi_records ON public.kpi_records
  FOR SELECT USING (public.get_user_role() = 'analyst');

CREATE POLICY analyst_insert_kpi_records ON public.kpi_records
  FOR INSERT WITH CHECK (public.get_user_role() = 'analyst');

CREATE POLICY analyst_update_kpi_records ON public.kpi_records
  FOR UPDATE USING (public.get_user_role() = 'analyst')
  WITH CHECK (public.get_user_role() = 'analyst');

-- Supervisor: SELECT only their department
CREATE POLICY supervisor_select_kpi_records ON public.kpi_records
  FOR SELECT USING (
    public.get_user_role() = 'supervisor'
    AND department_id = public.get_user_department_id()
  );

-- ============================================================================
-- 5.5 corrective_actions — RLS Policies
-- ============================================================================

CREATE POLICY admin_all_corrective_actions ON public.corrective_actions
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY analyst_select_corrective_actions ON public.corrective_actions
  FOR SELECT USING (public.get_user_role() = 'analyst');

CREATE POLICY analyst_insert_corrective_actions ON public.corrective_actions
  FOR INSERT WITH CHECK (public.get_user_role() = 'analyst');

CREATE POLICY analyst_update_corrective_actions ON public.corrective_actions
  FOR UPDATE USING (public.get_user_role() = 'analyst')
  WITH CHECK (public.get_user_role() = 'analyst');

-- Supervisor: read corrective actions for their department's records
CREATE POLICY supervisor_select_corrective_actions ON public.corrective_actions
  FOR SELECT USING (
    public.get_user_role() = 'supervisor'
    AND kpi_record_id IN (
      SELECT id FROM public.kpi_records
      WHERE department_id = public.get_user_department_id()
    )
  );

-- ============================================================================
-- 5.6 payroll_cutoffs — RLS Policies
-- ============================================================================

CREATE POLICY admin_all_payroll_cutoffs ON public.payroll_cutoffs
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY analyst_select_payroll_cutoffs ON public.payroll_cutoffs
  FOR SELECT USING (public.get_user_role() = 'analyst');

CREATE POLICY supervisor_select_payroll_cutoffs ON public.payroll_cutoffs
  FOR SELECT USING (public.get_user_role() = 'supervisor');

-- ============================================================================
-- 5.7 supervisor_submissions — RLS Policies
-- ============================================================================

CREATE POLICY admin_all_supervisor_submissions ON public.supervisor_submissions
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- Analyst: SELECT + INSERT + UPDATE
CREATE POLICY analyst_select_supervisor_submissions ON public.supervisor_submissions
  FOR SELECT USING (public.get_user_role() = 'analyst');

CREATE POLICY analyst_insert_supervisor_submissions ON public.supervisor_submissions
  FOR INSERT WITH CHECK (public.get_user_role() = 'analyst');

CREATE POLICY analyst_update_supervisor_submissions ON public.supervisor_submissions
  FOR UPDATE USING (public.get_user_role() = 'analyst')
  WITH CHECK (public.get_user_role() = 'analyst');

-- Supervisor: SELECT + INSERT + UPDATE only for their department
CREATE POLICY supervisor_select_supervisor_submissions ON public.supervisor_submissions
  FOR SELECT USING (
    public.get_user_role() = 'supervisor'
    AND department_id = public.get_user_department_id()
  );

CREATE POLICY supervisor_insert_supervisor_submissions ON public.supervisor_submissions
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'supervisor'
    AND department_id = public.get_user_department_id()
  );

CREATE POLICY supervisor_update_supervisor_submissions ON public.supervisor_submissions
  FOR UPDATE USING (
    public.get_user_role() = 'supervisor'
    AND department_id = public.get_user_department_id()
  ) WITH CHECK (
    public.get_user_role() = 'supervisor'
    AND department_id = public.get_user_department_id()
  );

-- ============================================================================
-- 5.8 operational_metrics — RLS Policies
-- ============================================================================

CREATE POLICY admin_all_operational_metrics ON public.operational_metrics
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- Analyst: SELECT + INSERT + UPDATE
CREATE POLICY analyst_select_operational_metrics ON public.operational_metrics
  FOR SELECT USING (public.get_user_role() = 'analyst');

CREATE POLICY analyst_insert_operational_metrics ON public.operational_metrics
  FOR INSERT WITH CHECK (public.get_user_role() = 'analyst');

CREATE POLICY analyst_update_operational_metrics ON public.operational_metrics
  FOR UPDATE USING (public.get_user_role() = 'analyst')
  WITH CHECK (public.get_user_role() = 'analyst');

-- Supervisor: SELECT + INSERT + UPDATE only for their department
CREATE POLICY supervisor_select_operational_metrics ON public.operational_metrics
  FOR SELECT USING (
    public.get_user_role() = 'supervisor'
    AND department_id = public.get_user_department_id()
  );

CREATE POLICY supervisor_insert_operational_metrics ON public.operational_metrics
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'supervisor'
    AND department_id = public.get_user_department_id()
  );

CREATE POLICY supervisor_update_operational_metrics ON public.operational_metrics
  FOR UPDATE USING (
    public.get_user_role() = 'supervisor'
    AND department_id = public.get_user_department_id()
  ) WITH CHECK (
    public.get_user_role() = 'supervisor'
    AND department_id = public.get_user_department_id()
  );

-- ============================================================================
-- 5.9 supervisor_kpis — RLS Policies
-- ============================================================================

CREATE POLICY admin_all_supervisor_kpis ON public.supervisor_kpis
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY analyst_select_supervisor_kpis ON public.supervisor_kpis
  FOR SELECT USING (public.get_user_role() = 'analyst');

CREATE POLICY supervisor_select_supervisor_kpis ON public.supervisor_kpis
  FOR SELECT USING (
    public.get_user_role() = 'supervisor'
    AND (
      supervisor_id = auth.uid()
      OR department_id = public.get_user_department_id()
    )
  );

-- ============================================================================
-- 5.10 audit_log — RLS Policies
-- ============================================================================

CREATE POLICY admin_all_audit_log ON public.audit_log
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY analyst_select_audit_log ON public.audit_log
  FOR SELECT USING (public.get_user_role() = 'analyst');

-- Supervisors cannot see audit_log (no policy = no access with RLS enabled)

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
