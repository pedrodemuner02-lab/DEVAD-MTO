import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Lock, Sun, Sunset, Moon, CloudSun, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { loginAsAdmin, loginAsTurno } = useAuth();
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Definición de turnos fijos
  const turnos = [
    {
      id: 'matutino',
      nombre: 'Turno Matutino',
      horario: '6:00 - 14:00',
      icon: Sun,
      color: 'yellow',
      gradient: 'from-yellow-400 to-orange-400'
    },
    {
      id: 'vespertino',
      nombre: 'Turno Vespertino',
      horario: '14:00 - 22:00',
      icon: Sunset,
      color: 'orange',
      gradient: 'from-orange-400 to-red-400'
    },
    {
      id: 'nocturno',
      nombre: 'Turno Nocturno',
      horario: '22:00 - 6:00',
      icon: Moon,
      color: 'blue',
      gradient: 'from-blue-400 to-indigo-400'
    },
    {
      id: 'intermedio',
      nombre: 'Turno Intermedio',
      horario: '10:00 - 18:00',
      icon: CloudSun,
      color: 'teal',
      gradient: 'from-teal-400 to-cyan-400'
    }
  ];

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

  // Login como turno (sin contraseña)
  const handleTurnoClick = async (turno) => {
    setError('');
    setLoading(true);

    try {
      const result = await loginAsTurno(turno);
      
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
      <div className="w-full max-w-6xl">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <Settings className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">DEVAD-MTO</h1>
          <p className="text-primary-100">Sistema Integral de Mantenimiento</p>
          <p className="text-primary-200 text-sm mt-2">Acceso por Turnos - Simplificado</p>
        </div>

        {/* Error Global */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border-2 border-danger-200 rounded-lg flex items-center gap-3 text-danger-700 max-w-2xl mx-auto">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* ========== SECCIÓN ADMINISTRADOR (Destacada arriba) ========== */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-6 max-w-2xl mx-auto border-4 border-primary-500">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Lock className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Jefe de Mantenimiento</h2>
              <p className="text-sm text-gray-600">Acceso con contraseña</p>
            </div>
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label htmlFor="adminPassword" className="label text-lg">
                Contraseña de Jefe/Administrador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setError('');
                  }}
                  className="input pl-12 text-lg py-3"
                  placeholder="Ingrese contraseña"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary py-4 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                  Iniciando...
                </span>
              ) : (
                'Entrar como Jefe de Mantenimiento'
              )}
            </button>
          </form>
        </div>

        {/* Separador */}
        <div className="flex items-center justify-center my-8">
          <div className="border-t border-primary-300 flex-grow max-w-xs"></div>
          <span className="px-4 text-primary-100 font-medium">O</span>
          <div className="border-t border-primary-300 flex-grow max-w-xs"></div>
        </div>

        {/* ========== SECCIÓN TURNOS DE OPERADORES ========== */}
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso por Turnos</h2>
            <p className="text-gray-600">
              Selecciona tu turno de trabajo (asignado por encargado de planta)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {turnos.map((turno) => {
              const IconComponent = turno.icon;
              return (
                <button
                  key={turno.id}
                  onClick={() => handleTurnoClick(turno)}
                  disabled={loading}
                  className={`
                    relative overflow-hidden rounded-xl border-3 border-gray-200
                    hover:border-${turno.color}-500 hover:shadow-2xl
                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                    group p-6
                  `}
                >
                  {/* Fondo con gradiente */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${turno.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  
                  {/* Contenido */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`p-4 bg-${turno.color}-100 rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-12 h-12 text-${turno.color}-600`} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {turno.nombre}
                    </h3>
                    
                    <div className={`inline-flex items-center px-4 py-2 rounded-full bg-${turno.color}-100 text-${turno.color}-700 font-semibold`}>
                      {turno.horario}
                    </div>

                    <p className="text-sm text-gray-500 mt-3">
                      Click para acceder
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              💡 <strong>Nota:</strong> El encargado de planta te indica qué turno te corresponde hoy
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-primary-100">
            © 2025 DEVAD-MTO - Pedro Demuner Valdivia
          </p>
          <p className="text-xs text-primary-200 mt-1">
            Versión 2.0.0 - Sistema por Turnos Simplificado
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
