import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
  TrendingDown,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import InventoryModal from '../components/modals/InventoryModal';
import ConfirmDialog from '../components/modals/ConfirmDialog';
import Toast from '../components/ui/Toast';
import { inventoryService } from '../services/databaseService';

// Datos de ejemplo
const initialInventory = [
  {
    id: 1,
    codigo: 'INV-001',
    nombre: 'Filtro de aire',
    categoria: 'Filtros',
    stockActual: 15,
    stockMinimo: 10,
    stockMaximo: 50,
    unidad: 'Piezas',
    ubicacion: 'Almacén A - Estante 3',
    proveedor: 'Filtros Industriales SA',
    precioUnitario: 250.00,
    ultimaEntrada: '2025-10-10',
    ultimaSalida: '2025-10-12',
  },
  {
    id: 2,
    codigo: 'INV-002',
    nombre: 'Aceite lubricante 20W-50',
    categoria: 'Lubricantes',
    stockActual: 8,
    stockMinimo: 15,
    stockMaximo: 60,
    unidad: 'Litros',
    ubicacion: 'Almacén B - Zona de líquidos',
    proveedor: 'Lubricantes del Sur',
    precioUnitario: 180.00,
    ultimaEntrada: '2025-09-28',
    ultimaSalida: '2025-10-13',
  },
  {
    id: 3,
    codigo: 'INV-003',
    nombre: 'Rodamiento 6205-2RS',
    categoria: 'Rodamientos',
    stockActual: 25,
    stockMinimo: 12,
    stockMaximo: 40,
    unidad: 'Piezas',
    ubicacion: 'Almacén A - Estante 1',
    proveedor: 'Rodamientos Técnicos',
    precioUnitario: 85.00,
    ultimaEntrada: '2025-10-05',
    ultimaSalida: '2025-10-11',
  },
  {
    id: 4,
    codigo: 'INV-004',
    nombre: 'Banda transportadora 3m',
    categoria: 'Transmisión',
    stockActual: 3,
    stockMinimo: 5,
    stockMaximo: 15,
    unidad: 'Piezas',
    ubicacion: 'Almacén C - Zona especial',
    proveedor: 'Bandas y Cadenas SA',
    precioUnitario: 1250.00,
    ultimaEntrada: '2025-09-20',
    ultimaSalida: '2025-10-08',
  },
];

