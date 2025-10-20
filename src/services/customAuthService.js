import { supabase } from '../lib/supabase';

// ==================== CUSTOM AUTH SERVICE ====================
// Sistema de autenticación personalizado que reemplaza Supabase Auth

export const customAuthService = {
  /**
   * Login con email y contraseña usando tabla personalizada
   */
  async signIn(email, password) {
    try {
      console.log('🔄 customAuth.signIn(): Iniciando login para:', email);

      // PASO 1: Limpiar sesiones expiradas
      await supabase.rpc('clean_expired_sessions');

      // PASO 2: Buscar usuario por email
      const { data: userData, error: userError } = await supabase
        .from('auth_users')
        .select('*')
        .eq('email', email)
        .eq('activo', true)
        .single();

      if (userError || !userData) {
        console.error('❌ customAuth.signIn(): Usuario no encontrado o inactivo');
        return {
          data: null,
          error: { message: 'Usuario no encontrado o inactivo' }
        };
      }

      // PASO 3: Verificar si está bloqueado
      if (userData.bloqueado_hasta && new Date(userData.bloqueado_hasta) > new Date()) {
        console.error('❌ customAuth.signIn(): Usuario bloqueado temporalmente');
        return {
          data: null,
          error: { message: 'Usuario bloqueado temporalmente. Intente más tarde.' }
        };
      }

      // PASO 4: Verificar contraseña usando la función verify_password
      const { data: passwordValid, error: verifyError } = await supabase
        .rpc('verify_password', {
          password: password,
          hash: userData.password_hash
        });

      if (verifyError || !passwordValid) {
        console.error('❌ customAuth.signIn(): Contraseña incorrecta');

        // Incrementar intentos fallidos
        const nuevoIntentos = (userData.intentos_fallidos || 0) + 1;
        let bloqueadoHasta = null;

        // Bloquear después de 5 intentos fallidos (5 minutos)
        if (nuevoIntentos >= 5) {
          bloqueadoHasta = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
          console.warn('⚠️ customAuth.signIn(): Usuario bloqueado por 5 minutos');
        }

        await supabase
          .from('auth_users')
          .update({
            intentos_fallidos: nuevoIntentos,
            bloqueado_hasta: bloqueadoHasta
          })
          .eq('id', userData.id);

        return {
          data: null,
          error: { 
            message: nuevoIntentos >= 5 
              ? 'Demasiados intentos fallidos. Usuario bloqueado por 5 minutos.' 
              : 'Contraseña incorrecta' 
          }
        };
      }

      console.log('✅ customAuth.signIn(): Contraseña verificada correctamente');

      // PASO 5: Generar token de sesión
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_session_token');

      if (tokenError || !tokenData) {
        console.error('❌ customAuth.signIn(): Error generando token');
        return {
          data: null,
          error: { message: 'Error generando sesión' }
        };
      }

      const token = tokenData;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      // PASO 6: Crear sesión en la base de datos
      const { data: sessionData, error: sessionError } = await supabase
        .from('auth_sessions')
        .insert({
          user_id: userData.id,
          token: token,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        console.error('❌ customAuth.signIn(): Error creando sesión:', sessionError);
        return {
          data: null,
          error: { message: 'Error creando sesión' }
        };
      }

      // PASO 7: Resetear intentos fallidos y actualizar último acceso
      await supabase
        .from('auth_users')
        .update({
          intentos_fallidos: 0,
          bloqueado_hasta: null,
          ultimo_acceso: new Date().toISOString()
        })
        .eq('id', userData.id);

      console.log('✅ customAuth.signIn(): Sesión creada exitosamente');
      console.log('👔 customAuth.signIn(): Puesto del usuario:', userData.puesto);

      // PASO 8: Buscar datos de operador (para compatibilidad)
      const { data: operatorData } = await supabase
        .from('operators')
        .select('*')
        .eq('email', email)
        .single();

      // PASO 9: Guardar sesión en localStorage
      const sessionInfo = {
        user: {
          id: userData.id,
          email: userData.email,
          nombre: userData.nombre,
          puesto: userData.puesto,
          codigo: userData.codigo
        },
        operator: operatorData || {
          email: userData.email,
          nombre: userData.nombre,
          puesto: userData.puesto,
          codigo: userData.codigo,
          turno: userData.turno
        },
        session: {
          token: token,
          expires_at: expiresAt.toISOString()
        }
      };

      localStorage.setItem('custom_auth_session', JSON.stringify(sessionInfo));

      return {
        data: sessionInfo,
        error: null
      };

    } catch (error) {
      console.error('❌ customAuth.signIn(): Error general:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  /**
   * Logout - eliminar sesión
   */
  async signOut() {
    try {
      const sessionInfo = localStorage.getItem('custom_auth_session');
      
      if (sessionInfo) {
        const session = JSON.parse(sessionInfo);
        
        // Eliminar sesión de la base de datos
        await supabase
          .from('auth_sessions')
          .delete()
          .eq('token', session.session.token);
      }

      // Eliminar de localStorage
      localStorage.removeItem('custom_auth_session');

      console.log('✅ customAuth.signOut(): Sesión cerrada');
      return { error: null };
    } catch (error) {
      console.error('❌ customAuth.signOut(): Error:', error);
      return { error: { message: error.message } };
    }
  },

  /**
   * Obtener sesión actual
   */
  async getSession() {
    try {
      const sessionInfo = localStorage.getItem('custom_auth_session');

      if (!sessionInfo) {
        console.log('ℹ️ customAuth.getSession(): No hay sesión activa');
        return { data: null, error: null };
      }

      const session = JSON.parse(sessionInfo);

      // Verificar si la sesión expiró
      const expiresAt = new Date(session.session.expires_at);
      if (expiresAt < new Date()) {
        console.warn('⚠️ customAuth.getSession(): Sesión expirada');
        await this.signOut();
        return { data: null, error: { message: 'Sesión expirada' } };
      }

      // Verificar que la sesión existe en la base de datos
      const { data: dbSession, error: sessionError } = await supabase
        .from('auth_sessions')
        .select('*')
        .eq('token', session.session.token)
        .eq('user_id', session.user.id)
        .single();

      if (sessionError || !dbSession) {
        console.warn('⚠️ customAuth.getSession(): Sesión inválida en BD');
        await this.signOut();
        return { data: null, error: { message: 'Sesión inválida' } };
      }

      console.log('✅ customAuth.getSession(): Sesión activa');
      return { data: session, error: null };

    } catch (error) {
      console.error('❌ customAuth.getSession(): Error:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  /**
   * Cambiar contraseña
   */
  async updatePassword(newPassword) {
    try {
      const { data: session } = await this.getSession();

      if (!session) {
        return { data: null, error: { message: 'No hay sesión activa' } };
      }

      // Hashear nueva contraseña
      const { data: hashedPassword, error: hashError } = await supabase
        .rpc('hash_password', { password: newPassword });

      if (hashError || !hashedPassword) {
        console.error('❌ customAuth.updatePassword(): Error hasheando contraseña');
        return { data: null, error: { message: 'Error procesando contraseña' } };
      }

      // Actualizar en la base de datos
      const { error: updateError } = await supabase
        .from('auth_users')
        .update({ password_hash: hashedPassword })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('❌ customAuth.updatePassword(): Error actualizando:', updateError);
        return { data: null, error: updateError };
      }

      console.log('✅ customAuth.updatePassword(): Contraseña actualizada');
      return { data: { success: true }, error: null };

    } catch (error) {
      console.error('❌ customAuth.updatePassword(): Error:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated() {
    const { data } = await this.getSession();
    return !!data?.session;
  }
};

export default customAuthService;
