/**
 * 🔧 Test de Conexión con Supabase
 * 
 * Este script verifica que la configuración de Supabase sea correcta.
 * Ejecutar: npm run test:supabase
 */

import { supabase, TABLES } from './src/lib/supabase.js';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.blue}▶ ${msg}${colors.reset}`),
};

async function testSupabaseConnection() {
  console.log(`\n${colors.bright}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  🚀 Test de Conexión con Supabase${colors.reset}`);
  console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}\n`);

  // Test 1: Verificar variables de entorno
  log.step('Test 1: Verificando variables de entorno');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
    log.error('VITE_SUPABASE_URL no está configurada correctamente');
    log.info('Edita el archivo .env y actualiza VITE_SUPABASE_URL');
    return false;
  }
  log.success(`URL configurada: ${supabaseUrl}`);

  if (!supabaseKey || supabaseKey.includes('your-anon-key')) {
    log.error('VITE_SUPABASE_ANON_KEY no está configurada correctamente');
    log.info('Edita el archivo .env y actualiza VITE_SUPABASE_ANON_KEY');
    return false;
  }
  log.success(`Key configurada (primeros 20 chars): ${supabaseKey.substring(0, 20)}...`);

  // Test 2: Verificar conexión básica
  log.step('Test 2: Verificando conexión con Supabase');
  try {
    // Intentar hacer una query simple
    const { data, error } = await supabase
      .from(TABLES.EQUIPMENT)
      .select('id')
      .limit(1);

    if (error) {
      log.error(`Error de conexión: ${error.message}`);
      if (error.message.includes('Failed to fetch')) {
        log.warning('Verifica que la URL del proyecto sea correcta');
      } else if (error.message.includes('Invalid API key')) {
        log.warning('La API key no es válida. Verifica que copiaste la anon key correctamente');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        log.warning('La tabla no existe. Ejecuta el archivo supabase-schema.sql en el SQL Editor');
      }
      return false;
    }

    log.success('Conexión exitosa con Supabase');
  } catch (err) {
    log.error(`Error inesperado: ${err.message}`);
    return false;
  }

  // Test 3: Verificar tablas
  log.step('Test 3: Verificando existencia de tablas');
  const tablesToCheck = [
    TABLES.INVENTORY,
    TABLES.EQUIPMENT,
    TABLES.OPERATORS,
    TABLES.MAINTENANCE,
    TABLES.MAINTENANCE_TEMPLATES,
    TABLES.MAINTENANCE_INSTANCES,
    TABLES.REQUISITIONS,
  ];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        log.error(`Tabla "${table}" no existe o no es accesible`);
        log.info(`Ejecuta el archivo supabase-schema.sql en el SQL Editor de Supabase`);
        return false;
      }

      const count = data?.length || 0;
      log.success(`Tabla "${table}" existe (${count} registro${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''})`);
    } catch (err) {
      log.error(`Error al verificar tabla "${table}": ${err.message}`);
      return false;
    }
  }

  // Test 4: Verificar permisos (crear y eliminar un registro de prueba)
  log.step('Test 4: Verificando permisos de escritura');
  try {
    // Intentar insertar un registro de prueba
    const testItem = {
      codigo: 'TEST-001',
      nombre: 'Item de Prueba',
      categoria: 'Prueba',
      stock_actual: 0,
      stock_minimo: 0,
      stock_maximo: 0,
      unidad_medida: 'unidad',
      precio_unitario: 0,
      ubicacion: 'Test',
      estado: 'activo',
      descripcion: 'Registro de prueba - se eliminará automáticamente',
    };

    const { data: insertedData, error: insertError } = await supabase
      .from(TABLES.INVENTORY)
      .insert(testItem)
      .select()
      .single();

    if (insertError) {
      log.error(`No se puede insertar: ${insertError.message}`);
      log.info('Verifica las políticas RLS en Supabase (Settings → Authentication → Policies)');
      return false;
    }

    log.success('Permiso de escritura (INSERT) verificado');

    // Intentar eliminar el registro de prueba
    const { error: deleteError } = await supabase
      .from(TABLES.INVENTORY)
      .delete()
      .eq('id', insertedData.id);

    if (deleteError) {
      log.warning(`No se puede eliminar: ${deleteError.message}`);
      log.info('El registro de prueba quedó en la base de datos. Puedes eliminarlo manualmente.');
    } else {
      log.success('Permiso de eliminación (DELETE) verificado');
    }
  } catch (err) {
    log.error(`Error al verificar permisos: ${err.message}`);
    return false;
  }

  // Test 5: Verificar datos de seed
  log.step('Test 5: Verificando datos de seed');
  try {
    const { data: equipmentData } = await supabase
      .from(TABLES.EQUIPMENT)
      .select('id, codigo, nombre')
      .limit(3);

    if (equipmentData && equipmentData.length > 0) {
      log.success(`Encontrados ${equipmentData.length} equipo(s) de prueba:`);
      equipmentData.forEach((eq) => {
        console.log(`   - ${eq.codigo}: ${eq.nombre}`);
      });
    } else {
      log.warning('No se encontraron datos de seed. Ejecuta supabase-schema.sql completo.');
    }
  } catch (err) {
    log.error(`Error al verificar seed data: ${err.message}`);
  }

  // Resumen final
  console.log(`\n${colors.bright}${'='.repeat(60)}${colors.reset}`);
  log.success('¡Todos los tests pasaron exitosamente! 🎉');
  console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}\n`);
  log.info('Puedes iniciar la aplicación con: npm run dev');
  console.log();

  return true;
}

// Ejecutar tests
testSupabaseConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    log.error(`Error fatal: ${err.message}`);
    console.error(err);
    process.exit(1);
  });
