import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://whjfotlxvbltvukddzoj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoamZvdGx4dmJsdHZ1a2Rkem9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NDE2MDAsImV4cCI6MjA1MjIxNzYwMH0.BFle46MeQLD2ovUEi-aDooHPZjii1W1XLsCM4AKa5Sc'
);

async function verificarEstructura() {
  console.log('📋 Verificando estructura de tabla maintenance...\n');

  const { data, error } = await supabase
    .from('maintenance')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️ No hay registros en maintenance');
    return;
  }

  console.log('✅ Columnas encontradas en maintenance:');
  const columnas = Object.keys(data[0]);
  columnas.forEach((col, i) => {
    console.log(`  ${i + 1}. ${col}`);
  });

  console.log('\n📊 Registro de ejemplo:');
  console.log(JSON.stringify(data[0], null, 2));
}

verificarEstructura();
