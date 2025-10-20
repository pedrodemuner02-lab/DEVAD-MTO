// Servicio de base de datos SQLite para DEVAD-MTO
import Database from 'better-sqlite3';
import path from 'path';

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbPath = null;
  }

  initialize(dbPath) {
    try {
      this.dbPath = dbPath || path.join(process.cwd(), 'database', 'devad-mto.db');
      this.db = new Database(this.dbPath, { verbose: console.log });
      this.db.pragma('journal_mode = WAL');
      this.createTables();
      this.insertInitialData();
      console.log('Base de datos inicializada correctamente');
      return true;
    } catch (error) {
      console.error('Error al inicializar base de datos:', error);
      return false;
    }
  }

  createTables() {
    const tables = `
      -- Tabla de usuarios
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        email TEXT,
        rol TEXT NOT NULL CHECK(rol IN ('operador', 'jefe', 'administrador')),
        turno TEXT CHECK(turno IN ('matutino', 'vespertino', 'nocturno', 'mixto')),
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        ultimo_acceso DATETIME
      );

      -- Tabla de equipos
      CREATE TABLE IF NOT EXISTS equipos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        tipo TEXT NOT NULL,
        marca TEXT,
        modelo TEXT,
        numero_serie TEXT,
        fecha_adquisicion DATE,
        ubicacion TEXT,
        area TEXT,
        estado TEXT DEFAULT 'operativo' CHECK(estado IN ('operativo', 'mantenimiento', 'fuera_servicio', 'reparacion')),
        criticidad TEXT DEFAULT 'media' CHECK(criticidad IN ('baja', 'media', 'alta', 'critica')),
        descripcion TEXT,
        especificaciones TEXT,
        imagen_url TEXT,
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de tipos de mantenimiento
      CREATE TABLE IF NOT EXISTS tipos_mantenimiento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        descripcion TEXT,
        color TEXT DEFAULT '#3B82F6'
      );

      -- Tabla de mantenimientos
      CREATE TABLE IF NOT EXISTS mantenimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipo_id INTEGER NOT NULL,
        tipo_mantenimiento_id INTEGER NOT NULL,
        folio TEXT UNIQUE,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        prioridad TEXT DEFAULT 'media' CHECK(prioridad IN ('baja', 'media', 'alta', 'urgente')),
        estado TEXT DEFAULT 'programado' CHECK(estado IN ('programado', 'en_proceso', 'completado', 'cancelado', 'pendiente_aprobacion')),
        fecha_programada DATETIME NOT NULL,
        fecha_inicio DATETIME,
        fecha_finalizacion DATETIME,
        tiempo_estimado INTEGER,
        tiempo_real INTEGER,
        tecnico_asignado_id INTEGER,
        aprobado_por_id INTEGER,
        actividades_realizadas TEXT,
        observaciones TEXT,
        costo_estimado REAL DEFAULT 0,
        costo_real REAL DEFAULT 0,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipo_id) REFERENCES equipos (id),
        FOREIGN KEY (tipo_mantenimiento_id) REFERENCES tipos_mantenimiento (id),
        FOREIGN KEY (tecnico_asignado_id) REFERENCES usuarios (id),
        FOREIGN KEY (aprobado_por_id) REFERENCES usuarios (id)
      );

      -- Tabla de repuestos/inventario
      CREATE TABLE IF NOT EXISTS inventario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        categoria TEXT,
        unidad_medida TEXT DEFAULT 'pieza',
        stock_actual INTEGER DEFAULT 0,
        stock_minimo INTEGER DEFAULT 0,
        stock_maximo INTEGER DEFAULT 100,
        ubicacion_almacen TEXT,
        precio_unitario REAL DEFAULT 0,
        proveedor TEXT,
        imagen_url TEXT,
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de movimientos de inventario
      CREATE TABLE IF NOT EXISTS movimientos_inventario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inventario_id INTEGER NOT NULL,
        tipo_movimiento TEXT NOT NULL CHECK(tipo_movimiento IN ('entrada', 'salida', 'ajuste', 'transferencia')),
        cantidad INTEGER NOT NULL,
        stock_anterior INTEGER NOT NULL,
        stock_nuevo INTEGER NOT NULL,
        costo_unitario REAL DEFAULT 0,
        costo_total REAL DEFAULT 0,
        motivo TEXT,
        mantenimiento_id INTEGER,
        usuario_id INTEGER NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inventario_id) REFERENCES inventario (id),
        FOREIGN KEY (mantenimiento_id) REFERENCES mantenimientos (id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      );

      -- Tabla de repuestos utilizados en mantenimientos
      CREATE TABLE IF NOT EXISTS mantenimiento_repuestos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mantenimiento_id INTEGER NOT NULL,
        inventario_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        costo_unitario REAL DEFAULT 0,
        costo_total REAL DEFAULT 0,
        FOREIGN KEY (mantenimiento_id) REFERENCES mantenimientos (id),
        FOREIGN KEY (inventario_id) REFERENCES inventario (id)
      );

      -- Tabla de requisiciones de compra
      CREATE TABLE IF NOT EXISTS requisiciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folio TEXT UNIQUE NOT NULL,
        solicitante_id INTEGER NOT NULL,
        departamento TEXT,
        fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_requerida DATE,
        justificacion TEXT,
        estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'aprobada', 'rechazada', 'en_proceso', 'completada', 'cancelada')),
        prioridad TEXT DEFAULT 'normal' CHECK(prioridad IN ('baja', 'normal', 'alta', 'urgente')),
        aprobado_por_id INTEGER,
        fecha_aprobacion DATETIME,
        comentarios_aprobacion TEXT,
        total_estimado REAL DEFAULT 0,
        FOREIGN KEY (solicitante_id) REFERENCES usuarios (id),
        FOREIGN KEY (aprobado_por_id) REFERENCES usuarios (id)
      );

      -- Tabla de items de requisiciones
      CREATE TABLE IF NOT EXISTS requisicion_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requisicion_id INTEGER NOT NULL,
        inventario_id INTEGER,
        descripcion TEXT NOT NULL,
        cantidad INTEGER NOT NULL,
        unidad_medida TEXT DEFAULT 'pieza',
        precio_estimado REAL DEFAULT 0,
        proveedor_sugerido TEXT,
        FOREIGN KEY (requisicion_id) REFERENCES requisiciones (id),
        FOREIGN KEY (inventario_id) REFERENCES inventario (id)
      );

      -- Tabla de actividades por turno
      CREATE TABLE IF NOT EXISTS actividades_turno (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operador_id INTEGER NOT NULL,
        turno TEXT NOT NULL CHECK(turno IN ('matutino', 'vespertino', 'nocturno')),
        fecha DATE NOT NULL,
        hora_inicio TIME,
        hora_fin TIME,
        actividad TEXT NOT NULL,
        equipo_id INTEGER,
        observaciones TEXT,
        completada INTEGER DEFAULT 0,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (operador_id) REFERENCES usuarios (id),
        FOREIGN KEY (equipo_id) REFERENCES equipos (id)
      );

      -- Tabla de fallas/incidencias
      CREATE TABLE IF NOT EXISTS fallas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipo_id INTEGER NOT NULL,
        reportado_por_id INTEGER NOT NULL,
        fecha_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,
        descripcion TEXT NOT NULL,
        severidad TEXT DEFAULT 'media' CHECK(severidad IN ('baja', 'media', 'alta', 'critica')),
        estado TEXT DEFAULT 'reportada' CHECK(estado IN ('reportada', 'en_revision', 'asignada', 'en_reparacion', 'resuelta', 'cerrada')),
        mantenimiento_id INTEGER,
        fecha_resolucion DATETIME,
        solucion TEXT,
        FOREIGN KEY (equipo_id) REFERENCES equipos (id),
        FOREIGN KEY (reportado_por_id) REFERENCES usuarios (id),
        FOREIGN KEY (mantenimiento_id) REFERENCES mantenimientos (id)
      );

      -- Tabla de configuración del sistema
      CREATE TABLE IF NOT EXISTS configuracion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clave TEXT UNIQUE NOT NULL,
        valor TEXT,
        descripcion TEXT,
        tipo TEXT DEFAULT 'text',
        fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de logs/auditoría
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        accion TEXT NOT NULL,
        modulo TEXT NOT NULL,
        detalles TEXT,
        ip_address TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      );

      -- Índices para mejorar rendimiento
      CREATE INDEX IF NOT EXISTS idx_mantenimientos_equipo ON mantenimientos(equipo_id);
      CREATE INDEX IF NOT EXISTS idx_mantenimientos_fecha ON mantenimientos(fecha_programada);
      CREATE INDEX IF NOT EXISTS idx_mantenimientos_estado ON mantenimientos(estado);
      CREATE INDEX IF NOT EXISTS idx_inventario_codigo ON inventario(codigo);
      CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_inventario(fecha);
      CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
      CREATE INDEX IF NOT EXISTS idx_fallas_equipo ON fallas(equipo_id);
      CREATE INDEX IF NOT EXISTS idx_fallas_estado ON fallas(estado);
      CREATE INDEX IF NOT EXISTS idx_actividades_fecha ON actividades_turno(fecha);
    `;

    this.db.exec(tables);
  }

  insertInitialData() {
    // Verificar si ya hay datos
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM usuarios').get();
    if (userCount.count > 0) return;

    const insertData = this.db.transaction(() => {
      // Usuarios iniciales (contraseñas: hash simple para demo, usar bcrypt en producción)
      this.db.prepare(`
        INSERT INTO usuarios (username, password, nombre, apellido, email, rol, turno)
        VALUES
          ('admin', 'admin123', 'Administrador', 'Sistema', 'admin@devad-mto.com', 'administrador', 'mixto'),
          ('jefe', 'jefe123', 'Carlos', 'Ramírez', 'jefe@devad-mto.com', 'jefe', 'mixto'),
          ('operador', 'operador123', 'Juan', 'Pérez', 'operador@devad-mto.com', 'operador', 'matutino'),
          ('operador2', 'operador123', 'María', 'González', 'operador2@devad-mto.com', 'operador', 'vespertino')
      `).run();

      // Tipos de mantenimiento
      this.db.prepare(`
        INSERT INTO tipos_mantenimiento (nombre, descripcion, color)
        VALUES
          ('Preventivo', 'Mantenimiento programado para prevenir fallas', '#10B981'),
          ('Correctivo', 'Reparación de equipos con fallas', '#EF4444'),
          ('Predictivo', 'Mantenimiento basado en condición del equipo', '#3B82F6'),
          ('Lubricación', 'Lubricación y engrase de componentes', '#F59E0B'),
          ('Inspección', 'Inspección visual y funcional', '#8B5CF6'),
          ('Calibración', 'Calibración de instrumentos', '#EC4899')
      `).run();

      // Equipos de ejemplo
      this.db.prepare(`
        INSERT INTO equipos (codigo, nombre, tipo, marca, modelo, ubicacion, area, estado, criticidad)
        VALUES
          ('EQ-001', 'Incubadora Industrial IPG-001', 'Incubadora', 'IPG', 'Premium 5000', 'Sala A', 'Producción', 'operativo', 'critica'),
          ('EQ-002', 'Incubadora Industrial IPG-002', 'Incubadora', 'IPG', 'Standard 3000', 'Sala B', 'Producción', 'operativo', 'alta'),
          ('EQ-003', 'Máquina Lavadora Industrial', 'Lavadora', 'Industrial', 'ML-50L', 'Lavandería', 'Limpieza', 'operativo', 'media'),
          ('EQ-004', 'Generador de Emergencia', 'Generador', 'Caterpillar', 'DE50E3', 'Sala Eléctrica', 'Energía', 'operativo', 'critica'),
          ('EQ-005', 'Compresor de Aire', 'Compresor', 'Atlas Copco', 'GA-30', 'Sala de Máquinas', 'Neumática', 'mantenimiento', 'alta'),
          ('EQ-006', 'Bomba de Agua Principal', 'Bomba', 'Grundfos', 'CR-45', 'Cuarto de Bombas', 'Hidráulica', 'operativo', 'critica')
      `).run();

      // Inventario inicial
      this.db.prepare(`
        INSERT INTO inventario (codigo, nombre, descripcion, categoria, unidad_medida, stock_actual, stock_minimo, precio_unitario)
        VALUES
          ('REP-001', 'Filtro de Aire HEPA', 'Filtro de alta eficiencia para incubadoras', 'Filtros', 'pieza', 15, 5, 450.00),
          ('REP-002', 'Termostato Digital', 'Termostato para control de temperatura', 'Componentes Eléctricos', 'pieza', 8, 3, 850.00),
          ('REP-003', 'Resistencia Eléctrica 220V', 'Resistencia calefactora 1500W', 'Componentes Eléctricos', 'pieza', 12, 4, 320.00),
          ('REP-004', 'Aceite Lubricante SAE 40', 'Aceite para maquinaria industrial', 'Lubricantes', 'litro', 50, 20, 85.00),
          ('REP-005', 'Grasa Industrial EP2', 'Grasa para rodamientos', 'Lubricantes', 'kg', 30, 10, 120.00),
          ('REP-006', 'Rodamiento 6205-2RS', 'Rodamiento sellado', 'Rodamientos', 'pieza', 20, 8, 95.00),
          ('REP-007', 'Correa Tipo A 42"', 'Correa en V para transmisión', 'Transmisión', 'pieza', 10, 4, 180.00),
          ('REP-008', 'Sensor de Temperatura PT100', 'Sensor de temperatura', 'Sensores', 'pieza', 6, 2, 650.00),
          ('REP-009', 'Válvula Solenoide 1/2"', 'Válvula electromagnética', 'Válvulas', 'pieza', 5, 2, 420.00),
          ('REP-010', 'Filtro de Combustible', 'Filtro para generador', 'Filtros', 'pieza', 12, 4, 280.00)
      `).run();

      // Configuración inicial
      this.db.prepare(`
        INSERT INTO configuracion (clave, valor, descripcion, tipo)
        VALUES
          ('empresa_nombre', 'DEVAD-MTO', 'Nombre de la empresa', 'text'),
          ('empresa_direccion', '', 'Dirección de la empresa', 'text'),
          ('empresa_telefono', '', 'Teléfono de contacto', 'text'),
          ('dias_alerta_mantenimiento', '7', 'Días de anticipación para alertas', 'number'),
          ('folio_mantenimiento_prefix', 'MTO', 'Prefijo para folios de mantenimiento', 'text'),
          ('folio_requisicion_prefix', 'REQ', 'Prefijo para folios de requisiciones', 'text'),
          ('backup_automatico', '1', 'Activar backup automático', 'boolean'),
          ('backup_frecuencia_dias', '7', 'Frecuencia de backup en días', 'number')
      `).run();
    });

    insertData();
    console.log('Datos iniciales insertados correctamente');
  }

  // Métodos auxiliares
  prepare(sql) {
    return this.db.prepare(sql);
  }

  exec(sql) {
    return this.db.exec(sql);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Exportar instancia singleton
const dbService = new DatabaseService();
export default dbService;
