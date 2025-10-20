import { supabase, TABLES } from '../lib/supabase';
import { maintenanceService } from './maintenanceService';
import { equipmentService } from './databaseService';
import { inventoryService } from './databaseService';

/**
 * Servicio para Dashboard - Obtiene estadísticas y datos reales
 */
export const dashboardService = {
  /**
   * Obtener estadísticas generales del sistema
   */
  async getStats() {
    try {
      // 1. Contar mantenimientos por estado
      const { data: maintenances, error: mError } = await supabase
        .from(TABLES.MAINTENANCE)
        .select('estado');
      
      if (mError) throw mError;

      const pendientes = maintenances.filter(m => m.estado === 'Pendiente').length;
      const enProceso = maintenances.filter(m => m.estado === 'En proceso').length;
      const completados = maintenances.filter(m => m.estado === 'Completado').length;

      // 2. Contar equipos por estado
      const { data: equipos, error: eError } = await supabase
        .from(TABLES.EQUIPMENT)
        .select('estado');
      
      if (eError) throw eError;

      const equiposActivos = equipos.filter(e => e.estado === 'Operativo').length;
      const totalEquipos = equipos.length;

      // 3. Contar items de inventario con stock bajo
      const { data: inventory, error: iError } = await supabase
        .from(TABLES.INVENTORY)
        .select('cantidad, stock_minimo');
      
      if (iError) throw iError;

      const alertasCriticas = inventory.filter(item => 
        (item.cantidad || 0) < (item.stock_minimo || 0)
      ).length;

      return {
        data: {
          mantenimientosPendientes: pendientes + enProceso,
          mantenimientosCompletados: completados,
          equiposActivos: totalEquipos,
          porcentajeOperativo: totalEquipos > 0 ? Math.round((equiposActivos / totalEquipos) * 100) : 0,
          alertasCriticas: alertasCriticas,
        },
        error: null
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtener mantenimientos recientes (últimos 5)
   */
  async getRecentMaintenances() {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .select(`
          id,
          codigo,
          equipment_id,
          tipo,
          estado,
          fecha_programada,
          equipment:equipment_id (
            nombre,
            codigo
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;

      return {
        data: data.map(item => ({
          id: item.id,
          folio: item.codigo,
          equipo: item.equipment?.nombre || 'Sin equipo',
          tipo: item.tipo,
          estado: item.estado,
          fecha: item.fecha_programada,
        })),
        error: null
      };
    } catch (error) {
      console.error('Error al obtener mantenimientos recientes:', error);
      return { data: [], error };
    }
  },

  /**
   * Obtener alertas de inventario (items con stock bajo)
   */
  async getInventoryAlerts() {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY)
        .select('id, nombre, cantidad, stock_minimo')
        .order('cantidad', { ascending: true })
        .limit(10);
      
      if (error) throw error;

      // Filtrar solo los que tienen stock bajo
      const alerts = data.filter(item => 
        (item.cantidad || 0) < (item.stock_minimo || 0)
      ).slice(0, 5); // Máximo 5 alertas

      return {
        data: alerts.map(item => ({
          id: item.id,
          item: item.nombre,
          stock: item.cantidad || 0,
          minimo: item.stock_minimo || 0,
        })),
        error: null
      };
    } catch (error) {
      console.error('Error al obtener alertas de inventario:', error);
      return { data: [], error };
    }
  },

  /**
   * Obtener métricas de eficiencia por tipo de mantenimiento
   */
  async getEfficiencyMetrics() {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .select('tipo, estado, horas_estimadas, horas_reales');
      
      if (error) throw error;

      // Calcular eficiencia por tipo
      const calcularEficiencia = (tipo) => {
        const mantenimientos = data.filter(m => 
          m.tipo === tipo && 
          m.estado === 'Completado' &&
          m.horas_estimadas && 
          m.horas_reales
        );

        if (mantenimientos.length === 0) return 0;

        const eficienciaTotal = mantenimientos.reduce((sum, m) => {
          const eficiencia = (m.horas_estimadas / m.horas_reales) * 100;
          return sum + Math.min(eficiencia, 100); // Máximo 100%
        }, 0);

        return Math.round(eficienciaTotal / mantenimientos.length);
      };

      return {
        data: {
          preventivo: calcularEficiencia('Preventivo'),
          correctivo: calcularEficiencia('Correctivo'),
          predictivo: calcularEficiencia('Predictivo'),
        },
        error: null
      };
    } catch (error) {
      console.error('Error al obtener métricas de eficiencia:', error);
      return {
        data: { preventivo: 0, correctivo: 0, predictivo: 0 },
        error
      };
    }
  },

  /**
   * Obtener actividad del equipo (operadores)
   */
  async getTeamActivity() {
    try {
      // Contar operadores activos (columna activo = true)
      const { data: operators, error: oError } = await supabase
        .from(TABLES.OPERATORS)
        .select('id')
        .eq('activo', true);
      
      if (oError) throw oError;

      // Todos los que tienen activo=true son operadores activos
      const operadoresActivos = operators ? operators.length : 0;

      // Contar trabajos en progreso
      const { data: trabajos, error: tError } = await supabase
        .from(TABLES.MAINTENANCE)
        .select('id')
        .eq('estado', 'En proceso');
      
      if (tError) throw tError;

      // Calcular productividad (mantenimientos completados vs total)
      const { data: completados, error: cError } = await supabase
        .from(TABLES.MAINTENANCE)
        .select('id')
        .eq('estado', 'Completado');
      
      const { data: total, error: tTotalError } = await supabase
        .from(TABLES.MAINTENANCE)
        .select('id');

      const productividad = total && total.length > 0 
        ? Math.round((completados.length / total.length) * 100)
        : 0;

      return {
        data: {
          operadoresActivos: operadoresActivos,
          trabajosEnProgreso: trabajos.length,
          productividad: productividad,
        },
        error: null
      };
    } catch (error) {
      console.error('Error al obtener actividad del equipo:', error);
      return {
        data: {
          operadoresActivos: 0,
          trabajosEnProgreso: 0,
          productividad: 0,
        },
        error
      };
    }
  },
};

export default dashboardService;
