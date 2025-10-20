import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';

const EquipmentModal = ({ isOpen, onClose, onSave, equipment = null }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    ubicacion: '',
    fechaAdquisicion: new Date().toISOString().split('T')[0],
    estado: 'operativo',
    criticidad: 'media',
    ultimoMantenimiento: '',
    proximoMantenimiento: '',
    horasOperacion: 0,
    capacidad: '',
  });

  useEffect(() => {
    if (equipment) {
      setFormData(equipment);
    } else {
      setFormData({
        codigo: '',
        nombre: '',
        tipo: '',
        marca: '',
        modelo: '',
        numeroSerie: '',
        ubicacion: '',
        fechaAdquisicion: new Date().toISOString().split('T')[0],
        estado: 'operativo',
        criticidad: 'media',
        ultimoMantenimiento: '',
        proximoMantenimiento: '',
        horasOperacion: 0,
        capacidad: '',
      });
    }
  }, [equipment, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'horasOperacion' ? parseFloat(value) || 0 : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {equipment ? 'Editar Equipo' : 'Nuevo Equipo'}
              </h2>
              <p className="text-sm text-gray-500">
                {equipment ? 'Actualiza la información del equipo' : 'Registra un nuevo equipo en el sistema'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código *
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className="input"
                required
                placeholder="EQP-001"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Equipo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="input"
                required
                placeholder="Incubadora IPG-001"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Equipo *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Incubadora">Incubadora</option>
                <option value="Compresor">Compresor</option>
                <option value="Generador">Generador</option>
                <option value="Transportador">Transportador</option>
                <option value="Climatización">Climatización</option>
                <option value="Bomba">Bomba</option>
                <option value="Motor">Motor</option>
                <option value="Caldera">Caldera</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca *
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="input"
                required
                placeholder="Petersime"
              />
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo *
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                className="input"
                required
                placeholder="BioStreamer™"
              />
            </div>

            {/* Número de Serie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Serie *
              </label>
              <input
                type="text"
                name="numeroSerie"
                value={formData.numeroSerie}
                onChange={handleChange}
                className="input"
                required
                placeholder="PSM-2023-8845"
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                className="input"
                required
                placeholder="Sala de Incubación 1"
              />
            </div>

            {/* Fecha de Adquisición */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Adquisición *
              </label>
              <input
                type="date"
                name="fechaAdquisicion"
                value={formData.fechaAdquisicion}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="operativo">Operativo</option>
                <option value="mantenimiento">En Mantenimiento</option>
                <option value="fuera_de_servicio">Fuera de Servicio</option>
                <option value="standby">Standby</option>
              </select>
            </div>

            {/* Criticidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Criticidad *
              </label>
              <select
                name="criticidad"
                value={formData.criticidad}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            {/* Horas de Operación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horas de Operación
              </label>
              <input
                type="number"
                name="horasOperacion"
                value={formData.horasOperacion}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                className="input"
                min="0"
                step="0.1"
                placeholder="2150"
              />
            </div>

            {/* Capacidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad
              </label>
              <input
                type="text"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleChange}
                className="input"
                placeholder="57,600 huevos"
              />
            </div>

            {/* Último Mantenimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Último Mantenimiento
              </label>
              <input
                type="date"
                name="ultimoMantenimiento"
                value={formData.ultimoMantenimiento}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Próximo Mantenimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Próximo Mantenimiento
              </label>
              <input
                type="date"
                name="proximoMantenimiento"
                value={formData.proximoMantenimiento}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {equipment ? 'Guardar Cambios' : 'Crear Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentModal;
