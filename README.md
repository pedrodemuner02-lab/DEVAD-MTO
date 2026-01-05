# 🔧 DEVAD-MTO - Sistema de Mantenimiento Industrial

Sistema integral de gestión de mantenimiento preventivo, correctivo y predictivo para equipos industriales.

## 📋 Características Principales

### ✅ Módulos Implementados

- **🔧 Gestión de Mantenimiento**
  - Mantenimientos únicos y recurrentes
  - Asignación automática inteligente por turnos
  - Balanceo de carga de trabajo
  - Estados: Programado, En Proceso, Completado, Cancelado

- **🔄 Plantillas Recurrentes**
  - Generación automática de instancias
  - Configuración por días de la semana
  - Frecuencia semanal/mensual personalizable
  - Visualización de días con badges (L M X J V S D)

- **📦 Gestión de Equipos**
  - Catálogo completo de equipos industriales
  - Código único por equipo
  - Historial de mantenimientos

- **👥 Gestión de Operadores**
  - Asignación por turnos (Mañana, Intermedio, Tarde, Noche)
  - Niveles de complejidad (Baja: 1 punto, Media: 2 puntos, Alta: 3 puntos)
  - Distribución equitativa de carga

- **📊 Sistema de Inventario**
  - Control de partes y refacciones
  - Stock mínimo y alertas
  - Seguimiento de consumo

- **🛒 Requisiciones**
  - Solicitud de materiales
  - Estados: Pendiente, Aprobado, Rechazado, Completado

## 🏗️ Arquitectura Técnica

### **Frontend**
- ⚛️ React 18.2.0 + Vite 5.4.20
- 🎨 Tailwind CSS para estilos
- 🔄 React Router DOM para navegación
- 🎯 Lucide React para iconos

### **Backend**
- 🗄️ Supabase PostgreSQL
- 🔐 Autenticación personalizada
- 🔒 Row Level Security (RLS)

### **Base de Datos**
```
📁 ESTRUCTURA HÍBRIDA OPTIMIZADA
├── auth_users (Usuarios y sesiones)
├── equipment (Equipos industriales)
├── operators (Operadores por turno)
├── maintenance (Tabla híbrida: plantillas + instancias)
│   ├── es_plantilla = true  → Plantilla recurrente
│   └── es_plantilla = false → Instancia de mantenimiento
├── inventory (Inventario de partes)
└── requisitions (Requisiciones de materiales)
```

## 🚀 Instalación y Configuración

### **Requisitos Previos**
- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase

### **1. Clonar Repositorio**
```bash
git clone https://github.com/TU_USUARIO/DEVAD-MTO.git
cd DEVAD-MTO-APP
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Configurar Variables de Entorno**
Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://nhtyyfniqjkzzkswupgf.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### **4. Ejecutar Scripts SQL**
Ejecuta los siguientes archivos en Supabase SQL Editor (en orden):

```sql
-- 1. Estructura base de datos
sql-scripts/REDISEÑO-MANTENIMIENTO-HIBRIDO.sql

-- 2. Columnas de recurrencia
sql-scripts/AGREGAR-COLUMNAS-RECURRENCIA.sql

-- 3. Datos de ejemplo (opcional)
sql-scripts/INSERTAR-EQUIPOS-EJEMPLO.sql
```

### **5. Iniciar Servidor de Desarrollo**
```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 👤 Credenciales de Acceso

**Administrador:**
- Usuario: `admin.mto@devad.com`
- Contraseña: `admin123`
- Puesto: Administrador del Sistema

**Jefe de Mantenimiento:**
- Usuario: `jefe.mto@devad.com`
- Contraseña: `jefe123`
- Puesto: Jefe de Mantenimiento

## 📁 Estructura del Proyecto

