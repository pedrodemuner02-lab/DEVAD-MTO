import { supabase, TABLES } from '../lib/supabase';

// ==================== INVENTORY SERVICE ====================

export const inventoryService = {
  // Obtener todos los artículos
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data ? data.map(item => inventoryService.transformFromDB(item)) : [], error: null };
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      return { data: null, error };
    }
  },

  // Crear nuevo artículo
  async create(item) {
    try {
      // Preparar datos limpiando valores opcionales
      const insertData = {
        codigo: item.codigo,
        nombre: item.nombre,
        categoria: item.categoria,
        unidad: item.unidad,
      };

      // Agregar campos numéricos con valores predeterminados
      if (item.stockActual !== undefined && item.stockActual !== '') {
        insertData.stock_actual = Number(item.stockActual);
      }
      if (item.stockMinimo !== undefined && item.stockMinimo !== '') {
        insertData.stock_minimo = Number(item.stockMinimo);
      }
      if (item.stockMaximo !== undefined && item.stockMaximo !== '') {
        insertData.stock_maximo = Number(item.stockMaximo);
      }
      if (item.precioUnitario !== undefined && item.precioUnitario !== '') {
        insertData.precio_unitario = Number(item.precioUnitario);
      }

      // Agregar campos de texto opcionales solo si tienen valor
      if (item.ubicacion) insertData.ubicacion = item.ubicacion;
      if (item.proveedor) insertData.proveedor = item.proveedor;

      // Agregar fechas solo si tienen valor válido
      if (item.ultimaEntrada && item.ultimaEntrada !== '') {
        insertData.ultima_entrada = item.ultimaEntrada;
      }
      if (item.ultimaSalida && item.ultimaSalida !== '') {
        insertData.ultima_salida = item.ultimaSalida;
      }

      const { data, error } = await supabase
        .from(TABLES.INVENTORY)
        .insert([insertData])
        .select()
        .single();
      
      if (error) throw error;
      return { data: inventoryService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al crear artículo:', error);
      return { data: null, error };
    }
  },

  // Actualizar artículo
  async update(id, item) {
    try {
      // Preparar datos limpiando valores opcionales
      const updateData = {
        codigo: item.codigo,
        nombre: item.nombre,
        categoria: item.categoria,
        unidad: item.unidad,
      };

      // Agregar campos numéricos con valores predeterminados
      if (item.stockActual !== undefined && item.stockActual !== '') {
        updateData.stock_actual = Number(item.stockActual);
      }
      if (item.stockMinimo !== undefined && item.stockMinimo !== '') {
        updateData.stock_minimo = Number(item.stockMinimo);
      }
      if (item.stockMaximo !== undefined && item.stockMaximo !== '') {
        updateData.stock_maximo = Number(item.stockMaximo);
      }
      if (item.precioUnitario !== undefined && item.precioUnitario !== '') {
        updateData.precio_unitario = Number(item.precioUnitario);
      }

      // Agregar campos de texto opcionales
      if (item.ubicacion !== undefined) updateData.ubicacion = item.ubicacion || null;
      if (item.proveedor !== undefined) updateData.proveedor = item.proveedor || null;

      // Agregar fechas solo si tienen valor válido
      if (item.ultimaEntrada !== undefined) {
        updateData.ultima_entrada = item.ultimaEntrada || null;
      }
      if (item.ultimaSalida !== undefined) {
        updateData.ultima_salida = item.ultimaSalida || null;
      }

      const { data, error } = await supabase
        .from(TABLES.INVENTORY)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data: inventoryService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al actualizar artículo:', error);
      return { data: null, error };
    }
  },

  // Eliminar artículo
  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLES.INVENTORY)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
      return { error };
    }
  },

  // Transformar datos de DB a formato de app
  transformFromDB(item) {
    if (!item) return null;
    return {
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      categoria: item.categoria,
      stockActual: item.stock_actual,
      stockMinimo: item.stock_minimo,
      stockMaximo: item.stock_maximo,
      unidad: item.unidad,
      ubicacion: item.ubicacion,
      proveedor: item.proveedor,
      precioUnitario: item.precio_unitario,
      ultimaEntrada: item.ultima_entrada,
      ultimaSalida: item.ultima_salida,
    };
  },
};

