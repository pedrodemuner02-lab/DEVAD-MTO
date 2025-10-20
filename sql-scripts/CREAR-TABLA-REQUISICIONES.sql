-- =====================================================
-- TABLA DE REQUISICIONES
-- Sistema de solicitud y aprobación de materiales
-- =====================================================

-- Crear tabla de requisiciones
CREATE TABLE IF NOT EXISTS requisitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folio VARCHAR(50) UNIQUE NOT NULL,
  
  -- Información del solicitante
  solicitante_id UUID REFERENCES auth.users(id),
  solicitante_nombre VARCHAR(255) NOT NULL,
  solicitante_email VARCHAR(255) NOT NULL,
  
  -- Detalles de la requisición
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Formato de items: [{"item_id": "uuid", "nombre": "Tornillo M8", "cantidad": 10, "unidad": "pza"}]
  
  -- Estado del proceso
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
  -- Estados: pendiente, aprobado, rechazado, entregado, cancelado
  
  prioridad VARCHAR(20) NOT NULL DEFAULT 'normal',
  -- Prioridades: baja, normal, alta, urgente
  
  -- Motivo/Justificación
  motivo TEXT,
  observaciones TEXT,
  
  -- Proceso de aprobación
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  aprobado_por_id UUID REFERENCES auth.users(id),
  aprobado_por_nombre VARCHAR(255),
  notas_aprobacion TEXT,
  
  -- Proceso de entrega
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  entregado_por VARCHAR(255),
  recibido_por VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_requisitions_folio ON requisitions(folio);
CREATE INDEX IF NOT EXISTS idx_requisitions_estado ON requisitions(estado);
CREATE INDEX IF NOT EXISTS idx_requisitions_solicitante ON requisitions(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_requisitions_fecha ON requisitions(fecha_solicitud DESC);
CREATE INDEX IF NOT EXISTS idx_requisitions_prioridad ON requisitions(prioridad);

-- Índice GIN para búsqueda en JSONB
CREATE INDEX IF NOT EXISTS idx_requisitions_items ON requisitions USING GIN (items);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_requisitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requisitions_updated_at
  BEFORE UPDATE ON requisitions
  FOR EACH ROW
  EXECUTE FUNCTION update_requisitions_updated_at();

-- Función para generar folio automático
CREATE OR REPLACE FUNCTION generate_requisition_folio()
RETURNS TRIGGER AS $$
DECLARE
  year_str VARCHAR(4);
  counter INTEGER;
  new_folio VARCHAR(50);
BEGIN
  -- Obtener año actual
  year_str := TO_CHAR(NOW(), 'YYYY');
  
  -- Obtener el último número del año
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(folio FROM 'REQ-' || year_str || '-(.*)') AS INTEGER)
  ), 0) + 1
  INTO counter
  FROM requisitions
  WHERE folio LIKE 'REQ-' || year_str || '-%';
  
  -- Generar nuevo folio: REQ-2025-001
  new_folio := 'REQ-' || year_str || '-' || LPAD(counter::TEXT, 3, '0');
  
  NEW.folio := new_folio;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requisitions_generate_folio
  BEFORE INSERT ON requisitions
  FOR EACH ROW
  WHEN (NEW.folio IS NULL OR NEW.folio = '')
  EXECUTE FUNCTION generate_requisition_folio();

-- Deshabilitar RLS por ahora (para desarrollo)
ALTER TABLE requisitions DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar requisiciones de ejemplo (necesitarás ajustar los UUIDs)
-- Esto se puede ejecutar después de tener usuarios en el sistema

/*
INSERT INTO requisitions (
  solicitante_nombre, 
  solicitante_email,
  items,
  estado,
  prioridad,
  motivo,
  observaciones
) VALUES 
(
  'Juan Pérez',
  'operador1@devad-mto.com',
  '[
    {"item_id": "item-uuid-1", "nombre": "Rodamiento SKF 6205", "cantidad": 2, "unidad": "pza"},
    {"item_id": "item-uuid-2", "nombre": "Aceite SAE 40", "cantidad": 5, "unidad": "lt"}
  ]'::jsonb,
  'pendiente',
  'alta',
  'Mantenimiento preventivo Bomba #3',
  'Urgente para turno nocturno'
),
(
  'María González',
  'operador2@devad-mto.com',
  '[
    {"item_id": "item-uuid-3", "nombre": "Tornillos M8 x 20mm", "cantidad": 50, "unidad": "pza"}
  ]'::jsonb,
  'aprobado',
  'normal',
  'Reemplazo de panel eléctrico',
  NULL
);
*/

-- =====================================================
-- CONSULTAS ÚTILES (Todas comentadas por defecto)
-- =====================================================

-- Ver todas las requisiciones
-- SELECT * FROM requisitions ORDER BY created_at DESC;

-- Ver requisiciones pendientes
-- SELECT folio, solicitante_nombre, estado, prioridad, fecha_solicitud 
-- FROM requisitions 
-- WHERE estado = 'pendiente' 
-- ORDER BY prioridad DESC, fecha_solicitud ASC;

-- Ver items solicitados en una requisición
-- SELECT folio, jsonb_pretty(items) 
-- FROM requisitions 
-- WHERE folio = 'REQ-2025-001';

-- Estadísticas por estado
-- SELECT estado, COUNT(*) as total 
-- FROM requisitions 
-- GROUP BY estado;

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla requisitions creada exitosamente' as mensaje;
