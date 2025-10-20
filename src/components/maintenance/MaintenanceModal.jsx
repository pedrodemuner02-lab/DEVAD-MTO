import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, Wrench, AlertTriangle } from 'lucide-react';
// Eliminado import obsoleto: maintenanceTemplateService (tabla maintenance_templates ya no existe)
import { supabase, TABLES } from '../../lib/supabase';

const MaintenanceModal = ({ mode, maintenance, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    equipmentId: '',
    tipo: 'Preventivo',
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    estado: 'programado',
    fechaProgramada: '',
    turno: 'Matutino',
    operadorAsignado: '',
    horasEstimadas: '',
    costoEstimado: '',
    observaciones: '',
    // 🤖 Nuevos campos de asignación automática
    complejidad: 'media',
    urgencia: 'normal',
    asignacionAutomatica: true,
    // Campos de recurrencia
    esRecurrente: false,
    recurrencia: {
      tipo: 'mensual',
      cada: 1,
      diasSemana: [],
      fechaInicio: '',
      horaEspecifica: '',
      horaObligatoria: false,
      duracionEstimada: 60,
      distribuirTurnos: true,
      turnoPreferido: '',
    },
    generarHasta: '',
    esIndefinido: false,
  });

  const [equipments, setEquipments] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showRecurrencePreview, setShowRecurrencePreview] = useState(false);

  // Cargar equipos y operadores
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar TODOS los equipos (sin límite)
      const { data: equipData, error: equipError } = await supabase
        .from(TABLES.EQUIPMENT)
        .select('id, codigo, nombre')
        .order('nombre');
      
      if (equipError) {
        console.error('Error al cargar equipos:', equipError);
      } else {
        console.log('Equipos cargados:', equipData);
        setEquipments(equipData || []);
      }

      // Por ahora usamos operadores hardcoded hasta que tengamos la tabla operators
      // En el futuro esto se cargará desde la base de datos
      const hardcodedOperators = [
        'admin@devad-mto.com',
        'jefe@devad-mto.com',
        'operador1@devad-mto.com',
        'operador2@devad-mto.com',
        'operador3@devad-mto.com',
      ];
      setOperators(hardcodedOperators);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (maintenance && (mode === 'edit' || mode === 'view')) {
      setFormData({
        equipmentId: maintenance.equipmentId || '',
        tipo: maintenance.tipo || 'Preventivo',
        titulo: maintenance.titulo || '',
        descripcion: maintenance.descripcion || '',
        prioridad: maintenance.prioridad || 'media',
        estado: maintenance.estado || 'programado',
        fechaProgramada: maintenance.fechaProgramada || '',
        turno: maintenance.turno || 'Matutino',
        operadorAsignado: maintenance.operadorAsignado || '',
        horasEstimadas: maintenance.horasEstimadas || '',
        costoEstimado: maintenance.costoEstimado || '',
        observaciones: maintenance.observaciones || '',
        esRecurrente: maintenance.esRecurrente || false,
        recurrencia: maintenance.recurrencia || formData.recurrencia,
        generarHasta: maintenance.generarHasta || '',
        esIndefinido: maintenance.esIndefinido || false,
      });
    }
  }, [maintenance, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Manejo especial para campos de recurrencia
    if (name.startsWith('recurrencia.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        recurrencia: { ...formData.recurrencia, [field]: newValue }
      });
    } else {
      setFormData({ ...formData, [name]: newValue });
    }
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleRecurrenceTypeChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      recurrencia: {
        ...formData.recurrencia,
        tipo: value,
        cada: value === 'diaria' ? 1 : value === 'semanal' ? 1 : value === 'mensual' ? 1 : 1,
      }
    });
  };

  const calculateRecurrencePreview = () => {
    if (!formData.esRecurrente || !formData.recurrencia.fechaInicio) {
      return [];
    }

    // Si no hay fecha final y no es indefinido, retornar vacío
    if (!formData.esIndefinido && !formData.generarHasta) {
      return [];
    }

    const start = new Date(formData.recurrencia.fechaInicio);
    // Si es indefinido, generar para 1 año de vista previa
    const end = formData.esIndefinido 
      ? new Date(start.getTime() + (365 * 24 * 60 * 60 * 1000))
      : new Date(formData.generarHasta);
    
    const preview = [];
    let current = new Date(start);
    let count = 0;
    const maxPreview = 10; // Mostrar máximo 10 en preview

    while (current <= end && count < maxPreview) {
      // Para tipo semanal, validar días específicos
      if (formData.recurrencia.tipo === 'semanal') {
        const dayOfWeek = current.getDay();
        if (formData.recurrencia.diasSemana.includes(dayOfWeek)) {
          preview.push(new Date(current));
          count++;
        }
        // Avanzar 1 día
        current.setDate(current.getDate() + 1);
      } else {
        preview.push(new Date(current));
        count++;
        
        // Calcular siguiente fecha según tipo de recurrencia
        switch (formData.recurrencia.tipo) {
          case 'diaria':
            current.setDate(current.getDate() + parseInt(formData.recurrencia.cada));
            break;
          case 'mensual':
            current.setMonth(current.getMonth() + parseInt(formData.recurrencia.cada));
            break;
          case 'anual':
            current.setFullYear(current.getFullYear() + parseInt(formData.recurrencia.cada));
            break;
          default:
            current = new Date(end.getTime() + 1); // Salir del loop
        }
      }
    }

    return preview;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.equipmentId) {
      newErrors.equipmentId = 'El equipo es requerido';
    }
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }
    
    // Si NO es recurrente, validar fecha programada normal
    if (!formData.esRecurrente && !formData.fechaProgramada) {
      newErrors.fechaProgramada = 'La fecha programada es requerida';
    }
    
    // Si ES recurrente, validar campos de recurrencia
    if (formData.esRecurrente) {
      if (!formData.recurrencia.fechaInicio) {
        newErrors.fechaInicio = 'La fecha de inicio es requerida';
      }
      // Solo validar generarHasta si NO es indefinido
      if (!formData.esIndefinido && !formData.generarHasta) {
        newErrors.generarHasta = 'La fecha final es requerida o marca como indefinido';
      }
      if (formData.recurrencia.tipo === 'semanal' && formData.recurrencia.diasSemana.length === 0) {
        newErrors.diasSemana = 'Selecciona al menos un día de la semana';
      }
    }
    
    // Solo validar operador si NO está activada la distribución automática
    if (!formData.recurrencia.distribuirTurnos && !formData.operadorAsignado) {
      newErrors.operadorAsignado = 'El operador es requerido (o activa distribución automática)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onClose();
      return;
    }

    if (validate()) {
      // Transformar formData al formato que espera el servicio
      const maintenanceData = {
        equipmentId: formData.equipmentId, // UUID string, NO convertir a número
        tipo: formData.tipo,
        prioridad: formData.prioridad,
        estado: formData.estado,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fechaProgramada: formData.esRecurrente ? formData.recurrencia.fechaInicio : formData.fechaProgramada,
        turno: formData.turno,
        operadorAsignado: formData.operadorAsignado || null, // null si distribución automática
        horasEstimadas: formData.horasEstimadas ? parseFloat(formData.horasEstimadas) : null,
        costoEstimado: formData.costoEstimado ? parseFloat(formData.costoEstimado) : null,
        observaciones: formData.observaciones,
        esRecurrente: formData.esRecurrente,
        // Campos de recurrencia se manejarán en el futuro
      };

      console.log('📤 Guardando mantenimiento:', maintenanceData);
      
      // ⚠️ TEMPORAL: Esta sección será reemplazada con instanceGenerator.js
      // Si es recurrente, por ahora solo guardamos los datos
      if (formData.esRecurrente) {
        console.warn('⚠️ Mantenimiento recurrente - funcionalidad en desarrollo');
        // TODO: Implementar con instanceGenerator.js
        onSave(maintenanceData);
        onClose();
      } else {
        // Mantenimiento simple (no recurrente)
        onSave(maintenanceData);
      }
    }
  };

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' && 'Nuevo Mantenimiento'}
              {mode === 'edit' && 'Editar Mantenimiento'}
              {mode === 'view' && 'Detalles del Mantenimiento'}
            </h2>
            {maintenance?.folio && (
              <p className="text-sm text-gray-500 mt-1">Folio: {maintenance.folio}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información General */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary-600" />
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Equipo */}
              <div>
                <label className="label">
                  Equipo <span className="text-danger-600">*</span>
                </label>
                <select
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleChange}
                  className={`input ${errors.equipmentId ? 'border-danger-500' : ''}`}
                  disabled={isViewMode || loading}
                  required
                >
                  <option value="">Seleccionar equipo...</option>
                  {equipments.map((equip) => (
                    <option key={equip.id} value={equip.id}>
                      {equip.codigo} - {equip.nombre}
                    </option>
                  ))}
                </select>
                {errors.equipmentId && (
                  <p className="text-xs text-danger-600 mt-1">{errors.equipmentId}</p>
                )}
              </div>

              {/* Tipo */}
              <div>
                <label className="label">
                  Tipo de Mantenimiento <span className="text-danger-600">*</span>
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="input"
                  disabled={isViewMode}
                  required
                >
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                  <option value="Predictivo">Predictivo</option>
                  <option value="Lubricación">Lubricación</option>
                  <option value="Inspección">Inspección</option>
                  <option value="Calibración">Calibración</option>
                </select>
              </div>

              {/* Título */}
              <div className="md:col-span-2">
                <label className="label">
                  Título <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={`input ${errors.titulo ? 'border-danger-500' : ''}`}
                  placeholder="Título del mantenimiento"
                  disabled={isViewMode}
                  required
                />
                {errors.titulo && (
                  <p className="text-xs text-danger-600 mt-1">{errors.titulo}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="label">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="input"
                  rows="3"
                  placeholder="Descripción detallada del mantenimiento"
                  disabled={isViewMode}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Programación */}
          {!formData.esRecurrente && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Programación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fecha Programada */}
                <div>
                  <label className="label">
                    Fecha Programada <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="fechaProgramada"
                    value={formData.fechaProgramada}
                    onChange={handleChange}
                    className={`input ${errors.fechaProgramada ? 'border-danger-500' : ''}`}
                    disabled={isViewMode}
                    required
                  />
                  {errors.fechaProgramada && (
                    <p className="text-xs text-danger-600 mt-1">{errors.fechaProgramada}</p>
                  )}
                </div>

              {/* Fecha Inicio */}
              <div>
                <label className="label">Fecha y Hora de Inicio</label>
                <input
                  type="datetime-local"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  className="input"
                  disabled={isViewMode}
                />
              </div>

              {/* Fecha Finalización */}
              <div>
                <label className="label">Fecha y Hora de Finalización</label>
                <input
                  type="datetime-local"
                  name="fechaFinalizacion"
                  value={formData.fechaFinalizacion}
                  onChange={handleChange}
                  className="input"
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>
          )}

          {/* 🤖 ASIGNACIÓN AUTOMÁTICA - NUEVOS CAMPOS */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Asignación Automática Inteligente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Complejidad */}
              <div>
                <label className="label">
                  Complejidad <span className="text-danger-600">*</span>
                </label>
                <select
                  name="complejidad"
                  value={formData.complejidad || 'media'}
                  onChange={handleChange}
                  className="input bg-white"
                  disabled={isViewMode}
                  required
                >
                  <option value="baja">🟢 Baja (1 punto) - Tareas simples</option>
                  <option value="media">🟡 Media (2 puntos) - Tareas estándar</option>
                  <option value="alta">🔴 Alta (3 puntos) - Tareas complejas</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  Define la dificultad del trabajo para el balanceo de carga
                </p>
              </div>

              {/* Urgencia */}
              <div>
                <label className="label">
                  Urgencia <span className="text-danger-600">*</span>
                </label>
                <select
                  name="urgencia"
                  value={formData.urgencia || 'normal'}
                  onChange={handleChange}
                  className="input bg-white"
                  disabled={isViewMode}
                  required
                >
                  <option value="normal">⏰ Normal - Distribuir equitativamente</option>
                  <option value="urgente">🚨 Urgente - Asignar a turno actual</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {formData.urgencia === 'urgente' 
                    ? '⚡ Se asignará al turno actual inmediatamente' 
                    : '📊 Se distribuirá al turno con menor carga'}
                </p>
              </div>
            </div>

            {/* Checkbox de Asignación Automática */}
            <div className="mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="asignacionAutomatica"
                  checked={formData.asignacionAutomatica !== false}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  disabled={isViewMode}
                />
                <span className="text-sm font-medium text-gray-900">
                  Activar asignación automática inteligente
                </span>
              </label>
              <p className="text-xs text-gray-600 ml-6 mt-1">
                ✅ El sistema seleccionará automáticamente el operador y turno óptimo considerando:
                <br/>• Carga de trabajo actual por turno
                <br/>• Disponibilidad de operadores
                <br/>• Complejidad del trabajo
                <br/>• Urgencia de la tarea
              </p>
            </div>
          </div>

          {/* Asignación y Estado */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Asignación y Estado
            </h3>
            <div className={`grid grid-cols-1 ${formData.asignacionAutomatica !== false ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
              {/* Operador Asignado - SOLO SI ASIGNACIÓN AUTOMÁTICA ESTÁ DESACTIVADA */}
              {formData.asignacionAutomatica === false && (
                <div>
                  <label className="label">
                    Operador Asignado <span className="text-danger-600">*</span>
                  </label>
                  <select
                    name="operadorAsignado"
                    value={formData.operadorAsignado}
                    onChange={handleChange}
                    className={`input ${errors.operadorAsignado ? 'border-danger-500' : ''}`}
                    disabled={isViewMode || loading}
                    required
                  >
                    <option value="">Seleccionar operador...</option>
                    {operators.map((email) => (
                      <option key={email} value={email}>
                        {email}
                      </option>
                    ))}
                  </select>
                  {errors.operadorAsignado && (
                    <p className="text-xs text-danger-600 mt-1">{errors.operadorAsignado}</p>
                  )}
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Asignación manual activada - debes elegir un operador
                  </p>
                </div>
              )}

              {/* Prioridad */}
              <div>
                <label className="label">Prioridad</label>
                <select
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                  className="input"
                  disabled={isViewMode}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="label">Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="input"
                  disabled={isViewMode}
                >
                  <option value="programado">Programado</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recurrencia */}
          {mode === 'create' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  Mantenimiento Recurrente
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="esRecurrente"
                    checked={formData.esRecurrente}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Activar recurrencia
                  </span>
                </label>
              </div>

              {formData.esRecurrente && (
                <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Fecha de Inicio */}
                    <div>
                      <label className="label">
                        Fecha de inicio <span className="text-danger-600">*</span>
                      </label>
                      <input
                        type="date"
                        name="recurrencia.fechaInicio"
                        value={formData.recurrencia.fechaInicio}
                        onChange={handleChange}
                        className={`input ${errors.fechaInicio ? 'border-danger-500' : ''}`}
                      />
                      {errors.fechaInicio && (
                        <p className="text-xs text-danger-600 mt-1">{errors.fechaInicio}</p>
                      )}
                    </div>

                    {/* Tipo de Recurrencia */}
                    <div>
                      <label className="label">
                        Se repite <span className="text-danger-600">*</span>
                      </label>
                      <select
                        name="recurrencia.tipo"
                        value={formData.recurrencia.tipo}
                        onChange={handleRecurrenceTypeChange}
                        className="input"
                      >
                        <option value="diaria">Diariamente</option>
                        <option value="semanal">Semanalmente</option>
                        <option value="mensual">Mensualmente</option>
                        <option value="anual">Anualmente</option>
                      </select>
                    </div>

                    {/* Frecuencia - Oculto si es semanal */}
                    {formData.recurrencia.tipo !== 'semanal' && (
                      <div>
                        <label className="label">
                          Cada <span className="text-danger-600">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            name="recurrencia.cada"
                            value={formData.recurrencia.cada}
                            onChange={handleChange}
                            min="1"
                            max="365"
                            className="input"
                          />
                          <span className="text-sm text-gray-600">
                            {formData.recurrencia.tipo === 'diaria' && 'día(s)'}
                            {formData.recurrencia.tipo === 'mensual' && 'mes(es)'}
                            {formData.recurrencia.tipo === 'anual' && 'año(s)'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Duración Estimada */}
                    <div>
                      <label className="label">
                        Duración estimada (min) <span className="text-danger-600">*</span>
                      </label>
                      <input
                        type="number"
                        name="recurrencia.duracionEstimada"
                        value={formData.recurrencia.duracionEstimada}
                        onChange={handleChange}
                        min="15"
                        step="15"
                        className="input"
                        placeholder="60"
                      />
                    </div>
                  </div>

                  {/* Selector de días de la semana - Solo para tipo semanal */}
                  {formData.recurrencia.tipo === 'semanal' && (
                    <div>
                      <label className="label">
                        Días de la semana <span className="text-danger-600">*</span>
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {[
                          { value: 0, label: 'D', name: 'Domingo' },
                          { value: 1, label: 'L', name: 'Lunes' },
                          { value: 2, label: 'M', name: 'Martes' },
                          { value: 3, label: 'X', name: 'Miércoles' },
                          { value: 4, label: 'J', name: 'Jueves' },
                          { value: 5, label: 'V', name: 'Viernes' },
                          { value: 6, label: 'S', name: 'Sábado' },
                        ].map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              const newDays = formData.recurrencia.diasSemana.includes(day.value)
                                ? formData.recurrencia.diasSemana.filter(d => d !== day.value)
                                : [...formData.recurrencia.diasSemana, day.value].sort();
                              setFormData({
                                ...formData,
                                recurrencia: { ...formData.recurrencia, diasSemana: newDays }
                              });
                            }}
                            className={`p-2 text-sm font-medium rounded-lg transition-colors ${
                              formData.recurrencia.diasSemana.includes(day.value)
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                            title={day.name}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      {errors.diasSemana && (
                        <p className="text-xs text-danger-600 mt-1">{errors.diasSemana}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Selecciona los días en los que se realizará el mantenimiento
                      </p>
                    </div>
                  )}

                  {/* Horario */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Hora específica (opcional)</label>
                      <input
                        type="time"
                        name="recurrencia.horaEspecifica"
                        value={formData.recurrencia.horaEspecifica}
                        onChange={handleChange}
                        className="input"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer pb-2">
                        <input
                          type="checkbox"
                          name="recurrencia.horaObligatoria"
                          checked={formData.recurrencia.horaObligatoria}
                          onChange={handleChange}
                          disabled={!formData.recurrencia.horaEspecifica}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                          Hora obligatoria (no puede cambiarse)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Distribución de Turnos */}
                  <div>
                    <label className="label">Asignación de turno</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="distribucionTurno"
                          checked={formData.recurrencia.distribuirTurnos}
                          onChange={() => setFormData({
                            ...formData,
                            recurrencia: { ...formData.recurrencia, distribuirTurnos: true, turnoPreferido: '' }
                          })}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm text-gray-700">
                          Distribuir automáticamente entre turnos (balanceo de carga)
                        </span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="distribucionTurno"
                          checked={!formData.recurrencia.distribuirTurnos}
                          onChange={() => setFormData({
                            ...formData,
                            recurrencia: { ...formData.recurrencia, distribuirTurnos: false }
                          })}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm text-gray-700">Turno específico:</span>
                      </label>

                      {!formData.recurrencia.distribuirTurnos && (
                        <select
                          name="recurrencia.turnoPreferido"
                          value={formData.recurrencia.turnoPreferido}
                          onChange={handleChange}
                          className="input ml-6"
                        >
                          <option value="">Seleccionar turno...</option>
                          <option value="matutino">Matutino (Mañana) - 6:00 a 14:00</option>
                          <option value="intermedio">Intermedio (Tarde) - 14:00 a 18:00</option>
                          <option value="vespertino">Vespertino (Tarde-Noche) - 18:00 a 22:00</option>
                          <option value="nocturno">Nocturno (Noche) - 22:00 a 6:00</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Generar Hasta */}
                  <div>
                    <label className="label">
                      Generar mantenimientos hasta {!formData.esIndefinido && <span className="text-danger-600">*</span>}
                    </label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        name="generarHasta"
                        value={formData.generarHasta}
                        onChange={handleChange}
                        min={formData.recurrencia.fechaInicio}
                        disabled={formData.esIndefinido}
                        className={`input ${errors.generarHasta ? 'border-danger-500' : ''} ${formData.esIndefinido ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                      {errors.generarHasta && (
                        <p className="text-xs text-danger-600 mt-1">{errors.generarHasta}</p>
                      )}
                      
                      {/* Checkbox Indefinido */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="esIndefinido"
                          checked={formData.esIndefinido}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                          Indefinido (sin fecha final)
                        </span>
                      </label>
                      
                      <p className="text-xs text-gray-500">
                        {formData.esIndefinido 
                          ? '⚠️ Este mantenimiento se repetirá indefinidamente hasta que lo desactives manualmente'
                          : 'Se generarán automáticamente los mantenimientos hasta esta fecha'}
                      </p>
                    </div>
                  </div>

                  {/* Vista Previa */}
                  {formData.recurrencia.fechaInicio && (formData.generarHasta || formData.esIndefinido) && (
                    <div className="bg-white p-4 rounded border border-blue-300">
                      <button
                        type="button"
                        onClick={() => setShowRecurrencePreview(!showRecurrencePreview)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-2"
                      >
                        {showRecurrencePreview ? '▼' : '▶'} Vista previa de fechas
                      </button>
                      
                      {showRecurrencePreview && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            {formData.esIndefinido 
                              ? 'Primeras 10 fechas (vista previa de 1 año):'
                              : 'Primeras 10 fechas programadas:'}
                          </p>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {calculateRecurrencePreview().map((fecha, idx) => (
                              <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                  {fecha.toLocaleDateString('es-MX', { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span>Instancia #{idx + 1}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Total estimado - Solo si NO es indefinido */}
                          {!formData.esIndefinido && formData.recurrencia.tipo !== 'semanal' && (
                            <p className="text-xs text-gray-500 mt-2">
                              Total estimado: {Math.ceil(
                                (new Date(formData.generarHasta) - new Date(formData.recurrencia.fechaInicio)) / 
                                (1000 * 60 * 60 * 24 * (
                                  formData.recurrencia.tipo === 'diaria' ? formData.recurrencia.cada :
                                  formData.recurrencia.tipo === 'mensual' ? formData.recurrencia.cada * 30 :
                                  formData.recurrencia.cada * 365
                                ))
                              )} mantenimientos
                            </p>
                          )}
                          {!formData.esIndefinido && formData.recurrencia.tipo === 'semanal' && (
                            <p className="text-xs text-gray-500 mt-2">
                              Total estimado: {Math.ceil(
                                ((new Date(formData.generarHasta) - new Date(formData.recurrencia.fechaInicio)) / 
                                (1000 * 60 * 60 * 24 * 7)) * formData.recurrencia.diasSemana.length
                              )} mantenimientos
                            </p>
                          )}
                          
                          {/* Mensaje para indefinido */}
                          {formData.esIndefinido && (
                            <p className="text-xs text-amber-600 mt-2 font-medium flex items-center gap-1">
                              <span>⚠️</span>
                              <span>Mantenimiento INDEFINIDO - Se continuará generando automáticamente</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actividades y Observaciones */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary-600" />
              Actividades y Observaciones
            </h3>
            <div className="space-y-4">
              {/* Actividades Realizadas */}
              <div>
                <label className="label">Actividades Realizadas</label>
                <textarea
                  name="actividadesRealizadas"
                  value={formData.actividadesRealizadas}
                  onChange={handleChange}
                  className="input"
                  rows="4"
                  placeholder="Detalle de las actividades realizadas durante el mantenimiento"
                  disabled={isViewMode}
                ></textarea>
              </div>

              {/* Observaciones */}
              <div>
                <label className="label">Observaciones</label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  className="input"
                  rows="3"
                  placeholder="Observaciones adicionales"
                  disabled={isViewMode}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              {isViewMode ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="btn btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {mode === 'create' ? 'Crear Mantenimiento' : 'Guardar Cambios'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
