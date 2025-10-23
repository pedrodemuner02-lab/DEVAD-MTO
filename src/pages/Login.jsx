import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Lock, User, AlertCircle, Users } from 'lucide-react';
import { operatorService } from '../services/databaseService';

const Login = () => {
  const navigate = useNavigate();
  const { loginAsAdmin, loginAsOperator } = useAuth();
  const [adminPassword, setAdminPassword] = useState('');
  const [operators, setOperators] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOperators, setLoadingOperators] = useState(true);

  // Cargar operadores activos al montar
  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    try {
      setLoadingOperators(true);
      const { data, error } = await operatorService.getAll();
      
      if (error) throw error;
      
      // Filtrar solo operadores activos
      const activeOps = (data || []).filter(op => 
        op.estado === 'Disponible' || op.estado === 'Ocupado' || op.estado === 'activo'
      );
      
      setOperators(activeOps);
    } catch (err) {
      console.error('Error al cargar operadores:', err);
      setOperators([]);
    } finally {
      setLoadingOperators(false);
    }
  };

  // Login como administrador
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginAsAdmin(adminPassword);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Contraseña incorrecta');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Login como operador (sin contraseña)
  const handleOperatorClick = async (operator) => {
    setError('');
    setLoading(true);

    try {
      const result = await loginAsOperator(operator);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <Settings className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">DEVAD-MTO</h1>
          <p className="text-primary-100">Sistema Integral de Mantenimiento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ========== SECCIÓN ADMINISTRADOR ========== */}
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Lock className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Administrador</h2>
            </div>
            
            {error && error.includes('admin') && (
              <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg flex items-center gap-2 text-danger-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label htmlFor="adminPassword" className="label">
                  Contraseña de Administrador
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="adminPassword"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setError('');
                    }}
                    className="input pl-10"
                    placeholder="Ingrese contraseña de administrador"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn btn-primary py-3 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    Iniciando...
                  </span>
                ) : (
                  'Entrar como Administrador'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Solo personal autorizado con contraseña
              </p>
            </div>
          </div>

          {/* ========== SECCIÓN OPERADORES ========== */}
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-success-100 rounded-lg">
                <Users className="w-6 h-6 text-success-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Operadores</h2>
            </div>

            {error && !error.includes('admin') && (
              <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg flex items-center gap-2 text-danger-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-4">
              Selecciona tu número de operador:
            </p>

            {loadingOperators ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : operators.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay operadores disponibles</p>
                <p className="text-xs text-gray-400 mt-2">
                  El administrador debe agregar operadores primero
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {operators.map((operator, index) => (
                  <button
                    key={operator.id}
                    onClick={() => handleOperatorClick(operator)}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="w-12 h-12 bg-primary-100 group-hover:bg-primary-200 rounded-full flex items-center justify-center mb-2">
                      <span className="text-xl font-bold text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">
                      {operator.nombre.split(' ')[0]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {operator.turno}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Sin contraseña - Solo selecciona tu número
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-primary-100">
            © 2025 DEVAD-MTO - Pedro Demuner Valdivia
          </p>
          <p className="text-xs text-primary-200 mt-1">
            Versión 1.0.0 - Acceso Simplificado
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
