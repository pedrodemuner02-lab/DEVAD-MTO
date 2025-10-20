import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whjfotlxvbltvukddzoj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoamZvdGx4dmJsdHZ1a2Rkem9qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc3NDQ5MCwiZXhwIjoyMDc1MzUwNDkwfQ.LRUZF6FA3HqQPweiJZsZTa_2fKU7UvXlICq8dpFGe9o';

// Cliente con privilegios de administrador
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const nuevosUsuarios = [
  {
    email: 'admin.mto@devad.com',
    password: 'Admin2025!',
    nombre: 'Administrador',
    apellidos: 'Sistema',
    puesto: 'Administrador',
    turno: 'Todos'
  },
  {
    email: 'jefe.mto@devad.com',
    password: 'Jefe2025!',
    nombre: 'Jefe',
    apellidos: 'Mantenimiento',
    puesto: 'Jefe de Mantenimiento',
    turno: 'Diurno'
  },
  {
    email: 'operador.mto@devad.com',
    password: 'Opera2025!',
    nombre: 'Operador',
    apellidos: 'Técnico',
    puesto: 'Técnico de Mantenimiento',
    turno: 'Matutino'
  }
];

async function eliminarUsuariosAntiguos() {
  console.log('🗑️  Eliminando usuarios antiguos...\n');
  
  const emailsAntiguos = [
    'admin@devad-mto.com',
    'jefe@devad-mto.com',
    'operador@devad-mto.com'
  ];

  for (const email of emailsAntiguos) {
    try {
      // Buscar usuario por email
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const usuario = users.users.find(u => u.email === email);
      
      if (usuario) {
        // Eliminar de auth
        await supabaseAdmin.auth.admin.deleteUser(usuario.id);
        console.log(`✅ Usuario eliminado de auth: ${email}`);
        
        // Eliminar de operators
        await supabaseAdmin
          .from('operators')
          .delete()
          .eq('email', email);
        console.log(`✅ Operador eliminado de DB: ${email}`);
      } else {
        console.log(`ℹ️  Usuario no encontrado: ${email}`);
      }
    } catch (error) {
      console.log(`⚠️  Error al eliminar ${email}:`, error.message);
    }
  }
  
  console.log('\n');
}

async function crearNuevosUsuarios() {
  console.log('👥 Creando nuevos usuarios...\n');

  for (const usuario of nuevosUsuarios) {
    try {
      console.log(`🔄 Creando usuario: ${usuario.email}...`);
      
      // 1. Crear usuario en auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: usuario.email,
        password: usuario.password,
        email_confirm: true,
        user_metadata: {
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          puesto: usuario.puesto
        }
      });

      if (authError) {
        console.error(`❌ Error creando usuario en auth:`, authError.message);
        continue;
      }

      console.log(`   ✅ Usuario creado en auth: ${authData.user.id}`);

      // 2. Crear operador en la base de datos
      const { data: operatorData, error: operatorError } = await supabaseAdmin
        .from('operators')
        .insert([
          {
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            email: usuario.email,
            puesto: usuario.puesto,
            turno: usuario.turno,
            estatus: 'activo'
          }
        ])
        .select()
        .single();

      if (operatorError) {
        console.error(`❌ Error creando operador en DB:`, operatorError.message);
        // Si falla, eliminar el usuario de auth
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        continue;
      }

      console.log(`   ✅ Operador creado en DB: ${operatorData.id}`);
      console.log(`   📧 Email: ${usuario.email}`);
      console.log(`   🔑 Contraseña: ${usuario.password}`);
      console.log(`   👔 Puesto: ${usuario.puesto}\n`);

    } catch (error) {
      console.error(`❌ Error general creando ${usuario.email}:`, error.message);
    }
  }
}

async function verificarUsuarios() {
  console.log('🔍 Verificando usuarios creados...\n');

  try {
    // Listar usuarios de auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    console.log(`✅ Total usuarios en auth: ${authUsers.users.length}`);
    
    authUsers.users.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
    });

    console.log('\n');

    // Listar operadores en DB
    const { data: operators, error } = await supabaseAdmin
      .from('operators')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al listar operadores:', error.message);
      return;
    }

    console.log(`✅ Total operadores en DB: ${operators.length}`);
    operators.forEach(op => {
      console.log(`   - ${op.email} | ${op.puesto} | ${op.estatus}`);
    });

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 CREAR NUEVOS USUARIOS - DEVAD-MTO');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Paso 1: Eliminar usuarios antiguos
    await eliminarUsuariosAntiguos();

    // Paso 2: Crear nuevos usuarios
    await crearNuevosUsuarios();

    // Paso 3: Verificar
    await verificarUsuarios();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ PROCESO COMPLETADO');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📋 NUEVAS CREDENCIALES:\n');
    console.log('🔧 ADMINISTRADOR:');
    console.log('   Email: admin.mto@devad.com');
    console.log('   Contraseña: Admin2025!\n');

    console.log('👨‍💼 JEFE DE MANTENIMIENTO:');
    console.log('   Email: jefe.mto@devad.com');
    console.log('   Contraseña: Jefe2025!\n');

    console.log('👷 OPERADOR:');
    console.log('   Email: operador.mto@devad.com');
    console.log('   Contraseña: Opera2025!\n');

    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error fatal:', error);
  }
}

main();
