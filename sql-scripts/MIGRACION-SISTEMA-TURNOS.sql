-- ============================================================
-- MIGRACIÓN A SISTEMA POR TURNOS FIJOS - VERSIÓN LIMPIA
-- ============================================================
-- PASOS 1-7: Ejecutar en orden
-- PASOS 8-11: Usar archivo PASOS-8-9-10-11-EJECUTAR.sql
-- ============================================================

-- ============================================================
-- PASO 1: BACKUP DE DATOS IMPORTANTES
-- ============================================================

CREATE TABLE IF NOT EXISTS maintenance_backup AS SELECT * FROM maintenance;
CREATE TABLE IF NOT EXISTS operators_backup AS SELECT * FROM operators;

-- ============================================================
-- PASO 2: MODIFICAR TABLA MAINTENANCE
-- ============================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance' AND column_name = 'turno_asignado') THEN
        ALTER TABLE maintenance ADD COLUMN turno_asignado VARCHAR(20);
    END IF;
END $$;

ALTER TABLE maintenance ADD CONSTRAINT check_turno_valido CHECK (turno_asignado IN ('matutino', 'vespertino', 'nocturno', 'intermedio'));

COMMENT ON COLUMN maintenance.turno_asignado IS 'Turno fijo asignado (matutino/vespertino/nocturno/intermedio). Reemplaza operador_asignado_id individual.';

-- ============================================================
-- PASO 3: MIGRAR DATOS EXISTENTES
-- ============================================================

UPDATE maintenance m SET turno_asignado = CASE WHEN o.turno ILIKE '%matutino%' OR o.turno ILIKE '%mañana%' THEN 'matutino' WHEN o.turno ILIKE '%vespertino%' OR o.turno ILIKE '%tarde%' THEN 'vespertino' WHEN o.turno ILIKE '%nocturno%' OR o.turno ILIKE '%noche%' THEN 'nocturno' WHEN o.turno ILIKE '%intermedio%' THEN 'intermedio' ELSE 'matutino' END FROM operators o WHERE m.operador_asignado_id = o.id;

UPDATE maintenance SET turno_asignado = 'matutino' WHERE turno_asignado IS NULL;

-- ============================================================
-- PASO 4: CREAR TABLA DE CONFIGURACIÓN SEMANAL
-- ============================================================

CREATE TABLE IF NOT EXISTS configuracion_semanal (
    id SERIAL PRIMARY KEY,
    semana_numero INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    turno_doble VARCHAR(20) NOT NULL CHECK (turno_doble IN ('matutino', 'vespertino')),
    porcentaje_matutino INTEGER DEFAULT 30,
    porcentaje_vespertino INTEGER DEFAULT 30,
    porcentaje_nocturno INTEGER DEFAULT 10,
    porcentaje_intermedio INTEGER DEFAULT 10,
    operadores_matutino INTEGER DEFAULT 1,
    operadores_vespertino INTEGER DEFAULT 1,
    operadores_nocturno INTEGER DEFAULT 1,
    operadores_intermedio INTEGER DEFAULT 1,
    fecha_configuracion TIMESTAMPTZ DEFAULT NOW(),
    configurado_por VARCHAR(100),
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(semana_numero, ano)
);

COMMENT ON TABLE configuracion_semanal IS 'Configuración semanal de distribución de carga por turnos. Se configura cada lunes.';

CREATE INDEX idx_config_semanal_activa ON configuracion_semanal(activa, ano, semana_numero);

-- ============================================================
-- PASO 5: INSERTAR CONFIGURACIÓN INICIAL
-- ============================================================

DO $$
DECLARE
    v_semana INTEGER;
    v_ano INTEGER;
