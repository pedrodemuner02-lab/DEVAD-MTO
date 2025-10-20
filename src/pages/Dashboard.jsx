import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import dashboardService from '../services/dashboardService';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  TrendingUp,
  Wrench,
  Users,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mantenimientosPendientes: 0,
    mantenimientosCompletados: 0,
    equiposActivos: 0,
    porcentajeOperativo: 0,
    alertasCriticas: 0,
  });
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [efficiency, setEfficiency] = useState({
    preventivo: 0,
    correctivo: 0,
    predictivo: 0,
  });
  const [teamActivity, setTeamActivity] = useState({
    operadoresActivos: 0,
    trabajosEnProgreso: 0,
    productividad: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, maintenancesRes, alertsRes, efficiencyRes, activityRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentMaintenances(),
        dashboardService.getInventoryAlerts(),
        dashboardService.getEfficiencyMetrics(),
        dashboardService.getTeamActivity(),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (maintenancesRes.data) setRecentMaintenance(maintenancesRes.data);
      if (alertsRes.data) setInventoryAlerts(alertsRes.data);
      if (efficiencyRes.data) setEfficiency(efficiencyRes.data);
      if (activityRes.data) setTeamActivity(activityRes.data);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      name: 'Mantenimientos Pendientes',
      value: stats.mantenimientosPendientes.toString(),
      change: 'Requieren atención',
      icon: Clock,
      color: 'warning',
    },
    {
      name: 'Mantenimientos Completados',
      value: stats.mantenimientosCompletados.toString(),
      change: 'Este mes',
      icon: CheckCircle,
      color: 'success',
    },
    {
      name: 'Equipos Activos',
      value: stats.equiposActivos.toString(),
      change: `${stats.porcentajeOperativo}% operativos`,
      icon: Activity,
      color: 'primary',
    },
    {
      name: 'Alertas Críticas',
      value: stats.alertasCriticas.toString(),
      change: 'Stock bajo',
      icon: AlertTriangle,
      color: 'danger',
    },
  ];

  const getEstadoBadge = (estado) => {
    const badges = {
      completado: 'badge badge-success',
      en_proceso: 'badge badge-warning',
      programado: 'badge badge-info',
      pendiente: 'badge badge-warning',
      cancelado: 'badge badge-danger',
    };
    return badges[estado] || 'badge';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'Completado': 'Completado',
      'En proceso': 'En Proceso',
      'Programado': 'Programado',
      'Pendiente': 'Pendiente',
      'Cancelado': 'Cancelado',
    };
    return textos[estado] || estado;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inicio</h1>
          <p className="text-gray-500 mt-1">Vista general del sistema de mantenimiento</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Última actualización</p>
          <p className="text-sm font-semibold text-gray-900">
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-4 text-center py-8">
            <p className="text-gray-500">Cargando estadísticas...</p>
          </div>
        ) : (
          statsCards.map((stat) => {
            const colorClasses = {
              warning: { bg: 'bg-warning-100', text: 'text-warning-600' },
              success: { bg: 'bg-success-100', text: 'text-success-600' },
              primary: { bg: 'bg-primary-100', text: 'text-primary-600' },
              danger: { bg: 'bg-danger-100', text: 'text-danger-600' },
            };
            const colors = colorClasses[stat.color];
            
            return (
              <div key={stat.name} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className={`text-sm mt-2 ${colors.text}`}>{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mantenimientos Recientes</h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Folio</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4 text-gray-500">Cargando...</td></tr>
                ) : recentMaintenance.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-gray-500">No hay mantenimientos recientes</td></tr>
                ) : (
                  recentMaintenance.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.equipo}</td>
                      <td>{item.tipo}</td>
                      <td>{item.folio}</td>
                      <td>{item.fecha ? new Date(item.fecha).toLocaleDateString('es-MX') : 'Sin fecha'}</td>
                      <td>
                        <span className={getEstadoBadge(item.estado.toLowerCase().replace(' ', '_'))}>
                          {getEstadoTexto(item.estado)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Alertas de Inventario</h2>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-4">Cargando...</p>
            ) : inventoryAlerts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No hay alertas de inventario</p>
            ) : (
              inventoryAlerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.item}</p>
                      <p className="text-xs text-gray-500 mt-1">Stock actual: {alert.stock} / Mínimo: {alert.minimo}</p>
                    </div>
                    <AlertTriangle className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium text-center">
            Ver todo el inventario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Eficiencia de Mantenimiento</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Preventivo</span>
                <span className="text-sm font-semibold text-gray-900">{efficiency.preventivo}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-success-600 h-2 rounded-full transition-all" style={{ width: `${efficiency.preventivo}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Correctivo</span>
                <span className="text-sm font-semibold text-gray-900">{efficiency.correctivo}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-warning-600 h-2 rounded-full transition-all" style={{ width: `${efficiency.correctivo}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Predictivo</span>
                <span className="text-sm font-semibold text-gray-900">{efficiency.predictivo}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${efficiency.predictivo}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad del Equipo</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-900">Operadores Activos</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{teamActivity.operadoresActivos}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-warning-600" />
                <span className="text-sm font-medium text-gray-900">Trabajos en Progreso</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{teamActivity.trabajosEnProgreso}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-success-600" />
                <span className="text-sm font-medium text-gray-900">Productividad</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{teamActivity.productividad}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
