import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tablas de la base de datos
export const TABLES = {
  INVENTORY: 'inventory',
  EQUIPMENT: 'equipment',
  OPERATORS: 'operators',
  MAINTENANCE: 'maintenance', // Tabla híbrida: es_plantilla=true para plantillas, false para instancias
  // OBSOLETO: MAINTENANCE_TEMPLATES → Ahora usamos columna es_plantilla en maintenance
  // OBSOLETO: MAINTENANCE_INSTANCES → Ahora usamos columna plantilla_id en maintenance
  REQUISITIONS: 'requisitions',
};
