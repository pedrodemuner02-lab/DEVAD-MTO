-- CREAR TABLAS DE PLANTILLAS RECURRENTES
-- Ejecutar este SQL en Supabase SQL Editor

-- 1. Eliminar tablas si existen (para empezar limpio)
DROP TABLE IF EXISTS maintenance_instances CASCADE;
DROP TABLE IF EXISTS maintenance_templates CASCADE;

-- 2. Crear tabla de plantillas
CREATE TABLE maintenance_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información del equipo
  equipo_id VARCHAR(255),
  equipo_nombre VARCHAR(255),
  
  -- Detalles del mantenimiento
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  prioridad VARCHAR(20) DEFAULT 'media',
  tecnico_asignado VARCHAR(255),
  
  -- Configuración de recurrencia
  es_recurrente BOOLEAN DEFAULT true,
  es_indefinido BOOLEAN DEFAULT false,
  recurrencia JSONB,
  generar_hasta DATE,
  last_generated TIMESTAMP WITH TIME ZONE,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Crear tabla de instancias generadas
CREATE TABLE maintenance_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES maintenance_templates(id) ON DELETE CASCADE,
  folio VARCHAR(50) UNIQUE NOT NULL,
  
  -- Copia de información de la plantilla
  equipo_id VARCHAR(255),
  equipo_nombre VARCHAR(255),
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  prioridad VARCHAR(20),
  tecnico_asignado VARCHAR(255),
  
  -- Programación
  fecha_programada DATE NOT NULL,
  fecha_completada TIMESTAMP WITH TIME ZONE,
  
  -- Estado y seguimiento
  estado VARCHAR(20) DEFAULT 'programado',
  notas TEXT,
  turno VARCHAR(20),
  instance_number INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Crear triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_maintenance_templates_updated_at 
    BEFORE UPDATE ON maintenance_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_instances_updated_at 
    BEFORE UPDATE ON maintenance_instances 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Crear índices para mejorar performance
CREATE INDEX idx_templates_active ON maintenance_templates(is_active);
CREATE INDEX idx_templates_equipo ON maintenance_templates(equipo_id);
CREATE INDEX idx_instances_template ON maintenance_instances(template_id);
CREATE INDEX idx_instances_estado ON maintenance_instances(estado);
CREATE INDEX idx_instances_fecha ON maintenance_instances(fecha_programada);

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE maintenance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_instances ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas permisivas (permitir todo por ahora)
CREATE POLICY "Permitir todo en templates" 
    ON maintenance_templates 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permitir todo en instances" 
    ON maintenance_instances 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ✅ TABLAS CREADAS CORRECTAMENTE
SELECT 'Tablas de plantillas recurrentes creadas exitosamente' AS resultado;
