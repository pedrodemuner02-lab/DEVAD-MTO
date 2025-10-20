import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  Award,
  Edit,
  Trash2,
  Eye,
  Download,
  Clock,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import OperatorModal from '../components/modals/OperatorModal';
import ConfirmDialog from '../components/modals/ConfirmDialog';
import Toast from '../components/ui/Toast';
import { operatorService } from '../services/databaseService';

// Datos de ejemplo
const initialOperators = [
  {
    id: 1,
    codigo: 'OPR-001',
    nombre: 'Juan Carlos Pérez',
    puesto: 'Técnico de Mantenimiento',
    turno: 'matutino',
    telefono: '271-123-4567',
    email: 'jperez@plantmaster.com',
    fechaIngreso: '2020-03-15',
    estado: 'activo',
    certificaciones: ['Electricidad Industrial', 'Sistemas HVAC', 'Seguridad Industrial'],
    especialidad: 'Eléctrico',
    mantenimientosCompletados: 142,
    eficiencia: 95,
  },
  {
    id: 2,
    codigo: 'OPR-002',
    nombre: 'María Elena Rodríguez',
    puesto: 'Técnico Mecánico',
    turno: 'intermedio',
    telefono: '271-234-5678',
    email: 'mrodriguez@plantmaster.com',
    fechaIngreso: '2019-07-22',
    estado: 'activo',
    certificaciones: ['Mecánica Industrial', 'Soldadura', 'Neumática e Hidráulica'],
    especialidad: 'Mecánico',
    mantenimientosCompletados: 178,
    eficiencia: 92,
  },
  {
    id: 3,
    codigo: 'OPR-003',
    nombre: 'Roberto Sánchez',
    puesto: 'Supervisor de Turno',
    turno: 'vespertino',
    telefono: '271-345-6789',
    email: 'rsanchez@plantmaster.com',
    fechaIngreso: '2018-01-10',
    estado: 'activo',
    certificaciones: ['Liderazgo', 'Gestión de Mantenimiento', 'Calidad Total', 'Seguridad Industrial'],
    especialidad: 'Supervisión',
    mantenimientosCompletados: 89,
    eficiencia: 98,
  },
  {
    id: 4,
    codigo: 'OPR-004',
    nombre: 'Ana Patricia López',
    puesto: 'Técnico de Instrumentación',
    turno: 'nocturno',
    telefono: '271-456-7890',
    email: 'alopez@plantmaster.com',
    fechaIngreso: '2021-09-05',
    estado: 'activo',
    certificaciones: ['Instrumentación Industrial', 'Control de Procesos', 'PLC'],
    especialidad: 'Instrumentación',
    mantenimientosCompletados: 67,
    eficiencia: 89,
  },
  {
    id: 5,
    codigo: 'OPR-005',
    nombre: 'Pedro Martínez',
    puesto: 'Técnico de Mantenimiento',
    turno: 'matutino',
    telefono: '271-567-8901',
    email: 'pmartinez@plantmaster.com',
    fechaIngreso: '2022-02-14',
    estado: 'inactivo',
    certificaciones: ['Mantenimiento Preventivo', 'Seguridad Industrial'],
    especialidad: 'General',
    mantenimientosCompletados: 45,
    eficiencia: 85,
  },
  {
    id: 6,
    codigo: 'OPR-006',
    nombre: 'Laura Gómez',
    puesto: 'Técnico Eléctrico',
    turno: 'intermedio',
    telefono: '271-678-9012',
    email: 'lgomez@plantmaster.com',
    fechaIngreso: '2020-11-20',
    estado: 'vacaciones',
    certificaciones: ['Electricidad Industrial', 'Alta Tensión', 'Automatización'],
    especialidad: 'Eléctrico',
    mantenimientosCompletados: 125,
    eficiencia: 93,
  },
];

