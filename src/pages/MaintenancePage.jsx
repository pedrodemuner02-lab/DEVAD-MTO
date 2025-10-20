import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Download,
  Repeat,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MaintenanceModal from '../components/maintenance/MaintenanceModal';
// Eliminado import obsoleto: maintenanceTemplateService (ya no se usa tabla maintenance_templates)
import maintenanceService from '../services/maintenanceService';
import Toast from '../components/ui/Toast';

// Datos de ejemplo - en producción vendrían de la base de datos
const initialMaintenances = [
  {
    id: 1,
    folio: 'MTO-2025-001',
    equipo: 'Incubadora IPG-001',
    tipo: 'Preventivo',
    titulo: 'Mantenimiento preventivo mensual',
    descripcion: 'Revisión general de sistema de control de temperatura',
    prioridad: 'media',
    estado: 'completado',
    fechaProgramada: '2025-10-10',
    fechaInicio: '2025-10-10T08:00',
    fechaFinalizacion: '2025-10-10T12:30',
    tecnicoAsignado: 'Juan Pérez',
    actividadesRealizadas: 'Cambio de filtros, calibración de sensores',
    observaciones: 'Equipo operando correctamente',
  },
  {
    id: 2,
    folio: 'MTO-2025-002',
    equipo: 'Compresor de Aire',
    tipo: 'Correctivo',
    titulo: 'Reparación de fuga de aire',
    descripcion: 'Detectada fuga en válvula principal',
    prioridad: 'alta',
    estado: 'en_proceso',
    fechaProgramada: '2025-10-13',
    fechaInicio: '2025-10-13T09:00',
    fechaFinalizacion: null,
    tecnicoAsignado: 'María González',
    actividadesRealizadas: 'Desmontaje de válvula, limpieza de líneas',
    observaciones: 'Pendiente llegada de repuesto',
  },
  {
    id: 3,
    folio: 'MTO-2025-003',
    equipo: 'Generador de Emergencia',
    tipo: 'Inspección',
    titulo: 'Inspección quincenal',
    descripcion: 'Revisión de niveles y prueba de arranque',
    prioridad: 'media',
    estado: 'programado',
    fechaProgramada: '2025-10-16',
    fechaInicio: null,
    fechaFinalizacion: null,
    tecnicoAsignado: 'Carlos Ramírez',
    actividadesRealizadas: null,
    observaciones: null,
  },
];

