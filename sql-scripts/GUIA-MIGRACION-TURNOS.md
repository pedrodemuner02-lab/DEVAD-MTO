# 🔄 GUÍA DE MIGRACIÓN A SISTEMA POR TURNOS

## 📋 RESUMEN

El nuevo sistema elimina la gestión individual de operadores y los reemplaza por **4 turnos fijos**:
- 🌞 **Matutino** (6:00 - 14:00)
- 🌅 **Vespertino** (14:00 - 22:00)  
- 🌙 **Nocturno** (22:00 - 6:00)
- ☁️ **Intermedio** (10:00 - 18:00)

---

## ⚠️ ANTES DE EMPEZAR

### **Requisitos:**
✅ Tener acceso a Supabase SQL Editor  
✅ Haber hecho commit de todos los cambios de código  
✅ Tener backup de la base de datos (recomendado)  
✅ Conocer la estructura actual de tu base de datos  

---

## 🚀 OPCIÓN 1: MIGRACIÓN GRADUAL (RECOMENDADO)

### **Ventajas:**
- ✅ Mantiene tabla `operators` para historial
- ✅ Permite rollback fácil
- ✅ Compatibilidad con código antiguo

### **Pasos:**

#### **1. Acceder a Supabase**
```
1. Ir a https://supabase.com
2. Seleccionar proyecto: nhtyyfniqjkzzkswupgf
3. Click en "SQL Editor" (menú lateral)
```

#### **2. Ejecutar Script de Migración**
```
1. Abrir archivo: sql-scripts/MIGRACION-SISTEMA-TURNOS.sql
2. Copiar TODO el contenido
3. Pegarlo en SQL Editor de Supabase
4. Click en "Run" (o Ctrl+Enter)
```

#### **3. Verificar Resultados**
Deberías ver mensajes como:
```sql
✅ Columna turno_asignado agregada
✅ Datos migrados exitosamente
✅ Tabla configuracion_semanal creada
✅ Funciones y triggers creados
✅ Políticas RLS actualizadas
```

#### **4. Revisar Datos Migrados**
```sql
-- Ver mantenimientos por turno
SELECT turno_asignado, COUNT(*) as total
FROM maintenance
WHERE es_plantilla = FALSE
GROUP BY turno_asignado;

-- Ver configuración actual
SELECT * FROM configuracion_semanal;
```

#### **5. Probar Aplicación**
```
1. Recargar http://localhost:5173/
2. Probar login por turnos
3. Verificar que se ven las tareas correctamente
```

---

## 🔥 OPCIÓN 2: LIMPIEZA COMPLETA (OPCIONAL)

### **Ventajas:**
- ✅ Base de datos más limpia
- ✅ Elimina código obsoleto
- ✅ Performance ligeramente mejor

### **Desventajas:**
- ❌ Pierde historial de operadores
- ❌ Rollback más difícil
- ⚠️ Requiere actualizar más código

### **Pasos:**

#### **1. Ejecutar Primero la Migración**
```
Ver OPCIÓN 1 arriba
```

#### **2. Ejecutar Script de Limpieza**
```
1. Abrir: sql-scripts/OPCIONAL-ELIMINAR-OPERATORS.sql
2. Copiar todo el contenido
3. Pegarlo en SQL Editor
4. Click en "Run"
```

#### **3. Actualizar Código Frontend**

**Archivos a modificar:**

**`src/App.jsx` - Eliminar ruta de operadores:**
```jsx
// ELIMINAR o COMENTAR:
<Route path="/operadores" element={<OperatorsPage />} />
```

**`src/components/layout/Layout.jsx` - Eliminar del menú:**
```jsx
// ELIMINAR o COMENTAR:
{ path: '/operadores', name: 'Operadores', icon: Users, roles: ['jefe', 'administrador'] }
```

**`src/services/databaseService.js` - Comentar operatorService:**
```javascript
// COMENTAR TODO EL BLOQUE:
/*
export const operatorService = {
  async getAll() { ... },
  async create() { ... },
  ...
};
*/
```

#### **4. Eliminar Archivos Obsoletos (Opcional)**
```bash
# Estos archivos ya no se necesitan:
- src/pages/OperatorsPage.jsx
- src/components/modals/OperatorModal.jsx
```

---

## 📊 CAMBIOS EN LA BASE DE DATOS

### **Nuevas Tablas:**

#### **1. `configuracion_semanal`**
```sql
- Almacena configuración de carga semanal
- Se configura cada lunes
- Define qué turno tendrá 2 operadores
- Calcula porcentajes de distribución
```

### **Nuevas Columnas:**

#### **1. `maintenance.turno_asignado`**
```sql
- Reemplaza a operador_asignado_id
- Valores: 'matutino', 'vespertino', 'nocturno', 'intermedio'
- Se asigna automáticamente según configuración
```

### **Nuevas Funciones:**

#### **1. `asignar_turno_automatico()`**
```sql
- Trigger que asigna turno a nuevos mantenimientos
- Respeta porcentajes de configuración semanal
- Se ejecuta antes de INSERT/UPDATE
```

#### **2. `obtener_estadisticas_turno(p_turno)`**
```sql
- Retorna estadísticas de un turno
- Total, pendientes, completadas, porcentaje
```

### **Nuevas Vistas:**

#### **1. `v_mantenimientos_por_turno`**
```sql
- Vista simplificada agrupada por turno
- Incluye información de equipo
- Incluye configuración actual
```

---

## 🧪 PRUEBAS POST-MIGRACIÓN

### **Test 1: Login por Turnos**
```
✅ Login como jefe (con contraseña)
✅ Login como turno matutino (sin contraseña)
✅ Login como turno vespertino (sin contraseña)
✅ Cerrar sesión y volver a entrar
```

