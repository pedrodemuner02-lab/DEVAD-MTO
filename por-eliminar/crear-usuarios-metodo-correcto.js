import { createClient } from '@supabase/supabase-js';

// ==================== CONFIGURACIÓN ====================
const SUPABASE_URL = 'https://whjfotlxvbltvukddzoj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoamZvdGx4dmJsdHZ1a2Rkem9qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc3NDQ5MCwiZXhwIjoyMDc1MzUwNDkwfQ.LRUZF6FA3HqQPweiJZsZTa_2fKU7UvXlICq8dpFGe9o';

// Cliente con service_role para crear usuarios
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ==================== USUARIOS A CREAR ====================
const usuarios = [
  {
    email: 'admin.mto@devad.com',
    password: 'Admin123!',
    nombre: 'Administrador del Sistema',
    codigo: 'ADM-001',
    puesto: 'Administrador',
    turno: 'Intermedio'
  },
  {
    email: 'jefe.mto@devad.com',
    password: 'Jefe123!',
    nombre: 'Jefe de Mantenimiento',
    codigo: 'JEFE-001',
    puesto: 'Jefe de Mantenimiento',
    turno: 'Mañana'
  },
  {
    email: 'operador.mto@devad.com',
    password: 'Opera123!',
    nombre: 'Operador de Mantenimiento',
    codigo: 'OPE-001',
    puesto: 'Técnico de Mantenimiento',
    turno: 'Tarde'
  }
];

// ==================== FUNCIÓN PRINCIPAL ====================
async function crearUsuarios() {
  console.log('🚀 =============================================');
  console.log('🚀 CREACIÓN DE USUARIOS - MÉTODO CORRECTO');
  console.log('🚀 =============================================\n');

  for (const usuario of usuarios) {
    console.log(`\n📝 Procesando: ${usuario.email}`);
    console.log(`   Nombre: ${usuario.nombre}`);
    console.log(`   Puesto: ${usuario.puesto}`);
    console.log(`   Contraseña: ${usuario.password}`);

    try {
      // PASO 1: Crear usuario en auth.users con admin API
      console.log('   🔄 Paso 1/3: Creando usuario en Auth...');
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: usuario.email,
        password: usuario.password,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          nombre: usuario.nombre,
          puesto: usuario.puesto
        }
      });

      if (authError) {
        console.error(`   ❌ Error en Auth:`, authError.message);
        
        // Si el error es que ya existe, intentar actualizarlo
        if (authError.message.includes('already registered')) {
          console.log('   🔄 Usuario ya existe, intentando actualizar...');
          
          // Buscar el usuario por email
          const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          
          if (listError) {
            console.error('   ❌ Error listando usuarios:', listError.message);
            continue;
          }

          const existingUser = users.users.find(u => u.email === usuario.email);
          
          if (existingUser) {
            console.log(`   ✅ Usuario encontrado con ID: ${existingUser.id}`);
            
            // Actualizar contraseña
            const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
              existingUser.id,
              {
                password: usuario.password,
                email_confirm: true,
                user_metadata: {
                  nombre: usuario.nombre,
                  puesto: usuario.puesto
                }
              }
            );

            if (updateError) {
              console.error('   ❌ Error actualizando:', updateError.message);
              continue;
            }

            console.log('   ✅ Contraseña actualizada exitosamente');
            // Usar el ID del usuario existente
            authData.user = existingUser;
          } else {
            console.error('   ❌ No se pudo encontrar el usuario');
            continue;
          }
        } else {
          continue;
        }
      } else {
        console.log(`   ✅ Usuario creado en Auth con ID: ${authData.user.id}`);
      }

      // PASO 2: Verificar/Crear operador en tabla operators
      console.log('   🔄 Paso 2/3: Verificando operador en DB...');
      
      const { data: existingOp, error: checkError } = await supabaseAdmin
        .from('operators')
        .select('*')
        .eq('email', usuario.email)
        .single();

      if (existingOp) {
        console.log('   ℹ️ Operador ya existe, actualizando...');
        
        const { error: updateOpError } = await supabaseAdmin
          .from('operators')
          .update({
            nombre: usuario.nombre,
            puesto: usuario.puesto,
            turno: usuario.turno,
            codigo: usuario.codigo,
            updated_at: new Date().toISOString()
          })
          .eq('email', usuario.email);

        if (updateOpError) {
          console.error('   ❌ Error actualizando operador:', updateOpError.message);
        } else {
          console.log('   ✅ Operador actualizado');
        }
      } else {
        console.log('   🔄 Creando nuevo operador...');
        
        const { data: newOp, error: createOpError } = await supabaseAdmin
          .from('operators')
          .insert({
            email: usuario.email,
            nombre: usuario.nombre,
            puesto: usuario.puesto,
            turno: usuario.turno,
            codigo: usuario.codigo,
            telefono: '0000000000',
            activo: true,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createOpError) {
          console.error('   ❌ Error creando operador:', createOpError.message);
        } else {
          console.log(`   ✅ Operador creado con ID: ${newOp.id}`);
        }
      }

      // PASO 3: Prueba de login
      console.log('   🔄 Paso 3/3: Probando login...');
      
      const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
        email: usuario.email,
        password: usuario.password
      });

      if (loginError) {
        console.error('   ❌ Error en prueba de login:', loginError.message);
        console.log('   ⚠️ Verifica las credenciales manualmente');
      } else {
        console.log('   ✅ ¡LOGIN EXITOSO! Las credenciales funcionan correctamente');
        // Cerrar sesión inmediatamente
        await supabaseAdmin.auth.signOut();
      }

      console.log(`\n   ✅✅✅ ${usuario.email} procesado completamente`);

    } catch (error) {
      console.error(`   ❌ Error inesperado:`, error.message);
    }
  }

  console.log('\n\n🎉 =============================================');
  console.log('🎉 PROCESO COMPLETADO');
  console.log('🎉 =============================================\n');
  console.log('📋 CREDENCIALES PARA PRUEBA:');
  console.log('━'.repeat(50));
  usuarios.forEach(u => {
    console.log(`\n   Email:    ${u.email}`);
    console.log(`   Password: ${u.password}`);
    console.log(`   Rol:      ${u.puesto}`);
  });
  console.log('\n━'.repeat(50));
  console.log('\n✅ Abre http://localhost:5173/ y prueba con admin.mto@devad.com\n');
}

// Ejecutar
crearUsuarios()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
