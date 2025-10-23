-- ============================================================
-- PASOS 8, 9, 10, 11 - EJECUTAR DESPUÉS DEL PASO 7
-- ============================================================
-- Este archivo contiene los pasos finales de la migración
-- Ejecutar TODO este código de una sola vez en Supabase
-- ============================================================

-- ============================================================
-- PASO 8: POLÍTICAS RLS PARA TURNOS (OPCIONAL - SOLO SI USAS SUPABASE AUTH)
-- ============================================================

DROP POLICY IF EXISTS "Turnos ven solo sus tareas" ON maintenance;
DROP POLICY IF EXISTS "Turnos actualizan sus tareas" ON maintenance;
DROP POLICY IF EXISTS "Admin ve todo" ON maintenance;
DROP POLICY IF EXISTS "Jefe ve todo" ON maintenance;
DROP POLICY IF EXISTS "Turnos ven sus tareas asignadas" ON maintenance;
DROP POLICY IF EXISTS "Solo admins crean mantenimientos" ON maintenance;
DROP POLICY IF EXISTS "Solo admins eliminan mantenimientos" ON maintenance;

CREATE POLICY "Turnos ven sus tareas asignadas" ON maintenance FOR SELECT USING (COALESCE(current_setting('request.jwt.claims', true)::json->>'role', '') IN ('administrador', 'jefe') OR (turno_asignado = COALESCE(current_setting('request.jwt.claims', true)::json->>'turno', '') AND es_plantilla = FALSE) OR (es_plantilla = TRUE AND COALESCE(current_setting('request.jwt.claims', true)::json->>'role', '') IN ('administrador', 'jefe')));

CREATE POLICY "Solo admins crean mantenimientos" ON maintenance FOR INSERT WITH CHECK (COALESCE(current_setting('request.jwt.claims', true)::json->>'role', '') IN ('administrador', 'jefe'));

CREATE POLICY "Turnos actualizan sus tareas" ON maintenance FOR UPDATE USING (COALESCE(current_setting('request.jwt.claims', true)::json->>'role', '') IN ('administrador', 'jefe') OR (turno_asignado = COALESCE(current_setting('request.jwt.claims', true)::json->>'turno', '') AND es_plantilla = FALSE));

CREATE POLICY "Solo admins eliminan mantenimientos" ON maintenance FOR DELETE USING (COALESCE(current_setting('request.jwt.claims', true)::json->>'role', '') IN ('administrador', 'jefe'));

-- ============================================================
-- PASO 9: FUNCIONES DE ESTADÍSTICAS
-- ============================================================

DROP FUNCTION IF EXISTS obtener_estadisticas_turno(VARCHAR);
DROP FUNCTION IF EXISTS obtener_config_semanal_activa();

