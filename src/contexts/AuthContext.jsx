import React, { createContext, useContext, useEffect, useState } from 'react';
import { customAuthService } from '../services/customAuthService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión y datos del operador al iniciar
  useEffect(() => {
    console.log('🔄 AuthContext: Iniciando carga de usuario...');
    
    const loadUserData = async () => {
      try {
        console.log('🔄 AuthContext: Llamando a customAuthService.getSession()...');
        const { data } = await customAuthService.getSession();
        console.log('✅ AuthContext: Respuesta de getSession:', data);
        
        if (data?.user && data?.operator) {
          console.log('✅ AuthContext: Usuario y operador encontrados');
          setUser(data.user);
          setOperator(data.operator);
        } else {
          console.log('ℹ️ AuthContext: No hay usuario autenticado');
        }
      } catch (error) {
        console.error('❌ AuthContext: Error loading user data:', error);
      } finally {
        console.log('✅ AuthContext: Finalizando carga, setLoading(false)');
        setLoading(false);
      }
    };

    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ AuthContext: Timeout alcanzado, forzando fin de loading');
      setLoading(false);
    }, 5000);

    loadUserData().finally(() => {
      clearTimeout(timeoutId);
    });

    // No necesitamos listener de Supabase Auth
  }, []);

  // Función de login
  const login = async (email, password) => {
    try {
      const { data, error } = await customAuthService.signIn(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        setUser(data.user);
        setOperator(data.operator);
        return { success: true };
      }

      return { success: false, error: 'Error desconocido en el login' };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      const { error } = await customAuthService.signOut();
      
      if (!error) {
        setUser(null);
        setOperator(null);
        return { success: true };
      }

      return { success: false, error: error.message };
    } catch (error) {
      console.error('Error en logout:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para actualizar contraseña
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await customAuthService.updatePassword(newPassword);
      
      if (!error) {
        return { success: true };
      }

      return { success: false, error: error.message };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error: error.message };
    }
  };

  // Obtener rol del usuario basado en el PUESTO del operador
  const getUserRole = () => {
    // Si no hay operador cargado, rol por defecto
    if (!operator || !operator.puesto) return 'operador';
    
    const puesto = operator.puesto.toLowerCase();
    
    // Mapear puesto a rol automáticamente
    // ADMINISTRADORES
    if (puesto.includes('administrador') || puesto.includes('admin')) {
      return 'administrador';
    }
    
    // JEFES / SUPERVISORES
    if (puesto.includes('jefe') || 
        puesto.includes('supervisor') || 
        puesto.includes('coordinador') ||
        puesto.includes('gerente')) {
      return 'jefe';
    }
    
    // OPERADORES (por defecto)
    return 'operador';
  };

  // Verificar permisos basados en rol
  const hasPermission = (requiredRoles) => {
    const currentRole = getUserRole();
    if (!currentRole) return false;

    // Si se pasa un array de roles, verificar si el usuario tiene alguno
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(currentRole);
    }

    // Si se pasa un string, verificar jerarquía
    const roleHierarchy = {
      'administrador': 3,
      'jefe': 2,
      'operador': 1
    };

    return roleHierarchy[currentRole] >= roleHierarchy[requiredRoles];
  };

  const value = {
    user,
    operator,
    userRole: getUserRole(),
    loading,
    login,
    logout,
    updatePassword,
    hasPermission,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
