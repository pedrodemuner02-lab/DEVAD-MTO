import { createClient } from '@supabase/supabase-js';

// Usar el SERVICE ROLE KEY para tener permisos admin
const supabaseUrl = 'https://whjfotlxvbltvukddzoj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoamZvdGx4dmJsdHZ1a2Rkem9qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc3NDQ5MCwiZXhwIjoyMDc1MzUwNDkwfQ.LRUZF6FA3HqQPweiJZsZTa_2fKU7UvXlICq8dpFGe9o';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const usuarios = [
  {
    email: 'admin.mto@devad.com',
    password: 'Admin2025!',
    codigo: 'ADM-001',
    nombre: 'Administrador',
    apellidos: 'Sistema',
    puesto: 'Administrador',
    turno: 'Mañana'
  },
  {
    email: 'jefe.mto@devad.com',
    password: 'Jefe2025!',
    codigo: 'JEFE-001',
    nombre: 'Jefe',
    apellidos: 'Mantenimiento',
    puesto: 'Jefe de Mantenimiento',
    turno: 'Mañana'
  },
  {
    email: 'operador.mto@devad.com',
    password: 'Opera2025!',
    codigo: 'OPE-001',
    nombre: 'Operador',
    apellidos: 'Técnico',
    puesto: 'Técnico de Mantenimiento',
    turno: 'Mañana'
  }
];

async function crearUsuarios() {
  console.log('🔧 CREANDO USUARIOS EN SUPABASE AUTH...\n');

  for (const usuario of usuarios) {
    try {
      console.log(`\n📝 Creando usuario: ${usuario.email}`);
      
      // 1. Crear usuario en auth.users usando Admin API
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: usuario.email,
        password: usuario.password,
        email_confirm: true,
        user_metadata: {
          nombre: usuario.nombre,
          puesto: usuario.puesto
        }
      });

      if (authError) {
        console.error(`❌ Error creando usuario en auth: ${authError.message}`);
        continue;
      }

      console.log(`✅ Usuario creado en auth.users con ID: ${authData.user.id}`);

      // 2. Crear operador en la tabla operators
      const { data: operatorData, error: operatorError } = await supabaseAdmin
        .from('operators')
        .insert([{
          codigo: usuario.codigo,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          email: usuario.email,
          puesto: usuario.puesto,
          turno: usuario.turno
        }])
        .select()
        .single();

      if (operatorError) {
        console.error(`❌ Error creando operador: ${operatorError.message}`);
        // Si falla, eliminar el usuario de auth
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log('🔄 Usuario de auth eliminado por error en operador');
        continue;
      }

      console.log(`✅ Operador creado con ID: ${operatorData.id}`);
      console.log(`   - Código: ${usuario.codigo}`);
      console.log(`   - Puesto: ${usuario.puesto}`);
      console.log(`   - Turno: ${usuario.turno}`);

    } catch (error) {
      console.error(`❌ Error general creando ${usuario.email}:`, error.message);
    }
  }

  // Verificar usuarios creados
  console.log('\n\n═══════════════════════════════════════');
  console.log('📊 VERIFICACIÓN FINAL');
  console.log('═══════════════════════════════════════\n');

  // Listar usuarios en auth
  const { data: authUsers, error: authListError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (!authListError) {
    const devadUsers = authUsers.users.filter(u => u.email.includes('@devad.com'));
    console.log(`✅ Usuarios en auth.users: ${devadUsers.length}`);
    devadUsers.forEach(u => {
      console.log(`   - ${u.email} (confirmado: ${u.email_confirmed_at ? '✅' : '❌'})`);
    });
  }

  // Listar operadores
  const { data: operators, error: opsError } = await supabaseAdmin
    .from('operators')
    .select('*')
    .like('email', '%@devad.com');

  if (!opsError && operators) {
    console.log(`\n✅ Operadores en tabla operators: ${operators.length}`);
    operators.forEach(o => {
      console.log(`   - ${o.email} | ${o.codigo} | ${o.puesto} | ${o.turno}`);
    });
  }

  console.log('\n═══════════════════════════════════════');
  console.log('🎉 PROCESO COMPLETADO');
  console.log('═══════════════════════════════════════');
  console.log('\n📝 CREDENCIALES DE ACCESO:\n');
  usuarios.forEach(u => {
    console.log(`${u.puesto}:`);
    console.log(`  Email: ${u.email}`);
    console.log(`  Password: ${u.password}\n`);
  });
}

crearUsuarios();