CREATE OR REPLACE FUNCTION obtener_estadisticas_turno(p_turno VARCHAR(20))
RETURNS TABLE(
    total_tareas BIGINT,
    pendientes BIGINT,
    en_progreso BIGINT,
    completadas BIGINT,
    vencidas BIGINT,
    porcentaje_completado NUMERIC,
    porcentaje_vencido NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_tareas,
        COUNT(*) FILTER (WHERE estado = 'pendiente' OR estado = 'Pendiente' OR estado = 'Programado')::BIGINT as pendientes,
        COUNT(*) FILTER (WHERE estado = 'en_progreso' OR estado = 'En Progreso')::BIGINT as en_progreso,
        COUNT(*) FILTER (WHERE estado = 'completada' OR estado = 'Completada' OR estado = 'completado')::BIGINT as completadas,
        COUNT(*) FILTER (WHERE fecha_programada < CURRENT_DATE AND (estado != 'completada' AND estado != 'Completada'))::BIGINT as vencidas,
        ROUND((COUNT(*) FILTER (WHERE estado ILIKE '%complet%')::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2) as porcentaje_completado,
        ROUND((COUNT(*) FILTER (WHERE fecha_programada < CURRENT_DATE AND estado NOT ILIKE '%complet%')::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2) as porcentaje_vencido
    FROM maintenance
    WHERE turno_asignado = p_turno AND es_plantilla = FALSE AND fecha_programada >= CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION obtener_config_semanal_activa()
RETURNS TABLE(
    semana INTEGER,
    ano INTEGER,
    turno_doble VARCHAR(20),
    matutino_ops INTEGER,
    vespertino_ops INTEGER,
    nocturno_ops INTEGER,
    intermedio_ops INTEGER,
    matutino_pct INTEGER,
    vespertino_pct INTEGER,
    nocturno_pct INTEGER,
    intermedio_pct INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        semana_numero as semana,
        ano,
        turno_doble,
        operadores_matutino as matutino_ops,
        operadores_vespertino as vespertino_ops,
        operadores_nocturno as nocturno_ops,
        operadores_intermedio as intermedio_ops,
        porcentaje_matutino as matutino_pct,
        porcentaje_vespertino as vespertino_pct,
        porcentaje_nocturno as nocturno_pct,
        porcentaje_intermedio as intermedio_pct
    FROM configuracion_semanal
    WHERE semana_numero = EXTRACT(WEEK FROM CURRENT_DATE) AND ano = EXTRACT(YEAR FROM CURRENT_DATE) AND activa = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PASO 10: COMENTARIO EN BACKUP
-- ============================================================

COMMENT ON TABLE operators_backup IS 'Backup de tabla operators antes de migración a sistema de turnos';

-- ============================================================
-- PASO 11: VERIFICACIÓN DE MIGRACIÓN
-- ============================================================

SELECT '✅ PASO 11: VERIFICACIÓN INICIADA' as mensaje;

SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'maintenance' AND column_name = 'turno_asignado';

SELECT semana_numero, ano, turno_doble, porcentaje_matutino, porcentaje_vespertino, porcentaje_nocturno, porcentaje_intermedio, operadores_matutino, operadores_vespertino, operadores_nocturno, operadores_intermedio, configurado_por, fecha_configuracion FROM configuracion_semanal WHERE activa = TRUE ORDER BY created_at DESC LIMIT 1;

SELECT COALESCE(turno_asignado, 'SIN ASIGNAR') as turno, COUNT(*) as total, COUNT(*) FILTER (WHERE estado ILIKE '%pendiente%' OR estado ILIKE '%programado%') as pendientes, COUNT(*) FILTER (WHERE estado ILIKE '%progreso%') as en_progreso, COUNT(*) FILTER (WHERE estado ILIKE '%complet%') as completadas FROM maintenance WHERE es_plantilla = FALSE GROUP BY turno_asignado ORDER BY turno_asignado NULLS LAST;

SELECT 'MATUTINO' as turno, * FROM obtener_estadisticas_turno('matutino') UNION ALL SELECT 'VESPERTINO' as turno, * FROM obtener_estadisticas_turno('vespertino') UNION ALL SELECT 'NOCTURNO' as turno, * FROM obtener_estadisticas_turno('nocturno') UNION ALL SELECT 'INTERMEDIO' as turno, * FROM obtener_estadisticas_turno('intermedio');

SELECT routine_name, routine_type, data_type as return_type FROM information_schema.routines WHERE routine_name IN ('asignar_turno_automatico', 'obtener_estadisticas_turno', 'obtener_config_semanal_activa');

SELECT trigger_name, event_manipulation, event_object_table, action_statement FROM information_schema.triggers WHERE event_object_table = 'maintenance' AND trigger_name = 'trigger_asignar_turno';

SELECT table_name FROM information_schema.views WHERE table_name = 'v_mantenimientos_por_turno';

SELECT tablename, schemaname FROM pg_tables WHERE tablename IN ('maintenance_backup', 'operators_backup');

SELECT '✅ MIGRACIÓN COMPLETADA' as status, CURRENT_TIMESTAMP as fecha_verificacion, (SELECT COUNT(*) FROM configuracion_semanal WHERE activa = TRUE) as configuraciones_activas, (SELECT COUNT(*) FROM maintenance WHERE turno_asignado IS NOT NULL) as mantenimientos_con_turno, (SELECT COUNT(*) FROM maintenance WHERE turno_asignado IS NULL AND es_plantilla = FALSE) as mantenimientos_sin_turno;