```
DEVAD-MTO-APP/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout principal y navegación
│   │   ├── maintenance/     # Componentes de mantenimiento
│   │   ├── modals/          # Modales reutilizables
│   │   └── ui/              # Componentes UI (Toast, etc.)
│   ├── contexts/
│   │   └── AuthContext.jsx  # Contexto de autenticación
│   ├── lib/
│   │   └── supabase.js      # Cliente Supabase
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── MaintenancePage.jsx
│   │   ├── RecurringTemplatesPage.jsx
│   │   ├── EquipmentPage.jsx
│   │   ├── OperatorsPage.jsx
│   │   ├── InventoryPage.jsx
│   │   └── RequisitionsPage.jsx
│   ├── services/
│   │   ├── maintenanceService.js
│   │   ├── instanceGenerator.js       # Generador de instancias recurrentes
│   │   ├── assignmentService.js       # Asignación automática inteligente
│   │   ├── authService.js
│   │   └── databaseService.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── sql-scripts/              # Scripts SQL para Supabase
├── textos/                   # Documentación técnica
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🔄 Sistema de Plantillas Recurrentes

### **Características**
- ✅ Generación automática de instancias
- ✅ Configuración por días de la semana
- ✅ Asignación automática de operadores
- ✅ Balanceo de carga entre turnos
- ✅ Visualización con badges de días

### **Flujo de Trabajo**
1. Crear plantilla recurrente (es_plantilla=true)
2. Sistema genera instancias para próximas 4 semanas
3. Cada instancia se asigna automáticamente a un operador
4. Operadores reciben trabajo balanceado según complejidad

### **Ejemplo de Uso**
```javascript
// En RecurringTemplatesPage.jsx
const handleGenerarInstancias = async (templateId) => {
  const instanceGenerator = await import('../services/instanceGenerator');
  const resultado = await instanceGenerator.default.generateInstances(templateId, 4);
  // Genera instancias para próximas 4 semanas
};
```

## 🤖 Asignación Automática Inteligente

El sistema distribuye automáticamente el trabajo considerando:

- **Complejidad del Trabajo**
  - 🟢 Baja: 1 punto
  - 🟡 Media: 2 puntos
  - 🔴 Alta: 3 puntos

- **Turnos**
  - 🌅 Mañana (6:00 - 14:00)
  - ☀️ Intermedio (14:00 - 18:00)
  - 🌆 Tarde (18:00 - 22:00)
  - 🌙 Noche (22:00 - 6:00)

- **Balanceo de Carga**
  - Distribuye equitativamente entre operadores
  - Considera carga actual de cada turno
  - Prioriza según urgencia

## 📊 Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 18.2.0 | Framework Frontend |
| Vite | 5.4.20 | Build Tool |
| Tailwind CSS | 3.4.17 | Estilos |
| Supabase | Latest | Backend y Base de Datos |
| Lucide React | 0.469.0 | Iconos |
| React Router DOM | 7.1.1 | Navegación |

## 🐛 Solución de Problemas

### **Error: dias_semana.map is not a function**
**Solución:** Ya corregido en `RecurringTemplatesPage.jsx` y `instanceGenerator.js` con conversión JSONB → Array.

### **Error: Export default duplicado**
**Solución:** Ya corregido en `assignmentService.js`.

### **Error: Tabla maintenance_templates no existe**
**Solución:** Sistema híbrido implementado usando columna `es_plantilla` en tabla `maintenance`.

## 📝 Documentación Adicional

### Documentación Técnica del Sistema
- 📄 [SISTEMA-RECURRENTE-LISTO.md](textos/SISTEMA-RECURRENTE-LISTO.md) - Guía rápida de plantillas
- 📄 [ESPECIFICACION-PLANTILLAS-RECURRENTES.md](textos/ESPECIFICACION-PLANTILLAS-RECURRENTES.md) - Especificación completa
- 📄 [FIX-JSONB-DIAS-SEMANA.md](FIX-JSONB-DIAS-SEMANA.md) - Solución de error JSONB
- 📄 [ANALISIS-ARCHIVOS-TEST.md](ANALISIS-ARCHIVOS-TEST.md) - Análisis de archivos de prueba

### Documentación Académica
- 📚 [docs/](docs/) - Documentación académica y referencias bibliográficas
- 📄 [2.3. Gestión de Mantenimiento en la Industria Avícola](docs/2.3-GESTION-MANTENIMIENTO-INDUSTRIA-AVICOLA.md) - Historia, fundamentos y referencias APA

## 🚧 Roadmap

### **Fase Actual - ✅ Completada**
- [x] Sistema híbrido de mantenimiento
- [x] Plantillas recurrentes con generación automática
- [x] Asignación automática inteligente
- [x] Gestión de equipos, operadores e inventario
- [x] Requisiciones básicas

### **Fase 2 - 🚧 En Desarrollo**
- [ ] Requisiciones con items JSONB
- [ ] Reportes con gráficas (Chart.js)
- [ ] Interfaz móvil responsive
- [ ] Notificaciones en tiempo real
- [ ] Exportación a Excel/PDF

### **Fase 3 - 📋 Planificada**
- [ ] Análisis predictivo con IA
- [ ] Integración con sensores IoT
- [ ] App móvil nativa (React Native)
- [ ] Sistema de roles y permisos avanzado
- [ ] Historial completo de cambios (audit log)

## 👥 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario del Instituto Tecnológico Superior de Huatusco.

## 👨‍💻 Autor

**Pedro** - Desarrollador Principal
- Instituto Tecnológico Superior de Huatusco
- Proyecto: Sistema de Mantenimiento Industrial DEVAD-MTO

## 🙏 Agradecimientos

- Instituto Tecnológico Superior de Huatusco
- Supabase por la infraestructura backend
- Comunidad de React y Vite

---

**Versión:** 1.0.0 - Sistema de Plantillas Recurrentes Implementado
**Última Actualización:** Octubre 2025