const OperatorsPage = () => {
  const { hasPermission } = useAuth();
  const [operators, setOperators] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurno, setFilterTurno] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterEspecialidad, setFilterEspecialidad] = useState('todos');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState(null);
  
  // Toast notification
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Cargar datos desde Supabase
  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    try {
      setLoading(true);
      const { data, error } = await operatorService.getAll();
      if (error) throw error;
      setOperators(data || []);
      setFilteredOperators(data || []);
    } catch (error) {
      console.error('Error al cargar operadores:', error);
      setToast({ isVisible: true, message: '❌ Error al cargar operadores', type: 'error' });
      setOperators([]);
      setFilteredOperators([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado
  useEffect(() => {
    let filtered = [...operators];

    if (searchTerm) {
      filtered = filtered.filter(
        (op) =>
          op.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          op.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          op.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          op.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTurno !== 'todos') {
      filtered = filtered.filter((op) => op.turno === filterTurno);
    }

    if (filterEstado !== 'todos') {
      filtered = filtered.filter((op) => op.estado === filterEstado);
    }

    if (filterEspecialidad !== 'todos') {
      filtered = filtered.filter((op) => op.especialidad === filterEspecialidad);
    }

    setFilteredOperators(filtered);
  }, [searchTerm, filterTurno, filterEstado, filterEspecialidad, operators]);

  const getEstadoBadge = (estado) => {
    const badges = {
      activo: { class: 'badge-success', icon: UserCheck, text: 'Activo' },
      inactivo: { class: 'badge-gray', icon: UserX, text: 'Inactivo' },
      vacaciones: { class: 'badge-warning', icon: Calendar, text: 'Vacaciones' },
      licencia: { class: 'badge-info', icon: Clock, text: 'Licencia' },
    };
    return badges[estado] || badges.activo;
  };

  const getTurnoBadge = (turno) => {
    const badges = {
      matutino: { class: 'text-yellow-700 bg-yellow-100', text: 'Matutino (6-14h)' },
      intermedio: { class: 'text-orange-700 bg-orange-100', text: 'Intermedio (14-18h)' },
      vespertino: { class: 'text-blue-700 bg-blue-100', text: 'Vespertino (18-22h)' },
      nocturno: { class: 'text-indigo-700 bg-indigo-100', text: 'Nocturno (22-6h)' },
    };
    return badges[turno] || badges.matutino;
  };

  const getEficienciaBadge = (eficiencia) => {
    if (eficiencia >= 95) return { class: 'text-success-700 bg-success-100', text: 'Excelente' };
    if (eficiencia >= 90) return { class: 'text-primary-700 bg-primary-100', text: 'Muy Bueno' };
    if (eficiencia >= 80) return { class: 'text-warning-700 bg-warning-100', text: 'Bueno' };
    return { class: 'text-danger-700 bg-danger-100', text: 'Requiere Mejora' };
  };

  const stats = {
    totalOperadores: operators.length,
    activos: operators.filter((op) => op.estado === 'activo').length,
    porTurno: {
      matutino: operators.filter((op) => op.turno === 'matutino' && op.estado === 'activo').length,
      intermedio: operators.filter((op) => op.turno === 'intermedio' && op.estado === 'activo').length,
      vespertino: operators.filter((op) => op.turno === 'vespertino' && op.estado === 'activo').length,
      nocturno: operators.filter((op) => op.turno === 'nocturno' && op.estado === 'activo').length,
    },
    certificacionesPromedio: (
      operators.reduce((sum, op) => sum + op.certificaciones.length, 0) / operators.length
    ).toFixed(1),
  };

  const especialidades = [...new Set(operators.map((op) => op.especialidad))];

  // CRUD Functions
  const handleAdd = () => {
    setSelectedOperator(null);
    setIsModalOpen(true);
  };

  const handleEdit = (operador) => {
    setSelectedOperator(operador);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedOperator) {
        // Editar existente
        const { data, error } = await operatorService.update(selectedOperator.id, formData);
        if (error) throw error;
        setOperators(prev => prev.map(op => op.id === selectedOperator.id ? data : op));
        setToast({ isVisible: true, message: '✅ Operador actualizado exitosamente', type: 'success' });
      } else {
        // Crear nuevo
        const { data, error } = await operatorService.create(formData);
        if (error) throw error;
        setOperators(prev => [data, ...prev]);
        setToast({ isVisible: true, message: '✅ Operador registrado exitosamente', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al guardar operador:', error);
      setToast({ isVisible: true, message: '❌ Error al guardar operador', type: 'error' });
    }
  };

  const handleDeleteClick = (operador) => {
    setOperatorToDelete(operador);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (operatorToDelete) {
      try {
        const { error } = await operatorService.delete(operatorToDelete.id);
        if (error) throw error;
        setOperators(prev => prev.filter(op => op.id !== operatorToDelete.id));
        setToast({ isVisible: true, message: '🗑️ Operador eliminado exitosamente', type: 'success' });
        setOperatorToDelete(null);
        setIsConfirmOpen(false);
      } catch (error) {
        console.error('Error al eliminar operador:', error);
        setToast({ isVisible: true, message: '❌ Error al eliminar operador', type: 'error' });
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Operadores</h1>
          <p className="text-gray-600 mt-1">
            Personal técnico y especialistas de mantenimiento
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
              Nuevo Operador
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Operadores</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOperadores}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-success-600">{stats.activos}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Turno con Más Personal</p>
              <p className="text-2xl font-bold text-primary-600">
                {Math.max(...Object.values(stats.porTurno))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Object.entries(stats.porTurno)
                  .sort((a, b) => b[1] - a[1])[0][0]
                  .charAt(0)
                  .toUpperCase() +
                  Object.entries(stats.porTurno)
                    .sort((a, b) => b[1] - a[1])[0][0]
                    .slice(1)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificaciones Promedio</p>
              <p className="text-2xl font-bold text-warning-600">{stats.certificacionesPromedio}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <Award className="w-6 h-6 text-warning-600" />
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
              placeholder="Buscar operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterTurno}
              onChange={(e) => setFilterTurno(e.target.value)}
              className="input pl-10"
            >
              <option value="todos">Todos los turnos</option>
              <option value="matutino">Matutino</option>
              <option value="intermedio">Intermedio</option>
              <option value="vespertino">Vespertino</option>
              <option value="nocturno">Nocturno</option>
            </select>
          </div>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="input"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="vacaciones">Vacaciones</option>
            <option value="licencia">Licencia</option>
          </select>

          <select
            value={filterEspecialidad}
            onChange={(e) => setFilterEspecialidad(e.target.value)}
            className="input"
          >
            <option value="todos">Todas las especialidades</option>
            {especialidades.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Distribution by Shift */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución por Turno (Activos)
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.porTurno.matutino}</div>
            <div className="text-sm text-gray-600">Matutino</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.porTurno.intermedio}</div>
            <div className="text-sm text-gray-600">Intermedio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.porTurno.vespertino}</div>
            <div className="text-sm text-gray-600">Vespertino</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.porTurno.nocturno}</div>
            <div className="text-sm text-gray-600">Nocturno</div>
          </div>
        </div>
      </div>

      {/* Operators Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificaciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Desempeño
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                {hasPermission(['jefe', 'administrador']) && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOperators.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No se encontraron operadores</p>
                  </td>
                </tr>
              ) : (
                filteredOperators.map((operador) => {
                  const estadoBadge = getEstadoBadge(operador.estado);
                  const turnoBadge = getTurnoBadge(operador.turno);
                  const eficienciaBadge = getEficienciaBadge(operador.eficiencia);
                  const EstadoIcon = estadoBadge.icon;

                  return (
                    <tr key={operador.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {operador.nombre
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {operador.nombre}
                            </div>
                            <div className="text-xs text-gray-500">{operador.codigo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{operador.puesto}</div>
                        <div className="text-xs text-gray-500">
                          Desde {new Date(operador.fechaIngreso).toLocaleDateString('es-MX')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${turnoBadge.class}`}>{turnoBadge.text}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{operador.especialidad}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${estadoBadge.class} flex items-center gap-1 w-fit`}>
                          <EstadoIcon className="w-3 h-3" />
                          {estadoBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {operador.certificaciones.slice(0, 2).map((cert, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700"
                            >
                              <Award className="w-3 h-3 mr-1" />
                              {cert}
                            </span>
                          ))}
                          {operador.certificaciones.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              +{operador.certificaciones.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{operador.eficiencia}%</div>
                        <span className={`badge ${eficienciaBadge.class} text-xs`}>
                          {eficienciaBadge.text}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {operador.mantenimientosCompletados} completados
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs text-gray-600 mb-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {operador.telefono}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {operador.email}
                        </div>
                      </td>
                      {hasPermission(['jefe', 'administrador']) && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-primary-600 hover:text-primary-900" onClick={() => handleEdit(operador)}>
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900" onClick={() => handleEdit(operador)}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-danger-600 hover:text-danger-900" onClick={() => handleDeleteClick(operador)}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <OperatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        operator={selectedOperator}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Operador"
        message={`¿Estás seguro de que deseas eliminar a "${operatorToDelete?.nombre}"? Esta acción no se puede deshacer.`}
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

export default OperatorsPage;
