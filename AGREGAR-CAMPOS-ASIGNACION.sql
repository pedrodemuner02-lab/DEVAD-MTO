-- ============================================================
-- 🎯 AGREGAR CAMPOS PARA ASIGNACIÓN AUTOMÁTICA
-- Sistema de distribución inteligente por turnos y complejidad
-- ============================================================

-- 1️⃣ Agregar columnas a la tabla maintenance
ALTER TABLE maintenance 
ADD COLUMN IF NOT EXISTS complejidad VARCHAR(20) DEFAULT 'media',
ADD COLUMN IF NOT EXISTS urgencia VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS turno_asignado VARCHAR(50),
ADD COLUMN IF NOT EXISTS puntos_complejidad INTEGER DEFAULT 2;

-- 2️⃣ Crear tabla para tracking de carga por operador (OPCIONAL - para futuro)
CREATE TABLE IF NOT EXISTS operator_workload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  turno VARCHAR(50),
  fecha_semana DATE,
  carga_actual INTEGER DEFAULT 0,
  trabajos_asignados INTEGER DEFAULT 0,
  capacidad_maxima INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3️⃣ Verificar que shift_config existe con los 4 turnos
-- (Si no existe, crearla)
CREATE TABLE IF NOT EXISTS shift_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) NOT NULL,
  horario VARCHAR(100),
  operadores_asignados JSONB DEFAULT '[]',
  capacidad_turno INTEGER DEFAULT 20,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar los 4 turnos si no existen
INSERT INTO shift_config (nombre, horario, capacidad_turno, activo) 
VALUES 
  ('Mañana', '07:00 - 15:00', 20, true),
  ('Intermedio', '10:00 - 18:00', 20, true),
  ('Tarde', '15:00 - 23:00', 20, true),
  ('Noche', '23:00 - 07:00', 15, true)
ON CONFLICT DO NOTHING;

-- 4️⃣ Actualizar registros existentes con valores por defecto
UPDATE maintenance 
SET 
  complejidad = 'media',
  urgencia = 'normal',
  puntos_complejidad = 2
WHERE complejidad IS NULL;

-- ✅ LISTO! Ahora la tabla maintenance tiene los campos necesarios
-- para asignación automática por turnos y complejidad
