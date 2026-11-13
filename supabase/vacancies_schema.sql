-- ============================================================================
-- TABLA DE GESTIÓN DE VACANTES, PLAZAS Y SLA DE RESPUESTA DE JEFES
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.recruitment_vacancies (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_no           int,
  position_name         text        NOT NULL,
  supervisor_name       text        NOT NULL,
  supervisor_id         uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  department_name       text,
  vacancy_type          text        DEFAULT 'Sustitución',
  replacement_for       text,
  status                text        CHECK (status IN ('VIGENTE', 'EN_PRUEBA', 'CERRADA', 'CONGELADA')) DEFAULT 'VIGENTE',
  requested_date        date        NOT NULL DEFAULT CURRENT_DATE,
  closed_date           date,
  total_days            int         DEFAULT 1,
  hr_days               int         DEFAULT 1,
  supervisor_days       int         DEFAULT 0,
  current_owner         text        CHECK (current_owner IN ('hr', 'supervisor')) DEFAULT 'supervisor',
  candidate_in_process  text,
  hired_candidate       text,
  observations          text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- Desactivar RLS o dar permisos para permitir operaciones
ALTER TABLE public.recruitment_vacancies DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.recruitment_vacancies TO anon, authenticated, postgres, service_role;