// ==================== EQUIPMENT SERVICE ====================

export const equipmentService = {
  // Obtener todos los equipos
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.EQUIPMENT)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data.map(item => equipmentService.transformFromDB(item)), error: null };
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      return { data: null, error };
    }
  },

  // Crear nuevo equipo
  async create(equipment) {
    try {
      // Preparar datos limpiando valores opcionales
      const insertData = {
        codigo: equipment.codigo,
        nombre: equipment.nombre,
        tipo: equipment.tipo,
      };

      // Agregar campos opcionales solo si tienen valor
      if (equipment.marca) insertData.marca = equipment.marca;
      if (equipment.modelo) insertData.modelo = equipment.modelo;
      if (equipment.numeroSerie) insertData.numero_serie = equipment.numeroSerie;
      if (equipment.ubicacion) insertData.ubicacion = equipment.ubicacion;
      if (equipment.estado) insertData.estado = equipment.estado;
      if (equipment.criticidad) insertData.criticidad = equipment.criticidad;
      if (equipment.capacidad) insertData.capacidad = equipment.capacidad;

      // Agregar campos numéricos
      if (equipment.horasOperacion !== undefined && equipment.horasOperacion !== '') {
        insertData.horas_operacion = Number(equipment.horasOperacion);
      }

      // Agregar fechas solo si tienen valor válido
      if (equipment.fechaAdquisicion && equipment.fechaAdquisicion !== '') {
        insertData.fecha_adquisicion = equipment.fechaAdquisicion;
      }
      if (equipment.ultimoMantenimiento && equipment.ultimoMantenimiento !== '') {
        insertData.ultimo_mantenimiento = equipment.ultimoMantenimiento;
      }
      if (equipment.proximoMantenimiento && equipment.proximoMantenimiento !== '') {
        insertData.proximo_mantenimiento = equipment.proximoMantenimiento;
      }

      const { data, error } = await supabase
        .from(TABLES.EQUIPMENT)
        .insert([insertData])
        .select()
        .single();
      
      if (error) throw error;
      return { data: equipmentService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al crear equipo:', error);
      return { data: null, error };
    }
  },

  // Actualizar equipo
  async update(id, equipment) {
    try {
      // Preparar datos limpiando valores opcionales
      const updateData = {
        codigo: equipment.codigo,
        nombre: equipment.nombre,
        tipo: equipment.tipo,
      };

      // Agregar campos opcionales
      if (equipment.marca !== undefined) updateData.marca = equipment.marca || null;
      if (equipment.modelo !== undefined) updateData.modelo = equipment.modelo || null;
      if (equipment.numeroSerie !== undefined) updateData.numero_serie = equipment.numeroSerie || null;
      if (equipment.ubicacion !== undefined) updateData.ubicacion = equipment.ubicacion || null;
      if (equipment.estado !== undefined) updateData.estado = equipment.estado;
      if (equipment.criticidad !== undefined) updateData.criticidad = equipment.criticidad;
      if (equipment.capacidad !== undefined) updateData.capacidad = equipment.capacidad || null;

      // Agregar campos numéricos
      if (equipment.horasOperacion !== undefined && equipment.horasOperacion !== '') {
        updateData.horas_operacion = Number(equipment.horasOperacion);
      }

      // Agregar fechas
      if (equipment.fechaAdquisicion !== undefined) {
        updateData.fecha_adquisicion = equipment.fechaAdquisicion || null;
      }
      if (equipment.ultimoMantenimiento !== undefined) {
        updateData.ultimo_mantenimiento = equipment.ultimoMantenimiento || null;
      }
      if (equipment.proximoMantenimiento !== undefined) {
        updateData.proximo_mantenimiento = equipment.proximoMantenimiento || null;
      }

      const { data, error } = await supabase
        .from(TABLES.EQUIPMENT)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data: equipmentService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al actualizar equipo:', error);
      return { data: null, error };
    }
  },

  // Eliminar equipo
  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLES.EQUIPMENT)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error al eliminar equipo:', error);
      return { error };
    }
  },

  // Actualizar fechas de mantenimiento desde un mantenimiento completado
  async updateMaintenanceDates(equipmentId, lastDate, nextDate) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EQUIPMENT)
        .update({
          ultimo_mantenimiento: lastDate,
          proximo_mantenimiento: nextDate,
        })
        .eq('id', equipmentId)
        .select()
        .single();
      
      if (error) throw error;
      return { data: this.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al actualizar fechas de mantenimiento:', error);
      return { data: null, error };
    }
  },

  // Transformar datos de DB a formato de app
  transformFromDB(item) {
    if (!item) return null;
    return {
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      tipo: item.tipo,
      marca: item.marca,
      modelo: item.modelo,
      numeroSerie: item.numero_serie,
      ubicacion: item.ubicacion,
      fechaAdquisicion: item.fecha_adquisicion,
      estado: item.estado,
      criticidad: item.criticidad,
      ultimoMantenimiento: item.ultimo_mantenimiento,
      proximoMantenimiento: item.proximo_mantenimiento,
      horasOperacion: item.horas_operacion,
      capacidad: item.capacidad,
    };
  },
};

