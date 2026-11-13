-- ============================================================================
-- HABILITAR ACCESO DE LECTURA Y ESCRITURA INMEDIATA PARA EL FRONTEND (ANON)
-- Ejecuta este script en el SQL Editor de Supabase para que la app web pueda
-- guardar registros, novedades y acciones correctivas sin bloqueos de RLS.
-- ============================================================================

-- 1. Desactivar RLS o permitir políticas públicas para desarrollo
ALTER TABLE public.kpi_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrective_actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_cutoffs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;

-- 2. Asegurar que las columnas opcionales no bloqueen inserts sin usuario autenticado
ALTER TABLE public.supervisor_kpis ALTER COLUMN supervisor_id DROP NOT NULL;
ALTER TABLE public.supervisor_submissions ALTER COLUMN supervisor_id DROP NOT NULL;
ALTER TABLE public.supervisor_submissions ALTER COLUMN payroll_cutoff_id DROP NOT NULL;
ALTER TABLE public.kpi_records ALTER COLUMN recorded_by DROP NOT NULL;
ALTER TABLE public.corrective_actions ALTER COLUMN responsible_user_id DROP NOT NULL;

-- 3. Otorgar permisos al rol anon y authenticated
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- Listo: Ahora cualquier formulario de la app insertará directamente en la base de datos de Supabase.

