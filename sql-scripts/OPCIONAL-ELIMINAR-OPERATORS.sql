-- ============================================================
-- LIMPIEZA COMPLETA - ELIMINAR TABLA OPERATORS
-- ============================================================
-- ⚠️ ADVERTENCIA: Este script ELIMINA PERMANENTEMENTE la tabla operators
-- Solo ejecutar si estás 100% seguro de usar el sistema por turnos
-- ============================================================

-- ============================================================
-- VERIFICACIÓN PREVIA
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '⚠️  ADVERTENCIA: Vas a eliminar la tabla operators';
    RAISE NOTICE '✅ Verifica que ya ejecutaste MIGRACION-SISTEMA-TURNOS.sql';
    RAISE NOTICE '✅ Verifica que existe operators_backup';
    RAISE NOTICE '✅ Verifica que todos los mantenimientos tienen turno_asignado';
END $$;

-- Verificar que existe el backup
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'operators_backup') THEN
        RAISE EXCEPTION '❌ No existe tabla operators_backup. Ejecuta primero MIGRACION-SISTEMA-TURNOS.sql';
    END IF;
    RAISE NOTICE '✅ Backup verificado: operators_backup existe';
END $$;

-- Verificar que todos los mantenimientos tienen turno asignado
DO $$
DECLARE
    v_sin_turno INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_sin_turno
    FROM maintenance
    WHERE turno_asignado IS NULL AND es_plantilla = FALSE;
    
    IF v_sin_turno > 0 THEN
        RAISE EXCEPTION '❌ Hay % mantenimientos sin turno asignado. Ejecuta la migración primero.', v_sin_turno;
    END IF;
    RAISE NOTICE '✅ Todos los mantenimientos tienen turno asignado';
END $$;

-- ============================================================
-- PASO 1: ELIMINAR DEPENDENCIAS
-- ============================================================

-- Eliminar políticas RLS
DROP POLICY IF EXISTS "Operators can view own profile" ON operators;
DROP POLICY IF EXISTS "Operators can update own profile" ON operators;
DROP POLICY IF EXISTS "Users can view own profile" ON operators;
DROP POLICY IF EXISTS "Users can update own profile" ON operators;

RAISE NOTICE '✅ Políticas RLS eliminadas';

-- Eliminar índices relacionados
DROP INDEX IF EXISTS idx_operators_activo;
DROP INDEX IF EXISTS idx_operators_turno;
DROP INDEX IF EXISTS idx_operators_email;
DROP INDEX IF EXISTS idx_operators_codigo;
DROP INDEX IF EXISTS idx_operators_puesto;

RAISE NOTICE '✅ Índices eliminados';

-- Eliminar triggers relacionados
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

RAISE NOTICE '✅ Triggers y funciones eliminadas';

-- ============================================================
-- PASO 2: ELIMINAR FOREIGN KEYS EN MAINTENANCE
-- ============================================================

-- Eliminar constraint de foreign key
ALTER TABLE maintenance DROP CONSTRAINT IF EXISTS maintenance_operador_asignado_id_fkey;
ALTER TABLE maintenance DROP CONSTRAINT IF EXISTS fk_maintenance_operator;

RAISE NOTICE '✅ Foreign keys eliminadas';

-- ============================================================
-- PASO 3: MARCAR COLUMNA OPERADOR_ASIGNADO_ID COMO OBSOLETA
-- ============================================================

-- Opción A: Eliminar columna (recomendado)
-- Descomentar si quieres eliminar completamente:
-- ALTER TABLE maintenance DROP COLUMN IF EXISTS operador_asignado_id;

-- Opción B: Mantener pero marcar como obsoleta (por compatibilidad)
COMMENT ON COLUMN maintenance.operador_asignado_id IS 
'[OBSOLETO] Columna deprecated. Usar turno_asignado en su lugar.';

RAISE NOTICE '⚠️  Columna operador_asignado_id marcada como obsoleta';

-- ============================================================
-- PASO 4: ELIMINAR TABLA OPERATORS
-- ============================================================

-- Deshabilitar RLS antes de eliminar
ALTER TABLE operators DISABLE ROW LEVEL SECURITY;

-- Eliminar tabla
DROP TABLE IF EXISTS operators CASCADE;

