import React, { useState } from 'react';
import { Clock, Edit, Save, X } from 'lucide-react';

// Configuración por defecto de los 4 turnos
const defaultTurnos = [
  {
    id: 1,
    nombre: 'Matutino',
    alias: 'Mañana',
    horaInicio: '06:00',
    horaFin: '14:00',
    color: '#FCD34D', // Amarillo
    activo: true,
  },
  {
    id: 2,
    nombre: 'Intermedio',
    alias: 'Tarde',
    horaInicio: '14:00',
    horaFin: '18:00',
    color: '#FB923C', // Naranja
    activo: true,
  },
  {
    id: 3,
    nombre: 'Vespertino',
    alias: 'Tarde-Noche',
    horaInicio: '18:00',
    horaFin: '22:00',
    color: '#A78BFA', // Púrpura
    activo: true,
  },
  {
    id: 4,
    nombre: 'Nocturno',
    alias: 'Noche',
    horaInicio: '22:00',
    horaFin: '06:00',
    color: '#60A5FA', // Azul
    activo: true,
  },
];

const TurnosConfig = () => {
  const [turnos, setTurnos] = useState(defaultTurnos);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (turno) => {
    setEditingId(turno.id);
    setEditForm(turno);
  };

  const handleSave = () => {
    setTurnos(turnos.map(t => t.id === editingId ? editForm : t));
    setEditingId(null);
    setEditForm({});
    // Aquí se guardaría en la base de datos
    alert('Configuración de turno guardada');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const toggleActivo = (id) => {
    setTurnos(turnos.map(t => 
      t.id === id ? { ...t, activo: !t.activo } : t
    ));
  };

  const calculateDuration = (inicio, fin) => {
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    
    let hours = h2 - h1;
    let minutes = m2 - m1;
    
    // Manejar turno nocturno que cruza la medianoche
    if (hours < 0) {
      hours += 24;
    }
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    
    return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración de Turnos
        </h2>
        <p className="text-gray-500">
          Define los horarios de cada turno para la distribución automática de mantenimientos
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Información importante
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Los turnos se utilizan para distribuir automáticamente los mantenimientos recurrentes.
              Puedes personalizar los horarios según las necesidades de tu planta.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {turnos.map((turno) => {
          const isEditing = editingId === turno.id;
          const current = isEditing ? editForm : turno;

          return (
            <div
              key={turno.id}
              className={`card ${!turno.activo ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: current.color }}
                  ></div>
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={current.nombre}
                          onChange={(e) => handleChange('nombre', e.target.value)}
                          className="input text-sm font-semibold"
                          placeholder="Nombre del turno"
                        />
                        <input
                          type="text"
                          value={current.alias}
                          onChange={(e) => handleChange('alias', e.target.value)}
                          className="input text-xs"
                          placeholder="Alias"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {turno.nombre}
                        </h3>
                        <p className="text-sm text-gray-500">{turno.alias}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="p-2 text-success-600 hover:bg-success-50 rounded-lg"
                        title="Guardar"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(turno)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Hora Inicio</label>
                      <input
                        type="time"
                        value={current.horaInicio}
                        onChange={(e) => handleChange('horaInicio', e.target.value)}
                        className="input text-sm"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Hora Fin</label>
                      <input
                        type="time"
                        value={current.horaFin}
                        onChange={(e) => handleChange('horaFin', e.target.value)}
                        className="input text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label text-xs">Color</label>
                      <input
                        type="color"
                        value={current.color}
                        onChange={(e) => handleChange('color', e.target.value)}
                        className="h-10 w-full rounded border border-gray-300"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Horario:</span>
                      <span className="font-mono font-medium text-gray-900">
                        {turno.horaInicio} - {turno.horaFin}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duración:</span>
                      <span className="font-medium text-gray-900">
                        {calculateDuration(turno.horaInicio, turno.horaFin)}
                      </span>
                    </div>
                  </>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={turno.activo}
                      onChange={() => toggleActivo(turno.id)}
                      className="w-4 h-4 text-primary-600 rounded"
                      disabled={isEditing}
                    />
                    <span className="text-sm text-gray-700">
                      Turno activo para asignación automática
                    </span>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">
          Notas sobre los turnos:
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            <span>
              Los turnos activos se utilizan para distribuir automáticamente los mantenimientos recurrentes
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            <span>
              El sistema balancea la carga de trabajo entre todos los turnos activos
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            <span>
              Puedes desactivar un turno temporalmente sin perder su configuración
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            <span>
              Los mantenimientos con hora obligatoria no se distribuyen automáticamente
            </span>
          </li>
        </ul>
      </div>

      {/* Resumen */}
      <div className="card border-2 border-primary-200">
        <h3 className="font-semibold text-gray-900 mb-3">
          Resumen de Cobertura
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Turnos activos:</span>
            <span className="font-medium text-gray-900">
              {turnos.filter(t => t.activo).length} de {turnos.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cobertura total:</span>
            <span className="font-medium text-gray-900">24 horas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnosConfig;
