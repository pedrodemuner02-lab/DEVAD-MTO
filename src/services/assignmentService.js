// ============================================================
// 🤖 SERVICIO DE ASIGNACIÓN AUTOMÁTICA DE MANTENIMIENTO
// Distribuye trabajos por turno y complejidad (SIMPLIFICADO)
// ============================================================

import { supabase, TABLES } from '../lib/supabase';

class AssignmentService {
  constructor() {
    // 🎯 Puntos de complejidad (para balanceo de carga)
    this.complejidadValores = {
      'baja': 1,
      'media': 2,
      'alta': 3
    };

    // 🕐 Turnos configurados
    this.turnos = ['Mañana', 'Intermedio', 'Tarde', 'Noche'];
  }

  // ============================================================
  // 🎯 MÉTODO PRINCIPAL: Asignar mantenimiento automáticamente
  // ============================================================
  async assignMaintenance(maintenanceData) {
    const { 
      id, 
      complejidad = 'media', 
      urgencia = 'normal',
      fecha_programada = null
    } = maintenanceData;

    try {
      console.log('🤖 Iniciando asignación automática...', { id, complejidad, urgencia, fecha_programada });

      let operadorAsignado = null;

      if (urgencia === 'urgente') {
        // 🔴 URGENTE: Asignar al turno actual (inmediato)
        console.log('🔴 Urgencia detectada - asignando a turno actual');
        operadorAsignado = await this.assignToCurrentShift(complejidad);
      } else if (fecha_programada) {
        // 📅 CON FECHA: Optimizar para esa fecha específica
        console.log(`📅 Optimizando asignación para fecha: ${fecha_programada}`);
        operadorAsignado = await this.distributeEquitably(complejidad, fecha_programada);
      } else {
        // 🟢 NORMAL: Distribución equitativa (balanceo de carga)
        console.log('🟢 Distribución equitativa entre turnos');
        operadorAsignado = await this.distributeEquitably(complejidad);
      }

      if (!operadorAsignado) {
        throw new Error('❌ No hay operadores disponibles para asignar');
      }

      // ✅ Actualizar el mantenimiento con el operador asignado
      const puntos = this.complejidadValores[complejidad];
      const { error } = await supabase
        .from(TABLES.MAINTENANCE)
        .update({
          operador_asignado_id: operadorAsignado.id,
          turno_asignado: operadorAsignado.turno,
          puntos_complejidad: puntos,
          estado: 'Programado' // Cambiar de Pendiente a Programado
        })
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Mantenimiento asignado exitosamente:', {
        operador: operadorAsignado.nombre,
        turno: operadorAsignado.turno,
        puntos
      });