RAISE NOTICE '✅ Tabla operators eliminada';

-- ============================================================
-- PASO 5: LIMPIAR REFERENCIAS EN AUTH (si existen)
-- ============================================================

-- Eliminar tabla user_profiles si existe y estaba relacionada
DROP TABLE IF EXISTS public.user_profiles CASCADE;

RAISE NOTICE '✅ Tablas relacionadas eliminadas';

-- ============================================================
-- PASO 6: ACTUALIZAR SERVICIOS (Recordatorio)
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '──────────────────────────────────────────────────────';
    RAISE NOTICE '📝 SIGUIENTE PASO: Actualizar código de la aplicación';
    RAISE NOTICE '──────────────────────────────────────────────────────';
    RAISE NOTICE '';
    RAISE NOTICE 'Archivos a modificar:';
    RAISE NOTICE '1. src/services/databaseService.js';
    RAISE NOTICE '   └─ Eliminar o comentar operatorService';
    RAISE NOTICE '';
    RAISE NOTICE '2. src/pages/OperatorsPage.jsx';
    RAISE NOTICE '   └─ Eliminar o redireccionar a configuración de turnos';
    RAISE NOTICE '';
    RAISE NOTICE '3. src/components/modals/OperatorModal.jsx';
    RAISE NOTICE '   └─ Ya no se necesita';
    RAISE NOTICE '';
    RAISE NOTICE '4. src/App.jsx';
    RAISE NOTICE '   └─ Eliminar ruta /operadores';
    RAISE NOTICE '';
    RAISE NOTICE '5. src/components/layout/Layout.jsx';
    RAISE NOTICE '   └─ Eliminar link "Operadores" del menú';
    RAISE NOTICE '';
END $$;

-- ============================================================
-- PASO 7: VERIFICACIÓN FINAL
-- ============================================================

-- Verificar que la tabla ya no existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'operators') THEN
        RAISE EXCEPTION '❌ ERROR: La tabla operators aún existe';
    END IF;
    RAISE NOTICE '✅ VERIFICADO: Tabla operators eliminada correctamente';
END $$;

-- Verificar que el backup existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'operators_backup') THEN
        RAISE WARNING '⚠️  ADVERTENCIA: No existe backup de operators';
    ELSE
        RAISE NOTICE '✅ VERIFICADO: Backup operators_backup disponible';
    END IF;
END $$;

-- Mostrar resumen
SELECT 
    'Mantenimientos totales' as concepto,
    COUNT(*) as cantidad
FROM maintenance
WHERE es_plantilla = FALSE

UNION ALL

SELECT 
    'Con turno asignado',
    COUNT(*)
FROM maintenance
WHERE turno_asignado IS NOT NULL AND es_plantilla = FALSE

UNION ALL

SELECT 
    'Turno: ' || turno_asignado,
    COUNT(*)
FROM maintenance
WHERE es_plantilla = FALSE
GROUP BY turno_asignado;

-- ============================================================
-- ROLLBACK EN CASO DE EMERGENCIA
-- ============================================================

/*
Si necesitas restaurar la tabla operators:

-- Restaurar desde backup
CREATE TABLE operators AS SELECT * FROM operators_backup;

-- Re-crear foreign key
ALTER TABLE maintenance 
ADD CONSTRAINT maintenance_operador_asignado_id_fkey 
FOREIGN KEY (operador_asignado_id) REFERENCES operators(id);

-- Re-habilitar RLS
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

-- Re-crear políticas básicas
CREATE POLICY "Operators can view own profile" ON operators
FOR SELECT USING (auth.uid() = id);
*/

-- ============================================================
-- FIN DE LIMPIEZA
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '──────────────────────────────────────────────────────';
    RAISE NOTICE '✅ LIMPIEZA COMPLETADA';
    RAISE NOTICE '──────────────────────────────────────────────────────';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tabla operators eliminada';
    RAISE NOTICE '✅ Backup disponible en operators_backup';
    RAISE NOTICE '✅ Sistema listo para usar turnos fijos';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Siguiente paso: Actualizar código de la aplicación';
    RAISE NOTICE '🔄 Reiniciar servidor de desarrollo';
    RAISE NOTICE '';
END $$;
