-- =====================================================
-- CREAR TABLA DE PLANTILLAS RECURRENTES
-- Sistema de mantenimientos programados automáticamente
-- =====================================================

-- Crear tabla de plantillas (si no existe)
CREATE TABLE IF NOT EXISTS maintenance_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipo_id VARCHAR(255),
  equipo_nombre VARCHAR(255),
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  prioridad VARCHAR(20) DEFAULT 'media',
  tecnico_asignado VARCHAR(255),
  
  -- Configuración de recurrencia
  es_recurrente BOOLEAN DEFAULT false,
  es_indefinido BOOLEAN DEFAULT false,
  recurrencia JSONB,
  -- Formato: {"tipo": "diaria|semanal|mensual|anual", "cada": 1, "fechaInicio": "2025-01-01", "horaEspecifica": "08:00", "diasSemana": [1,3,5], "duracionEstimada": 2, "turnoPreferido": "matutino", "distribuirTurnos": false}
  
  generar_hasta DATE,
  last_generated TIMESTAMP WITH TIME ZONE,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de instancias generadas (si no existe)
CREATE TABLE IF NOT EXISTS maintenance_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID,
  folio VARCHAR(50) UNIQUE NOT NULL,
  
  equipo_id VARCHAR(255),
  equipo_nombre VARCHAR(255),
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  
  fecha_programada TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_finalizacion TIMESTAMP WITH TIME ZONE,
  
  tecnico_asignado VARCHAR(255),
  turno VARCHAR(20),
  prioridad VARCHAR(20) DEFAULT 'media',
  estado VARCHAR(50) DEFAULT 'programado',
  duracion_estimada NUMERIC,
  
  es_recurrente BOOLEAN DEFAULT true,
  instance_number INTEGER,
  
  actividades_realizadas TEXT,
  observaciones TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_maintenance_templates_updated_at ON maintenance_templates;
CREATE TRIGGER update_maintenance_templates_updated_at
    BEFORE UPDATE ON maintenance_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_instances_updated_at ON maintenance_instances;
CREATE TRIGGER update_maintenance_instances_updated_at
    BEFORE UPDATE ON maintenance_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_templates_active ON maintenance_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_instances_template ON maintenance_instances(template_id);
CREATE INDEX IF NOT EXISTS idx_instances_estado ON maintenance_instances(estado);
CREATE INDEX IF NOT EXISTS idx_instances_fecha ON maintenance_instances(fecha_programada);

-- Verificar que se crearon correctamente
SELECT 'Tablas creadas exitosamente' AS mensaje;
SELECT COUNT(*) as total_templates FROM maintenance_templates;
SELECT COUNT(*) as total_instances FROM maintenance_instances;
