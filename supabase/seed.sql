-- ============================================================================
-- ISOPAN HR KPI Control — Seed Data for Supabase
-- Script con datos realistas para Guatemala (Moneda: Quetzales GTQ)
-- ============================================================================

-- 1. DEPARTAMENTOS
INSERT INTO public.departments (id, name, code) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Producción', 'PROD'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Empaque', 'EMP'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Mantenimiento', 'MANT'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Logística y Distribución', 'LOG'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Control de Calidad', 'CAL'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Administración y Finanzas', 'ADM')
ON CONFLICT (name) DO NOTHING;

-- 2. CATÁLOGO MAESTRO DE LOS 16 KPIS DE RR.HH.
INSERT INTO public.kpi_definitions (
  id, code, name, objective, formula, formula_key,
  target_value, target_operator, target_unit, frequency,
  responsible_role, data_source, category, sort_order, is_active
) VALUES
(
  'b1c2d3e4-0001-4000-8000-000000000001',
  'KPI-01',
  'Tiempo promedio de contratación',
  'Monitorear la agilidad del proceso de selección para cubrir plazas operativas y administrativas sin afectar la continuidad operativa.',
  '(Suma de días transcurridos desde solicitud hasta contratación de todas las vacantes) / Total de contrataciones',
  'avg_hiring_days',
  15.00,
  '<=',
  'días',
  'monthly',
  'Analista de Atracción y Talento',
  'Módulo de Reclutamiento / ATS',
  'Atracción de Talento',
  1,
  true
),
(
  'b1c2d3e4-0002-4000-8000-000000000002',
  'KPI-02',
  'Cumplimiento documental',
  'Asegurar el 100% de expedientes laborales con documentación legal guatemalteca (DPI, Contrato sellado MINTRAB, Antecedentes, IGSS, Tarjetas de salud).',
  '(Expedientes con documentación 100% completa / Total de colaboradores activos) * 100',
  'docs_compliance_pct',
  100.00,
  '>=',
  '%',
  'monthly',
  'Encargado de Expedientes y Auditoría RR.HH.',
  'Módulo de Expedientes y Auditoría',
  'Cumplimiento Legal y Auditoría',
  2,
  true
),
(
  'b1c2d3e4-0003-4000-8000-000000000003',
  'KPI-03',
  'Índice de ausentismo',
  'Controlar y reducir ausencias injustificadas y suspensiones para mitigar el sobrecosto por horas extraordinarias de cobertura.',
  '(Total horas de ausencia / Total horas laborables programadas) * 100',
  'absenteeism_rate',
  2.50,
  '<=',
  '%',
  'weekly',
  'Supervisores de Área / Analista de RR.HH.',
  'Reloj Biométrico / Asistencia',
  'Gestión de Tiempo y Asistencia',
  3,
  true
),
(
  'b1c2d3e4-0004-4000-8000-000000000004',
  'KPI-04',
  'Exactitud de nómina',
  'Garantizar el cálculo fidedigno de salarios ordinarios, extraordinarios, cuota laboral IGSS y retenciones fiscales sin reprocesos.',
  '((Total transacciones de nómina - Pagos con reclamo o ajuste) / Total transacciones de nómina) * 100',
  'payroll_accuracy_pct',
  99.50,
  '>=',
  '%',
  'monthly',
  'Coordinador de Compensaciones y Nómina',
  'Módulo de Nómina y Planilla',
  'Compensaciones y Nómina',
  4,
  true
),
(
  'b1c2d3e4-0005-4000-8000-000000000005',
  'KPI-05',
  'Costo total de nómina',
  'Mantener la erogación total de compensaciones, provisión patronal IGSS (12.67%) y pasivos laborales dentro del presupuesto mensual autorizado.',
  'Suma (Salarios ordinarios + Horas extras + Bonificaciones + Cuota patronal IGSS 12.67% + Provisión prestaciones 29.16%)',
  'total_payroll_cost',
  850000.00,
  '<=',
  'Q',
  'monthly',
  'Gerente de Recursos Humanos y Contraloría',
  'Módulo de Nómina / ERP Financiero',
  'Gestión Financiera de RR.HH.',
  5,
  true
),
(
  'b1c2d3e4-0006-4000-8000-000000000006',
  'KPI-06',
  'Nómina sobre ventas',
  'Medir el peso porcentual del costo de nómina total respecto a las ventas brutas de la organización para garantizar viabilidad financiera.',
  '(Costo total de nómina / Ventas netas totales facturadas) * 100',
  'payroll_vs_sales_pct',
  18.00,
  '<=',
  '%',
  'monthly',
  'Gerente de RR.HH. / Dirección Financiera',
  'ERP Financiero / Ventas',
  'Gestión Financiera de RR.HH.',
  6,
  true
),
(
  'b1c2d3e4-0007-4000-8000-000000000007',
  'KPI-07',
  'Índice de rotación de personal',
  'Medir la tasa mensual de bajas (renuncias voluntarias y despidos justificados) para retener el talento calificado en líneas operativas.',
  '((Total renuncias + Total despidos en el mes) / Headcount promedio del mes) * 100',
  'turnover_rate',
  3.00,
  '<=',
  '%',
  'monthly',
  'Jefe de Desarrollo Organizacional',
  'Módulo de Altas y Bajas',
  'Retención y Clima Laboral',
  7,
  true
),
(
  'b1c2d3e4-0008-4000-8000-000000000008',
  'KPI-08',
  'Incidencias laborales',
  'Monitorear amonestaciones verbales, llamadas de atención escritas, faltas al reglamento interior y quejas presentadas ante delegación MINTRAB.',
  'Total de reportes disciplinarios y quejas laborales formalizadas en el período',
  'labor_incidents_count',
  5.00,
  '<=',
  'incidencias',
  'monthly',
  'Encargado de Relaciones Laborales',
  'Módulo de Relaciones Laborales',
  'Cumplimiento Legal y Disciplinario',
  8,
  true
),
(
  'b1c2d3e4-0009-4000-8000-000000000009',
  'KPI-09',
  'Cumplimiento de programas de productividad / incentivos',
  'Medir el porcentaje de líneas de producción y equipos operativos que alcanzan la meta de bonificación por rendimiento pactada.',
  '(Colaboradores que lograron bono de productividad / Colaboradores elegibles) * 100',
  'incentive_achievement_pct',
  85.00,
  '>=',
  '%',
  'monthly',
  'Supervisores de Planta / Jefe de Producción',
  'Módulo de Producción / Metas',
  'Productividad y Desempeño',
  9,
  true
),
(
  'b1c2d3e4-0010-4000-8000-000000000010',
  'KPI-10',
  'Horas extras (% sobre horas ordinarias)',
  'Evitar fatiga del personal y sobrecostos por recargo 1.5x limitando el volumen de horas extraordinarias diurnas y mixtas trabajadas.',
  '(Total horas extras laboradas / Total horas ordinarias laboradas) * 100',
  'overtime_pct_ordinary',
  5.00,
  '<=',
  '%',
  'weekly',
  'Supervisores de Área / Gerente de Operaciones',
  'Reloj Biométrico / Nómina',
  'Gestión de Tiempo y Asistencia',
  10,
  true
),
(
  'b1c2d3e4-0011-4000-8000-000000000011',
  'KPI-11',
  'Costo de horas extras (% sobre nómina)',
  'Fiscalizar el impacto financiero de las horas extras con recargo legal sobre la planilla ordinaria de sueldos.',
  '(Monto total pagado por concepto de horas extras / Monto total de sueldos base devengados) * 100',
  'overtime_cost_pct_payroll',
  3.00,
  '<=',
  '%',
  'monthly',
  'Coordinador de Compensaciones',
  'Módulo de Nómina',
  'Gestión Financiera de RR.HH.',
  11,
  true
),
(
  'b1c2d3e4-0012-4000-8000-000000000012',
  'KPI-12',
  'Productividad por colaborador',
  'Evaluar la eficiencia manufacturera promedio por operario en unidades producidas por turno/mes.',
  'Total de unidades aptas producidas / Total de colaboradores operativos directos',
  'productivity_per_worker',
  2400.00,
  '>=',
  'unidades',
  'monthly',
  'Gerente de Producción / Analista de Procesos',
  'Módulo de Producción / ERP',
  'Productividad y Desempeño',
  12,
  true
),
(
  'b1c2d3e4-0013-4000-8000-000000000013',
  'KPI-13',
  'Vacantes pendientes críticas',
  'Garantizar que ninguna vacante operativa o técnica de criticidad alta permanezca descubierta por más de 15 días calendario.',
  'Conteo de plazas vacantes activas prioritarias con antigüedad > 15 días',
  'critical_vacancies_over_15d',
  0.00,
  '<=',
  'vacantes',
  'weekly',
  'Jefe de Reclutamiento y Selección',
  'Módulo de Reclutamiento',
  'Atracción de Talento',
  13,
  true
),
(
  'b1c2d3e4-0014-4000-8000-000000000014',
  'KPI-14',
  'Indemnizaciones y prestaciones pendientes',
  'Cumplir el plazo legal estipulado en Código de Trabajo para liquidación de prestaciones irrenunciables y pasivo laboral (meta: 0 mora > 15 días).',
  'Total finiquitos y liquidaciones pendientes de pago con más de 15 días de baja',
  'overdue_liquidations_count',
  0.00,
  '<=',
  'liquidaciones',
  'monthly',
  'Encargado de Nómina y Tesorería',
  'Módulo de Finiquitos / Tesorería',
  'Cumplimiento Legal y Auditoría',
  14,
  true
),
(
  'b1c2d3e4-0015-4000-8000-000000000015',
  'KPI-15',
  'Cumplimiento de capacitación',
  'Asegurar la ejecución del Programa Anual de Capacitación en inocuidad alimentaria (BPM), seguridad industrial y liderazgo.',
  '(Horas de capacitación efectivamente impartidas / Horas de capacitación programadas) * 100',
  'training_compliance_pct',
  90.00,
  '>=',
  '%',
  'monthly',
  'Coordinador de Capacitación y Desarrollo',
  'Módulo de Capacitación',
  'Capacitación y Desarrollo',
  15,
  true
),
(
  'b1c2d3e4-0016-4000-8000-000000000016',
  'KPI-16',
  'Cumplimiento de evaluaciones de desempeño',
  'Garantizar el 100% de evaluaciones semestrales 360° y por objetivos realizadas por los líderes a su equipo a cargo.',
  '(Total evaluaciones de desempeño completadas / Total evaluaciones programadas) * 100',
  'performance_eval_compliance_pct',
  100.00,
  '>=',
  '%',
  'semi_annual',
  'Gerente de Recursos Humanos / Todos los Jefes de Área',
  'Módulo de Evaluación de Desempeño',
  'Productividad y Desempeño',
  16,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  objective = EXCLUDED.objective,
  formula = EXCLUDED.formula,
  target_value = EXCLUDED.target_value,
  target_operator = EXCLUDED.target_operator,
  target_unit = EXCLUDED.target_unit,
  frequency = EXCLUDED.frequency;

-- 3. HISTÓRICO DE REGISTROS DE KPIS (6 MESES: JUNIO A NOVIEMBRE 2026)
-- Con variaciones realistas (Verde, Amarillo, Rojo)
INSERT INTO public.kpi_records (
  kpi_definition_id, period_year, period_month, period_week,
  actual_value, target_value, target_operator, variance, status, notes
) VALUES
-- KPI-01: Tiempo promedio de contratación (Meta: <= 15 días)
('b1c2d3e4-0001-4000-8000-000000000001', 2026, 6, NULL, 18.2, 15.0, '<=', 3.2, 'red', 'Alta rotación de operarios en turno B complicó cobertura.'),
('b1c2d3e4-0001-4000-8000-000000000001', 2026, 7, NULL, 16.5, 15.0, '<=', 1.5, 'yellow', 'Alianzas con municipalidades locales aceleraron la captación.'),
('b1c2d3e4-0001-4000-8000-000000000001', 2026, 8, NULL, 14.8, 15.0, '<=', -0.2, 'green', 'Proceso estandarizado con pruebas psicométricas rápidas.'),
('b1c2d3e4-0001-4000-8000-000000000001', 2026, 9, NULL, 13.9, 15.0, '<=', -1.1, 'green', 'Buen desempeño de filtros telefónicos previos.'),
('b1c2d3e4-0001-4000-8000-000000000001', 2026, 10, NULL, 15.4, 15.0, '<=', 0.4, 'yellow', 'Demora en validación de referencias por parte de jefes de área.'),
('b1c2d3e4-0001-4000-8000-000000000001', 2026, 11, NULL, 12.8, 15.0, '<=', -2.2, 'green', 'Pipeline optimizado con contrataciones de temporada alta.'),

-- KPI-02: Cumplimiento documental (Meta: >= 100%)
('b1c2d3e4-0002-4000-8000-000000000002', 2026, 6, NULL, 94.5, 100.0, '>=', -5.5, 'yellow', 'Faltan tarjetas de manipulación de alimentos vencidas en Planta 1.'),
('b1c2d3e4-0002-4000-8000-000000000002', 2026, 7, NULL, 96.0, 100.0, '>=', -4.0, 'yellow', 'Jornada médica para renovación de tarjetas de pulmones.'),
('b1c2d3e4-0002-4000-8000-000000000002', 2026, 8, NULL, 98.2, 100.0, '>=', -1.8, 'yellow', 'Seguimiento estricto con supervisores de turno.'),
('b1c2d3e4-0002-4000-8000-000000000002', 2026, 9, NULL, 99.1, 100.0, '>=', -0.9, 'green', '99% expedientes físicos y digitales cotejados.'),
('b1c2d3e4-0002-4000-8000-000000000002', 2026, 10, NULL, 98.5, 100.0, '>=', -1.5, 'yellow', 'Ingreso de 25 operarios temporales pendientes de entrega de penales.'),
('b1c2d3e4-0002-4000-8000-000000000002', 2026, 11, NULL, 100.0, 100.0, '>=', 0.0, 'green', 'Auditoría interna completada con 100% de expedientes al día.'),

-- KPI-03: Índice de ausentismo (Meta: <= 2.5%)
('b1c2d3e4-0003-4000-8000-000000000003', 2026, 6, NULL, 3.4, 2.5, '<=', 0.9, 'red', 'Brote de gripe estacional provocó suspensiones masivas de IGSS.'),
('b1c2d3e4-0003-4000-8000-000000000003', 2026, 7, NULL, 2.8, 2.5, '<=', 0.3, 'yellow', 'Campaña de vacunación y entrega de vitaminas en planta.'),
('b1c2d3e4-0003-4000-8000-000000000003', 2026, 8, NULL, 2.3, 2.5, '<=', -0.2, 'green', 'Normalización de asistencia en líneas principales.'),
('b1c2d3e4-0003-4000-8000-000000000003', 2026, 9, NULL, 2.1, 2.5, '<=', -0.4, 'green', 'Premio de puntualidad semanal surtió efecto en Empaque.'),
('b1c2d3e4-0003-4000-8000-000000000003', 2026, 10, NULL, 2.6, 2.5, '<=', 0.1, 'yellow', 'Ausencias en feriado del 20 de octubre sin justificación previa.'),
('b1c2d3e4-0003-4000-8000-000000000003', 2026, 11, NULL, 1.9, 2.5, '<=', -0.6, 'green', 'Excelente control de asistencia con biométrico sincronizado.'),

-- KPI-04: Exactitud de nómina (Meta: >= 99.5%)
('b1c2d3e4-0004-4000-8000-000000000004', 2026, 6, NULL, 99.1, 99.5, '>=', -0.4, 'yellow', '3 reclamos por mal cálculo de horas mixtas con nocturnas.'),
('b1c2d3e4-0004-4000-8000-000000000004', 2026, 7, NULL, 99.6, 99.5, '>=', 0.1, 'green', 'Cálculo de Bono 14 ejecutado con 0 reclamos.'),
('b1c2d3e4-0004-4000-8000-000000000004', 2026, 8, NULL, 99.7, 99.5, '>=', 0.2, 'green', 'Revisión en espejo entre nómina y jefes funcionó.'),
('b1c2d3e4-0004-4000-8000-000000000004', 2026, 9, NULL, 99.8, 99.5, '>=', 0.3, 'green', 'Planilla quincenal y mensual cuadrada al centavo.'),
('b1c2d3e4-0004-4000-8000-000000000004', 2026, 10, NULL, 99.4, 99.5, '>=', -0.1, 'yellow', 'Ajuste retroactivo por ascenso no reportado a tiempo.'),
('b1c2d3e4-0004-4000-8000-000000000004', 2026, 11, NULL, 99.9, 99.5, '>=', 0.4, 'green', 'Validación previa con candado de corte evitó errores.'),

-- KPI-05: Costo total de nómina (Meta: <= Q 850,000)
('b1c2d3e4-0005-4000-8000-000000000005', 2026, 6, NULL, 862500.0, 850000.0, '<=', 12500.0, 'yellow', 'Mayor pago de horas extra por falla mecánica en horno 3.'),
('b1c2d3e4-0005-4000-8000-000000000005', 2026, 7, NULL, 845200.0, 850000.0, '<=', -4800.0, 'green', 'Control de horas extraordinarias mantuvo costo en meta.'),
('b1c2d3e4-0005-4000-8000-000000000005', 2026, 8, NULL, 839000.0, 850000.0, '<=', -11000.0, 'green', 'Eficiencia en rotación de turnos redujo recargos.'),
('b1c2d3e4-0005-4000-8000-000000000005', 2026, 9, NULL, 842100.0, 850000.0, '<=', -7900.0, 'green', 'Estabilidad en el costo de la fuerza laboral.'),
('b1c2d3e4-0005-4000-8000-000000000005', 2026, 10, NULL, 878000.0, 850000.0, '<=', 28000.0, 'red', 'Arranque de producción de temporada navideña generó horas extra.'),
('b1c2d3e4-0005-4000-8000-000000000005', 2026, 11, NULL, 858000.0, 850000.0, '<=', 8000.0, 'yellow', 'Producción a plena capacidad; controlado dentro del margen.'),

-- KPI-06: Nómina sobre ventas (Meta: <= 18.0%)
('b1c2d3e4-0006-4000-8000-000000000006', 2026, 6, NULL, 18.9, 18.0, '<=', 0.9, 'yellow', 'Ventas ligeramente bajas por inicio de invierno.'),
('b1c2d3e4-0006-4000-8000-000000000006', 2026, 7, NULL, 17.6, 18.0, '<=', -0.4, 'green', 'Repunte en canal institucional de panadería.'),
('b1c2d3e4-0006-4000-8000-000000000006', 2026, 8, NULL, 17.2, 18.0, '<=', -0.8, 'green', 'Ratio óptimo de apalancamiento laboral.'),
('b1c2d3e4-0006-4000-8000-000000000006', 2026, 9, NULL, 16.9, 18.0, '<=', -1.1, 'green', 'Crecimiento de facturación 12% intermensual.'),
('b1c2d3e4-0006-4000-8000-000000000006', 2026, 10, NULL, 17.8, 18.0, '<=', -0.2, 'green', 'Buen desempeño comercial compensó costo de nómina.'),
('b1c2d3e4-0006-4000-8000-000000000006', 2026, 11, NULL, 16.2, 18.0, '<=', -1.8, 'green', 'Pico histórico de ventas por preventa de fin de año.'),

-- KPI-07: Índice de rotación de personal (Meta: <= 3.0%)
('b1c2d3e4-0007-4000-8000-000000000007', 2026, 6, NULL, 4.2, 3.0, '<=', 1.2, 'red', 'Salida de operarios jóvenes por lejanía de transporte nocturno.'),
('b1c2d3e4-0007-4000-8000-000000000007', 2026, 7, NULL, 3.5, 3.0, '<=', 0.5, 'yellow', 'Implementación de subsidio de transporte para turno C.'),
('b1c2d3e4-0007-4000-8000-000000000007', 2026, 8, NULL, 2.9, 3.0, '<=', -0.1, 'green', 'Se estabilizaron las líneas de empaque y horneado.'),
('b1c2d3e4-0007-4000-8000-000000000007', 2026, 9, NULL, 2.4, 3.0, '<=', -0.6, 'green', 'Entrevistas de salida muestran satisfacción con nuevo clima.'),
('b1c2d3e4-0007-4000-8000-000000000007', 2026, 10, NULL, 3.1, 3.0, '<=', 0.1, 'yellow', 'Renuncias de temporada en área de distribución.'),
('b1c2d3e4-0007-4000-8000-000000000007', 2026, 11, NULL, 2.2, 3.0, '<=', -0.8, 'green', 'Retención excelente en vísperas del pago de aguinaldo.'),

-- KPI-08: Incidencias laborales (Meta: <= 5)
('b1c2d3e4-0008-4000-8000-000000000008', 2026, 6, NULL, 6.0, 5.0, '<=', 1.0, 'yellow', 'Discusión entre operarios y uso indebido de celular en línea.'),
('b1c2d3e4-0008-4000-8000-000000000008', 2026, 7, NULL, 4.0, 5.0, '<=', -1.0, 'green', 'Reunión de alineación con delegados de seguridad.'),
('b1c2d3e4-0008-4000-8000-000000000008', 2026, 8, NULL, 3.0, 5.0, '<=', -2.0, 'green', 'Cero denuncias ante inspección de trabajo.'),
('b1c2d3e4-0008-4000-8000-000000000008', 2026, 9, NULL, 2.0, 5.0, '<=', -3.0, 'green', 'Clima de respeto y aplicación consistente del reglamento.'),
('b1c2d3e4-0008-4000-8000-000000000008', 2026, 10, NULL, 5.0, 5.0, '<=', 0.0, 'green', 'Llamadas de atención por incumplimiento de EPP.'),
('b1c2d3e4-0008-4000-8000-000000000008', 2026, 11, NULL, 2.0, 5.0, '<=', -3.0, 'green', 'Cero conflictos graves; canal de sugerencias activo.'),

-- KPI-09: Cumplimiento de programas de productividad / incentivos (Meta: >= 85.0%)
('b1c2d3e4-0009-4000-8000-000000000009', 2026, 6, NULL, 81.5, 85.0, '>=', -3.5, 'yellow', 'Cuellos de botella en empaque redujeron cumplimiento.'),
('b1c2d3e4-0009-4000-8000-000000000009', 2026, 7, NULL, 86.2, 85.0, '>=', 1.2, 'green', 'Mejora en velocidad de envolvedoras automáticas.'),
('b1c2d3e4-0009-4000-8000-000000000009', 2026, 8, NULL, 88.4, 85.0, '>=', 3.4, 'green', 'Planta operando a ritmo óptimo; buen pago de incentivos.'),
('b1c2d3e4-0009-4000-8000-000000000009', 2026, 9, NULL, 87.1, 85.0, '>=', 2.1, 'green', '87% del personal alcanzó el bono de productividad pactado.'),
('b1c2d3e4-0009-4000-8000-000000000009', 2026, 10, NULL, 84.0, 85.0, '>=', -1.0, 'yellow', 'Paro no programado de línea de pan dulce restó puntos.'),
('b1c2d3e4-0009-4000-8000-000000000009', 2026, 11, NULL, 91.3, 85.0, '>=', 6.3, 'green', 'Récord de cajas producidas y empacadas en el mes.'),

-- KPI-10: Horas extras (% sobre horas ordinarias) (Meta: <= 5.0%)
('b1c2d3e4-0010-4000-8000-000000000010', 2026, 6, NULL, 6.8, 5.0, '<=', 1.8, 'red', 'Falta de personal en turno mixto obligó a doblar turnos.'),
('b1c2d3e4-0010-4000-8000-000000000010', 2026, 7, NULL, 5.4, 5.0, '<=', 0.4, 'yellow', 'Contratación de refuerzo temporal empezó a surtir efecto.'),
('b1c2d3e4-0010-4000-8000-000000000010', 2026, 8, NULL, 4.6, 5.0, '<=', -0.4, 'green', 'Planificación semanal de turnos aprobada con anticipación.'),
('b1c2d3e4-0010-4000-8000-000000000010', 2026, 9, NULL, 4.2, 5.0, '<=', -0.8, 'green', 'Supervisores controlaron salida puntual de operarios.'),
('b1c2d3e4-0010-4000-8000-000000000010', 2026, 10, NULL, 6.2, 5.0, '<=', 1.2, 'red', 'Pico de producción de pan de temporada y retraso de proveedores.'),
('b1c2d3e4-0010-4000-8000-000000000010', 2026, 11, NULL, 4.9, 5.0, '<=', -0.1, 'green', 'Ajuste de tercer turno cubrió demanda sin disparar horas extra.'),

-- KPI-11: Costo de horas extras (% sobre nómina) (Meta: <= 3.0%)
('b1c2d3e4-0011-4000-8000-000000000011', 2026, 6, NULL, 4.1, 3.0, '<=', 1.1, 'red', 'Recargo 1.5x afectó el balance mensual de nómina.'),
('b1c2d3e4-0011-4000-8000-000000000011', 2026, 7, NULL, 3.3, 3.0, '<=', 0.3, 'yellow', 'Control semanal y validación previa de papeletas.'),
('b1c2d3e4-0011-4000-8000-000000000011', 2026, 8, NULL, 2.7, 3.0, '<=', -0.3, 'green', 'Dentro de parámetro presupuestario.'),
('b1c2d3e4-0011-4000-8000-000000000011', 2026, 9, NULL, 2.5, 3.0, '<=', -0.5, 'green', 'Costo contenido exitosamente.'),
('b1c2d3e4-0011-4000-8000-000000000011', 2026, 10, NULL, 3.7, 3.0, '<=', 0.7, 'red', 'Exceso en Mantenimiento y Producción.'),
('b1c2d3e4-0011-4000-8000-000000000011', 2026, 11, NULL, 2.9, 3.0, '<=', -0.1, 'green', 'Alineado con meta ejecutiva.'),

-- KPI-12: Productividad por colaborador (Meta: >= 2400 unidades)
('b1c2d3e4-0012-4000-8000-000000000012', 2026, 6, NULL, 2310.0, 2400.0, '>=', -90.0, 'yellow', 'Curva de aprendizaje de nuevos ingresos.'),
('b1c2d3e4-0012-4000-8000-000000000012', 2026, 7, NULL, 2430.0, 2400.0, '>=', 30.0, 'green', 'Capacitación en puesto elevó rendimiento.'),
('b1c2d3e4-0012-4000-8000-000000000012', 2026, 8, NULL, 2480.0, 2400.0, '>=', 80.0, 'green', 'Líneas continuas sin fallas de amasado.'),
('b1c2d3e4-0012-4000-8000-000000000012', 2026, 9, NULL, 2520.0, 2400.0, '>=', 120.0, 'green', 'Excelente coordinación entre producción y empaque.'),
('b1c2d3e4-0012-4000-8000-000000000012', 2026, 10, NULL, 2410.0, 2400.0, '>=', 10.0, 'green', 'Cumple meta con buena cadencia de turno.'),
('b1c2d3e4-0012-4000-8000-000000000012', 2026, 11, NULL, 2650.0, 2400.0, '>=', 250.0, 'green', 'Alta productividad en líneas de pan de molde y tostadas.'),

-- KPI-13: Vacantes pendientes críticas (Meta: <= 0)
('b1c2d3e4-0013-4000-8000-000000000013', 2026, 6, NULL, 2.0, 0.0, '<=', 2.0, 'red', 'Técnico electromecánico y panadero maestro pendientes.'),
('b1c2d3e4-0013-4000-8000-000000000013', 2026, 7, NULL, 1.0, 0.0, '<=', 1.0, 'yellow', 'Se contrató panadero; sigue abierto técnico electromecánico.'),
('b1c2d3e4-0013-4000-8000-000000000013', 2026, 8, NULL, 0.0, 0.0, '<=', 0.0, 'green', 'Todas las plazas cubiertas a tiempo.'),
('b1c2d3e4-0013-4000-8000-000000000013', 2026, 9, NULL, 0.0, 0.0, '<=', 0.0, 'green', 'Planta operando con plantilla autorizada 100%.'),
('b1c2d3e4-0013-4000-8000-000000000013', 2026, 10, NULL, 1.0, 0.0, '<=', 1.0, 'yellow', 'Supervisor de ruta foránea con 18 días en proceso.'),
('b1c2d3e4-0013-4000-8000-000000000013', 2026, 11, NULL, 0.0, 0.0, '<=', 0.0, 'green', 'Plazas de temporada cubiertas al 100%.'),

-- KPI-14: Indemnizaciones y prestaciones pendientes (Meta: <= 0)
('b1c2d3e4-0014-4000-8000-000000000014', 2026, 6, NULL, 0.0, 0.0, '<=', 0.0, 'green', 'Liquidaciones pagadas dentro de los 10 días de ley.'),
('b1c2d3e4-0014-4000-8000-000000000014', 2026, 7, NULL, 0.0, 0.0, '<=', 0.0, 'green', 'Finiquitos firmados con acta notarial.'),
('b1c2d3e4-0014-4000-8000-000000000014', 2026, 8, NULL, 1.0, 0.0, '<=', 1.0, 'yellow', 'Ex-colaborador no se presentó a firmar finiquito en banco.'),
('b1c2d3e4-0014-4000-8000-000000000014', 2026, 9, NULL, 0.0, 0.0, '<=', 0.0, 'green', 'Finiquito rezagado fue solventado con cheque de gerencia.'),
('b1c2d3e4-0014-4000-8000-000000000014', 2026, 10, NULL, 0.0, 0.0, '<=', 0.0, 'green', 'Cero pasivos pendientes; conciliaciones bancarias al día.'),
('b1c2d3e4-0014-4000-8000-000000000014', 2026, 11, NULL, 0.0, 0.0, '<=', 0.0, 'green', 'Pagos al día; no hay reclamos laborales abiertos.'),

-- KPI-15: Cumplimiento de capacitación (Meta: >= 90.0%)
('b1c2d3e4-0015-4000-8000-000000000015', 2026, 6, NULL, 86.0, 90.0, '>=', -4.0, 'yellow', 'Faltó turno noche por coincidir con mantenimiento general.'),
('b1c2d3e4-0015-4000-8000-000000000015', 2026, 7, NULL, 91.5, 90.0, '>=', 1.5, 'green', 'Capacitación en BPM con aval de INTECAP.'),
('b1c2d3e4-0015-4000-8000-000000000015', 2026, 8, NULL, 93.0, 90.0, '>=', 3.0, 'green', 'Taller de primeros auxilios y evacuación de conatos de incendio.'),
('b1c2d3e4-0015-4000-8000-000000000015', 2026, 9, NULL, 94.2, 90.0, '>=', 4.2, 'green', 'Excelente asistencia del personal administrativo y operativo.'),
('b1c2d3e4-0015-4000-8000-000000000015', 2026, 10, NULL, 88.5, 90.0, '>=', -1.5, 'yellow', 'Reprogramación de módulo de inocuidad para noviembre.'),
('b1c2d3e4-0015-4000-8000-000000000015', 2026, 11, NULL, 95.0, 90.0, '>=', 5.0, 'green', 'Cierre anual del programa de competencias con éxito.'),

-- KPI-16: Cumplimiento de evaluaciones de desempeño (Meta: = 100%)
('b1c2d3e4-0016-4000-8000-000000000016', 2026, 6, NULL, 98.0, 100.0, '=', -2.0, 'yellow', 'Evaluación Semestre 1 cerrada; 3 jefes entregaron con retraso.'),
('b1c2d3e4-0016-4000-8000-000000000016', 2026, 11, NULL, 100.0, 100.0, '=', 0.0, 'green', 'Cierre 100% evaluación anual anticipada para cálculo de ascensos.');

-- 4. PERIODOS DE CORTE DE PLANILLA (PAYROLL CUTOFFS)
INSERT INTO public.payroll_cutoffs (
  id, period_year, period_month, cutoff_datetime, warning_hours_before, is_locked, notes
) VALUES
(
  'c1d2e3f4-0001-4000-8000-000000000001',
  2026, 10,
  '2026-10-28 17:00:00-06',
  12,
  true,
  'Corte ordinario de fin de mes de octubre cerrado con éxito.'
),
(
  'c1d2e3f4-0002-4000-8000-000000000002',
  2026, 11,
  '2026-11-27 17:00:00-06',
  12,
  false,
  'Período activo para novedades de noviembre (corte en cuenta regresiva).'
)
ON CONFLICT (period_year, period_month) DO NOTHING;

-- 5. ACCIONES CORRECTIVAS DE EJEMPLO
INSERT INTO public.corrective_actions (
  kpi_record_id, description, due_date, status, completion_date, evidence_notes
)
SELECT
  r.id,
  'Implementar ruta nocturna de microbús para colaboradores del turno mixto y renegociar bonificación de puntualidad.',
  '2026-07-15',
  'completed',
  '2026-07-12',
  'Se contrató servicio de transporte con Transportes San José S.A. Rotación bajó a 2.9% en agosto.'
FROM public.kpi_records r
JOIN public.kpi_definitions d ON r.kpi_definition_id = d.id
WHERE d.code = 'KPI-07' AND r.period_year = 2026 AND r.period_month = 6
LIMIT 1;

INSERT INTO public.corrective_actions (
  kpi_record_id, description, due_date, status, evidence_notes
)
SELECT
  r.id,
  'Auditoría y jornada médica con Centro de Salud de Mixco para emisión exprés de tarjetas de pulmones.',
  '2026-11-20',
  'in_progress',
  'Coordinado con el inspector de saneamiento para 35 colaboradores pendientes.'
FROM public.kpi_records r
JOIN public.kpi_definitions d ON r.kpi_definition_id = d.id
WHERE d.code = 'KPI-02' AND r.period_year = 2026 AND r.period_month = 10
LIMIT 1;

INSERT INTO public.corrective_actions (
  kpi_record_id, description, due_date, status, evidence_notes
)
SELECT
  r.id,
  'Rebalanceo de líneas de horneado y activación de turno extraordinario voluntario con pre-aprobación obligatoria.',
  '2026-11-15',
  'in_progress',
  'Se limitó el tope máximo a 8 horas extras semanales por operario para evitar fatiga.'
FROM public.kpi_records r
JOIN public.kpi_definitions d ON r.kpi_definition_id = d.id
WHERE d.code = 'KPI-10' AND r.period_year = 2026 AND r.period_month = 10
LIMIT 1;

-- 6. EVALUACIÓN Y RANKING PREDICTIVO DE JEFES INMEDIATOS
INSERT INTO public.supervisor_kpis (
  department_id, period_year, period_month,
  payroll_closure_pct, biometric_justification_pct, interview_response_days,
  evaluation_progress_pct, training_progress_pct, overall_score, status
) VALUES
('a1b2c3d4-0001-4000-8000-000000000001', 2026, 11, 95.0, 92.0, 2.1, 90.0, 94.0, 92.6, 'green'), -- Producción
('a1b2c3d4-0002-4000-8000-000000000002', 2026, 11, 100.0, 98.0, 1.4, 100.0, 96.0, 98.8, 'green'), -- Empaque (Líder del ranking)
('a1b2c3d4-0003-4000-8000-000000000003', 2026, 11, 75.0, 68.0, 4.5, 60.0, 70.0, 68.2, 'red'),   -- Mantenimiento (En alerta)
('a1b2c3d4-0004-4000-8000-000000000004', 2026, 11, 88.0, 84.0, 2.8, 85.0, 88.0, 86.4, 'yellow'), -- Logística
('a1b2c3d4-0005-4000-8000-000000000005', 2026, 11, 98.0, 96.0, 1.8, 95.0, 98.0, 96.7, 'green'), -- Calidad
('a1b2c3d4-0006-4000-8000-000000000006', 2026, 11, 100.0, 99.0, 1.2, 100.0, 95.0, 98.8, 'green') -- Administración
ON CONFLICT (department_id, period_year, period_month) DO UPDATE SET
  payroll_closure_pct = EXCLUDED.payroll_closure_pct,
  biometric_justification_pct = EXCLUDED.biometric_justification_pct,
  overall_score = EXCLUDED.overall_score,
  status = EXCLUDED.status;

-- 7. METRICAS OPERACIONALES DE APOYO (NOVIEMBRE 2026)
INSERT INTO public.operational_metrics (department_id, period_year, period_month, period_week, metric_type, value, notes) VALUES
('a1b2c3d4-0001-4000-8000-000000000001', 2026, 11, NULL, 'headcount', 125, 'Personal fijo en turnos rotativos A, B y C'),
('a1b2c3d4-0001-4000-8000-000000000001', 2026, 11, NULL, 'ordinary_hours', 22000, 'Total horas normales trabajadas'),
('a1b2c3d4-0001-4000-8000-000000000001', 2026, 11, NULL, 'overtime_hours', 1080, 'Horas extra acumuladas autorizadas'),
('a1b2c3d4-0001-4000-8000-000000000001', 2026, 11, NULL, 'units_produced', 331250, 'Unidades de pan empacadas y aptas'),
('a1b2c3d4-0002-4000-8000-000000000002', 2026, 11, NULL, 'headcount', 65, 'Operarios de empaque y sellado térmico');

-- ============================================================================
-- FIN DEL SCRIPT SEED
-- ============================================================================

