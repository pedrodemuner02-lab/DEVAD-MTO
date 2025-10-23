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

  // Cargar sesión desde localStorage al iniciar
  useEffect(() => {
    console.log('🔄 AuthContext: Iniciando carga de usuario...');
    
    const loadUserData = async () => {
      try {
        // Intentar cargar desde localStorage primero (nuevo sistema)
        const storedUser = localStorage.getItem('devad-mto-user');
        const storedOperator = localStorage.getItem('devad-mto-operator');

        if (storedUser && storedOperator) {
          console.log('✅ AuthContext: Sesión encontrada en localStorage');
          setUser(JSON.parse(storedUser));
          setOperator(JSON.parse(storedOperator));
          setLoading(false);
          return;
        }

        // Si no hay en localStorage, intentar con customAuthService (legacy)
        console.log('🔄 AuthContext: Verificando customAuthService...');
        const { data } = await customAuthService.getSession();
        
        if (data?.user && data?.operator) {
          console.log('✅ AuthContext: Usuario y operador encontrados (legacy)');
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
  }, []);

  // ========== LOGIN COMO ADMINISTRADOR (CON CONTRASEÑA) ==========
  const loginAsAdmin = async (password) => {
    try {
      console.log('🔐 Intentando login como administrador...');
      
      // Contraseñas hardcodeadas (puedes cambiar esto)
      const validPasswords = ['admin123', 'devad2025', 'mantenimiento'];
      
      if (!validPasswords.includes(password)) {
        return { 
          success: false, 
          error: 'Contraseña incorrecta para administrador' 
        };
      }

      // Crear usuario administrador ficticio
      const adminUser = {
        id: 'admin-user',
        email: 'admin@devad-mto.local',
        role: 'administrador'
      };

      const adminOperator = {
        id: 'admin-op',
        codigo: 'ADMIN',
        nombre: 'Administrador del Sistema',
        puesto: 'Administrador',
        turno: 'Completo',
        email: 'admin@devad-mto.local',
        estado: 'activo'
      };

      // Guardar en localStorage
      localStorage.setItem('devad-mto-user', JSON.stringify(adminUser));
      localStorage.setItem('devad-mto-operator', JSON.stringify(adminOperator));

      setUser(adminUser);
      setOperator(adminOperator);

      console.log('✅ Login administrador exitoso');
      return { success: true };
    } catch (error) {
      console.error('❌ Error en loginAsAdmin:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== LOGIN COMO OPERADOR (SIN CONTRASEÑA) ==========
  const loginAsOperator = async (operatorData) => {
    try {
      console.log('👷 Iniciando sesión como operador:', operatorData.nombre);

      // Crear usuario operador
      const operatorUser = {
        id: `operator-${operatorData.id}`,
        email: operatorData.email || `${operatorData.codigo}@devad-mto.local`,
        role: 'operador'
      };

      // Guardar en localStorage
      localStorage.setItem('devad-mto-user', JSON.stringify(operatorUser));
      localStorage.setItem('devad-mto-operator', JSON.stringify(operatorData));

      setUser(operatorUser);
      setOperator(operatorData);

      console.log('✅ Login operador exitoso');
      return { success: true };
    } catch (error) {
      console.error('❌ Error en loginAsOperator:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== LOGIN LEGACY (MANTENER COMPATIBILIDAD) ==========
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
      console.log('🚪 Cerrando sesión...');
      
      // Limpiar localStorage
      localStorage.removeItem('devad-mto-user');
      localStorage.removeItem('devad-mto-operator');

      // Intentar cerrar sesión en customAuthService (si aplica)
      try {
        await customAuthService.signOut();
      } catch (err) {
        console.log('ℹ️ No había sesión en customAuthService');
      }
      
      setUser(null);
      setOperator(null);
      
      console.log('✅ Sesión cerrada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error en logout:', error);
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
    login,              // Legacy
    loginAsAdmin,       // Nuevo: Admin con contraseña
    loginAsOperator,    // Nuevo: Operador sin contraseña
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
