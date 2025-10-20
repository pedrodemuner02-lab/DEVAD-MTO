import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Trash2 } from 'lucide-react';

const OperatorModal = ({ isOpen, onClose, onSave, operator = null }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    puesto: '',
    turno: 'matutino',
    telefono: '',
    email: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    estado: 'activo',
    certificaciones: [],
    especialidad: '',
    mantenimientosCompletados: 0,
    eficiencia: 100,
  });

  const [newCert, setNewCert] = useState('');

  useEffect(() => {
    if (operator) {
      setFormData(operator);
    } else {
      setFormData({
        codigo: '',
        nombre: '',
        puesto: '',
        turno: 'matutino',
        telefono: '',
        email: '',
        fechaIngreso: new Date().toISOString().split('T')[0],
        estado: 'activo',
        certificaciones: [],
        especialidad: '',
        mantenimientosCompletados: 0,
        eficiencia: 100,
      });
    }
  }, [operator, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mantenimientosCompletados' || name === 'eficiencia'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const addCertificacion = () => {
    if (newCert.trim()) {
      setFormData(prev => ({
        ...prev,
        certificaciones: [...prev.certificaciones, newCert.trim()]
      }));
      setNewCert('');
    }
  };

  const removeCertificacion = (index) => {
    setFormData(prev => ({
      ...prev,
      certificaciones: prev.certificaciones.filter((_, i) => i !== index)
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
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {operator ? 'Editar Operador' : 'Nuevo Operador'}
              </h2>
              <p className="text-sm text-gray-500">
                {operator ? 'Actualiza la información del operador' : 'Registra un nuevo operador en el sistema'}
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
                placeholder="OPR-001"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="input"
                required
                placeholder="Juan Carlos Pérez"
              />
            </div>

            {/* Puesto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puesto *
              </label>
              <select
                name="puesto"
                value={formData.puesto}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Técnico de Mantenimiento">Técnico de Mantenimiento</option>
                <option value="Técnico Mecánico">Técnico Mecánico</option>
                <option value="Técnico Eléctrico">Técnico Eléctrico</option>
                <option value="Técnico de Instrumentación">Técnico de Instrumentación</option>
                <option value="Supervisor de Turno">Supervisor de Turno</option>
                <option value="Jefe de Mantenimiento">Jefe de Mantenimiento</option>
              </select>
            </div>

            {/* Especialidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidad *
              </label>
              <select
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Eléctrico">Eléctrico</option>
                <option value="Mecánico">Mecánico</option>
                <option value="Instrumentación">Instrumentación</option>
                <option value="Supervisión">Supervisión</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Turno */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turno *
              </label>
              <select
                name="turno"
                value={formData.turno}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="matutino">Matutino (6:00 - 14:00)</option>
                <option value="intermedio">Intermedio (14:00 - 18:00)</option>
                <option value="vespertino">Vespertino (18:00 - 22:00)</option>
                <option value="nocturno">Nocturno (22:00 - 6:00)</option>
              </select>
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
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="licencia">Licencia</option>
              </select>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="input"
                required
                placeholder="271-123-4567"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
                placeholder="operador@plantmaster.com"
              />
            </div>

            {/* Fecha de Ingreso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Ingreso *
              </label>
              <input
                type="date"
                name="fechaIngreso"
                value={formData.fechaIngreso}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* Eficiencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eficiencia (%) *
              </label>
              <input
                type="number"
                name="eficiencia"
                value={formData.eficiencia}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                className="input"
                required
                min="0"
                max="100"
                step="1"
              />
            </div>

            {/* Certificaciones */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificaciones
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertificacion())}
                  className="input flex-1"
                  placeholder="Nombre de la certificación"
                />
                <button
                  type="button"
                  onClick={addCertificacion}
                  className="btn btn-secondary"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.certificaciones.map((cert, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertificacion(index)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
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
              {operator ? 'Guardar Cambios' : 'Crear Operador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperatorModal;
