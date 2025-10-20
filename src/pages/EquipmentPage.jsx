import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EquipmentModal from '../components/modals/EquipmentModal';
import ConfirmDialog from '../components/modals/ConfirmDialog';
import Toast from '../components/ui/Toast';
import { equipmentService } from '../services/databaseService';

// Datos de ejemplo
const initialEquipment = [
  {
    id: 1,
    codigo: 'EQP-001',
    nombre: 'Incubadora IPG-001',
    tipo: 'Incubadora',
    marca: 'Petersime',
    modelo: 'BioStreamer™',
    numeroSerie: 'PSM-2023-8845',
    ubicacion: 'Sala de Incubación 1',
    fechaAdquisicion: '2023-01-15',
    estado: 'operativo',
    criticidad: 'alta',
    ultimoMantenimiento: '2025-10-10',
    proximoMantenimiento: '2025-11-10',
    horasOperacion: 2150,
    capacidad: '57,600 huevos',
  },
  {
    id: 2,
    codigo: 'EQP-002',
    nombre: 'Compresor Principal',
    tipo: 'Compresor',
    marca: 'Atlas Copco',
    modelo: 'GA 30 VSD',
    numeroSerie: 'AC-2022-5421',
    ubicacion: 'Cuarto de Máquinas',
    fechaAdquisicion: '2022-06-20',
    estado: 'mantenimiento',
    criticidad: 'alta',
    ultimoMantenimiento: '2025-10-05',
    proximoMantenimiento: '2025-10-20',
    horasOperacion: 8950,
    capacidad: '30 HP',
  },
  {
    id: 3,
    codigo: 'EQP-003',
    nombre: 'Generador Emergencia',
    tipo: 'Generador',
    marca: 'Cummins',
    modelo: 'C150 D5',
    numeroSerie: 'CUM-2021-9982',
    ubicacion: 'Área Externa Norte',
    fechaAdquisicion: '2021-03-10',
    estado: 'operativo',
    criticidad: 'alta',
    ultimoMantenimiento: '2025-09-15',
    proximoMantenimiento: '2025-12-15',
    horasOperacion: 450,
    capacidad: '150 kVA',
  },
  {
    id: 4,
    codigo: 'EQP-004',
    nombre: 'Banda Transportadora 1',
    tipo: 'Transportador',
    marca: 'Moba',
    modelo: 'Omnia PX',
    numeroSerie: 'MOB-2020-3341',
    ubicacion: 'Área de Clasificación',
    fechaAdquisicion: '2020-09-25',
    estado: 'operativo',
    criticidad: 'media',
    ultimoMantenimiento: '2025-10-08',
    proximoMantenimiento: '2025-11-08',
    horasOperacion: 12340,
    capacidad: '120,000 huevos/hora',
  },
  {
    id: 5,
    codigo: 'EQP-005',
    nombre: 'Sistema HVAC Principal',
    tipo: 'Climatización',
    marca: 'Carrier',
    modelo: '39M',
    numeroSerie: 'CAR-2023-7755',
    ubicacion: 'Techo - Zona Central',
    fechaAdquisicion: '2023-02-18',
    estado: 'fuera_de_servicio',
    criticidad: 'media',
    ultimoMantenimiento: '2025-09-20',
    proximoMantenimiento: '2025-10-25',
    horasOperacion: 3200,
    capacidad: '20 TR',
  },
];