      return operadorAsignado;

    } catch (error) {
      console.error('❌ Error en asignación automática:', error);
      throw error;
    }
  }

  // ============================================================
  // 🔴 ASIGNACIÓN URGENTE: Turno actual
  // ============================================================
  async assignToCurrentShift(complejidad) {
    // Obtener turno actual basado en la hora
    const turnoActual = this.getCurrentShift();
    console.log(`⏰ Turno actual detectado: ${turnoActual}`);
    
    // Obtener operadores disponibles en turno actual
    const operadoresDisponibles = await this.getAvailableOperators(turnoActual);
    
    if (operadoresDisponibles.length === 0) {
      console.warn(`⚠️ No hay operadores en turno ${turnoActual}, buscando en otros turnos...`);
      // Si no hay en turno actual, usar distribución normal
      return await this.distributeEquitably(complejidad);
    }

    console.log(`👥 ${operadoresDisponibles.length} operadores disponibles en ${turnoActual}`);

    // Encontrar operador con menor carga
    return await this.findOperatorWithMinWorkload(operadoresDisponibles);
  }

  // ============================================================
  // 🟢 DISTRIBUCIÓN EQUITATIVA: Turnos futuros
  // ============================================================
  async distributeEquitably(complejidad) {
    console.log('📊 Calculando carga de todos los turnos...');
    
    // Obtener carga de todos los turnos
    const turnosConCarga = await this.getShiftsWithWorkload();
    
    // Ordenar por menor carga (balanceo)
    turnosConCarga.sort((a, b) => a.carga_actual - b.carga_actual);
    
    console.log('📊 Carga de turnos:', turnosConCarga.map(t => 
      `${t.nombre}: ${t.carga_actual} puntos (${t.porcentaje_carga.toFixed(1)}%)`
    ));
    
    // Tomar el turno con menor carga
    const turnoSeleccionado = turnosConCarga[0];
    console.log(`✅ Turno seleccionado: ${turnoSeleccionado.nombre} (menor carga)`);
    
    // Obtener operadores de ese turno
    const operadoresTurno = await this.getAvailableOperators(turnoSeleccionado.nombre);
    
    if (operadoresTurno.length === 0) {
      console.warn(`⚠️ No hay operadores en ${turnoSeleccionado.nombre}, intentando siguiente turno...`);
      // Si no hay operadores, probar con el siguiente turno menos cargado
      for (let i = 1; i < turnosConCarga.length; i++) {
        const siguienteTurno = turnosConCarga[i];
        const ops = await this.getAvailableOperators(siguienteTurno.nombre);
        if (ops.length > 0) {
          return await this.findOperatorWithMinWorkload(ops);
        }
      }
      throw new Error('No hay operadores disponibles en ningún turno');
    }
    
    console.log(`👥 ${operadoresTurno.length} operadores encontrados en ${turnoSeleccionado.nombre}`);
    
    // Asignar al operador con menor carga dentro del turno
    return await this.findOperatorWithMinWorkload(operadoresTurno);
  }

  // ============================================================
  // 👥 OBTENER OPERADORES DISPONIBLES (activos en turno específico)
  // ============================================================
  async getAvailableOperators(turno) {
    const { data: operadores, error } = await supabase
      .from(TABLES.OPERATORS)
      .select('*')
      .eq('activo', true)
      .eq('turno', turno);

    if (error) {
      console.error('Error obteniendo operadores:', error);
      throw error;
    }

    // Filtrar para excluir admin y jefe (solo operadores reales)
    const operadoresReales = operadores?.filter(op => 
      op.puesto !== 'Administrador' && 
      op.puesto !== 'Jefe de Mantenimiento'
    ) || [];

    console.log(`👥 Operadores activos en turno ${turno}:`, operadoresReales.length);
    return operadoresReales;
  }

  // ============================================================
  // 📊 CALCULAR CARGA POR TURNO
  // ============================================================
  async getShiftsWithWorkload() {
    const turnosConCarga = [];

    for (const turno of this.turnos) {
      const carga = await this.calculateShiftWorkload(turno);
      turnosConCarga.push({
        nombre: turno,
        carga_actual: carga,
        porcentaje_carga: (carga / 20) * 100 // Capacidad máxima 20 puntos
      });
    }

    return turnosConCarga;
  }

  // ============================================================
  // 🧮 CALCULAR CARGA DE UN TURNO ESPECÍFICO
  // ============================================================
  async calculateShiftWorkload(turno) {
    const { data: mantenimientos, error } = await supabase
      .from(TABLES.MAINTENANCE)
      .select('puntos_complejidad')
      .eq('turno_asignado', turno)
      .in('estado', ['Programado', 'En proceso']);

    if (error) {
      console.error(`Error calculando carga de turno ${turno}:`, error);
      return 0;
    }

    const total = mantenimientos.reduce((sum, mto) => sum + (mto.puntos_complejidad || 2), 0);
    console.log(`📊 Carga de ${turno}: ${total} puntos (${mantenimientos.length} trabajos)`);
    return total;
  }

  // ============================================================
  // 🔍 ENCONTRAR OPERADOR CON MENOR CARGA
  // ============================================================
  async findOperatorWithMinWorkload(operadores) {
    console.log(`🔍 Buscando operador con menor carga entre ${operadores.length} operadores...`);
    
    const operadoresConCarga = await Promise.all(
      operadores.map(async (op) => {
        const carga = await this.getOperatorWorkload(op.id);
        return { ...op, carga_actual: carga };
      })
    );

    // Ordenar por menor carga
    operadoresConCarga.sort((a, b) => a.carga_actual - b.carga_actual);
    
    const seleccionado = operadoresConCarga[0];
    console.log(`✅ Operador seleccionado: ${seleccionado.nombre} (${seleccionado.carga_actual} puntos)`);
    
    return seleccionado;
  }

  // ============================================================
  // 📈 OBTENER CARGA ACTUAL DE UN OPERADOR
  // ============================================================
  async getOperatorWorkload(operatorId) {
    const { data: mantenimientos, error } = await supabase
      .from(TABLES.MAINTENANCE)
      .select('puntos_complejidad')
      .eq('operador_asignado_id', operatorId)
      .in('estado', ['Programado', 'En proceso']);

    if (error) {
      console.error('Error obteniendo carga de operador:', error);
      return 0;
    }

    return mantenimientos.reduce((sum, mto) => sum + (mto.puntos_complejidad || 2), 0);
  }

  // ============================================================
  // 🕐 OBTENER TURNO ACTUAL BASADO EN LA HORA
  // ============================================================
  getCurrentShift() {
    const hora = new Date().getHours();
    
    // Mañana: 07:00 - 15:00
    if (hora >= 7 && hora < 15) return 'Mañana';
    
    // Intermedio: 10:00 - 18:00 (traslape con Mañana)
    if (hora >= 10 && hora < 18) return 'Intermedio';
    
    // Tarde: 15:00 - 23:00
    if (hora >= 15 && hora < 23) return 'Tarde';
    
    // Noche: 23:00 - 07:00
    return 'Noche';
  }

  // ============================================================
  // 📊 OBTENER ESTADÍSTICAS DE DISTRIBUCIÓN (para dashboard)
  // ============================================================
  async getDistributionStats() {
    try {
      const turnosConCarga = await this.getShiftsWithWorkload();
      
      const { data: operadores, error } = await supabase
        .from(TABLES.OPERATORS)
        .select('id, nombre, turno, activo')
        .eq('activo', true);

      if (error) throw error;

      // Calcular carga de cada operador
      const operadoresConCarga = await Promise.all(
        operadores.map(async (op) => {
          const carga = await this.getOperatorWorkload(op.id);
          return {
            ...op,
            carga_actual: carga,
            porcentaje_carga: (carga / 10) * 100 // Capacidad individual 10 puntos
          };
        })
      );

      return {
        turnos: turnosConCarga,
        operadores: operadoresConCarga,
        turnoMenosCargado: turnosConCarga.sort((a, b) => a.carga_actual - b.carga_actual)[0],
        turnoMasCargado: turnosConCarga.sort((a, b) => b.carga_actual - a.carga_actual)[0]
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

export default new AssignmentService();

// ============================================================
// MÉTODOS ANTIGUOS (MANTENER POR COMPATIBILIDAD)
// ============================================================
export const assignmentService = {
  /**
   * Reasignar un mantenimiento a otro operador (manual por jefe)
   */
  async reasignar(assignmentId, nuevoOperadorId, motivo, reasignadoPor) {
    try {
      console.log('🔄 Reasignando mantenimiento...');

      // 1. Obtener asignación actual
      const { data: assignmentActual, error: getError } = await supabase
        .from('operator_assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();

      if (getError) throw getError;

      const operadorAnterior = assignmentActual.operator_id;

      // 2. Registrar en historial
      await supabase
        .from('assignment_history')
        .insert({
          assignment_id: assignmentId,
          operador_anterior: operadorAnterior,
          operador_nuevo: nuevoOperadorId,
          reasignado_por: reasignadoPor,
          motivo: motivo
        });

      // 3. Actualizar asignación
      const { data: updated, error: updateError } = await supabase
        .from('operator_assignments')
        .update({
          operator_id: nuevoOperadorId,
          reasignado: true,
          motivo_reasignacion: motivo,
          asignado_por: reasignadoPor,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('✅ Reasignación completada');
      console.log('   De:', operadorAnterior);
      console.log('   A:', nuevoOperadorId);

      // La carga se actualiza automáticamente por el trigger

      return { data: updated, error: null };

    } catch (error) {
      console.error('❌ Error en reasignación:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtener tareas asignadas a un operador específico
   */
  async obtenerTareasOperador(operadorId, fecha = null) {
    try {
      let query = supabase
        .from('v_assignments_detail')
        .select('*')
        .eq('operator_id', operadorId)
        .order('hora_inicio_programada', { ascending: true });

      if (fecha) {
        query = query.eq('fecha_programada', fecha);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };

    } catch (error) {
      console.error('❌ Error obteniendo tareas:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtener distribución de carga por turno
   */
  async obtenerDistribucionCarga(fecha, turno = null) {
    try {
      let query = supabase
        .from('operator_workload')
        .select(`
          *,
          operators (
            id,
            nombre,
            apellidos,
            email,
            turno
          )
        `)
        .eq('fecha', fecha);

      if (turno) {
        query = query.eq('turno', turno);
      }

      const { data, error } = await query.order('puntos_totales', { ascending: false });

      if (error) throw error;

      return { data, error: null };

    } catch (error) {
      console.error('❌ Error obteniendo distribución:', error);
      return { data: null, error };
    }
  },

  /**
   * Actualizar horas estimadas y recalcular complejidad
   */
  async actualizarComplejidad(maintenanceId, horasEstimadas, factorAjuste = 1.0) {
    try {
      const { data, error } = await supabase
        .from('maintenance_complexity')
        .update({
          horas_estimadas: horasEstimadas,
          factor_ajuste: factorAjuste
        })
        .eq('maintenance_id', maintenanceId)
        .select()
        .single();

      if (error) throw error;

      // Los puntos se calculan automáticamente por el trigger

      return { data, error: null };

    } catch (error) {
      console.error('❌ Error actualizando complejidad:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtener configuración de turnos
   */
  async obtenerTurnos() {
    try {
      const { data, error } = await supabase
        .from('shift_config')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true });

      if (error) throw error;

      return { data, error: null };

    } catch (error) {
      console.error('❌ Error obteniendo turnos:', error);
      return { data: null, error };
    }
  },

  /**
   * Actualizar configuración de turno
   */
  async actualizarTurno(turnoId, horaInicio, horaFin) {
    try {
      const { data, error } = await supabase
        .from('shift_config')
        .update({
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          updated_at: new Date().toISOString()
        })
        .eq('id', turnoId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };

    } catch (error) {
      console.error('❌ Error actualizando turno:', error);
      return { data: null, error };
    }
  },

  /**
   * Marcar tarea como completada
   */
  async completarTarea(assignmentId) {
    try {
      const { data, error } = await supabase
        .from('operator_assignments')
        .update({
          estado: 'completado',
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;

      // La carga se actualiza automáticamente por el trigger

      return { data, error: null };

    } catch (error) {
      console.error('❌ Error completando tarea:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtener estadísticas de un operador
   */
  async obtenerEstadisticasOperador(operadorId, fechaInicio, fechaFin) {
    try {
      const { data, error } = await supabase
        .from('operator_workload')
        .select('*')
        .eq('operator_id', operadorId)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha', { ascending: true });

      if (error) throw error;

      // Calcular promedios
      const stats = {
        dias_trabajados: data.length,
        promedio_puntos: data.reduce((sum, d) => sum + d.puntos_totales, 0) / (data.length || 1),
        promedio_tareas: data.reduce((sum, d) => sum + d.tareas_asignadas, 0) / (data.length || 1),
        total_completadas: data.reduce((sum, d) => sum + d.tareas_completadas, 0),
        promedio_carga: data.reduce((sum, d) => sum + d.porcentaje_carga, 0) / (data.length || 1),
        dias_sobrecargado: data.filter(d => d.disponibilidad === 'sobrecargado').length,
        detalles: data
      };

      return { data: stats, error: null };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return { data: null, error };
    }
  }
};

// Eliminado: export default assignmentService; (duplicado)
