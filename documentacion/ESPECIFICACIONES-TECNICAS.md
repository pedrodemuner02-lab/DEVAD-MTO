# ESPECIFICACIONES TÉCNICAS DEL SISTEMA DEVAD-MTO

## Información General del Sistema

**Nombre del Sistema:** DEVAD-MTO  
**Versión:** 1.0.0  
**Tipo:** Sistema de Gestión de Mantenimiento (GMAO/CMMS)  
**Plataforma:** Web Application  
**Arquitectura:** Cliente-Servidor  

## Arquitectura del Sistema

### Modelo de Capas

```
┌─────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN            │
│   (React + Tailwind CSS + Vite)         │
│  - Interfaz de Usuario                  │
│  - Componentes Reutilizables            │
│  - Navegación (React Router)            │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         CAPA DE LÓGICA DE NEGOCIO       │
│   (Services + Context API)              │
│  - maintenanceService.js                │
│  - assignmentService.js                 │
│  - instanceGenerator.js                 │
│  - authService.js                       │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         CAPA DE DATOS                   │
│   (Supabase PostgreSQL)                 │
│  - Base de Datos Relacional             │
│  - Row Level Security (RLS)             │
│  - API REST Automática                  │
└─────────────────────────────────────────┘
```

## Stack Tecnológico

### Frontend

#### Framework Principal
- **React 18.2.0**
  - Biblioteca para interfaces de usuario
  - Virtual DOM para rendimiento
  - Componentes funcionales con Hooks
  - Context API para estado global

#### Build Tool
- **Vite 5.4.20**
  - Bundler moderno y rápido
  - Hot Module Replacement (HMR)
  - Optimización de producción
  - Soporte para ES modules

#### Estilos
- **Tailwind CSS 3.4.17**
  - Framework CSS utility-first
  - Diseño responsive
  - Componentes personalizados
  - Modo oscuro (preparado)

#### Navegación
- **React Router DOM 7.1.1**
  - Enrutamiento del lado del cliente
  - Navegación declarativa
  - Rutas protegidas
  - Lazy loading de componentes

#### Iconografía
- **Lucide React 0.469.0**
  - Iconos modernos y consistentes
  - Tree-shakeable
  - Personalizable

### Backend

#### Base de Datos
- **Supabase PostgreSQL**
  - Base de datos relacional
  - ACID compliant
  - Tipos de datos avanzados (JSONB)
  - Funciones y triggers

#### Características de Supabase
- **Autenticación integrada**
  - Sistema personalizado de usuarios
  - Sesiones seguras
  - Row Level Security

- **API REST automática**
  - Generada automáticamente desde el esquema
  - Filtros y ordenamiento
  - Paginación

- **Realtime** (preparado para futuro)
  - Subscripciones a cambios
  - Notificaciones en tiempo real

## Estructura de la Base de Datos

### Tablas Principales

#### 1. auth_users
Almacena información de usuarios del sistema.

```sql
CREATE TABLE auth_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    puesto VARCHAR(100),
    rol VARCHAR(50) DEFAULT 'operador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único
- `username`: Nombre de usuario (email)
- `password_hash`: Contraseña hasheada
- `full_name`: Nombre completo
- `puesto`: Cargo/puesto
- `rol`: Rol en el sistema (admin, jefe, operador)

#### 2. equipment
Catálogo de equipos industriales.

```sql
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    familia VARCHAR(100),
    ubicacion VARCHAR(255),
    modelo VARCHAR(100),
    fabricante VARCHAR(100),
    fecha_instalacion DATE,
    estado VARCHAR(50) DEFAULT 'operativo',
    criticidad VARCHAR(20) DEFAULT 'media',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos clave:**
- `codigo`: Código único del equipo
- `familia`: Clasificación por tipo (incubadora, nacedora, etc.)
- `criticidad`: baja, media, alta, crítica
- `estado`: operativo, en mantenimiento, fuera de servicio

#### 3. operators
Operadores por turno.

