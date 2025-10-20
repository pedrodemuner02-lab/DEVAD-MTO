import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://whjfotlxvbltvukddzoj.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoamZvdGx4dmJsdHZ1a2Rkem9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NDE2MDAsImV4cCI6MjA1MjIxNzYwMH0.BFle46MeQLD2ovUEi-aDooHPZjii1W1XLsCM4AKa5Sc';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function verificarSistemaAuth() {
  console.log('🔍 ===============================================');
  console.log('🔍 VERIFICACIÓN DEL SISTEMA DE AUTENTICACIÓN');
  console.log('🔍 ===============================================\n');

  try {
    // 1. Verificar tabla auth_users
    console.log('1️⃣ Verificando tabla auth_users...');
    const { data: users, error: usersError } = await supabase
      .from('auth_users')
      .select('email, nombre, puesto, codigo, activo');

    if (usersError) {
      console.error('   ❌ Error:', usersError.message);
      console.log('   ⚠️  LA TABLA auth_users NO EXISTE');
      console.log('   📝 SOLUCIÓN: Ejecuta el archivo CREAR-SISTEMA-AUTH-PERSONALIZADO.sql en Supabase\n');
      return false;
    }

    if (!users || users.length === 0) {
      console.log('   ⚠️  La tabla existe pero está vacía');
      console.log('   📝 SOLUCIÓN: Ejecuta el archivo CREAR-SISTEMA-AUTH-PERSONALIZADO.sql en Supabase\n');
      return false;
    }

    console.log(`   ✅ Tabla existe con ${users.length} usuarios:`);
    users.forEach(u => {
      console.log(`      • ${u.email} - ${u.nombre} (${u.puesto}) - ${u.activo ? 'Activo' : 'Inactivo'}`);
    });
    console.log('');

    // 2. Verificar tabla auth_sessions
    console.log('2️⃣ Verificando tabla auth_sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('auth_sessions')
      .select('id');

    if (sessionsError) {
      console.error('   ❌ Error:', sessionsError.message);
      console.log('   ⚠️  LA TABLA auth_sessions NO EXISTE');
      return false;
    }

    console.log(`   ✅ Tabla existe (${sessions?.length || 0} sesiones activas)\n`);

    // 3. Verificar función hash_password
    console.log('3️⃣ Verificando función hash_password...');
    const { data: hashTest, error: hashError } = await supabase
      .rpc('hash_password', { password: 'test123' });

    if (hashError) {
      console.error('   ❌ Error:', hashError.message);
      console.log('   ⚠️  LA FUNCIÓN hash_password NO EXISTE');
      return false;
    }

    console.log('   ✅ Función hash_password funciona correctamente\n');

    // 4. Verificar función verify_password
    console.log('4️⃣ Verificando función verify_password...');
    const { data: verifyTest, error: verifyError } = await supabase
      .rpc('verify_password', { 
        password: 'test123',
        hash: hashTest
      });

    if (verifyError) {
      console.error('   ❌ Error:', verifyError.message);
      console.log('   ⚠️  LA FUNCIÓN verify_password NO EXISTE');
      return false;
    }

    console.log('   ✅ Función verify_password funciona correctamente\n');

    // 5. Verificar función generate_session_token
    console.log('5️⃣ Verificando función generate_session_token...');
    const { data: tokenTest, error: tokenError } = await supabase
      .rpc('generate_session_token');

    if (tokenError) {
      console.error('   ❌ Error:', tokenError.message);
      console.log('   ⚠️  LA FUNCIÓN generate_session_token NO EXISTE');
      return false;
    }

    console.log('   ✅ Función generate_session_token funciona correctamente\n');

    // 6. Verificar función clean_expired_sessions
    console.log('6️⃣ Verificando función clean_expired_sessions...');
    const { error: cleanError } = await supabase
      .rpc('clean_expired_sessions');

    if (cleanError) {
      console.error('   ❌ Error:', cleanError.message);
      console.log('   ⚠️  LA FUNCIÓN clean_expired_sessions NO EXISTE');
      return false;
    }

    console.log('   ✅ Función clean_expired_sessions funciona correctamente\n');

    // 7. Verificar tabla operators sincronizada
    console.log('7️⃣ Verificando sincronización con tabla operators...');
    const { data: operators, error: operatorsError } = await supabase
      .from('operators')
      .select('email, nombre, puesto');

    if (operatorsError) {
      console.error('   ❌ Error:', operatorsError.message);
      return false;
    }

    const userEmails = users.map(u => u.email);
    const operatorEmails = operators?.map(o => o.email) || [];
    const sincronizados = userEmails.filter(email => operatorEmails.includes(email));

    console.log(`   ✅ ${sincronizados.length}/${users.length} usuarios sincronizados con tabla operators\n`);

    // RESUMEN FINAL
    console.log('═'.repeat(50));
    console.log('🎉 VERIFICACIÓN COMPLETADA EXITOSAMENTE');
    console.log('═'.repeat(50));
    console.log('\n✅ Todo está listo para usar el nuevo sistema de autenticación\n');
    
    console.log('📋 CREDENCIALES DISPONIBLES:');
    console.log('━'.repeat(50));
    users.forEach(u => {
      const password = u.email === 'admin.mto@devad.com' ? 'admin123' :
                      u.email === 'jefe.mto@devad.com' ? 'jefe123' :
                      u.email === 'operador.mto@devad.com' ? 'opera123' :
                      '(desconocida)';
      console.log(`\n   Email:    ${u.email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Rol:      ${u.puesto}`);
    });
    console.log('\n' + '━'.repeat(50));
    
    console.log('\n🚀 SIGUIENTE PASO:');
    console.log('   1. Asegúrate que el servidor esté corriendo: npm run dev');
    console.log('   2. Abre: http://localhost:5173/');
    console.log('   3. Inicia sesión con: admin.mto@devad.com / admin123\n');

    return true;

  } catch (error) {
    console.error('\n💥 Error inesperado:', error.message);
    return false;
  }
}

// Ejecutar verificación
verificarSistemaAuth()
  .then(success => {
    if (!success) {
      console.log('\n⚠️  ACCIÓN REQUERIDA:');
      console.log('   📝 Ejecuta el archivo CREAR-SISTEMA-AUTH-PERSONALIZADO.sql');
      console.log('   en el SQL Editor de Supabase Dashboard\n');
      process.exit(1);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
