-- ============================================================
-- PRUEBA DE CONEXIÓN POSTGRESQL
-- ============================================================
-- Ejecuta estas queries para verificar que todo funciona
-- ============================================================

-- 1. Ver versión de PostgreSQL
SELECT version();

-- 2. Ver todas las tablas del proyecto
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Ver columnas de la tabla maintenance
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'maintenance'
ORDER BY ordinal_position;

-- 4. Ver configuración semanal activa
SELECT * FROM configuracion_semanal WHERE activa = TRUE;

-- 5. Ver distribución de mantenimientos por turno
SELECT 
    COALESCE(turno_asignado, 'SIN ASIGNAR') as turno,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE estado ILIKE '%pendiente%') as pendientes,
    COUNT(*) FILTER (WHERE estado ILIKE '%complet%') as completadas
FROM maintenance
WHERE es_plantilla = FALSE
GROUP BY turno_asignado
ORDER BY turno_asignado;

-- 6. Ver estadísticas del turno matutino
SELECT * FROM obtener_estadisticas_turno('matutino');

-- 7. Ver últimos 10 mantenimientos
SELECT 
    codigo,
    tipo,
    estado,
    turno_asignado,
    fecha_programada,
    created_at
FROM maintenance
WHERE es_plantilla = FALSE
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- FIN DE PRUEBAS
-- ============================================================
