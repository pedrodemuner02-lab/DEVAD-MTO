import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';

const InventoryModal = ({ isOpen, onClose, onSave, item = null }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    stockActual: 0,
    stockMinimo: 0,
    stockMaximo: 0,
    unidad: 'Piezas',
    ubicacion: '',
    proveedor: '',
    precioUnitario: 0,
    ultimaEntrada: new Date().toISOString().split('T')[0],
    ultimaSalida: '',
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        codigo: '',
        nombre: '',
        categoria: '',
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        unidad: 'Piezas',
        ubicacion: '',
        proveedor: '',
        precioUnitario: 0,
        ultimaEntrada: new Date().toISOString().split('T')[0],
        ultimaSalida: '',
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stockActual' || name === 'stockMinimo' || name === 'stockMaximo' || name === 'precioUnitario'
        ? parseFloat(value) || 0
        : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {item ? 'Editar Artículo' : 'Nuevo Artículo'}
              </h2>
              <p className="text-sm text-gray-500">
                {item ? 'Actualiza la información del artículo' : 'Agrega un nuevo artículo al inventario'}
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
                placeholder="INV-001"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Artículo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="input"
                required
                placeholder="Filtro de aire"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Filtros">Filtros</option>
                <option value="Lubricantes">Lubricantes</option>
                <option value="Rodamientos">Rodamientos</option>
                <option value="Transmisión">Transmisión</option>
                <option value="Eléctricos">Eléctricos</option>
                <option value="Herramientas">Herramientas</option>
                <option value="Seguridad">Seguridad</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            {/* Unidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de Medida *
              </label>
              <select
                name="unidad"
                value={formData.unidad}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="Piezas">Piezas</option>
                <option value="Litros">Litros</option>
                <option value="Kilogramos">Kilogramos</option>
                <option value="Metros">Metros</option>
                <option value="Cajas">Cajas</option>
                <option value="Juegos">Juegos</option>
              </select>
            </div>

            {/* Stock Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Actual *
              </label>
              <input
                type="number"
                name="stockActual"
                value={formData.stockActual}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                className="input"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Stock Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Mínimo *
              </label>
              <input
                type="number"
                name="stockMinimo"
                value={formData.stockMinimo}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                className="input"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Stock Máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Máximo *
              </label>
              <input
                type="number"
                name="stockMaximo"
                value={formData.stockMaximo}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                className="input"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Precio Unitario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Unitario *
              </label>
              <input
                type="number"
                name="precioUnitario"
                value={formData.precioUnitario}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                className="input"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            {/* Proveedor */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor *
              </label>
              <input
                type="text"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                className="input"
                required
                placeholder="Nombre del proveedor"
              />
            </div>

            {/* Ubicación */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación en Almacén *
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                className="input"
                required
                placeholder="Almacén A - Estante 3"
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
              {item ? 'Guardar Cambios' : 'Crear Artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;