const EquipmentPage = () => {
  const { hasPermission } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterCriticidad, setFilterCriticidad] = useState('todos');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  
  // Toast notification
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Cargar datos desde Supabase
  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const { data, error } = await equipmentService.getAll();
      if (error) throw error;
      setEquipment(data || []);
      setFilteredEquipment(data || []);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
      setToast({ isVisible: true, message: '❌ Error al cargar equipos', type: 'error' });
      setEquipment([]);
      setFilteredEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado
  useEffect(() => {
    let filtered = [...equipment];

    if (searchTerm) {
      filtered = filtered.filter(
        (eq) =>
          eq.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.modelo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTipo !== 'todos') {
      filtered = filtered.filter((eq) => eq.tipo === filterTipo);
    }

    if (filterEstado !== 'todos') {
      filtered = filtered.filter((eq) => eq.estado === filterEstado);
    }

    if (filterCriticidad !== 'todos') {
      filtered = filtered.filter((eq) => eq.criticidad === filterCriticidad);
    }

    setFilteredEquipment(filtered);
  }, [searchTerm, filterTipo, filterEstado, filterCriticidad, equipment]);

  const getEstadoBadge = (estado) => {
    const badges = {
      operativo: { class: 'badge-success', icon: CheckCircle, text: 'Operativo' },
      mantenimiento: { class: 'badge-warning', icon: Wrench, text: 'En Mantenimiento' },
      fuera_de_servicio: { class: 'badge-danger', icon: AlertCircle, text: 'Fuera de Servicio' },
      standby: { class: 'badge-gray', icon: Clock, text: 'Standby' },
    };
    return badges[estado] || badges.operativo;
  };

  const getCriticidadBadge = (criticidad) => {
    const badges = {
      alta: { class: 'text-danger-600 bg-danger-100', text: 'Alta' },
      media: { class: 'text-warning-600 bg-warning-100', text: 'Media' },
      baja: { class: 'text-gray-600 bg-gray-100', text: 'Baja' },
    };
    return badges[criticidad] || badges.media;
  };

  const stats = {
    totalEquipos: equipment.length,
    operativos: equipment.filter((eq) => eq.estado === 'operativo').length,
    enMantenimiento: equipment.filter((eq) => eq.estado === 'mantenimiento').length,
    fueraServicio: equipment.filter((eq) => eq.estado === 'fuera_de_servicio').length,
  };

  const tipos = [...new Set(equipment.map(eq => eq.tipo))];

  // CRUD Functions
  const handleAdd = () => {
    setSelectedEquipment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (equipo) => {
    setSelectedEquipment(equipo);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedEquipment) {
        // Editar existente
        const { data, error } = await equipmentService.update(selectedEquipment.id, formData);
        if (error) throw error;
        setEquipment(prev => prev.map(eq => eq.id === selectedEquipment.id ? data : eq));
        setToast({ isVisible: true, message: '✅ Equipo actualizado exitosamente', type: 'success' });
      } else {
        // Crear nuevo
        const { data, error } = await equipmentService.create(formData);
        if (error) throw error;
        setEquipment(prev => [data, ...prev]);
        setToast({ isVisible: true, message: '✅ Equipo registrado exitosamente', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al guardar equipo:', error);
      setToast({ isVisible: true, message: '❌ Error al guardar equipo', type: 'error' });
    }
  };

  const handleDeleteClick = (equipo) => {
    setEquipmentToDelete(equipo);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (equipmentToDelete) {
      try {
        const { error } = await equipmentService.delete(equipmentToDelete.id);
        if (error) throw error;
        setEquipment(prev => prev.filter(eq => eq.id !== equipmentToDelete.id));
        setToast({ isVisible: true, message: '🗑️ Equipo eliminado exitosamente', type: 'success' });
        setEquipmentToDelete(null);
        setIsConfirmOpen(false);
      } catch (error) {
        console.error('Error al eliminar equipo:', error);
        setToast({ isVisible: true, message: '❌ Error al eliminar equipo', type: 'error' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Equipos</h1>
          <p className="text-gray-600 mt-1">
            Catálogo de equipos y maquinaria de la planta
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
              Nuevo Equipo
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Equipos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEquipos}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Operativos</p>
              <p className="text-2xl font-bold text-success-600">{stats.operativos}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Mantenimiento</p>
              <p className="text-2xl font-bold text-warning-600">{stats.enMantenimiento}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <Wrench className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fuera de Servicio</p>
              <p className="text-2xl font-bold text-danger-600">{stats.fueraServicio}</p>
            </div>
            <div className="p-3 bg-danger-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="input pl-10"
            >
              <option value="todos">Todos los tipos</option>
              {tipos.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="input"
          >
            <option value="todos">Todos los estados</option>
            <option value="operativo">Operativo</option>
            <option value="mantenimiento">En Mantenimiento</option>
            <option value="fuera_de_servicio">Fuera de Servicio</option>
            <option value="standby">Standby</option>
          </select>

          <select
            value={filterCriticidad}
            onChange={(e) => setFilterCriticidad(e.target.value)}
            className="input"
          >
            <option value="todos">Todas las criticidades</option>
            <option value="alta">Criticidad Alta</option>
            <option value="media">Criticidad Media</option>
            <option value="baja">Criticidad Baja</option>
          </select>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.length === 0 ? (
          <div className="col-span-full card">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron equipos</p>
            </div>
          </div>
        ) : (
          filteredEquipment.map((equipo) => {
            const estadoBadge = getEstadoBadge(equipo.estado);
            const criticidadBadge = getCriticidadBadge(equipo.criticidad);
            const EstadoIcon = estadoBadge.icon;

            return (
              <div key={equipo.id} className="card hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{equipo.nombre}</h3>
                    </div>
                    <p className="text-xs text-gray-500">{equipo.codigo}</p>
                  </div>
                  <span className={`badge ${estadoBadge.class} flex items-center gap-1`}>
                    <EstadoIcon className="w-3 h-3" />
                    {estadoBadge.text}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{equipo.tipo}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Marca/Modelo:</span>
                    <span className="font-medium">{equipo.marca} {equipo.modelo}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="font-medium text-right">{equipo.ubicacion}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Criticidad:</span>
                    <span className={`badge ${criticidadBadge.class}`}>
                      {criticidadBadge.text}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Horas Operación:</span>
                    <span className="font-medium">{equipo.horasOperacion.toLocaleString()} hrs</span>
                  </div>
                </div>

                {/* Mantenimiento Info */}
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="text-xs text-gray-600 mb-1">Último Mantenimiento:</div>
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {new Date(equipo.ultimoMantenimiento).toLocaleDateString('es-MX')}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Próximo Mantenimiento:</div>
                  <div className="text-sm font-medium text-primary-600">
                    {new Date(equipo.proximoMantenimiento).toLocaleDateString('es-MX')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <button className="flex-1 btn btn-secondary text-xs py-2" onClick={() => handleEdit(equipo)}>
                    <Eye className="w-3 h-3 mr-1" />
                    Ver
                  </button>
                  {hasPermission(['jefe', 'administrador']) && (
                    <>
                      <button className="flex-1 btn btn-secondary text-xs py-2" onClick={() => handleEdit(equipo)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </button>
                      <button className="p-2 text-danger-600 hover:bg-danger-50 rounded" onClick={() => handleDeleteClick(equipo)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        equipment={selectedEquipment}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Equipo"
        message={`¿Estás seguro de que deseas eliminar "${equipmentToDelete?.nombre}"? Esta acción no se puede deshacer.`}
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

export default EquipmentPage;
