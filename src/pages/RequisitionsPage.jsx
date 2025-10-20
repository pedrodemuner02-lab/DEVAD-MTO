import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, FileText, CheckCircle, XCircle, Clock, Package, 
  Eye, Edit, Trash2, X, Download, ShoppingCart, TrendingUp, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { requisitionService } from '../services/requisitionService';
import RequisitionModal from '../components/modals/RequisitionModal';
import ConfirmDialog from '../components/modals/ConfirmDialog';
import Toast from '../components/ui/Toast';

const RequisitionsPage = () => {
  const { user, userRole, hasPermission } = useAuth();
  const [requisitions, setRequisitions] = useState([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [viewMode, setViewMode] = useState('view'); // 'view', 'edit', 'create'
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [requisitionToDelete, setRequisitionToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterPrioridad, setFilterPrioridad] = useState('todos');

  useEffect(() => {
    loadRequisitions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requisitions, searchTerm, filterEstado, filterPrioridad]);

  const loadRequisitions = async () => {
    setLoading(true);
    try {
      let result;
      // Los operadores solo ven sus propias requisiciones
      if (userRole === 'operador') {
        result = await requisitionService.getByUser(user.id);
      } else {
        // Jefes y admins ven todas
        result = await requisitionService.getAll();
      }

      if (result.error) {
        showToast('Error al cargar requisiciones', 'error');
      } else {
        setRequisitions(result.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar requisiciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requisitions];

    // Filtrar por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.folio.toLowerCase().includes(searchLower) ||
        req.solicitanteNombre.toLowerCase().includes(searchLower) ||
        req.motivo.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por estado
    if (filterEstado !== 'todos') {
      filtered = filtered.filter(req => req.estado === filterEstado);
    }

    // Filtrar por prioridad
    if (filterPrioridad !== 'todos') {
      filtered = filtered.filter(req => req.prioridad === filterPrioridad);
    }

    setFilteredRequisitions(filtered);
  };

  const handleCreate = () => {
    setSelectedRequisition(null);
    setViewMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (requisition) => {
    // Solo se puede editar si está pendiente y es el solicitante o es admin/jefe
    if (requisition.estado !== 'pendiente') {
      showToast('Solo se pueden editar requisiciones pendientes', 'error');
      return;
    }
    if (requisition.solicitanteId !== user.id && !hasPermission(['jefe', 'administrador'])) {
      showToast('No tienes permiso para editar esta requisición', 'error');
      return;
    }
    setSelectedRequisition(requisition);
    setViewMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (requisition) => {
    setSelectedRequisition(requisition);
    setIsViewModalOpen(true);
  };

  const handleSave = async (requisitionData) => {
    try {
      let result;
      if (selectedRequisition) {
        // Actualizar
        result = await requisitionService.update(selectedRequisition.id, requisitionData);
      } else {
        // Crear
        result = await requisitionService.create(requisitionData);
      }

      if (result.error) {
        showToast('Error al guardar la requisición', 'error');
      } else {
        showToast(
          selectedRequisition ? 'Requisición actualizada correctamente' : 'Requisición creada correctamente',
          'success'
        );
        loadRequisitions();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al guardar la requisición', 'error');
    }
  };

  const handleApprove = async (requisition) => {
    if (!hasPermission(['jefe', 'administrador'])) {
      showToast('No tienes permiso para aprobar requisiciones', 'error');
      return;
    }

    if (window.confirm(`¿Aprobar la requisición ${requisition.folio}?`)) {
      try {
        const result = await requisitionService.approve(requisition.id, {
          aprobadoPorId: user.id,
          aprobadoPorNombre: user.user_metadata?.full_name || user.email.split('@')[0],
        });

        if (result.error) {
          showToast('Error al aprobar requisición', 'error');
        } else {
          showToast('Requisición aprobada correctamente', 'success');
          loadRequisitions();
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('Error al aprobar requisición', 'error');
      }
    }
  };

  const handleReject = async (requisition) => {
    if (!hasPermission(['jefe', 'administrador'])) {
      showToast('No tienes permiso para rechazar requisiciones', 'error');
      return;
    }

    const motivo = window.prompt('Ingresa el motivo del rechazo:');
    if (motivo) {
      try {
        const result = await requisitionService.reject(requisition.id, {
          rechazadoPorId: user.id,
          rechazadoPorNombre: user.user_metadata?.full_name || user.email.split('@')[0],
          motivoRechazo: motivo,
        });

        if (result.error) {
          showToast('Error al rechazar requisición', 'error');
        } else {
          showToast('Requisición rechazada', 'success');
          loadRequisitions();
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('Error al rechazar requisición', 'error');
      }
    }
  };

  const handleDeliver = async (requisition) => {
    if (!hasPermission(['jefe', 'administrador'])) {
      showToast('No tienes permiso para marcar como entregado', 'error');
      return;
    }

    const recibidoPor = window.prompt('¿Quién recibe los materiales?', requisition.solicitanteNombre);
    if (recibidoPor) {
      try {
        const result = await requisitionService.deliver(requisition.id, {
          entregadoPor: user.user_metadata?.full_name || user.email.split('@')[0],
          recibidoPor,
        });

        if (result.error) {
          showToast('Error al marcar como entregado', 'error');
        } else {
          showToast('Requisición marcada como entregada', 'success');
          loadRequisitions();
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('Error al marcar como entregado', 'error');
      }
    }
  };

  const handleDeleteClick = (requisition) => {
    if (!['pendiente', 'cancelado'].includes(requisition.estado)) {
      showToast('Solo se pueden eliminar requisiciones pendientes o canceladas', 'error');
      return;
    }
    setRequisitionToDelete(requisition);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (requisitionToDelete) {
      try {
        const result = await requisitionService.delete(requisitionToDelete.id);
        if (result.error) {
          showToast('Error al eliminar requisición', 'error');
        } else {
          showToast('🗑️ Requisición eliminada correctamente', 'success');
          loadRequisitions();
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('Error al eliminar requisición', 'error');
      }
      setRequisitionToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { class: 'badge-warning', icon: Clock, text: 'Pendiente' },
      aprobado: { class: 'badge-success', icon: CheckCircle, text: 'Aprobado' },
      rechazado: { class: 'badge-danger', icon: XCircle, text: 'Rechazado' },
      entregado: { class: 'badge-info', icon: Package, text: 'Entregado' },
      cancelado: { class: 'badge-gray', icon: XCircle, text: 'Cancelado' },
    };

    const badge = badges[estado] || badges.pendiente;
    const Icon = badge.icon;

    return (
      <span className={`badge ${badge.class} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getPrioridadBadge = (prioridad) => {
    const colors = {
      baja: 'text-gray-700 bg-gray-100',
      normal: 'text-blue-700 bg-blue-100',
      alta: 'text-orange-700 bg-orange-100',
      urgente: 'text-red-700 bg-red-100',
    };

    const emojis = {
      baja: '🟢',
      normal: '🟡',
      alta: '🟠',
      urgente: '🔴',
    };

    return (
      <span className={`badge ${colors[prioridad]}`}>
        {emojis[prioridad]} {prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
      </span>
    );
  };

  // Estadísticas rápidas
  const stats = {
    total: requisitions.length,
    pendientes: requisitions.filter(r => r.estado === 'pendiente').length,
    aprobadas: requisitions.filter(r => r.estado === 'aprobado').length,
    entregadas: requisitions.filter(r => r.estado === 'entregado').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando requisiciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requisiciones</h1>
          <p className="text-gray-600 mt-1">
            Gestión de solicitudes de materiales y refacciones
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button onClick={handleCreate} className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Requisición
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-warning-600">{stats.pendientes}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-success-600">{stats.aprobadas}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Entregadas</p>
              <p className="text-2xl font-bold text-info-600">{stats.entregadas}</p>
            </div>
            <div className="p-3 bg-info-100 rounded-lg">
              <Package className="w-6 h-6 text-info-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Folio, solicitante o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="input"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select
            value={filterPrioridad}
            onChange={(e) => setFilterPrioridad(e.target.value)}
            className="input"
          >
            <option value="todos">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>

      {/* Tabla de requisiciones */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {filteredRequisitions.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay requisiciones
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterEstado !== 'todos' || filterPrioridad !== 'todos'
                  ? 'No se encontraron requisiciones con los filtros aplicados'
                  : 'Comienza creando tu primera requisición'}
              </p>
              {!searchTerm && filterEstado === 'todos' && filterPrioridad === 'todos' && (
                <button onClick={handleCreate} className="btn btn-primary inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nueva Requisición
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Folio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artículos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  {hasPermission(['jefe', 'administrador']) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequisitions.map((requisition) => (
                  <tr key={requisition.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {requisition.folio}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{requisition.solicitanteNombre}</div>
                      <div className="text-xs text-gray-500">{requisition.solicitanteEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {requisition.motivo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {requisition.items.length} artículo(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(requisition.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPrioridadBadge(requisition.prioridad)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(requisition.fechaSolicitud).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(requisition)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {requisition.estado === 'pendiente' && (
                          <>
                            {(requisition.solicitanteId === user.id || hasPermission(['jefe', 'administrador'])) && (
                              <button
                                onClick={() => handleEdit(requisition)}
                                className="text-gray-600 hover:text-gray-800"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            
                            {hasPermission(['jefe', 'administrador']) && (
                              <>
                                <button
                                  onClick={() => handleApprove(requisition)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Aprobar"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(requisition)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Rechazar"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {requisition.estado === 'aprobado' && hasPermission(['jefe', 'administrador']) && (
                          <button
                            onClick={() => handleDeliver(requisition)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Marcar como entregado"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        )}

                        {['pendiente', 'cancelado'].includes(requisition.estado) && 
                         (requisition.solicitanteId === user.id || hasPermission(['administrador'])) && (
                          <button
                            onClick={() => handleDeleteClick(requisition)}
                            className="text-danger-600 hover:text-danger-900"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de creación/edición */}
      {viewMode !== 'view' && (
        <RequisitionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          requisition={selectedRequisition}
          user={user}
        />
      )}

      {/* Modal de vista (detalles) */}
      {isViewModalOpen && selectedRequisition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Detalles de Requisición
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Info general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Folio</p>
                  <p className="font-mono font-semibold">{selectedRequisition.folio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  {getEstadoBadge(selectedRequisition.estado)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Solicitante</p>
                  <p className="font-medium">{selectedRequisition.solicitanteNombre}</p>
                  <p className="text-sm text-gray-500">{selectedRequisition.solicitanteEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prioridad</p>
                  {getPrioridadBadge(selectedRequisition.prioridad)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha Solicitud</p>
                  <p className="font-medium">
                    {new Date(selectedRequisition.fechaSolicitud).toLocaleString()}
                  </p>
                </div>
                {selectedRequisition.fechaAprobacion && (
                  <div>
                    <p className="text-sm text-gray-500">
                      {selectedRequisition.estado === 'rechazado' ? 'Fecha Rechazo' : 'Fecha Aprobación'}
                    </p>
                    <p className="font-medium">
                      {new Date(selectedRequisition.fechaAprobacion).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Motivo</p>
                <p className="font-medium">{selectedRequisition.motivo}</p>
              </div>

              {selectedRequisition.observaciones && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Observaciones</p>
                  <p className="text-gray-700">{selectedRequisition.observaciones}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Artículos Solicitados</h3>
                <table className="min-w-full divide-y divide-gray-200 border rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Código</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Artículo</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Cantidad</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unidad</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedRequisition.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{item.codigo}</td>
                        <td className="px-4 py-2 text-sm">{item.nombre}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.cantidad}</td>
                        <td className="px-4 py-2 text-sm">{item.unidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedRequisition.aprobadoPorNombre && (
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500 mb-1">
                    {selectedRequisition.estado === 'rechazado' ? 'Rechazado por' : 'Aprobado por'}
                  </p>
                  <p className="font-medium">{selectedRequisition.aprobadoPorNombre}</p>
                  {selectedRequisition.notasAprobacion && (
                    <>
                      <p className="text-sm text-gray-500 mt-2 mb-1">Notas</p>
                      <p className="text-gray-700">{selectedRequisition.notasAprobacion}</p>
                    </>
                  )}
                </div>
              )}

              {selectedRequisition.estado === 'entregado' && (
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-500 mb-1">Información de Entrega</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-500">Entregado por</p>
                      <p className="font-medium">{selectedRequisition.entregadoPor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Recibido por</p>
                      <p className="font-medium">{selectedRequisition.recibidoPor}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Fecha de entrega</p>
                      <p className="font-medium">
                        {new Date(selectedRequisition.fechaEntrega).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="btn btn-secondary w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Requisición"
        message={`¿Estás seguro de que deseas eliminar la requisición "${requisitionToDelete?.folio}"? Esta acción no se puede deshacer.`}
        type="danger"
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
};

export default RequisitionsPage;