```sql
CREATE TABLE operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    turno VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Turnos disponibles:**
- Mañana (6:00 - 14:00)
- Intermedio (14:00 - 18:00)
- Tarde (18:00 - 22:00)
- Noche (22:00 - 6:00)

#### 4. maintenance (Tabla Híbrida)
Almacena tanto plantillas como instancias de mantenimiento.

```sql
CREATE TABLE maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    es_plantilla BOOLEAN DEFAULT false,
    
    -- Campos comunes
    equipment_id UUID REFERENCES equipment(id),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50),
    complejidad VARCHAR(20) DEFAULT 'media',
    estado VARCHAR(50) DEFAULT 'programado',
    prioridad INTEGER DEFAULT 3,
    
    -- Campos para instancias
    fecha_programada DATE,
    fecha_inicio TIMESTAMP,
    fecha_completado TIMESTAMP,
    operador_asignado_id UUID REFERENCES operators(id),
    realizado_por VARCHAR(255),
    
    -- Campos para plantillas recurrentes
    frecuencia VARCHAR(50),
    dias_semana JSONB,
    hora_preferida TIME,
    duracion_estimada INTEGER,
    
    -- Relación plantilla-instancia
    plantilla_id UUID REFERENCES maintenance(id),
    
    -- Campos adicionales
    observaciones TEXT,
    repuestos_usados JSONB,
    costo_total DECIMAL(10,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tipos de mantenimiento:**
- preventivo
- correctivo
- predictivo
- mejora

**Complejidad:**
- baja: 1 punto de carga
- media: 2 puntos de carga
- alta: 3 puntos de carga

**Estados:**
- programado
- en_proceso
- completado
- cancelado

#### 5. inventory
Control de inventario de partes y refacciones.

```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    unidad VARCHAR(50),
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    stock_maximo INTEGER,
    ubicacion_almacen VARCHAR(100),
    costo_unitario DECIMAL(10,2),
    proveedor VARCHAR(255),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Alertas automáticas:**
- Cuando `stock_actual <= stock_minimo` se genera alerta

#### 6. requisitions
Solicitudes de materiales.

```sql
CREATE TABLE requisitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folio VARCHAR(50) UNIQUE NOT NULL,
    solicitante_id UUID REFERENCES auth_users(id),
    fecha_solicitud DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(50) DEFAULT 'pendiente',
    items JSONB,
    prioridad VARCHAR(20) DEFAULT 'normal',
    justificacion TEXT,
    aprobado_por UUID REFERENCES auth_users(id),
    fecha_aprobacion TIMESTAMP,
    notas_aprobacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Estados:**
- pendiente
- aprobado
- rechazado
- completado

## Módulos del Sistema

### 1. Dashboard
**Archivo:** `src/pages/Dashboard.jsx`

**Funcionalidades:**
- Resumen de mantenimientos pendientes
- Estadísticas generales
- Alertas de inventario bajo
- Gráficas de cumplimiento (futuro)

### 2. Gestión de Mantenimiento
**Archivo:** `src/pages/MaintenancePage.jsx`

**Funcionalidades:**
- Lista de mantenimientos (instancias)
- Crear mantenimiento único
- Editar mantenimiento
- Cambiar estado
- Asignar operador
- Ver historial

### 3. Plantillas Recurrentes
**Archivo:** `src/pages/RecurringTemplatesPage.jsx`

**Funcionalidades:**
- Crear plantillas recurrentes
- Configurar días de la semana
- Establecer frecuencia
- Generar instancias automáticamente (4 semanas)
- Editar plantillas
- Eliminar plantillas

### 4. Gestión de Equipos
**Archivo:** `src/pages/EquipmentPage.jsx`

**Funcionalidades:**
- Catálogo de equipos
- Agregar nuevo equipo
- Editar información
- Ver historial de mantenimientos
- Clasificación por familia
- Indicadores de criticidad

### 5. Gestión de Operadores
**Archivo:** `src/pages/OperatorsPage.jsx`

**Funcionalidades:**
- Lista de operadores
- Agregar operador
- Asignar turno
- Activar/desactivar
- Ver carga de trabajo

### 6. Inventario
**Archivo:** `src/pages/InventoryPage.jsx`

**Funcionalidades:**
- Catálogo de partes
- Control de stock
- Alertas de stock mínimo
- Registro de movimientos
- Búsqueda y filtrado

### 7. Requisiciones
**Archivo:** `src/pages/RequisitionsPage.jsx`

**Funcionalidades:**
- Crear requisición
- Aprobar/rechazar
- Seguimiento de estado
- Historial de requisiciones

## Servicios (Business Logic)

### maintenanceService.js
Gestión de operaciones de mantenimiento.

**Funciones principales:**
- `getAllMaintenance()`: Obtener todos los mantenimientos
- `getMaintenanceById(id)`: Obtener por ID
- `createMaintenance(data)`: Crear nuevo
- `updateMaintenance(id, data)`: Actualizar
- `deleteMaintenance(id)`: Eliminar
- `changeMaintenanceStatus(id, status)`: Cambiar estado

### instanceGenerator.js
Generación automática de instancias desde plantillas.

**Funciones principales:**
- `generateInstances(templateId, weeks)`: Generar instancias
- `calculateNextDates(diasSemana, weeks)`: Calcular fechas
- `createInstanceFromTemplate(template, date)`: Crear instancia

**Lógica:**
1. Lee plantilla recurrente
2. Calcula fechas según días de la semana configurados
3. Crea instancias para las próximas N semanas
4. Asigna automáticamente operadores

### assignmentService.js
Asignación inteligente de operadores.

**Funciones principales:**
- `assignOperator(maintenanceData)`: Asignar operador
- `calculateOperatorLoad(operatorId, date)`: Calcular carga
- `getOperatorsByShift(shift)`: Obtener operadores por turno
- `balanceWorkload()`: Balancear carga

**Algoritmo de asignación:**
1. Determina turno según horario
2. Obtiene operadores activos del turno
3. Calcula carga actual de cada operador
4. Asigna al operador con menor carga
5. Considera complejidad de la tarea (1-3 puntos)

### authService.js
Gestión de autenticación y sesiones.

**Funciones principales:**
- `login(username, password)`: Iniciar sesión
- `logout()`: Cerrar sesión
- `getCurrentUser()`: Obtener usuario actual
- `checkAuth()`: Verificar autenticación

## Flujos de Trabajo Principales

### Flujo 1: Crear Plantilla Recurrente

```
1. Usuario accede a "Plantillas Recurrentes"
2. Click en "Nueva Plantilla"
3. Completa formulario:
   - Selecciona equipo
   - Define título y descripción
   - Establece complejidad
   - Selecciona días de la semana
   - Define frecuencia
   - Establece hora preferida
4. Guarda plantilla (es_plantilla=true)
5. Sistema genera automáticamente instancias para 4 semanas
6. Cada instancia se asigna a un operador
```

### Flujo 2: Ejecutar Mantenimiento

```
1. Operador inicia sesión
2. Ve sus mantenimientos asignados
3. Selecciona uno programado
4. Cambia estado a "En Proceso"
5. Ejecuta tareas del checklist
6. Registra observaciones
7. Registra repuestos usados (si aplica)
8. Cambia estado a "Completado"
9. Sistema actualiza historial del equipo
```

### Flujo 3: Solicitar Refacciones

```
1. Usuario detecta stock bajo
2. Crea nueva requisición
3. Agrega items necesarios
4. Justifica la solicitud
5. Envía requisición
6. Jefe de mantenimiento recibe notificación
7. Revisa y aprueba/rechaza
8. Si aprobado: se procede con compra
9. Al recibir: se actualiza inventario
```

## Seguridad

### Autenticación
- Contraseñas hasheadas con bcrypt
- Sesiones seguras con tokens
- Logout automático por inactividad (futuro)

### Autorización
- Control basado en roles (admin, jefe, operador)
- Row Level Security en Supabase
- Políticas por tabla

### Roles y Permisos

#### Administrador
- Acceso total al sistema
- Gestión de usuarios
- Configuración del sistema

#### Jefe de Mantenimiento
- Crear/editar plantillas
- Aprobar requisiciones
- Ver todos los reportes
- Asignar/reasignar operadores

#### Operador
- Ver sus mantenimientos asignados
- Actualizar estado de sus tareas
- Registrar observaciones
- Solicitar requisiciones

## Deployment

### Requisitos del Servidor
- Node.js 18+
- npm o pnpm
- Conexión a Supabase

### Variables de Entorno
```env
VITE_SUPABASE_URL=https://[proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=[tu-anon-key]
```

### Build para Producción
```bash
npm run build
```

Genera archivos optimizados en `/dist`

### Configuración de Red Local
El sistema se despliega en la red local de la planta, accesible desde cualquier dispositivo conectado a la red mediante la IP del servidor.

## Escalabilidad y Mantenibilidad

### Modularidad
- Componentes independientes
- Servicios desacoplados
- Fácil agregar nuevos módulos

### Código Mantenible
- Nombres descriptivos
- Comentarios donde necesario
- Estructura consistente
- Separación de concerns

### Performance
- Lazy loading de componentes
- Paginación en listas largas
- Índices en base de datos
- Caché del navegador

## Roadmap Técnico

### Fase 2
- [ ] Reportes con Chart.js
- [ ] Exportación a Excel/PDF
- [ ] Notificaciones push
- [ ] App móvil (PWA)

### Fase 3
- [ ] Análisis predictivo
- [ ] Integración IoT
- [ ] Machine Learning
- [ ] App nativa (React Native)

---

**Documento técnico del sistema:** DEVAD-MTO v1.0.0  
**Arquitectura:** React + Supabase  
**Fecha:** Enero 2026