const MaintenancePage = () => {
  const { user, hasPermission } = useAuth();
  const [maintenances, setMaintenances] = useState([]);
  const [filteredMaintenances, setFilteredMaintenances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterPrioridad, setFilterPrioridad] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Cargar mantenimientos desde Supabase al montar el componente
  useEffect(() => {
    loadAllMaintenances();
  }, []);

  const loadAllMaintenances = async () => {
    try {
      setLoading(true);
      const { data, error } = await maintenanceService.getAll();
      if (error) throw error;
      setMaintenances(data || []);
      setFilteredMaintenances(data || []);
    } catch (error) {
      console.error('Error al cargar mantenimientos:', error);
      setToast({ isVisible: true, message: '❌ Error al cargar mantenimientos', type: 'error' });
      setMaintenances([]);
      setFilteredMaintenances([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar mantenimientos
  useEffect(() => {
    let filtered = maintenances;

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterEstado !== 'todos') {
      filtered = filtered.filter((m) => m.estado === filterEstado);
    }

    if (filterPrioridad !== 'todos') {
      filtered = filtered.filter((m) => m.prioridad === filterPrioridad);
    }

    setFilteredMaintenances(filtered);
  }, [searchTerm, filterEstado, filterPrioridad, maintenances]);

  const getEstadoBadge = (estado) => {
    const badges = {
      programado: { class: 'badge badge-info', text: 'Programado' },
      en_proceso: { class: 'badge badge-warning', text: 'En Proceso' },
      completado: { class: 'badge badge-success', text: 'Completado' },
      cancelado: { class: 'badge badge-danger', text: 'Cancelado' },
    };
    return badges[estado] || { class: 'badge', text: estado };
  };

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      baja: { class: 'badge bg-gray-100 text-gray-800', text: 'Baja' },
      media: { class: 'badge badge-info', text: 'Media' },
      alta: { class: 'badge badge-warning', text: 'Alta' },
      urgente: { class: 'badge badge-danger', text: 'Urgente' },
    };
    return badges[prioridad] || { class: 'badge', text: prioridad };
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedMaintenance(null);
    setShowModal(true);
  };

  const handleView = (maintenance) => {
    setModalMode('view');
    setSelectedMaintenance(maintenance);
    setShowModal(true);
  };

  const handleEdit = (maintenance) => {
    setModalMode('edit');
    setSelectedMaintenance(maintenance);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este mantenimiento?')) {
      try {
        const { error } = await maintenanceService.delete(id);
        if (error) throw error;
        
        setMaintenances(prev => prev.filter(m => m.id !== id));
        setToast({ isVisible: true, message: '🗑️ Mantenimiento eliminado exitosamente', type: 'success' });
      } catch (error) {
        console.error('Error al eliminar mantenimiento:', error);
        setToast({ isVisible: true, message: '❌ Error al eliminar mantenimiento', type: 'error' });
      }
    }
  };

  const handleSave = async (data) => {
    try {
      console.log('🔵 handleSave iniciado con data:', data);
      
      if (modalMode === 'create') {
        const folio = `MTO-${new Date().getFullYear()}-${String(maintenances.length + 1).padStart(3, '0')}`;
        
        // 📝 NUEVO SISTEMA HÍBRIDO: Todo en tabla maintenance
        const newData = { 
          ...data, 
          folio,
          // Campos básicos
          equipment_id: data.equipmentId || data.equipment_id,
          tipo: data.tipo || 'Preventivo',
          descripcion: data.descripcion || data.titulo || '',
          prioridad: data.prioridad || 'media',
          estado: data.estado || 'Programado',
          fecha_programada: data.fechaProgramada || new Date().toISOString(),
          horas_estimadas: parseFloat(data.horasEstimadas) || 1.0,
          costo_estimado: parseFloat(data.costoEstimado) || 0,
          
          // 🤖 Campos de asignación automática
          complejidad: data.complejidad || 'media',
          urgencia: data.urgencia || 'normal',
          puntos_complejidad: data.complejidad === 'baja' ? 1 : data.complejidad === 'alta' ? 3 : 2,
          
          // 🔄 Campos de recurrencia (si aplica)
          es_recurrente: data.esRecurrente || false,
          es_plantilla: data.esRecurrente || false, // Si es recurrente, es plantilla
          frecuencia_numero: data.esRecurrente ? (data.recurrencia?.cada || 1) : null,
          frecuencia_unidad: data.esRecurrente ? (
            data.recurrencia?.tipo === 'diaria' ? 'días' : 
            data.recurrencia?.tipo === 'semanal' ? 'semanas' : 
            data.recurrencia?.tipo === 'mensual' ? 'meses' : 'meses'
          ) : null,
          dias_semana: data.esRecurrente ? JSON.stringify(data.recurrencia?.diasSemana || []) : null,
        };
        
        console.log('🔵 Creando mantenimiento con:', newData);
        
        const { data: created, error } = await maintenanceService.create(newData);
        
        if (error) {
          console.error('🔴 Error al crear:', error);
          throw error;
        }
        
        console.log('✅ Mantenimiento creado exitosamente:', created);
        
        // 🔄 GENERAR INSTANCIAS (si es plantilla recurrente)
        if (data.esRecurrente && created?.id) {
          try {
            console.log('🔄 Generando instancias para plantilla recurrente...');
            
            const instanceGenerator = (await import('../services/instanceGenerator')).default;
            const resultado = await instanceGenerator.generateInstances(created.id, 4);
            
            const diasNombres = (data.recurrencia?.diasSemana || []).map(dia => 
              ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dia]
            ).join(', ');
            
            setToast({ 
              isVisible: true, 
              message: `✅ Plantilla recurrente creada. ${resultado.generadas} instancias generadas para: ${diasNombres}`, 
              type: 'success' 
            });
          } catch (genError) {
            console.error('❌ Error generando instancias:', genError);
            setToast({ 
              isVisible: true, 
              message: '⚠️ Plantilla creada pero error al generar instancias', 
              type: 'warning' 
            });
          }
        }
        // 🤖 ASIGNACIÓN AUTOMÁTICA (solo mantenimiento normal con asignación activada)
        else if (!data.esRecurrente && data.asignacionAutomatica !== false && created?.id) {
          try {
            console.log('🤖 Iniciando asignación automática...');
            
            const assignmentService = (await import('../services/assignmentService')).default;
            
            const operadorAsignado = await assignmentService.assignMaintenance({
              id: created.id,
              complejidad: newData.complejidad,
              urgencia: newData.urgencia
            });
            
            console.log('✅ Asignado a:', operadorAsignado);
            
            setToast({ 
              isVisible: true, 
              message: `✅ Mantenimiento asignado a: ${operadorAsignado.nombre} (${operadorAsignado.turno})`, 
              type: 'success' 
            });
          } catch (assignError) {
            console.warn('⚠️ Error en asignación:', assignError);
            setToast({ 
              isVisible: true, 
              message: `✅ Mantenimiento creado (${assignError.message})`, 
              type: 'warning' 
            });
          }
        } else {
          setToast({ 
            isVisible: true, 
            message: '✅ Mantenimiento creado exitosamente', 
            type: 'success' 
          });
        }
        
        setMaintenances(prev => [created, ...prev]);
        setTimeout(() => loadAllMaintenances(), 100);
        
      } else if (modalMode === 'edit') {
        const { data: updated, error } = await maintenanceService.update(selectedMaintenance.id, data);
        if (error) throw error;
        
        setMaintenances(prev => prev.map(m => m.id === selectedMaintenance.id ? updated : m));
        setToast({ isVisible: true, message: '✅ Mantenimiento actualizado exitosamente', type: 'success' });
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('🔴 Error en handleSave:', error);
      setToast({ isVisible: true, message: `❌ Error: ${error.message}`, type: 'error' });
    }
  };

  const stats = {
    total: maintenances.length,
    programados: maintenances.filter((m) => m.estado === 'programado').length,
    enProceso: maintenances.filter((m) => m.estado === 'en_proceso').length,
    completados: maintenances.filter((m) => m.estado === 'completado').length,
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
          <h1 className="text-3xl font-bold text-gray-900">Mantenimiento</h1>
          <p className="text-gray-500 mt-1">
            Gestión de mantenimientos preventivos, correctivos y predictivos
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar
          </button>
          {hasPermission(['operador', 'jefe', 'administrador']) && (
            <button
              onClick={handleCreate}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Mantenimiento
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Programados</p>
              <p className="text-2xl font-bold text-blue-900">{stats.programados}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-warning-50 rounded-lg border border-warning-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warning-600">En Proceso</p>
              <p className="text-2xl font-bold text-warning-900">{stats.enProceso}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-warning-600" />
          </div>
        </div>
        <div className="bg-success-50 rounded-lg border border-success-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-success-600">Completados</p>
              <p className="text-2xl font-bold text-success-900">{stats.completados}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="label">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por folio, equipo o título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label">Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="input"
            >
              <option value="todos">Todos</option>
              <option value="programado">Programado</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="label">Prioridad</label>
            <select
              value={filterPrioridad}
              onChange={(e) => setFilterPrioridad(e.target.value)}
              className="input"
            >
              <option value="todos">Todas</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Equipo</th>
                <th>Tipo</th>
                <th>Título</th>
                <th>Fecha</th>
                <th>Técnico</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaintenances.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No se encontraron mantenimientos
                  </td>
                </tr>
              ) : (
                filteredMaintenances.map((maintenance) => {
                  const estadoBadge = getEstadoBadge(maintenance.estado);
                  const prioridadBadge = getPrioridadBadge(maintenance.prioridad);

                  return (
                    <tr key={maintenance.id}>
                      <td className="font-medium">
                        <div className="flex items-center gap-2">
                          {maintenance.folio}
                          {maintenance.esRecurrente && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full" title="Mantenimiento recurrente">
                              <Repeat className="w-3 h-3" />
                              #{maintenance.instanceNumber || ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{maintenance.equipo}</td>
                      <td>{maintenance.tipo}</td>
                      <td className="max-w-xs truncate">{maintenance.titulo}</td>
                      <td>
                        {new Date(maintenance.fechaProgramada).toLocaleDateString('es-MX')}
                      </td>
                      <td>{maintenance.tecnicoAsignado}</td>
                      <td>
                        <span className={prioridadBadge.class}>
                          {prioridadBadge.text}
                        </span>
                      </td>
                      <td>
                        <span className={estadoBadge.class}>
                          {estadoBadge.text}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(maintenance)}
                            className="p-1 text-gray-400 hover:text-primary-600"
                            title="Ver"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hasPermission(['jefe', 'administrador']) && (
                            <>
                              <button
                                onClick={() => handleEdit(maintenance)}
                                className="p-1 text-gray-400 hover:text-warning-600"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(maintenance.id)}
                                className="p-1 text-gray-400 hover:text-danger-600"
                                title="Eliminar"
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

      {/* Modal */}
      {showModal && (
        <MaintenanceModal
          mode={modalMode}
          maintenance={selectedMaintenance}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

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

export default MaintenancePage;