BEGIN
    v_semana := EXTRACT(WEEK FROM CURRENT_DATE);
    v_ano := EXTRACT(YEAR FROM CURRENT_DATE);
    INSERT INTO configuracion_semanal (semana_numero, ano, turno_doble, porcentaje_matutino, porcentaje_vespertino, porcentaje_nocturno, porcentaje_intermedio, operadores_matutino, operadores_vespertino, operadores_nocturno, operadores_intermedio, configurado_por, activa) VALUES (v_semana, v_ano, 'matutino', 60, 30, 10, 10, 2, 1, 1, 1, 'SISTEMA', TRUE) ON CONFLICT (semana_numero, ano) DO NOTHING;
END $$;

-- ============================================================
-- PASO 6: CREAR VISTA SIMPLIFICADA
-- ============================================================

CREATE OR REPLACE VIEW v_mantenimientos_por_turno AS
SELECT m.id, m.codigo, m.tipo, m.descripcion, m.estado, m.prioridad, m.turno_asignado, m.fecha_programada, m.fecha_inicio, e.nombre as equipo_nombre, e.codigo as equipo_codigo, e.ubicacion as equipo_ubicacion, cs.operadores_matutino, cs.operadores_vespertino, cs.operadores_nocturno, cs.operadores_intermedio, cs.turno_doble, m.created_at, m.updated_at FROM maintenance m LEFT JOIN equipment e ON m.equipment_id = e.id LEFT JOIN configuracion_semanal cs ON cs.semana_numero = EXTRACT(WEEK FROM m.fecha_programada) AND cs.ano = EXTRACT(YEAR FROM m.fecha_programada) AND cs.activa = TRUE WHERE m.es_plantilla = FALSE;

COMMENT ON VIEW v_mantenimientos_por_turno IS 'Vista simplificada de mantenimientos agrupados por turno en lugar de operador individual';

-- ============================================================
-- PASO 7: FUNCIÓN Y TRIGGER DE ASIGNACIÓN AUTOMÁTICA
-- ============================================================

DROP TRIGGER IF EXISTS trigger_asignar_turno ON maintenance;
DROP FUNCTION IF EXISTS asignar_turno_automatico() CASCADE;

CREATE OR REPLACE FUNCTION asignar_turno_automatico()
RETURNS TRIGGER AS $$
DECLARE
    v_config RECORD;
    v_random INTEGER;
    v_semana INTEGER;
    v_ano INTEGER;
BEGIN
    IF NEW.es_plantilla = TRUE THEN
        RETURN NEW;
    END IF;
    v_semana := EXTRACT(WEEK FROM NEW.fecha_programada);
    v_ano := EXTRACT(YEAR FROM NEW.fecha_programada);
    SELECT * INTO v_config FROM configuracion_semanal WHERE semana_numero = v_semana AND ano = v_ano AND activa = TRUE LIMIT 1;
    IF v_config IS NULL THEN
        NEW.turno_asignado := 'matutino';
        RETURN NEW;
    END IF;
    v_random := FLOOR(RANDOM() * 100) + 1;
    IF v_random <= v_config.porcentaje_matutino THEN
        NEW.turno_asignado := 'matutino';
    ELSIF v_random <= (v_config.porcentaje_matutino + v_config.porcentaje_vespertino) THEN
        NEW.turno_asignado := 'vespertino';
    ELSIF v_random <= (v_config.porcentaje_matutino + v_config.porcentaje_vespertino + v_config.porcentaje_nocturno) THEN
        NEW.turno_asignado := 'nocturno';
    ELSE
        NEW.turno_asignado := 'intermedio';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_asignar_turno BEFORE INSERT OR UPDATE OF fecha_programada ON maintenance FOR EACH ROW WHEN (NEW.turno_asignado IS NULL AND NEW.es_plantilla = FALSE) EXECUTE FUNCTION asignar_turno_automatico();

COMMENT ON FUNCTION asignar_turno_automatico() IS 'Asigna automáticamente un turno a un mantenimiento según la configuración semanal. Solo para instancias (es_plantilla=false).';

-- ============================================================
-- CONTINUAR CON: PASOS-8-9-10-11-EJECUTAR.sql
-- ============================================================
