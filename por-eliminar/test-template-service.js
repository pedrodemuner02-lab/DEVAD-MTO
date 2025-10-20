import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('\n🧪 PRUEBA DIRECTA DEL SERVICIO\n');

async function testService() {
  // Simular lo que hace getAllTemplates()
  console.log('1. Consultando maintenance_templates...');
  const { data, error } = await supabase
    .from('maintenance_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log(`✅ ${data.length} plantilla(s) encontrada(s)`);
  
  if (data.length > 0) {
    console.log('\n📋 Plantilla:');
    const t = data[0];
    console.log(`   ID: ${t.id}`);
    console.log(`   Título: ${t.titulo}`);
    console.log(`   Tipo: ${t.tipo}`);
    console.log(`   Activa: ${t.is_active}`);
    console.log(`   Recurrencia:`, t.recurrencia);
  }

  // Contar instancias
  console.log('\n2. Consultando maintenance_instances...');
  const { data: instances, error: instError } = await supabase
    .from('maintenance_instances')
    .select('*', { count: 'exact' });

  if (instError) {
    console.log('❌ Error:', instError.message);
  } else {
    console.log(`✅ ${instances.length} instancia(s) encontrada(s)`);
    if (instances.length > 0) {
      instances.forEach(i => {
        console.log(`   - ${i.folio}: ${i.fecha_programada} (${i.estado})`);
      });
    }
  }
}

testService().catch(console.error);
