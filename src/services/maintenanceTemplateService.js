import { supabase, TABLES } from '../lib/supabase';

/**
 * Servicio para gestionar plantillas de mantenimiento recurrente
 * y generar instancias automáticamente
 * MIGRADO A SUPABASE
 */

class MaintenanceTemplateService {
  constructor() {
    // Ya no usamos localStorage, todo en Supabase
  }

  /**
   * Crear una nueva plantilla de mantenimiento recurrente
   */
  async createTemplate(templateData) {
    try {
      // Usar solo columnas que EXISTEN en la tabla
      const newTemplate = {
        equipment_id: templateData.equipo?.id || templateData.equipmentId || null,
        tipo: templateData.tipo || 'Preventivo',
        descripcion: templateData.descripcion || '',
        frecuencia_numero: parseInt(templateData.frecuenciaNumero) || 1,
        frecuencia_unidad: templateData.frecuenciaUnidad || 'días',
        horas_estimadas: parseFloat(templateData.horasEstimadas) || null,
        activo: true,
      };

      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_TEMPLATES)
        .insert([newTemplate])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las plantillas con información de equipo
   */
  async getAllTemplates() {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_TEMPLATES)
        .select(`
          *,
          equipment:equipment_id (
            id,
            nombre,
            codigo
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transformar datos para el frontend
      return (data || []).map(template => ({
        id: template.id,
        equipmentId: template.equipment_id,
        equipo: template.equipment?.nombre || 'Sin equipo',
        tipo: template.tipo,
        descripcion: template.descripcion,
        frecuenciaNumero: template.frecuencia_numero,
        frecuenciaUnidad: template.frecuencia_unidad,
        horasEstimadas: template.horas_estimadas,
        activo: template.activo,
        createdAt: template.created_at,
      }));
    } catch (error) {
      console.error('Error al obtener plantillas:', error);
      return [];
    }
  }

  /**
   * Obtener plantilla por ID
   */
  async getTemplateById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_TEMPLATES)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener plantilla:', error);
      return null;
    }
  }

  /**
   * Actualizar plantilla
   */
  async updateTemplate(id, updates) {
    try {
      // Mapear campos del frontend a la BD
      const updateData = {};
      
      if (updates.equipmentId !== undefined) updateData.equipment_id = updates.equipmentId;
      if (updates.tipo !== undefined) updateData.tipo = updates.tipo;
      if (updates.descripcion !== undefined) updateData.descripcion = updates.descripcion;
      if (updates.frecuenciaNumero !== undefined) updateData.frecuencia_numero = parseInt(updates.frecuenciaNumero);
      if (updates.frecuenciaUnidad !== undefined) updateData.frecuencia_unidad = updates.frecuenciaUnidad;
      if (updates.horasEstimadas !== undefined) updateData.horas_estimadas = parseFloat(updates.horasEstimadas);
      if (updates.activo !== undefined) updateData.activo = updates.activo;

      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_TEMPLATES)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error al actualizar plantilla:', error);
      throw error;
    }
  }

  /**
   * Eliminar plantilla
   */
  async deleteTemplate(id) {
    try {
      // Las instancias se eliminan automáticamente por CASCADE
      const { error } = await supabase
        .from(TABLES.MAINTENANCE_TEMPLATES)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      throw error;
    }
  }

  /**
   * Activar/Desactivar plantilla
   */
  async toggleTemplateActive(id, isActive) {
    return this.updateTemplate(id, { activo: isActive });
  }

  /**
   * Generar instancias de mantenimiento para una plantilla
   */
  async generateInstancesForTemplate(template) {
    try {
      if (!template.es_recurrente) {
        // Si no es recurrente, crear solo una instancia
        return await this.createSingleInstance(template);
      }

      const instances = this.calculateInstances(template);
      const existingInstances = await this.getInstancesByTemplateId(template.id);
      
      // Filtrar instancias nuevas que no existen
      const newInstances = instances.filter(newInst => {
        return !existingInstances.some(existing => 
          this.isSameDate(new Date(existing.fecha_programada), new Date(newInst.fecha_programada))
        );
      });

      // Guardar nuevas instancias en lote
      if (newInstances.length > 0) {
        const { data, error } = await supabase
          .from(TABLES.MAINTENANCE_INSTANCES)
          .insert(newInstances.map(inst => ({
            template_id: inst.template_id,
            folio: inst.folio,
            equipo_id: inst.equipo_id,
            equipo_nombre: inst.equipo_nombre,
            tipo: inst.tipo,
            titulo: inst.titulo,
            descripcion: inst.descripcion,
            fecha_programada: inst.fecha_programada,
            tecnico_asignado: inst.tecnico_asignado,
            turno: inst.turno,
            prioridad: inst.prioridad,
            estado: 'programado',
            duracion_estimada: inst.duracion_estimada,
            es_recurrente: true,
            instance_number: inst.instance_number,
          })))
          .select();

        if (error) throw error;

        // Actualizar fecha de última generación
        await this.updateTemplate(template.id, {
          last_generated: new Date().toISOString(),
        });

        return data;
      }

      return [];
    } catch (error) {
      console.error('Error al generar instancias:', error);
      throw error;
    }
  }

  /**
   * Calcular todas las instancias según la configuración de recurrencia
   */
  calculateInstances(template) {
    const instances = [];
    const recurrencia = template.recurrencia;
    const esIndefinido = template.es_indefinido;
    const generarHasta = template.generar_hasta;
    
    if (!recurrencia || !recurrencia.fechaInicio) return instances;

    const start = new Date(recurrencia.fechaInicio);
    
    // Para indefinidos, generar 100 instancias futuras
    const end = esIndefinido
      ? new Date(start.getTime() + (100 * this.getIntervalInMs(recurrencia)))
      : new Date(generarHasta);

    let current = new Date(start);
    let instanceNumber = 1;
    const maxInstances = esIndefinido ? 100 : 1000; // Límite de seguridad

    while (current <= end && instanceNumber <= maxInstances) {
      if (recurrencia.tipo === 'semanal') {
        // Para tipo semanal, validar días específicos
        const dayOfWeek = current.getDay();
        if (recurrencia.diasSemana && recurrencia.diasSemana.includes(dayOfWeek)) {
          instances.push(this.createInstanceFromTemplate(template, new Date(current), instanceNumber));
          instanceNumber++;
        }
        // Avanzar 1 día
        current.setDate(current.getDate() + 1);
      } else {
        instances.push(this.createInstanceFromTemplate(template, new Date(current), instanceNumber));
        instanceNumber++;
        
        // Calcular siguiente fecha
        switch (recurrencia.tipo) {
          case 'diaria':
            current.setDate(current.getDate() + parseInt(recurrencia.cada || 1));
            break;
          case 'mensual':
            current.setMonth(current.getMonth() + parseInt(recurrencia.cada || 1));
            break;
          case 'anual':
            current.setFullYear(current.getFullYear() + parseInt(recurrencia.cada || 1));
            break;
          default:
            current = new Date(end.getTime() + 1); // Salir del loop
        }
      }
    }

    return instances;
  }

  /**
   * Crear instancia de mantenimiento desde plantilla
   */
  createInstanceFromTemplate(template, fecha, instanceNumber) {
    const recurrencia = template.recurrencia || {};
    
    // Calcular hora de inicio y fin
    let fechaProgramada = new Date(fecha);
    if (recurrencia.horaEspecifica) {
      const [hours, minutes] = recurrencia.horaEspecifica.split(':');
      fechaProgramada.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // Calcular turno asignado
    const turnoAsignado = this.calculateShift(fechaProgramada, recurrencia, instanceNumber);

    return {
      template_id: template.id,
      folio: `${(template.tipo || 'MNT').substring(0, 3).toUpperCase()}-${Date.now()}-${instanceNumber}`,
      equipo_id: template.equipo_id,
      equipo_nombre: template.equipo_nombre,
      tipo: template.tipo,
      titulo: template.titulo,
      descripcion: template.descripcion,
      fecha_programada: fechaProgramada.toISOString(),
      tecnico_asignado: template.tecnico_asignado || 'Por asignar',
      turno: turnoAsignado,
      prioridad: template.prioridad,
      duracion_estimada: recurrencia.duracionEstimada,
      instance_number: instanceNumber,
    };
  }

  /**
   * Crear una sola instancia (no recurrente)
   */
  async createSingleInstance(template) {
    try {
      const instance = {
        template_id: null,
        folio: `${(template.tipo || 'MNT').substring(0, 3).toUpperCase()}-${Date.now()}`,
        equipo_id: template.equipo_id,
        equipo_nombre: template.equipo_nombre,
        tipo: template.tipo,
        titulo: template.titulo,
        descripcion: template.descripcion,
        fecha_programada: template.fecha_programada || new Date().toISOString(),
        tecnico_asignado: template.tecnico_asignado,
        turno: template.turno,
        prioridad: template.prioridad,
        estado: 'programado',
        es_recurrente: false,
      };
      
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_INSTANCES)
        .insert([instance])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear instancia única:', error);
      throw error;
    }
  }

  /**
   * Calcular turno según estrategia de distribución
   */
  calculateShift(fecha, recurrencia, instanceNumber) {
    // Si hay turno específico, usarlo
    if (!recurrencia.distribuirTurnos && recurrencia.turnoPreferido) {
      return recurrencia.turnoPreferido;
    }

    // Distribución automática con balanceo de carga
    const turnos = ['matutino', 'intermedio', 'vespertino', 'nocturno'];
    
    // Estrategia: rotar turnos según el número de instancia
    const turnoIndex = (instanceNumber - 1) % turnos.length;
    return turnos[turnoIndex];
  }

  /**
   * Obtener intervalo en milisegundos según tipo de recurrencia
   */
  getIntervalInMs(recurrencia) {
    const day = 24 * 60 * 60 * 1000;
    
    switch (recurrencia.tipo) {
      case 'diaria':
        return day * recurrencia.cada;
      case 'semanal':
        // Para semanal, usar 7 días como base
        return day * 7;
      case 'mensual':
        return day * 30 * recurrencia.cada;
      case 'anual':
        return day * 365 * recurrencia.cada;
      default:
        return day;
    }
  }

  /**
   * Verificar si dos fechas son el mismo día
   */
  isSameDate(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Regenerar instancias para una plantilla (eliminar antiguas y crear nuevas)
   */
  async regenerateInstancesForTemplate(template) {
    try {
      // Eliminar instancias futuras existentes
      await this.deleteFutureInstancesByTemplateId(template.id);
      
      // Generar nuevas instancias
      return await this.generateInstancesForTemplate(template);
    } catch (error) {
      console.error('Error al regenerar instancias:', error);
      throw error;
    }
  }

  // ========== Gestión de Instancias ==========

  /**
   * Obtener todas las instancias
   */
  async getAllInstances() {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_INSTANCES)
        .select('*')
        .order('fecha_programada', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener instancias:', error);
      return [];
    }
  }

  /**
   * Obtener instancias por template ID
   */
  async getInstancesByTemplateId(templateId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_INSTANCES)
        .select('*')
        .eq('template_id', templateId)
        .order('fecha_programada', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener instancias:', error);
      return [];
    }
  }

  /**
   * Actualizar instancia
   */
  async updateInstance(id, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_INSTANCES)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar instancia:', error);
      throw error;
    }
  }

  /**
   * Eliminar instancia
   */
  async deleteInstance(id) {
    try {
      const { error } = await supabase
        .from(TABLES.MAINTENANCE_INSTANCES)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar instancia:', error);
      throw error;
    }
  }

  /**
   * Eliminar instancias futuras por template ID
   */
  async deleteFutureInstancesByTemplateId(templateId) {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from(TABLES.MAINTENANCE_INSTANCES)
        .delete()
        .eq('template_id', templateId)
        .gt('fecha_programada', now);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar instancias futuras:', error);
      throw error;
    }
  }

  /**
   * Job: Generar instancias para plantillas indefinidas
   * Ejecutar diariamente para mantener 100 instancias futuras
   */
  async generateInstancesForIndefiniteTemplates() {
    try {
      const templates = await this.getAllTemplates();
      const indefiniteTemplates = templates.filter(t => t.is_active && t.es_recurrente && t.es_indefinido);
      
      for (const template of indefiniteTemplates) {
        const instances = await this.getInstancesByTemplateId(template.id);
        const now = new Date();
        const futureInstances = instances.filter(inst => {
          return new Date(inst.fecha_programada) > now;
        });
        
        // Si hay menos de 50 instancias futuras, generar más
        if (futureInstances.length < 50) {
          console.log(`Generando más instancias para plantilla indefinida: ${template.titulo}`);
          await this.generateInstancesForTemplate(template);
        }
      }
    } catch (error) {
      console.error('Error al generar instancias indefinidas:', error);
    }
  }

  // ========== Utilidades ==========

  /**
   * Obtener estadísticas
   */
  async getStats() {
    try {
      const templates = await this.getAllTemplates();
      const instances = await this.getAllInstances();
      
      return {
        totalTemplates: templates.length,
        activeTemplates: templates.filter(t => t.is_active).length,
        indefiniteTemplates: templates.filter(t => t.es_indefinido && t.is_active).length,
        totalInstances: instances.length,
        pendingInstances: instances.filter(i => i.estado === 'programado').length,
        completedInstances: instances.filter(i => i.estado === 'completado').length,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        totalTemplates: 0,
        activeTemplates: 0,
        indefiniteTemplates: 0,
        totalInstances: 0,
        pendingInstances: 0,
        completedInstances: 0,
      };
    }
  }
}

// Exportar instancia única (singleton)
const maintenanceTemplateService = new MaintenanceTemplateService();
export default maintenanceTemplateService;
