import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertCircle, CheckCircle, Sun, Sunset } from 'lucide-react';

const TurnosSemanaConfig = () => {
  const [turnoDoble, setTurnoDoble] = useState('matutino'); // Turno con 2 operadores
  const [semanaActual, setSemanaActual] = useState('');
  const [ultimaConfiguracion, setUltimaConfiguracion] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    cargarConfiguracion();
    calcularSemana();
  }, []);

  const calcularSemana = () => {
    const hoy = new Date();
    const inicioAno = new Date(hoy.getFullYear(), 0, 1);
    const diferenciaDias = Math.floor((hoy - inicioAno) / (24 * 60 * 60 * 1000));
    const numeroSemana = Math.ceil((diferenciaDias + inicioAno.getDay() + 1) / 7);
    setSemanaActual(`Semana ${numeroSemana} - ${hoy.getFullYear()}`);
  };

  const cargarConfiguracion = () => {
    const config = localStorage.getItem('devad-mto-config-semanal');
    if (config) {
      const data = JSON.parse(config);
      setUltimaConfiguracion(data);
      setTurnoDoble(data.turnoDoble);
    }
  };

  const guardarConfiguracion = () => {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes...

    // Validar que sea lunes (día 1)
    if (diaSemana !== 1) {
      setMensaje({
        tipo: 'warning',
        texto: `⚠️ La configuración semanal debe realizarse los LUNES. Hoy es ${getNombreDia(diaSemana)}.`
      });
      return;
    }

    const config = {
      turnoDoble,
      fechaConfiguracion: hoy.toISOString(),
      semana: semanaActual,
      distribuciones: calcularDistribucion(turnoDoble)
    };

    localStorage.setItem('devad-mto-config-semanal', JSON.stringify(config));
    setUltimaConfiguracion(config);

    setMensaje({
      tipo: 'success',
      texto: '✅ Configuración guardada exitosamente para esta semana'
    });

    // Limpiar mensaje después de 5 segundos
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  const calcularDistribucion = (turnoConDos) => {
    const distribuciones = {
      matutino: { porcentaje: 30, operadores: 1 },
      vespertino: { porcentaje: 30, operadores: 1 },
      nocturno: { porcentaje: 10, operadores: 1 },
      intermedio: { porcentaje: 10, operadores: 1 }
    };

    // Asignar 2 operadores y 60% de carga al turno seleccionado
    if (turnoConDos === 'matutino') {
      distribuciones.matutino = { porcentaje: 60, operadores: 2 };
      distribuciones.vespertino = { porcentaje: 30, operadores: 1 };
    } else if (turnoConDos === 'vespertino') {
      distribuciones.vespertino = { porcentaje: 60, operadores: 2 };
      distribuciones.matutino = { porcentaje: 30, operadores: 1 };
    }

    return distribuciones;
  };

  const getNombreDia = (dia) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[dia];
  };

  const distribuciones = calcularDistribucion(turnoDoble);
  const hoy = new Date();
  const esLunes = hoy.getDay() === 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Configuración de Carga Semanal</h2>
            <p className="text-primary-100">{semanaActual}</p>
          </div>
        </div>
        {!esLunes && (
          <div className="mt-4 bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong>Advertencia:</strong> La configuración semanal debe realizarse los LUNES.
              Hoy es {getNombreDia(hoy.getDay())}.
            </div>
          </div>
        )}
      </div>

      {/* Mensajes */}
      {mensaje.texto && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          mensaje.tipo === 'success' ? 'bg-success-50 border border-success-200 text-success-700' :
          mensaje.tipo === 'warning' ? 'bg-warning-50 border border-warning-200 text-warning-700' :
          'bg-danger-50 border border-danger-200 text-danger-700'
        }`}>
          {mensaje.tipo === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{mensaje.texto}</span>
        </div>
      )}

      {/* Configuración Principal */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          Seleccionar Turno con Mayor Carga (2 Operadores)
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Los demás turnos tendrán 1 operador cada uno. Esta configuración se aplica de lunes a domingo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Opción Matutino */}
          <label className={`
            relative flex items-center gap-4 p-6 border-2 rounded-lg cursor-pointer transition-all
            ${turnoDoble === 'matutino' 
              ? 'border-yellow-500 bg-yellow-50' 
              : 'border-gray-200 hover:border-gray-300'}
          `}>
            <input
              type="radio"
              name="turnoDoble"
              value="matutino"
              checked={turnoDoble === 'matutino'}
              onChange={(e) => setTurnoDoble(e.target.value)}
              className="w-5 h-5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sun className="w-6 h-6 text-yellow-600" />
                <span className="font-semibold text-gray-900">Turno Matutino</span>
              </div>
              <p className="text-sm text-gray-600">6:00 - 14:00</p>
              <p className="text-sm font-medium text-yellow-700 mt-2">
                2 Operadores · 60% de carga
              </p>
            </div>
            {turnoDoble === 'matutino' && (
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            )}
          </label>

          {/* Opción Vespertino */}
          <label className={`
            relative flex items-center gap-4 p-6 border-2 rounded-lg cursor-pointer transition-all
            ${turnoDoble === 'vespertino' 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-200 hover:border-gray-300'}
          `}>
            <input
              type="radio"
              name="turnoDoble"
              value="vespertino"
              checked={turnoDoble === 'vespertino'}
              onChange={(e) => setTurnoDoble(e.target.value)}
              className="w-5 h-5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sunset className="w-6 h-6 text-orange-600" />
                <span className="font-semibold text-gray-900">Turno Vespertino</span>
              </div>
              <p className="text-sm text-gray-600">14:00 - 22:00</p>
              <p className="text-sm font-medium text-orange-700 mt-2">
                2 Operadores · 60% de carga
              </p>
            </div>
            {turnoDoble === 'vespertino' && (
              <CheckCircle className="w-6 h-6 text-orange-600" />
            )}
          </label>
        </div>
      </div>

      {/* Vista Previa de Distribución */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Vista Previa de Distribución</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(distribuciones).map(([turno, config]) => (
            <div key={turno} className={`
              p-4 rounded-lg border-2
              ${turno === turnoDoble ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50'}
            `}>
              <div className="font-semibold text-gray-900 capitalize mb-2">{turno}</div>
              <div className="text-2xl font-bold text-primary-600">{config.operadores}</div>
              <div className="text-sm text-gray-600">
                {config.operadores === 1 ? 'Operador' : 'Operadores'}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-700">
                {config.porcentaje}% carga
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Última Configuración */}
      {ultimaConfiguracion && (
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">Configuración Actual</h3>
          <div className="text-sm text-blue-700">
            <p className="mb-1">
              <strong>Turno con 2 operadores:</strong> {ultimaConfiguracion.turnoDoble.toUpperCase()}
            </p>
            <p className="mb-1">
              <strong>Configurado:</strong> {new Date(ultimaConfiguracion.fechaConfiguracion).toLocaleString('es-MX')}
            </p>
            <p>
              <strong>Semana:</strong> {ultimaConfiguracion.semana}
            </p>
          </div>
        </div>
      )}

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={guardarConfiguracion}
          className={`btn py-3 px-6 text-lg font-semibold ${
            esLunes ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <Calendar className="w-5 h-5 mr-2" />
          {esLunes ? 'Guardar Configuración Semanal' : 'Guardar (Solo Lunes)'}
        </button>
      </div>

      {/* Nota Informativa */}
      <div className="card bg-gray-50 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">ℹ️ Nota Importante:</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Esta configuración se aplica de <strong>lunes a domingo</strong></li>
          <li>Debe realizarse <strong>cada lunes</strong> para la semana entrante</li>
          <li>El encargado de planta asigna físicamente a los operadores a cada turno</li>
          <li>El sistema reparte automáticamente las tareas según los porcentajes configurados</li>
        </ul>
      </div>
    </div>
  );
};

export default TurnosSemanaConfig;
