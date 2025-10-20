import { supabase, TABLES } from '../lib/supabase';
import { equipmentService } from './databaseService';

// ==================== MAINTENANCE SERVICE ====================

export const maintenanceService = {
  // Obtener todos los mantenimientos
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .select(`
          *,
          equipment:equipment_id (
            id,
            codigo,
            nombre,
            tipo
          )
        `)
        .order('fecha_programada', { ascending: false });
      
      if (error) throw error;
      return { data: data ? data.map(item => this.transformFromDB(item)) : [], error: null };
    } catch (error) {
      console.error('Error al obtener mantenimientos:', error);
      return { data: null, error };
    }
  },

  // Crear nuevo mantenimiento
  async create(maintenance) {
    try {
      // 📝 SISTEMA HÍBRIDO: Construir objeto con TODOS los campos posibles
      const insertData = {
        codigo: maintenance.folio || `MTO-${Date.now()}`,
        equipment_id: maintenance.equipment_id || maintenance.equipmentId,
        tipo: maintenance.tipo || 'Preventivo',
        prioridad: maintenance.prioridad || 'Media',
        estado: maintenance.estado || 'Programado',
        descripcion: maintenance.descripcion || '',
        
        // Campos opcionales básicos
        fecha_programada: maintenance.fecha_programada || maintenance.fechaProgramada || new Date().toISOString(),
        horas_estimadas: maintenance.horas_estimadas || parseFloat(maintenance.horasEstimadas) || 1.0,
        costo_estimado: maintenance.costo_estimado || parseFloat(maintenance.costoEstimado) || 0,
        observaciones: maintenance.observaciones || null,
        
        // 🤖 Campos de asignación automática
        complejidad: maintenance.complejidad || 'media',
        urgencia: maintenance.urgencia || 'normal',
        puntos_complejidad: maintenance.puntos_complejidad || 2,
        turno_asignado: maintenance.turno_asignado || null,
        
        // 🔄 Campos de recurrencia (HÍBRIDO)
        es_recurrente: maintenance.es_recurrente || false,
        es_plantilla: maintenance.es_plantilla || false,
        frecuencia_numero: maintenance.frecuencia_numero || null,
        frecuencia_unidad: maintenance.frecuencia_unidad || null,
        dias_semana: maintenance.dias_semana || null,
      };

      console.log('🔵 maintenanceService.create insertData:', insertData);

      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .insert([insertData])
        .select(`
          *,
          equipment:equipment_id (
            id,
            codigo,
            nombre,
            tipo
          )
        `)
        .single();

      if (error) {
        console.error('🔴 Error en insert:', error);
        throw error;
      }
      
      console.log('✅ Mantenimiento insertado:', data);
      return { data: this.transformFromDB(data), error: null };
    } catch (error) {
      console.error('❌ Error al crear mantenimiento:', error);
      return { data: null, error };
    }
  },

  // Actualizar mantenimiento
  async update(id, maintenance) {
    try {
      const updateData = {
        equipment_id: maintenance.equipmentId,
        tipo: maintenance.tipo,
        prioridad: maintenance.prioridad,
        estado: maintenance.estado,
        descripcion: maintenance.descripcion,
      };

      // Campos opcionales
      if (maintenance.fechaProgramada !== undefined) {
        updateData.fecha_programada = maintenance.fechaProgramada;
      }
      if (maintenance.fechaInicio !== undefined) {
        updateData.fecha_inicio = maintenance.fechaInicio;
      }
      if (maintenance.fechaFin !== undefined) {
        updateData.fecha_fin = maintenance.fechaFin;
      }
      if (maintenance.horasEstimadas !== undefined) {
        updateData.horas_estimadas = maintenance.horasEstimadas;
      }
      if (maintenance.horasReales !== undefined) {
        updateData.horas_reales = maintenance.horasReales;
      }
      if (maintenance.costoEstimado !== undefined) {
        updateData.costo_estimado = maintenance.costoEstimado;
      }
      if (maintenance.costoReal !== undefined) {
        updateData.costo_real = maintenance.costoReal;
      }
      if (maintenance.observaciones !== undefined) {
        updateData.observaciones = maintenance.observaciones;
      }

      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: this.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al actualizar mantenimiento:', error);
      return { data: null, error };
    }
  },

  // Eliminar mantenimiento
  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLES.MAINTENANCE)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error al eliminar mantenimiento:', error);
      return { error };
    }
  },

  // 🔗 COMPLETAR MANTENIMIENTO Y ACTUALIZAR FECHAS DEL EQUIPO
  async complete(id, completionData) {
    try {
      // 1. Obtener el mantenimiento para saber el equipo
      const { data: maintenance, error: fetchError } = await supabase
        .from(TABLES.MAINTENANCE)
        .select('equipment_id, fecha_programada')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Actualizar el mantenimiento como completado
      const updateData = {
        estado: 'Completado',
        fecha_fin: completionData.fechaCompletada || new Date().toISOString(),
      };

      if (completionData.horasReales) {
        updateData.horas_reales = Number(completionData.horasReales);
      }
      if (completionData.costoReal) {
        updateData.costo_real = Number(completionData.costoReal);
      }
      if (completionData.observaciones) {
        updateData.observaciones = completionData.observaciones;
      }
      if (completionData.solucion) {
        updateData.solucion = completionData.solucion;
      }

      const { data: updatedMaintenance, error: updateError } = await supabase
        .from(TABLES.MAINTENANCE)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // 3. 🎯 ACTUALIZAR FECHAS EN EL EQUIPO
      if (maintenance.equipment_id) {
        const lastMaintenanceDate = completionData.fechaCompletada || new Date().toISOString().split('T')[0];
        
        // Calcular próximo mantenimiento (ejemplo: 30 días después)
        const nextMaintenanceDate = new Date(lastMaintenanceDate);
        nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + 30);
        const nextDateString = nextMaintenanceDate.toISOString().split('T')[0];

        // Actualizar equipo con las nuevas fechas
        await equipmentService.updateMaintenanceDates(
          maintenance.equipment_id,
          lastMaintenanceDate,
          nextDateString
        );
      }

      return { data: this.transformFromDB(updatedMaintenance), error: null };
    } catch (error) {
      console.error('Error al completar mantenimiento:', error);
      return { data: null, error };
    }
  },

  // Obtener mantenimientos por equipo
  async getByEquipment(equipmentId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('fecha_programada', { ascending: false });
      
      if (error) throw error;
      return { data: data ? data.map(item => this.transformFromDB(item)) : [], error: null };
    } catch (error) {
      console.error('Error al obtener mantenimientos del equipo:', error);
      return { data: null, error };
    }
  },

  // 👤 Obtener mantenimientos por operador (email)
  async getByOperator(operatorEmail) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .select(`
          *,
          equipment:equipment_id (
            id,
            codigo,
            nombre,
            tipo
          )
        `)
        .eq('operador_asignado', operatorEmail)
        .order('fecha_programada', { ascending: false });
      
      if (error) throw error;
      return { data: data ? data.map(item => this.transformFromDB(item)) : [], error: null };
    } catch (error) {
      console.error('Error al obtener mantenimientos del operador:', error);
      return { data: null, error };
    }
  },

  // 📋 Obtener mantenimientos pendientes por operador
  async getPendingByOperator(operatorEmail) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .select(`
          *,
          equipment:equipment_id (
            id,
            codigo,
            nombre,
            tipo
          )
        `)
        .in('estado', ['Pendiente', 'En proceso'])
        .order('fecha_programada', { ascending: true });
      
      if (error) throw error;
      return { data: data ? data.map(item => this.transformFromDB(item)) : [], error: null };
    } catch (error) {
      console.error('Error al obtener mantenimientos pendientes del operador:', error);
      return { data: null, error };
    }
  },

  // Transformar de snake_case (DB) a camelCase (App)
  transformFromDB(item) {
    if (!item) return null;
    return {
      id: item.id,
      folio: item.codigo,
      equipmentId: item.equipment_id,
      equipo: item.equipment ? item.equipment.nombre : null,
      equipmentData: item.equipment || null,
      tipo: item.tipo,
      prioridad: item.prioridad,
      estado: item.estado,
      descripcion: item.descripcion,
      fechaProgramada: item.fecha_programada,
      fechaInicio: item.fecha_inicio,
      fechaFin: item.fecha_fin,
      horasEstimadas: item.horas_estimadas,
      horasReales: item.horas_reales,
      costoEstimado: item.costo_estimado,
      costoReal: item.costo_real,
      observaciones: item.observaciones,
      solucion: item.solucion,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  },
};

export default maintenanceService;
