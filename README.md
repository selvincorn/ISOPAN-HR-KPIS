# ISOPAN HR KPI Control

> **Sistema Gerencial de Indicadores de Recursos Humanos y Cumplimiento Laboral para Guatemala**  
> Desarrollado con React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons y Supabase (PostgreSQL + RLS).

---

## 🏗️ Arquitectura del Sistema

### 1. Base de Datos (Supabase / PostgreSQL)
- **10 Tablas Normalizadas**:
  - `departments`: Estructura organizacional (Producción, Empaque, Mantenimiento, Logística, Calidad, Administración).
  - `profiles`: Extensión de `auth.users` con roles (`admin`, `analyst`, `supervisor`).
  - `kpi_definitions`: Catálogo de los 16 KPIs maestros con fórmulas, frecuencias y metas.
  - `kpi_records`: Histórico de mediciones con cálculo automático de variación y estatus.
  - `corrective_actions`: Planes de acción con responsables y fechas de compromiso para desviaciones.
  - `payroll_cutoffs`: Fechas y horas de corte con candado automático para novedades de planilla.
  - `supervisor_submissions`: Registro de horas extras, bonos, permisos y justificaciones biométricas.
  - `operational_metrics`: Métricas de soporte para el motor de cálculo automático.
  - `supervisor_kpis`: Leading indicators y ranking de cumplimiento de jefaturas.
  - `audit_log`: Trazabilidad completa de cambios.
- **Row Level Security (RLS)**:
  - `admin`: Acceso y configuración total.
  - `analyst`: Auditoría, carga de datos y reportes.
  - `supervisor`: Acceso restringido exclusivamente a su departamento.

### 2. Catálogo Maestro de 16 KPIs Precargados
1. **KPI-01:** Tiempo promedio de contratación (Meta: $\le$ 15 días).
2. **KPI-02:** Cumplimiento documental (Meta: $\ge$ 100% de expedientes legales).
3. **KPI-03:** Índice de ausentismo (Meta: $\le$ 2.5%).
4. **KPI-04:** Exactitud de nómina (Meta: $\ge$ 99.5%).
5. **KPI-05:** Costo total de nómina (Meta: $\le$ Presupuesto en Quetzales).
6. **KPI-06:** Nómina sobre ventas (Meta: $\le$ 18.0%).
7. **KPI-07:** Índice de rotación de personal (Meta: $\le$ 3.0%).
8. **KPI-08:** Incidencias laborales (Meta: $\le$ 5 incidencias).
9. **KPI-09:** Cumplimiento de programas de incentivos (Meta: $\ge$ 85.0%).
10. **KPI-10:** Horas extras % sobre ordinarias (Meta: $\le$ 5.0%).
11. **KPI-11:** Costo de horas extras % sobre nómina (Meta: $\le$ 3.0%).
12. **KPI-12:** Productividad por colaborador (Meta: $\ge$ 2,400 unidades).
13. **KPI-13:** Vacantes pendientes críticas (Meta: 0 vacantes $>$ 15 días).
14. **KPI-14:** Indemnizaciones y prestaciones pendientes (Meta: 0 moras $>$ 15 días).
15. **KPI-15:** Cumplimiento de capacitación (Meta: $\ge$ 90.0%).
16. **KPI-16:** Cumplimiento de evaluaciones de desempeño (Meta: 100%).

### 3. Módulo Predictivo de Supervisores (Leading Indicators)
- **Candado de Corte en Tiempo Real:** Cuenta regresiva con alertas visuales (Verde $>$ 24h, Amarillo 12-24h, Rojo $<$ 12h y Bloqueo al vencer).
- **Boleta de Excepción Fuera de Corte:** Registro tardío requiere justificación obligatoria y penaliza el KPI del supervisor.
- **Ranking Predictivo:** Calificación global basada en cierre a corte, justificación biométrica $<$ 24h y respuesta a entrevistas.

---

## 🚀 Despliegue en Supabase (Paso a Paso)

1. Ingresa a [https://supabase.com](https://supabase.com) y crea un nuevo proyecto (ej. `isopan-hr-kpi`).
2. Abre el **SQL Editor** en la consola de Supabase.
3. Copia y ejecuta el contenido completo del archivo:
   - [supabase/schema.sql](supabase/schema.sql)
4. A continuación, copia y ejecuta el script de datos de prueba:
   - [supabase/seed.sql](supabase/seed.sql)
5. En **Project Settings > API**, copia:
   - **Project URL**
   - **anon / public key**

---

## 🌐 Configuración y Despliegue en Vercel

### 1. Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```

### 2. Despliegue en Vercel
1. Conecta tu repositorio de GitHub / GitLab en [vercel.com](https://vercel.com).
2. Configuración del proyecto en Vercel:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. En **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. El archivo [vercel.json](vercel.json) incluido reescribe automáticamente todas las rutas SPA hacia `/index.html` para evitar errores 404 en navegación directa.

