-- =====================================================
-- TRIGGER PARA GENERAR FOLIO AUTOMÁTICO
-- Genera folios tipo: REQ-2025-001, REQ-2025-002, etc.
-- =====================================================

-- 1. Crear función para generar folio
CREATE OR REPLACE FUNCTION generate_requisition_folio()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  year_str VARCHAR(4);
  new_folio VARCHAR(50);
BEGIN
  -- Obtener el año actual
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Obtener el siguiente número secuencial para este año
  SELECT COALESCE(MAX(CAST(SUBSTRING(folio FROM 10) AS INTEGER)), 0) + 1
  INTO next_number
  FROM requisitions
  WHERE folio LIKE 'REQ-' || year_str || '-%';
  
  -- Generar el nuevo folio con formato REQ-YYYY-NNN
  new_folio := 'REQ-' || year_str || '-' || LPAD(next_number::TEXT, 3, '0');
  
  -- Asignar el folio al nuevo registro
  NEW.folio := new_folio;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear trigger que se ejecuta ANTES de insertar
DROP TRIGGER IF EXISTS trigger_generate_requisition_folio ON requisitions;
CREATE TRIGGER trigger_generate_requisition_folio
  BEFORE INSERT ON requisitions
  FOR EACH ROW
  WHEN (NEW.folio IS NULL OR NEW.folio = '')
  EXECUTE FUNCTION generate_requisition_folio();

-- 3. Verificar que el trigger se creó correctamente
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'requisitions';
