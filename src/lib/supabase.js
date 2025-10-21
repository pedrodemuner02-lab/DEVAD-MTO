import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ VERIFICACIÓN MEJORADA
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Variables de entorno de Supabase no configuradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ (oculta)' : '❌');
  
  throw new Error('Variables de entorno de Supabase requeridas. Revisa tu archivo .env');
}

// ✅ CONFIGURACIÓN MEJORADA CON PERSISTENCIA
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Mantiene la sesión entre recargas
    autoRefreshToken: true, // Refresca tokens automáticamente
    detectSessionInUrl: true, // Detecta sesión en URL (magic links)
    storageKey: 'devad-mto-auth', // Clave única para localStorage
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'DEVAD-MTO'
    }
  }
});

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

// ✅ FUNCIÓN DE VERIFICACIÓN MEJORADA
export const checkConnection = async () => {
  try {
    console.log('🔍 Verificando conexión a Supabase...');
    
    // Verificar conexión básica
    const { data, error } = await supabase.from('operators').select('count').limit(1);
    
    if (error) {
      console.error('❌ Error de conexión a Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexión a Supabase establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error verificando conexión:', error);
    return false;
  }
};

// ✅ VERIFICAR AUTENTICACIÓN ACTUAL
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error verificando sesión:', error.message);
      return null;
    }
    
    if (session) {
      console.log('✅ Usuario autenticado:', session.user.email);
      return session.user;
    }
    
    console.log('ℹ️ No hay sesión activa');
    return null;
  } catch (error) {
    console.error('❌ Error en checkAuth:', error);
    return null;
  }
};
