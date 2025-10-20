import { supabase } from '../lib/supabase';

// ==================== AUTH SERVICE ====================

export const authService = {
  // Login con email y contraseña
  async signIn(email, password) {
    try {
      console.log('🔄 authService.signIn(): Iniciando login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ authService.signIn(): Error de Supabase:', error);
        throw error;
      }

      console.log('✅ authService.signIn(): Autenticación exitosa');

      // Buscar el operador en la base de datos
      console.log('🔄 authService.signIn(): Buscando operador en DB...');
      const { data: operatorData, error: opError } = await supabase
        .from('operators')
        .select('*')
        .eq('email', email)
        .single();

      if (opError) {
        console.error('❌ authService.signIn(): Error al buscar operador:', opError);
        // Si no se encuentra, crear operador temporal
        const operatorTemp = {
          email: data.user.email,
          nombre: data.user.user_metadata?.full_name || 'Usuario',
          puesto: 'Técnico', // Por defecto
          codigo: data.user.id.substring(0, 8).toUpperCase(),
        };
        console.log('⚠️ authService.signIn(): Operador no encontrado, usando temporal:', operatorTemp);
        
        return {
          data: {
            user: data.user,
            session: data.session,
            operator: operatorTemp,
          },
          error: null,
        };
      }

      console.log('✅ authService.signIn(): Operador encontrado:', operatorData);
      console.log('👔 authService.signIn(): Puesto del operador:', operatorData.puesto);

      return {
        data: {
          user: data.user,
          session: data.session,
          operator: operatorData, // Operador completo de la DB
        },
        error: null,
      };
    } catch (error) {
      console.error('❌ authService.signIn(): Error general:', error);
      return { data: null, error };
    }
  },

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error en logout:', error);
      return { error };
    }
  },

  // Obtener sesión actual
  async getSession() {
    try {
      console.log('🔄 authService.getSession(): Llamando a supabase.auth.getSession()...');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ authService.getSession(): Error de Supabase:', error);
        throw error;
      }

      console.log('✅ authService.getSession(): Respuesta de Supabase:', data);

      if (data.session) {
        console.log('✅ authService.getSession(): Sesión activa encontrada');
        
        // Buscar el operador en la base de datos
        console.log('🔄 authService.getSession(): Buscando operador en DB...');
        const { data: operatorData, error: opError } = await supabase
          .from('operators')
          .select('*')
          .eq('email', data.session.user.email)
          .single();

        if (opError) {
          console.error('❌ authService.getSession(): Error al buscar operador:', opError);
          // Si no se encuentra, crear operador temporal
          const operatorTemp = {
            email: data.session.user.email,
            nombre: data.session.user.user_metadata?.full_name || 'Usuario',
            puesto: 'Técnico',
            codigo: data.session.user.id.substring(0, 8).toUpperCase(),
          };
          console.log('⚠️ authService.getSession(): Operador no encontrado, usando temporal:', operatorTemp);
          
          return {
            data: {
              user: data.session.user,
              session: data.session,
              operator: operatorTemp,
            },
            error: null,
          };
        }

        console.log('✅ authService.getSession(): Operador encontrado:', operatorData);
        console.log('👔 authService.getSession(): Puesto del operador:', operatorData.puesto);

        return {
          data: {
            user: data.session.user,
            session: data.session,
            operator: operatorData, // Operador completo de la DB
          },
          error: null,
        };
      }

      console.log('ℹ️ authService.getSession(): No hay sesión activa');
      return { data: null, error: null };
    } catch (error) {
      console.error('❌ authService.getSession(): Error al obtener sesión:', error);
      return { data: null, error };
    }
  },

  // Cambiar contraseña
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return { data: null, error };
    }
  },

  // Verificar si el usuario está autenticado
  async isAuthenticated() {
    const { data } = await this.getSession();
    return !!data?.session;
  },

  // Obtener el rol del usuario actual
  async getUserRole() {
    const { data } = await this.getSession();
    if (!data?.operator) return 'guest';

    // Mapear el puesto a un rol
    const roleMap = {
      'Técnico de Mantenimiento': 'operador',
      'Técnico Mecánico': 'operador',
      'Técnico Eléctrico': 'operador',
      'Supervisor de Turno': 'jefe',
      'Jefe de Mantenimiento': 'jefe',
      'Administrador': 'administrador',
    };

    return roleMap[data.operator.puesto] || 'operador';
  },
};

export default authService;