### **Test 2: Visualización de Tareas**
```
✅ Turno matutino ve solo sus tareas
✅ Turno vespertino ve solo sus tareas
✅ Jefe ve todas las tareas
✅ Filtros funcionan correctamente
```

### **Test 3: Configuración Semanal**
```
✅ Acceder a Configuración → Carga Semanal
✅ Seleccionar turno con 2 operadores
✅ Guardar configuración
✅ Verificar distribución de porcentajes
```

### **Test 4: Generación de Mantenimientos**
```
✅ Ir a Plantillas Recurrentes
✅ Generar instancias de una plantilla
✅ Verificar que tienen turno asignado
✅ Verificar distribución según configuración
```

### **Test 5: Asignación Automática**
```sql
-- Insertar mantenimiento de prueba
INSERT INTO maintenance (
    codigo, tipo, descripcion, 
    equipment_id, fecha_programada, estado
) VALUES (
    'TEST-001', 'preventivo', 'Prueba de asignación',
    (SELECT id FROM equipment LIMIT 1),
    CURRENT_DATE + INTERVAL '1 day',
    'pendiente'
);

-- Verificar que tiene turno asignado
SELECT codigo, turno_asignado FROM maintenance WHERE codigo = 'TEST-001';
```

---

## 🔄 ROLLBACK EN CASO DE PROBLEMAS

### **Si algo sale mal:**

#### **1. Restaurar Mantenimientos**
```sql
-- Restaurar desde backup
TRUNCATE maintenance;
INSERT INTO maintenance SELECT * FROM maintenance_backup;
```

#### **2. Restaurar Operadores** (si se eliminó)
```sql
-- Restaurar tabla
CREATE TABLE operators AS SELECT * FROM operators_backup;

-- Re-crear foreign key
ALTER TABLE maintenance 
ADD CONSTRAINT maintenance_operador_asignado_id_fkey 
FOREIGN KEY (operador_asignado_id) REFERENCES operators(id);
```

#### **3. Eliminar Nuevas Estructuras**
```sql
-- Eliminar trigger
DROP TRIGGER IF EXISTS trigger_asignar_turno ON maintenance;
DROP FUNCTION IF EXISTS asignar_turno_automatico();

-- Eliminar columna
ALTER TABLE maintenance DROP COLUMN IF EXISTS turno_asignado;

-- Eliminar tabla de configuración
DROP TABLE IF EXISTS configuracion_semanal;
```

---

## 📝 CHECKLIST COMPLETA

### **Antes de la Migración:**
- [ ] Backup de base de datos
- [ ] Commit de código actual
- [ ] Acceso a Supabase SQL Editor
- [ ] Leer guía completa

### **Durante la Migración:**
- [ ] Ejecutar MIGRACION-SISTEMA-TURNOS.sql
- [ ] Verificar mensajes de éxito
- [ ] Revisar datos migrados
- [ ] (Opcional) Ejecutar OPCIONAL-ELIMINAR-OPERATORS.sql
- [ ] (Opcional) Actualizar código frontend

### **Después de la Migración:**
- [ ] Probar login por turnos
- [ ] Probar visualización de tareas
- [ ] Probar configuración semanal
- [ ] Probar generación de mantenimientos
- [ ] Verificar asignación automática
- [ ] Hacer commit de cambios
- [ ] Push a GitHub

---

## 🆘 SOPORTE

### **Problemas Comunes:**

#### **Error: "column turno_asignado does not exist"**
```sql
-- Ejecutar de nuevo la sección PASO 2 del script de migración
ALTER TABLE maintenance ADD COLUMN turno_asignado VARCHAR(20);
```

#### **Error: "relation configuracion_semanal does not exist"**
```sql
-- Ejecutar de nuevo la sección PASO 4 del script
CREATE TABLE configuracion_semanal (...);
```

#### **Mantenimientos sin turno asignado**
```sql
-- Asignar manualmente turno matutino por defecto
UPDATE maintenance 
SET turno_asignado = 'matutino' 
WHERE turno_asignado IS NULL;
```

#### **RLS bloqueando acceso**
```sql
-- Temporalmente deshabilitar RLS para debugging
ALTER TABLE maintenance DISABLE ROW LEVEL SECURITY;

-- Volver a habilitar después de arreglar
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
```

---

## ✅ VERIFICACIÓN FINAL

### **Ejecutar en Supabase SQL Editor:**

```sql
-- 1. Verificar estructura
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'maintenance' 
  AND column_name IN ('turno_asignado', 'operador_asignado_id');

-- 2. Verificar datos migrados
SELECT 
    turno_asignado,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes
FROM maintenance
WHERE es_plantilla = FALSE
GROUP BY turno_asignado;

-- 3. Verificar configuración
SELECT * FROM configuracion_semanal ORDER BY created_at DESC LIMIT 1;

-- 4. Verificar funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%turno%';

-- 5. Verificar trigger
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'maintenance';
```

### **Resultado Esperado:**
```
✅ Columna turno_asignado existe (VARCHAR)
✅ Todos los mantenimientos tienen turno asignado
✅ Configuración semanal tiene al menos 1 registro
✅ Función asignar_turno_automatico() existe
✅ Trigger trigger_asignar_turno existe
```

---

## 🎉 ¡MIGRACIÓN COMPLETADA!

Si todos los checks están ✅, tu sistema está listo para usar turnos fijos.

**Próximo paso:** Configurar la carga semanal cada lunes desde la interfaz.

---

**Creado por:** Pedro Demuner Valdivia  
**Fecha:** 23 de Octubre de 2025  
**Versión:** 2.0.0 - Sistema por Turnos