const InventoryPage = () => {
  const { hasPermission } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('todos');
  const [filterStock, setFilterStock] = useState('todos');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Toast notification
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Cargar datos de Supabase al montar el componente
  useEffect(() => {
    loadInventory();
  }, []);

  // Cargar datos de Supabase al montar el componente
  useEffect(() => {
    loadInventory();
  }, []);

  // Cargar inventario desde Supabase
  const loadInventory = async () => {
    setLoading(true);
    const { data, error } = await inventoryService.getAll();
    
    if (error) {
      console.error('Error al cargar inventario:', error);
      setToast({ isVisible: true, message: '❌ Error al cargar inventario', type: 'error' });
      // Si hay error, usar datos iniciales como fallback
      setInventory(initialInventory);
    } else if (data && data.length > 0) {
      setInventory(data);
    } else {
      // Si no hay datos en la DB, usar datos iniciales
      setInventory(initialInventory);
    }
    setLoading(false);
  };

  // Filtrado
  useEffect(() => {
    let filtered = [...inventory];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategoria !== 'todos') {
      filtered = filtered.filter((item) => item.categoria === filterCategoria);
    }

    if (filterStock === 'bajo') {
      filtered = filtered.filter((item) => item.stockActual <= item.stockMinimo);
    } else if (filterStock === 'critico') {
      filtered = filtered.filter((item) => item.stockActual < item.stockMinimo * 0.5);
    }

    setFilteredInventory(filtered);
  }, [searchTerm, filterCategoria, filterStock, inventory]);

  const getStockStatus = (item) => {
    if (item.stockActual < item.stockMinimo * 0.5) {
      return { status: 'critico', class: 'text-danger-600 bg-danger-100', text: 'Crítico' };
    } else if (item.stockActual <= item.stockMinimo) {
      return { status: 'bajo', class: 'text-warning-600 bg-warning-100', text: 'Bajo' };
    } else if (item.stockActual >= item.stockMaximo * 0.8) {
      return { status: 'alto', class: 'text-info-600 bg-info-100', text: 'Alto' };
    } else {
      return { status: 'normal', class: 'text-success-600 bg-success-100', text: 'Normal' };
    }
  };

  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter((item) => item.stockActual <= item.stockMinimo).length,
    criticalStock: inventory.filter((item) => item.stockActual < item.stockMinimo * 0.5).length,
    totalValue: inventory.reduce((sum, item) => sum + (item.stockActual * item.precioUnitario), 0),
  };

  const categorias = [...new Set(inventory.map(item => item.categoria))];

  // CRUD Functions
  const handleAdd = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedItem) {
        // Editar existente
        const { data, error } = await inventoryService.update(selectedItem.id, formData);
        if (error) throw error;
        
        setInventory(prev => 
          prev.map(item => item.id === selectedItem.id ? data : item)
        );
        setToast({ isVisible: true, message: '✅ Artículo actualizado exitosamente', type: 'success' });
      } else {
        // Crear nuevo
        const { data, error } = await inventoryService.create(formData);
        if (error) throw error;
        
        setInventory(prev => [data, ...prev]);
        setToast({ isVisible: true, message: '✅ Artículo creado exitosamente', type: 'success' });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setToast({ isVisible: true, message: '❌ Error al guardar artículo', type: 'error' });
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        const { error } = await inventoryService.delete(itemToDelete.id);
        if (error) throw error;
        
        setInventory(prev => prev.filter(item => item.id !== itemToDelete.id));
        setToast({ isVisible: true, message: '🗑️ Artículo eliminado exitosamente', type: 'success' });
        setItemToDelete(null);
      } catch (error) {
        console.error('Error al eliminar:', error);
        setToast({ isVisible: true, message: '❌ Error al eliminar artículo', type: 'error' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando inventario...</p>
        </div>
      )}

      {!loading && (
        <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario de Almacén</h1>
          <p className="text-gray-600 mt-1">
            Gestión de repuestos y materiales para mantenimiento
          </p>
        </div>
        {hasPermission(['jefe', 'administrador']) && (
          <div className="flex gap-3">
            <button className="btn btn-secondary">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <button className="btn btn-primary" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Artículo
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Artículos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-warning-600">{stats.lowStock}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Crítico</p>
              <p className="text-2xl font-bold text-danger-600">{stats.criticalStock}</p>
            </div>
            <div className="p-3 bg-danger-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-success-600">
                ${stats.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="input pl-10"
            >
              <option value="todos">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="input"
          >
            <option value="todos">Todos los niveles de stock</option>
            <option value="critico">Stock crítico</option>
            <option value="bajo">Stock bajo</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Artículo</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Precio Unit.</th>
                <th>Valor Total</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No se encontraron artículos
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const totalValue = item.stockActual * item.precioUnitario;

                  return (
                    <tr key={item.id}>
                      <td className="font-medium">{item.codigo}</td>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">{item.nombre}</div>
                          <div className="text-xs text-gray-500">{item.proveedor}</div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{item.categoria}</span>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="font-medium">
                            {item.stockActual} {item.unidad}
                          </div>
                          <div className="text-xs text-gray-500">
                            Mín: {item.stockMinimo} / Máx: {item.stockMaximo}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${stockStatus.class}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="text-sm text-gray-600">{item.ubicacion}</td>
                      <td className="text-sm">
                        ${item.precioUnitario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-sm font-medium">
                        ${totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1 text-gray-400 hover:text-primary-600"
                            title="Ver"
                            onClick={() => handleEdit(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hasPermission(['jefe', 'administrador']) && (
                            <>
                              <button
                                className="p-1 text-gray-400 hover:text-warning-600"
                                title="Editar"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1 text-gray-400 hover:text-danger-600"
                                title="Eliminar"
                                onClick={() => handleDeleteClick(item)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert for Critical Stock */}
      {stats.criticalStock > 0 && (
        <div className="card bg-danger-50 border-danger-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-danger-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-danger-900 mb-2">
                ⚠️ Alerta: {stats.criticalStock} artículo(s) en stock crítico
              </h3>
              <p className="text-sm text-danger-700">
                Algunos artículos tienen stock por debajo del 50% del mínimo requerido. 
                Se recomienda generar orden de compra inmediatamente.
              </p>
              <button className="btn btn-danger mt-3">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Generar Orden de Compra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals - Always render outside conditional */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        item={selectedItem}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Artículo"
        message={`¿Estás seguro de que deseas eliminar "${itemToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        type="danger"
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
        </>
      )}
    </div>
  );
};

export default InventoryPage;
