import { supabase, TABLES } from '../lib/supabase';

/**
 * Servicio para gestión de requisiciones de materiales
 * Maneja CRUD completo, aprobaciones y entrega de materiales
 */

export const requisitionService = {
  /**
   * Obtener todas las requisiciones
   * @param {Object} filters - Filtros opcionales (estado, solicitante, prioridad)
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from(TABLES.REQUISITIONS)
        .select('*')
        .order('fecha_solicitud', { ascending: false });

      // Aplicar filtros si existen
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.solicitante) {
        query = query.ilike('solicitante', `%${filters.solicitante}%`);
      }
      if (filters.prioridad) {
        query = query.eq('prioridad', filters.prioridad);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { 
        data: data ? data.map(item => requisitionService.transformFromDB(item)) : [], 
        error: null 
      };
    } catch (error) {
      console.error('Error al obtener requisiciones:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtener una requisición por ID
   * @param {string} id - ID de la requisición
   * @returns {Promise<{data: Object, error: any}>}
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.REQUISITIONS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: requisitionService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al obtener requisición:', error);
      return { data: null, error };
    }
  },

  /**
   * Crear nueva requisición
   * @param {Object} requisition - Datos de la requisición
   * @returns {Promise<{data: Object, error: any}>}
   */
  async create(requisition) {
    try {
      // Generar folio si no existe
      let folio = null;
      if (!requisition.folio) {
        folio = await this.generateFolio();
      }

      // Preparar datos según estructura real de la tabla
      const insertData = {
        folio: folio,
        solicitante: requisition.solicitanteNombre || requisition.solicitante || 'Usuario',
        departamento: requisition.departamento || 'Mantenimiento',
        fecha_solicitud: new Date().toISOString().split('T')[0],
        fecha_requerida: requisition.fechaRequerida || null,
        items: requisition.items || [],
        estado: requisition.estado || 'pendiente',
        prioridad: requisition.prioridad || 'normal',
        justificacion: requisition.motivo || requisition.justificacion,
        observaciones: requisition.observaciones || null,
        total: requisition.total || 0,
      };

      const { data, error } = await supabase
        .from(TABLES.REQUISITIONS)
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return { data: requisitionService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al crear requisición:', error);
      return { data: null, error };
    }
  },

  /**
   * Generar folio automático REQ-YYYY-NNN
   * @returns {Promise<string>}
   */
  async generateFolio() {
    try {
      const year = new Date().getFullYear();
      const prefix = `REQ-${year}-`;
      
      // Obtener el último folio del año actual
      const { data, error } = await supabase
        .from(TABLES.REQUISITIONS)
        .select('folio')
        .like('folio', `${prefix}%`)
        .order('folio', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        // Extraer el número del último folio
        const lastFolio = data[0].folio;
        const lastNumber = parseInt(lastFolio.split('-')[2]) || 0;
        nextNumber = lastNumber + 1;
      }

      // Generar nuevo folio con formato REQ-YYYY-NNN
      return `${prefix}${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.error('Error al generar folio:', error);
      // Generar folio de respaldo con timestamp
      return `REQ-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
    }
  },

  /**
   * Actualizar requisición (solo campos editables)
   * @param {string} id - ID de la requisición
   * @param {Object} requisition - Datos a actualizar
   * @returns {Promise<{data: Object, error: any}>}
   */
  async update(id, requisition) {
    try {
      const updateData = {};
      
      // Solo actualizar campos permitidos
      if (requisition.items !== undefined) updateData.items = requisition.items;
      if (requisition.prioridad !== undefined) updateData.prioridad = requisition.prioridad;
      if (requisition.motivo !== undefined) updateData.motivo = requisition.motivo;
      if (requisition.observaciones !== undefined) updateData.observaciones = requisition.observaciones;

      const { data, error } = await supabase
        .from(TABLES.REQUISITIONS)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: requisitionService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al actualizar requisición:', error);
      return { data: null, error };
    }
  },

  /**
   * Aprobar requisición
   * @param {string} id - ID de la requisición
   * @param {Object} approvalData - Datos de aprobación
   * @returns {Promise<{data: Object, error: any}>}
   */
  async approve(id, approvalData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.REQUISITIONS)
        .update({
          estado: 'aprobado',
          fecha_aprobacion: new Date().toISOString().split('T')[0],
          aprobador: approvalData.aprobadoPorNombre,
          observaciones: approvalData.notasAprobacion || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: requisitionService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al aprobar requisición:', error);
      return { data: null, error };
    }
  },

  /**
   * Rechazar requisición
   * @param {string} id - ID de la requisición
   * @param {Object} rejectionData - Datos de rechazo
   * @returns {Promise<{data: Object, error: any}>}
   */
  async reject(id, rejectionData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.REQUISITIONS)
        .update({
          estado: 'rechazado',
          fecha_aprobacion: new Date().toISOString().split('T')[0],
          aprobador: rejectionData.rechazadoPorNombre,
          observaciones: rejectionData.motivoRechazo || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: requisitionService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al rechazar requisición:', error);
      return { data: null, error };
    }
  },

  /**
   * Marcar requisición como entregada
   * @param {string} id - ID de la requisición
   * @param {Object} deliveryData - Datos de entrega
   * @returns {Promise<{data: Object, error: any}>}
   */
  async deliver(id, deliveryData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.REQUISITIONS)
        .update({
          estado: 'entregado',
          observaciones: `Entregado por: ${deliveryData.entregadoPor || 'N/A'}`,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: requisitionService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al marcar como entregado:', error);
      return { data: null, error };
    }
  },

  /**
   * Cancelar requisición
   * @param {string} id - ID de la requisición
   * @returns {Promise<{data: Object, error: any}>}
   */
  async cancel(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.REQUISITIONS)
        .update({ estado: 'cancelado' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: requisitionService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al cancelar requisición:', error);
      return { data: null, error };
    }
  },

  /**
   * Eliminar requisición (solo si está en estado pendiente o cancelado)
   * @param {string} id - ID de la requisición
   * @returns {Promise<{error: any}>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLES.REQUISITIONS)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error al eliminar requisición:', error);
      return { error };
    }
  },

  /**
   * Obtener estadísticas de requisiciones
   * @returns {Promise<{data: Object, error: any}>}
   */
  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from(TABLES.REQUISITIONS)
        .select('estado, prioridad');

      if (error) throw error;

      const stats = {
        total: data.length,
        porEstado: {
          pendiente: data.filter(r => r.estado === 'pendiente').length,
          aprobado: data.filter(r => r.estado === 'aprobado').length,
          rechazado: data.filter(r => r.estado === 'rechazado').length,
          entregado: data.filter(r => r.estado === 'entregado').length,
          cancelado: data.filter(r => r.estado === 'cancelado').length,
        },
        porPrioridad: {
          baja: data.filter(r => r.prioridad === 'baja').length,
          normal: data.filter(r => r.prioridad === 'normal').length,
          alta: data.filter(r => r.prioridad === 'alta').length,
          urgente: data.filter(r => r.prioridad === 'urgente').length,
        }
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { data: null, error };
    }
  },

  /**
   * Transformar datos de DB a formato de app
   * @param {Object} item - Datos de la base de datos
   * @returns {Object} - Datos transformados
   */
  transformFromDB(item) {
    if (!item) return null;
    return {
      id: item.id,
      folio: item.folio,
      solicitante: item.solicitante,
      solicitanteNombre: item.solicitante,
      departamento: item.departamento,
      fechaSolicitud: item.fecha_solicitud,
      fechaRequerida: item.fecha_requerida,
      items: item.items || [],
      estado: item.estado,
      prioridad: item.prioridad,
      justificacion: item.justificacion,
      motivo: item.justificacion || item.motivo,
      observaciones: item.observaciones,
      total: item.total,
      aprobador: item.aprobador,
      fechaAprobacion: item.fecha_aprobacion,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  },
};

export default requisitionService;
