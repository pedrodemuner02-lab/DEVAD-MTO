import { supabase, TABLES } from '../lib/supabase';
import assignmentService from './assignmentService';

/**
 * 🔄 GENERADOR DE INSTANCIAS RECURRENTES
 * Crea mantenimientos individuales basados en plantillas recurrentes
 */
class InstanceGenerator {
  constructor() {
    this.diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  }

  /**
   * 🎯 GENERAR INSTANCIAS PARA UNA PLANTILLA
   * @param {string} plantillaId - ID de la plantilla
   * @param {number} weeksAhead - Cuántas semanas adelante generar (default: 4)
   * @returns {Object} { generadas: number, instancias: Array }
   */
  async generateInstances(plantillaId, weeksAhead = 4) {
    try {
      console.log(`🔄 Generando instancias para plantilla ${plantillaId}...`);
      
      // 1️⃣ Obtener plantilla
      const { data: plantilla, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .select('*')
        .eq('id', plantillaId)
        .eq('es_plantilla', true)
        .single();
      
      if (error || !plantilla) {
        throw new Error(`Plantilla ${plantillaId} no encontrada`);
      }
      
      // 2️⃣ Verificar si está activa
      if (plantilla.estado !== 'Activo') {
        console.log('⏸️ Plantilla inactiva, no se generan instancias');
        return { generadas: 0, instancias: [] };
      }
      
      // 3️⃣ Calcular fechas futuras
      const fechas = this.calcularFechasFuturas(plantilla, weeksAhead);
      
      if (fechas.length === 0) {
        console.log('ℹ️ No hay fechas futuras para generar');
        return { generadas: 0, instancias: [] };
      }
      
      // 4️⃣ Crear instancias en batch
      const instanciasNuevas = [];
      
      for (const fecha of fechas) {
        // Verificar si ya existe
        const existe = await this.existeInstancia(plantillaId, fecha);
        if (existe) {
          console.log(`⏭️ Instancia para ${fecha} ya existe, saltando...`);
          continue;
        }
        
        // Preparar datos de instancia
        const instancia = {
          es_plantilla: false,
          es_recurrente: false,
          plantilla_id: plantillaId,
          fecha_programada: fecha,
          equipment_id: plantilla.equipment_id,
          tipo: plantilla.tipo,
          descripcion: plantilla.descripcion || '',
          horas_estimadas: parseFloat(plantilla.horas_estimadas) || 1.0,
          costo_estimado: parseFloat(plantilla.costo_estimado) || 0,
          prioridad: plantilla.prioridad || 'Media',
          complejidad: plantilla.complejidad || 'media',
          urgencia: 'normal', // Instancias recurrentes siempre son normales
          estado: 'Programado',
          puntos_complejidad: this.calcularPuntos(plantilla.complejidad),
          codigo: `MTO-${Date.now()}-${instanciasNuevas.length}`,
          // Campos de asignación (se llenan después)
          operador_asignado_id: null,
          turno_asignado: null
        };
        
        instanciasNuevas.push(instancia);
      }
      
      if (instanciasNuevas.length === 0) {
        console.log('✅ No hay nuevas instancias que generar');
        return { generadas: 0, instancias: [] };
      }
      
      // 5️⃣ Insertar todas las instancias
      console.log(`📝 Insertando ${instanciasNuevas.length} instancias...`);
      const { data: creadas, error: insertError } = await supabase
        .from(TABLES.MAINTENANCE)
        .insert(instanciasNuevas)
        .select('*');
      
      if (insertError) {
        console.error('❌ Error insertando instancias:', insertError);
        throw insertError;
      }
      
      // 6️⃣ Asignar automáticamente a operadores
      console.log(`🤖 Asignando operadores automáticamente...`);
      for (const instancia of creadas) {
        try {
          await assignmentService.assignMaintenance({
            id: instancia.id,
            complejidad: instancia.complejidad,
            urgencia: instancia.urgencia,
            fecha_programada: instancia.fecha_programada
          });
        } catch (asignError) {
          console.warn(`⚠️ No se pudo asignar instancia ${instancia.id}:`, asignError.message);
          // Continuar con las siguientes aunque una falle
        }
      }
      
      console.log(`✅ ${creadas.length} instancias generadas y asignadas`);
      return { generadas: creadas.length, instancias: creadas };
      
    } catch (error) {
      console.error('❌ Error generando instancias:', error);
      throw error;
    }
  }

  /**
   * 📅 CALCULAR FECHAS FUTURAS según frecuencia
   */
  calcularFechasFuturas(plantilla, weeksAhead) {
    const fechas = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Convertir dias_semana de JSONB a array si es necesario
    let diasSemana = plantilla.dias_semana || [];
    if (typeof diasSemana === 'string') {
      try {
        diasSemana = JSON.parse(diasSemana);
      } catch (e) {
        console.error('Error parseando dias_semana:', e);
        diasSemana = [];
      }
    }
    
    if (!Array.isArray(diasSemana) || diasSemana.length === 0) {
      console.warn('⚠️ Plantilla sin días de semana configurados');
      return [];
    }
    
    if (plantilla.frecuencia_unidad === 'semanas') {
      const cada = plantilla.frecuencia_numero || 1;
      
      // Generar fechas para las próximas N semanas
      for (let semana = 0; semana < weeksAhead; semana += cada) {
        for (const diaSemana of diasSemana) {
          const fecha = this.getProximoDia(hoy, diaSemana, semana);
          
          // Solo fechas futuras
          if (fecha < hoy) continue;
          
          // Verificar fecha límite si existe
          if (plantilla.generar_hasta) {
            const limite = new Date(plantilla.generar_hasta);
            if (fecha > limite) continue;
          }
          
          fechas.push(fecha.toISOString().split('T')[0]);
        }
      }
    }
    
    // Ordenar cronológicamente
    fechas.sort();
    return fechas;
  }

  /**
   * 📍 OBTENER PRÓXIMO DÍA DE LA SEMANA
   * @param {Date} desde - Fecha base
   * @param {number} diaSemana - 0=Domingo, 1=Lunes, ..., 6=Sábado
   * @param {number} semanasAdelante - Cuántas semanas adelante
   */
  getProximoDia(desde, diaSemana, semanasAdelante) {
    const resultado = new Date(desde);
    resultado.setHours(0, 0, 0, 0);
    
    // Avanzar a la semana correspondiente
    resultado.setDate(resultado.getDate() + (semanasAdelante * 7));
    
    // Ajustar al día de la semana deseado
    const diaActual = resultado.getDay();
    const diasHastaObjetivo = (diaSemana - diaActual + 7) % 7;
    resultado.setDate(resultado.getDate() + diasHastaObjetivo);
    
    return resultado;
  }

  /**
   * 🔍 VERIFICAR SI YA EXISTE INSTANCIA
   */
  async existeInstancia(plantillaId, fecha) {
    const { data, error } = await supabase
      .from(TABLES.MAINTENANCE)
      .select('id')
      .eq('plantilla_id', plantillaId)
      .eq('fecha_programada', fecha)
      .eq('es_plantilla', false)
      .maybeSingle();
    
    if (error) {
      console.error('Error verificando instancia:', error);
      return false;
    }
    
    return !!data;
  }

  /**
   * 🧮 CALCULAR PUNTOS DE COMPLEJIDAD
   */
  calcularPuntos(complejidad) {
    const mapa = { baja: 1, media: 2, alta: 3 };
    return mapa[complejidad] || 2;
  }

  /**
   * 🔄 GENERAR PARA TODAS LAS PLANTILLAS ACTIVAS
   */
  async generarParaTodasPlantillas(weeksAhead = 2) {
    try {
      console.log('🔄 Generando instancias para todas las plantillas activas...');
      
      const { data: plantillas, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .select('id, descripcion')
        .eq('es_plantilla', true)
        .eq('estado', 'Activo');
      
      if (error) throw error;
      
      if (!plantillas || plantillas.length === 0) {
        console.log('ℹ️ No hay plantillas activas');
        return { plantillas: 0, instancias: 0 };
      }
      
      let totalInstancias = 0;
      
      for (const plantilla of plantillas) {
        try {
          const resultado = await this.generateInstances(plantilla.id, weeksAhead);
          totalInstancias += resultado.generadas;
        } catch (error) {
          console.error(`❌ Error con plantilla ${plantilla.id}:`, error);
          // Continuar con las siguientes
        }
      }
      
      console.log(`✅ Generación masiva completada: ${totalInstancias} instancias para ${plantillas.length} plantillas`);
      return { plantillas: plantillas.length, instancias: totalInstancias };
      
    } catch (error) {
      console.error('❌ Error en generación masiva:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENER ESTADÍSTICAS DE PLANTILLA
   */
  async getEstadisticas(plantillaId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .select('id, estado, fecha_programada')
        .eq('plantilla_id', plantillaId)
        .eq('es_plantilla', false);
      
      if (error) throw error;
      
      const total = data.length;
      const programadas = data.filter(i => i.estado === 'Programado').length;
      const enProceso = data.filter(i => i.estado === 'En proceso').length;
      const completadas = data.filter(i => i.estado === 'Completado').length;
      
      const fechas = data
        .map(i => new Date(i.fecha_programada))
        .filter(f => f > new Date());
      
      const proximaFecha = fechas.length > 0 
        ? new Date(Math.min(...fechas)).toISOString().split('T')[0]
        : null;
      
      return {
        total,
        programadas,
        enProceso,
        completadas,
        proximaFecha
      };
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { total: 0, programadas: 0, enProceso: 0, completadas: 0, proximaFecha: null };
    }
  }
}

export default new InstanceGenerator();
