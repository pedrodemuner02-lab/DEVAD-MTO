-- Script para insertar equipos de ejemplo en Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query

-- Insertar equipos de ejemplo
INSERT INTO equipment (codigo, nombre, tipo, ubicacion, estado, created_at) VALUES
('EQ-001', 'Incubadora IPG-001', 'Incubadora', 'Área de Producción A', 'activo', NOW()),
('EQ-002', 'Compresor de Aire CAC-200', 'Compresor', 'Cuarto de Máquinas', 'activo', NOW()),
('EQ-003', 'Generador de Emergencia GEN-500', 'Generador', 'Exterior - Zona Este', 'activo', NOW()),
('EQ-004', 'Bomba Centrífuga BC-150', 'Bomba', 'Sistema de Agua', 'activo', NOW()),
('EQ-005', 'Horno Industrial HI-300', 'Horno', 'Área de Producción B', 'activo', NOW())
ON CONFLICT (codigo) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT 
  id,
  codigo,
  nombre,
  tipo,
  ubicacion,
  estado
FROM equipment
ORDER BY codigo;
