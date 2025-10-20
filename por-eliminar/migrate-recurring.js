import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('\n🔄 MIGRANDO MANTENIMIENTO RECURRENTE A PLANTILLA\n');
console.log('='.repeat(60));

async function migrateRecurringMaintenance() {
  // 1. Obtener el mantenimiento recurrente
  const { data: recurring, error: recError } = await supabase
    .from('maintenance')
    .select('*')
    .eq('es_recurrente', true)
    .single();

  if (recError) {
    console.log('❌ Error al obtener mantenimiento:', recError.message);
    return;
  }

  if (!recurring) {
    console.log('⚠️  No hay mantenimientos recurrentes para migrar');
    return;
  }

  console.log('\n📋 Mantenimiento encontrado:');
  console.log(`   ID: ${recurring.id}`);
  console.log(`   Folio: ${recurring.folio || 'N/A'}`);
  console.log(`   Tipo: ${recurring.tipo}`);
  console.log(`   Título: ${recurring.titulo || 'Sin título'}`);
  console.log(`   Descripción: ${recurring.descripcion || 'Sin descripción'}`);
  console.log(`   Equipo ID: ${recurring.equipment_id || 'N/A'}`);
  console.log(`   Turno: ${recurring.turno || 'N/A'}`);

  // 2. Obtener información del equipo
  let equipoNombre = 'Equipo no especificado';
  if (recurring.equipment_id) {
    const { data: equipo } = await supabase
      .from('equipment')
      .select('nombre_equipo')
      .eq('id', recurring.equipment_id)
      .single();
    
    if (equipo) {
      equipoNombre = equipo.nombre_equipo;
    }
  }

  console.log(`   Equipo: ${equipoNombre}`);

  // 3. Crear la plantilla (usando solo campos que existen)
  const template = {
    tipo: recurring.tipo || 'Preventivo',
    titulo: recurring.titulo || 'Mantenimiento Preventivo',
    descripcion: recurring.descripcion || 'Mantenimiento recurrente migrado del sistema anterior',
    prioridad: recurring.prioridad || 'media',
    es_recurrente: true,
    es_indefinido: true, // Por defecto indefinido
    is_active: true
  };

  // Agregar campos opcionales solo si existen
  if (recurring.equipment_id) {
    template.equipo_id = recurring.equipment_id;
  }
  if (equipoNombre) {
    template.equipo_nombre = equipoNombre;
  }
  if (recurring.operador_asignado) {
    template.tecnico_asignado = recurring.operador_asignado;
  }
  
  // Configurar recurrencia
  template.recurrencia = {
    tipo: 'mensual',
    cada: 1,
    horario: recurring.turno || 'matutino',
    turnosSeleccionados: [recurring.turno || 'matutino']
  };

  console.log('\n📝 Creando plantilla...');

  const { data: newTemplate, error: templateError } = await supabase
    .from('maintenance_templates')
    .insert([template])
    .select()
    .single();

  if (templateError) {
    console.log('❌ Error al crear plantilla:', templateError.message);
    console.log('   Detalle:', templateError);
    return;
  }

  console.log('✅ Plantilla creada exitosamente!');
  console.log(`   ID: ${newTemplate.id}`);
  console.log(`   Título: ${newTemplate.titulo}`);
  console.log(`   Tipo: ${newTemplate.tipo}`);
  console.log(`   Recurrencia: ${newTemplate.recurrencia.tipo}`);
  console.log(`   Estado: ${newTemplate.is_active ? 'Activa' : 'Inactiva'}`);

  // 4. Generar primeras instancias (opcional)
  console.log('\n🔄 Generando instancias para los próximos 3 meses...');

  const today = new Date();
  const instances = [];
  
  for (let i = 0; i < 3; i++) {
    const fecha = new Date(today);
    fecha.setMonth(fecha.getMonth() + i + 1);
    
    const instance = {
      template_id: newTemplate.id,
      folio: `MANT-PREV-${fecha.getFullYear()}-${String(i + 1).padStart(3, '0')}`,
      equipo_id: newTemplate.equipo_id,
      equipo_nombre: newTemplate.equipo_nombre,
      tipo: newTemplate.tipo,
      titulo: newTemplate.titulo,
      descripcion: newTemplate.descripcion,
      prioridad: newTemplate.prioridad,
      tecnico_asignado: newTemplate.tecnico_asignado,
      fecha_programada: fecha.toISOString().split('T')[0],
      estado: 'programado',
      turno: recurring.turno || 'matutino',
      instance_number: i + 1
    };

    instances.push(instance);
  }

  const { data: newInstances, error: instanceError } = await supabase
    .from('maintenance_instances')
    .insert(instances)
    .select();

  if (instanceError) {
    console.log('⚠️  Error al generar instancias:', instanceError.message);
  } else {
    console.log(`✅ ${newInstances.length} instancias generadas exitosamente!`);
    newInstances.forEach((inst, idx) => {
      console.log(`   ${idx + 1}. ${inst.folio} - ${inst.fecha_programada}`);
    });
  }

  // 5. Actualizar el mantenimiento original
  console.log('\n🔗 Vinculando mantenimiento original con la plantilla...');
  
  const { error: updateError } = await supabase
    .from('maintenance')
    .update({ template_id: newTemplate.id })
    .eq('id', recurring.id);

  if (updateError) {
    console.log('⚠️  Error al vincular:', updateError.message);
  } else {
    console.log('✅ Mantenimiento vinculado correctamente');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
  console.log('='.repeat(60));
  console.log('\n📊 Resumen:');
  console.log(`   ✅ 1 Plantilla creada`);
  console.log(`   ✅ ${newInstances?.length || 0} Instancias generadas`);
  console.log(`   ✅ 1 Mantenimiento vinculado`);
  console.log('\n💡 Ahora puedes ver la plantilla en la página de Plantillas Recurrentes\n');
}

migrateRecurringMaintenance().catch(console.error);
