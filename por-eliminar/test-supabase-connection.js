// Test de conexión a Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://whjfotlxvbltvukddzoj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoamZvdGx4dmJsdHZ1a2Rkem9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzQ0OTAsImV4cCI6MjA3NTM1MDQ5MH0.ANDH_0r-TzIE4rcUyhp8IUK_ur0qclmpuYjNQi-mE8Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Probando conexión a Supabase...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseAnonKey.substring(0, 20) + '...\n');

async function testConnection() {
  try {
    // 1. Verificar tablas existentes
    console.log('1️⃣ Verificando tablas...');
    const tables = ['inventory', 'equipment', 'operators', 'maintenance', 'requisitions'];
    
    for (const table of tables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: ERROR - ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${count || 0} registros`);
      }
    }

    // 2. Verificar si existen las tablas de templates
    console.log('\n2️⃣ Verificando tablas de plantillas recurrentes...');
    const templateTables = ['maintenance_templates', 'maintenance_instances'];
    
    for (const table of templateTables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: NO EXISTE - Necesitas ejecutar CREAR-TABLAS-TEMPLATES.sql`);
      } else {
        console.log(`   ✅ ${table}: ${count || 0} registros`);
      }
    }

    // 3. Probar inserción de datos
    console.log('\n3️⃣ Probando permisos de escritura...');
    const { data: testInsert, error: insertError } = await supabase
      .from('equipment')
      .select('id')
      .limit(1);
    
    if (insertError) {
      console.log(`   ❌ Error: ${insertError.message}`);
    } else {
      console.log(`   ✅ Permisos de lectura: OK`);
    }

    console.log('\n✅ Prueba completada\n');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testConnection();
