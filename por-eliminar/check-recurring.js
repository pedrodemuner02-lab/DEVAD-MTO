import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('\n🔍 VERIFICANDO MANTENIMIENTOS RECURRENTES\n');

// Verificar tabla maintenance
const { data: maintenance, error: mainError } = await supabase
  .from('maintenance')
  .select('*');

console.log('📋 TABLA MAINTENANCE:');
console.log('Total registros:', maintenance?.length || 0);

if (maintenance && maintenance.length > 0) {
  console.log('\nCampos disponibles:', Object.keys(maintenance[0]).join(', '));
  
  const recurrentes = maintenance.filter(m => m.es_recurrente === true);
  console.log('\nMantenimientos con es_recurrente=true:', recurrentes.length);
  
  if (recurrentes.length > 0) {
    console.log('\nDetalle:');
    recurrentes.forEach(m => {
      console.log(`- ${m.tipo} - ${m.descripcion} (ID: ${m.id.substring(0,8)})`);
    });
  }
  
  console.log('\nTodos los registros:');
  maintenance.forEach(m => {
    console.log(`- ID: ${m.id.substring(0,8)}`);
    console.log(`  Descripción: ${m.descripcion || 'N/A'}`);
    console.log(`  Tipo: ${m.tipo || 'N/A'}`);
    console.log(`  Es recurrente: ${m.es_recurrente || false}`);
    console.log('');
  });
}

// Verificar tabla maintenance_templates
const { data: templates, error: tempError } = await supabase
  .from('maintenance_templates')
  .select('*');

console.log('\n📋 TABLA MAINTENANCE_TEMPLATES:');
console.log('Total plantillas:', templates?.length || 0);

if (templates && templates.length > 0) {
  console.log('\nPlantillas registradas:');
  templates.forEach(t => {
    console.log(`- ${t.titulo} (${t.tipo})`);
    console.log(`  Equipo: ${t.equipo_nombre}`);
    console.log(`  Activa: ${t.is_active}`);
    console.log('');
  });
}

console.log('\n✅ Verificación completada\n');
