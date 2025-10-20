import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whjfotlxvbltvukddzoj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoamZvdGx4dmJsdHZ1a2Rkem9qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc3NDQ5MCwiZXhwIjoyMDc1MzUwNDkwfQ.LRUZF6FA3HqQPweiJZsZTa_2fKU7UvXlICq8dpFGe9o';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verificarTodo() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Verificar usuarios en auth
    console.log('1️⃣ USUARIOS EN AUTH (Authentication):\n');
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authData && authData.users.length > 0) {
      console.log(`✅ Total usuarios: ${authData.users.length}\n`);
      authData.users.forEach((user, index) => {
        console.log(`   Usuario ${index + 1}:`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log(`   ✅ Email confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`);
        console.log(`   📅 Creado: ${new Date(user.created_at).toLocaleString('es-MX')}`);
        console.log('');
      });
    } else {
      console.log('❌ No hay usuarios en auth\n');
    }

    // 2. Verificar operadores en la base de datos
    console.log('2️⃣ OPERADORES EN LA BASE DE DATOS:\n');
    const { data: operators, error: opError } = await supabaseAdmin
      .from('operators')
      .select('*')
      .order('created_at', { ascending: false });

    if (opError) {
      console.error('❌ Error al consultar operators:', opError.message);
    } else if (operators && operators.length > 0) {
      console.log(`✅ Total operadores: ${operators.length}\n`);
      operators.forEach((op, index) => {
        console.log(`   Operador ${index + 1}:`);
        console.log(`   👤 Nombre: ${op.nombre} ${op.apellidos || ''}`);
        console.log(`   📧 Email: ${op.email}`);
        console.log(`   👔 Puesto: ${op.puesto}`);
        console.log(`   🕐 Turno: ${op.turno}`);
        console.log(`   🆔 ID: ${op.id}`);
        console.log('');
      });
    } else {
      console.log('❌ No hay operadores en la base de datos\n');
    }

    // 3. Verificar coincidencias entre auth y operators
    console.log('3️⃣ VERIFICACIÓN DE COINCIDENCIAS:\n');
    const emailsNuevos = [
      'admin.mto@devad.com',
      'jefe.mto@devad.com',
      'operador.mto@devad.com'
    ];

    for (const email of emailsNuevos) {
      const enAuth = authData.users.find(u => u.email === email);
      const enOperators = operators?.find(o => o.email === email);

      console.log(`   📧 ${email}:`);
      console.log(`      Auth: ${enAuth ? '✅ Existe' : '❌ No existe'}`);
      console.log(`      Operators: ${enOperators ? '✅ Existe' : '❌ No existe'}`);
      
      if (enAuth && !enOperators) {
        console.log(`      ⚠️ ACCIÓN REQUERIDA: Falta crear operador en DB`);
      } else if (!enAuth && enOperators) {
        console.log(`      ⚠️ ACCIÓN REQUERIDA: Falta crear usuario en Auth`);
      } else if (enAuth && enOperators) {
        console.log(`      ✅ TODO CORRECTO - Listo para usar`);
      } else {
        console.log(`      ❌ No existe en ningún lado`);
      }
      console.log('');
    }

    // 4. Resumen y acciones necesarias
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 RESUMEN Y ACCIONES NECESARIAS');
    console.log('═══════════════════════════════════════════════════════\n');

    const accionesRequeridas = [];
    
    for (const email of emailsNuevos) {
      const enAuth = authData.users.find(u => u.email === email);
      const enOperators = operators?.find(o => o.email === email);
      
      if (enAuth && !enOperators) {
        accionesRequeridas.push(`❌ Ejecutar SQL para crear operador: ${email}`);
      }
    }

    if (accionesRequeridas.length > 0) {
      console.log('⚠️ ACCIONES PENDIENTES:\n');
      accionesRequeridas.forEach(accion => console.log(`   ${accion}`));
      console.log('\n💡 Ejecuta el archivo INSERTAR-OPERADORES-NUEVOS.sql en Supabase\n');
    } else {
      console.log('✅ TODO ESTÁ CORRECTO - El sistema está listo para usar\n');
      console.log('🎉 CREDENCIALES PARA LOGIN:\n');
      console.log('🔧 ADMINISTRADOR:');
      console.log('   Email: admin.mto@devad.com');
      console.log('   Contraseña: Admin2025!\n');
      console.log('👨‍💼 JEFE DE MANTENIMIENTO:');
      console.log('   Email: jefe.mto@devad.com');
      console.log('   Contraseña: Jefe2025!\n');
      console.log('👷 OPERADOR:');
      console.log('   Email: operador.mto@devad.com');
      console.log('   Contraseña: Opera2025!\n');
    }

    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error fatal:', error);
  }
}

verificarTodo();
