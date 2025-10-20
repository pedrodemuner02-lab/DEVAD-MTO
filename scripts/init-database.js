// Script para inicializar la base de datos SQLite
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'devad-mto.db');

// Crear directorio si no existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('Inicializando base de datos DEVAD-MTO...');
console.log('Ruta:', dbPath);

const db = new Database(dbPath);

// Habilitar modo WAL para mejor rendimiento
db.pragma('journal_mode = WAL');

// Crear tablas (SQL simplificado para el script)
const createTables = `
-- Usuarios
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
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tipos de mantenimiento
CREATE TABLE IF NOT EXISTS tipos_mantenimiento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  color TEXT DEFAULT '#3B82F6'
);

-- Equipos
CREATE TABLE IF NOT EXISTS equipos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  ubicacion TEXT,
  estado TEXT DEFAULT 'operativo',
  activo INTEGER DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventario
CREATE TABLE IF NOT EXISTS inventario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  stock_actual INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  precio_unitario REAL DEFAULT 0,
  activo INTEGER DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Configuración
CREATE TABLE IF NOT EXISTS configuracion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT,
  descripcion TEXT
);
`;

try {
  db.exec(createTables);
  console.log('✓ Tablas creadas correctamente');

  // Insertar datos iniciales
  const userCount = db.prepare('SELECT COUNT(*) as count FROM usuarios').get();
  
  if (userCount.count === 0) {
    console.log('Insertando datos iniciales...');

    // Usuarios
    db.prepare(`
      INSERT INTO usuarios (username, password, nombre, apellido, email, rol, turno)
      VALUES
        ('admin', 'admin123', 'Administrador', 'Sistema', 'admin@devad-mto.com', 'administrador', 'mixto'),
        ('jefe', 'jefe123', 'Carlos', 'Ramírez', 'jefe@devad-mto.com', 'jefe', 'mixto'),
        ('operador', 'operador123', 'Juan', 'Pérez', 'operador@devad-mto.com', 'operador', 'matutino'),
        ('operador2', 'operador123', 'María', 'González', 'operador2@devad-mto.com', 'operador', 'vespertino')
    `).run();
    console.log('✓ Usuarios creados');

    // Tipos de mantenimiento
    db.prepare(`
      INSERT INTO tipos_mantenimiento (nombre, descripcion, color)
      VALUES
        ('Preventivo', 'Mantenimiento programado', '#10B981'),
        ('Correctivo', 'Reparación de fallas', '#EF4444'),
        ('Predictivo', 'Basado en condición', '#3B82F6'),
        ('Lubricación', 'Lubricación y engrase', '#F59E0B')
    `).run();
    console.log('✓ Tipos de mantenimiento creados');

    // Equipos de ejemplo
    db.prepare(`
      INSERT INTO equipos (codigo, nombre, tipo, ubicacion, estado)
      VALUES
        ('EQ-001', 'Incubadora IPG-001', 'Incubadora', 'Sala A', 'operativo'),
        ('EQ-002', 'Compresor de Aire', 'Compresor', 'Sala de Máquinas', 'operativo'),
        ('EQ-003', 'Generador de Emergencia', 'Generador', 'Sala Eléctrica', 'operativo')
    `).run();
    console.log('✓ Equipos creados');

    // Inventario
    db.prepare(`
      INSERT INTO inventario (codigo, nombre, stock_actual, stock_minimo, precio_unitario)
      VALUES
        ('REP-001', 'Filtro de Aire HEPA', 15, 5, 450.00),
        ('REP-002', 'Aceite Lubricante SAE 40', 50, 20, 85.00),
        ('REP-003', 'Rodamiento 6205-2RS', 20, 8, 95.00)
    `).run();
    console.log('✓ Inventario creado');

    // Configuración
    db.prepare(`
      INSERT INTO configuracion (clave, valor, descripcion)
      VALUES
        ('empresa_nombre', 'DEVAD-MTO', 'Nombre de la empresa'),
        ('version', '1.0.0', 'Versión del sistema')
    `).run();
    console.log('✓ Configuración creada');

    console.log('\n✓ Base de datos inicializada correctamente\n');
  } else {
    console.log('✓ La base de datos ya contiene datos\n');
  }
} catch (error) {
  console.error('✗ Error al inicializar base de datos:', error);
  process.exit(1);
} finally {
  db.close();
}

console.log('Proceso completado');
console.log('Base de datos lista en:', dbPath);
