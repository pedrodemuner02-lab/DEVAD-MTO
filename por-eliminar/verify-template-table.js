import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('\n🔍 VERIFICANDO ESTRUCTURA DE TABLA maintenance_templates\n');

async function verifyTable() {
  // Intentar insertar un registro mínimo para ver qué campos acepta
  const testTemplate = {
    tipo: 'Preventivo',
    titulo: 'TEST',
    es_recurrente: true
  };

  const { data, error } = await supabase
    .from('maintenance_templates')
    .insert([testTemplate])
    .select();

  if (error) {
    console.log('❌ Error al insertar test:', error.message);
    console.log('   Código:', error.code);
    console.log('   Detalles:', error.details);
    console.log('   Hint:', error.hint);
  } else {
    console.log('✅ Inserción exitosa! Campos aceptados.');
    console.log('   ID creado:', data[0].id);
    
    // Eliminar el registro de prueba
    await supabase
      .from('maintenance_templates')
      .delete()
      .eq('id', data[0].id);
    
    console.log('   Test limpiado.');
  }

  // Verificar registros existentes
  const { data: existing, count } = await supabase
    .from('maintenance_templates')
    .select('*', { count: 'exact' });

  console.log(`\n📊 Registros existentes: ${count}`);
  if (existing && existing.length > 0) {
    console.log('   Campos disponibles:', Object.keys(existing[0]).join(', '));
  }
}

verifyTable().catch(console.error);
