import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whjfotlxvbltvukddzoj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoamZvdGx4dmJsdHZ1a2Rkem9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NDE2MDAsImV4cCI6MjA1MjIxNzYwMH0.BFle46MeQLD2ovUEi-aDooHPZjii1W1XLsCM4AKa5Sc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarEstructura() {
  console.log('🔍 Verificando estructura de la tabla operators...\n');

  const { data, error } = await supabase
    .from('operators')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Estructura de operators:');
    if (data && data.length > 0) {
      console.log('Columnas disponibles:', Object.keys(data[0]));
    } else {
      console.log('No hay datos en la tabla');
    }
  }
}

verificarEstructura();
