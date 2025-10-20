# 📁 Scripts SQL - DEVAD-MTO

Scripts SQL organizados para la configuración de la base de datos en Supabase.

## 🗂️ **Archivos Importantes**

### 1️⃣ **CREAR-TABLAS-TEMPLATES.sql** ⭐ **EJECUTAR PRIMERO**
- Crea las tablas para plantillas recurrentes de mantenimiento
- Tablas: `maintenance_templates` y `maintenance_instances`
- Incluye triggers y índices automáticos
- **Status:** Pendiente de ejecutar

### 2️⃣ **CREAR-TABLA-REQUISICIONES.sql**
- Crea la tabla de requisiciones de materiales
- Incluye campo JSONB para items
- **Status:** Ya ejecutado

### 3️⃣ **AGREGAR-TRIGGER-FOLIO-REQUISITIONS.sql**
- Genera folios automáticos (REQ-2025-001, REQ-2025-002, etc.)
- **Status:** Opcional (ya se genera desde el código)

### 4️⃣ **CREAR-USUARIOS-DEFINITIVO.sql**
- Script para crear usuarios administradores y jefes
- **Status:** Ejecutar según necesidad

### 5️⃣ **CREAR-ADMIN-USERS.sql**
- Alternativa para crear usuarios admin
- **Status:** Opcional

### 6️⃣ **INSERTAR-EQUIPOS-EJEMPLO.sql**
- Datos de ejemplo de equipos (Incubadora, Generador)
- **Status:** Ya ejecutado

---

## 🎯 **Orden de Ejecución Recomendado**

1. ✅ **CREAR-TABLA-REQUISICIONES.sql** (ya ejecutado)
2. ⏳ **CREAR-TABLAS-TEMPLATES.sql** (pendiente - IMPORTANTE)
3. ✅ **AGREGAR-TRIGGER-FOLIO-REQUISITIONS.sql** (opcional)
4. ✅ **INSERTAR-EQUIPOS-EJEMPLO.sql** (ya ejecutado)
5. 📝 **CREAR-USUARIOS-DEFINITIVO.sql** (según necesidad)

---

## 🚀 **Próximo Paso**

**Ejecutar CREAR-TABLAS-TEMPLATES.sql en Supabase SQL Editor** para habilitar las plantillas recurrentes de mantenimiento.

---

## 📝 **Notas**

- Los archivos temporales de verificación fueron eliminados
- Scripts organizados en carpeta `sql-scripts/`
- Fecha de organización: 16/10/2025