// ==================== OPERATOR SERVICE ====================

export const operatorService = {
  // Obtener todos los operadores
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.OPERATORS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data.map(item => operatorService.transformFromDB(item)), error: null };
    } catch (error) {
      console.error('Error al obtener operadores:', error);
      return { data: null, error };
    }
  },

  // Crear nuevo operador
  async create(operator) {
    try {
      const { data, error } = await supabase
        .from(TABLES.OPERATORS)
        .insert([{
          codigo: operator.codigo,
          nombre: operator.nombre,
          puesto: operator.puesto,
          turno: operator.turno,
          telefono: operator.telefono,
          email: operator.email,
          fecha_ingreso: operator.fechaIngreso,
          estado: operator.estado,
          certificaciones: operator.certificaciones,
          especialidad: operator.especialidad,
          mantenimientos_completados: operator.mantenimientosCompletados,
          eficiencia: operator.eficiencia,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { data: operatorService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al crear operador:', error);
      return { data: null, error };
    }
  },

  // Actualizar operador
  async update(id, operator) {
    try {
      const { data, error } = await supabase
        .from(TABLES.OPERATORS)
        .update({
          codigo: operator.codigo,
          nombre: operator.nombre,
          puesto: operator.puesto,
          turno: operator.turno,
          telefono: operator.telefono,
          email: operator.email,
          fecha_ingreso: operator.fechaIngreso,
          estado: operator.estado,
          certificaciones: operator.certificaciones,
          especialidad: operator.especialidad,
          mantenimientos_completados: operator.mantenimientosCompletados,
          eficiencia: operator.eficiencia,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data: operatorService.transformFromDB(data), error: null };
    } catch (error) {
      console.error('Error al actualizar operador:', error);
      return { data: null, error };
    }
  },

  // Eliminar operador
  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLES.OPERATORS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error al eliminar operador:', error);
      return { error };
    }
  },

  // Transformar datos de DB a formato de app
  transformFromDB(item) {
    if (!item) return null;
    return {
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      puesto: item.puesto,
      turno: item.turno,
      telefono: item.telefono,
      email: item.email,
      fechaIngreso: item.fecha_ingreso,
      estado: item.estado,
      certificaciones: item.certificaciones || [],
      especialidad: item.especialidad,
      mantenimientosCompletados: item.mantenimientos_completados || 0,
      eficiencia: item.eficiencia || 100,
    };
  },
};
