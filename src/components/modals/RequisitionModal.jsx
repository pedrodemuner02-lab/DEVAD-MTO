import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { inventoryService } from '../../services/databaseService';

const RequisitionModal = ({ isOpen, onClose, onSave, requisition, user }) => {
  const [formData, setFormData] = useState({
    prioridad: 'normal',
    motivo: '',
    observaciones: '',
    items: [],
  });

  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInventory();
      if (requisition) {
        // Modo edición
        setFormData({
          prioridad: requisition.prioridad || 'normal',
          motivo: requisition.motivo || '',
          observaciones: requisition.observaciones || '',
          items: requisition.items || [],
        });
      } else {
        // Modo creación
        resetForm();
      }
    }
  }, [isOpen, requisition]);

  const loadInventory = async () => {
    const { data, error } = await inventoryService.getAll();
    if (!error && data) {
      setInventoryItems(data);
    }
  };

  const resetForm = () => {
    setFormData({
      prioridad: 'normal',
      motivo: '',
      observaciones: '',
      items: [],
    });
    setSelectedItem('');
    setSelectedQuantity(1);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const addItem = () => {
    if (!selectedItem) {
      setErrors(prev => ({ ...prev, selectedItem: 'Selecciona un artículo' }));
      return;
    }

    const item = inventoryItems.find(i => i.id === selectedItem);
    if (!item) return;

    // Verificar si ya está en la lista
    const existingIndex = formData.items.findIndex(i => i.itemId === item.id);
    
    if (existingIndex >= 0) {
      // Actualizar cantidad
      const newItems = [...formData.items];
      newItems[existingIndex].cantidad += selectedQuantity;
      setFormData(prev => ({ ...prev, items: newItems }));
    } else {
      // Agregar nuevo item
      const newItem = {
        itemId: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        cantidad: selectedQuantity,
        unidad: item.unidad,
        stockDisponible: item.stockActual,
      };
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }

    // Reset selección
    setSelectedItem('');
    setSelectedQuantity(1);
    setErrors(prev => ({ ...prev, selectedItem: null }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const newItems = [...formData.items];
    newItems[index].cantidad = newQuantity;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'El motivo es requerido';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Debes agregar al menos un artículo';
    }

    // Validar stock disponible
    formData.items.forEach((item, index) => {
      if (item.cantidad > item.stockDisponible) {
        newErrors[`item_${index}`] = `Stock insuficiente (disponible: ${item.stockDisponible})`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const requisitionData = {
        ...formData,
        solicitanteId: user.id,
        solicitanteNombre: user.user_metadata?.full_name || user.email.split('@')[0],
        solicitanteEmail: user.email,
        // Transformar items al formato de BD
        items: formData.items.map(item => ({
          item_id: item.itemId,
          codigo: item.codigo,
          nombre: item.nombre,
          cantidad: item.cantidad,
          unidad: item.unidad,
        })),
      };

      await onSave(requisitionData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error al guardar requisición:', error);
      setErrors({ submit: 'Error al guardar la requisición' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {requisition ? 'Editar Requisición' : 'Nueva Requisición'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Prioridad y Motivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="baja">🟢 Baja</option>
                <option value="normal">🟡 Normal</option>
                <option value="alta">🟠 Alta</option>
                <option value="urgente">🔴 Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo/Justificación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                placeholder="Ej: Mantenimiento preventivo Bomba #3"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.motivo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.motivo && (
                <p className="mt-1 text-sm text-red-500">{errors.motivo}</p>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows="3"
              placeholder="Detalles adicionales..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Agregar Items */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Artículos Solicitados
            </h3>

            {/* Selector de items */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
              <div className="md:col-span-7">
                <select
                  value={selectedItem}
                  onChange={(e) => {
                    setSelectedItem(e.target.value);
                    setErrors(prev => ({ ...prev, selectedItem: null }));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.selectedItem ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar artículo...</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.codigo} - {item.nombre} (Stock: {item.stockActual} {item.unidad})
                    </option>
                  ))}
                </select>
                {errors.selectedItem && (
                  <p className="mt-1 text-sm text-red-500">{errors.selectedItem}</p>
                )}
              </div>
              <div className="md:col-span-3">
                <input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Cantidad"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={addItem}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>
            </div>

            {/* Lista de items agregados */}
            {errors.items && formData.items.length === 0 && (
              <div className="flex items-center gap-2 text-red-500 mb-4">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.items}</span>
              </div>
            )}

            {formData.items.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Código
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Artículo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Unidad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Stock
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.codigo}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.nombre}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            className={`w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 ${
                              errors[`item_${index}`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors[`item_${index}`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`item_${index}`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.unidad}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.stockDisponible}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay artículos agregados
              </div>
            )}
          </div>

          {/* Error general */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : requisition ? 'Actualizar' : 'Crear Requisición'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequisitionModal;
