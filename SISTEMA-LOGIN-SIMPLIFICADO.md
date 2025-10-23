# 🔐 Sistema de Login Simplificado

## 📋 **DESCRIPCIÓN**

Sistema de acceso dual diseñado para entornos industriales donde:
- **Administradores/Jefes**: Acceden con contraseña
- **Operadores**: Acceden sin contraseña, solo seleccionando su número

---

## 🎯 **CARACTERÍSTICAS**

### **✅ Ventajas del Nuevo Sistema:**

1. **Sin Registro Complejo**: Operadores no necesitan crear cuentas
2. **Acceso Rápido**: Solo 1 click para operadores
3. **Seguridad Selectiva**: Solo admin tiene contraseña
4. **Fácil Gestión**: Admin agrega operadores desde el sistema
5. **Sin Problemas de Autenticación**: No depende de Supabase Auth para operadores

---

## 🔑 **CREDENCIALES**

### **Administrador:**
```
Contraseñas válidas:
- admin123
- devad2025
- mantenimiento
```

### **Operadores:**
```
Sin contraseña
- Solo seleccionar número asignado
- El admin les indica qué número son
```

---

## 🖥️ **INTERFAZ DE LOGIN**

```
┌─────────────────────────────────────────────────────────┐
│                    DEVAD-MTO                            │
│              Sistema Integral de Mantenimiento          │
├─────────────────────────┬───────────────────────────────┤
│   👔 ADMINISTRADOR      │   👷 OPERADORES               │
│                         │                               │
│   🔐 Contraseña:        │   Selecciona tu número:       │
│   [____________]        │                               │
│   [Entrar]              │   ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│                         │   │ 1 │ │ 2 │ │ 3 │ │ 4 │   │
│   Solo personal         │   │OP │ │OP │ │OP │ │OP │   │
│   autorizado            │   └───┘ └───┘ └───┘ └───┘   │
│                         │                               │
│                         │   ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│                         │   │ 5 │ │ 6 │ │ 7 │ │ 8 │   │
│                         │   │OP │ │OP │ │OP │ │OP │   │
│                         │   └───┘ └───┘ └───┘ └───┘   │
│                         │                               │
│                         │   Sin contraseña requerida    │
└─────────────────────────┴───────────────────────────────┘
```

---

## 🔄 **FLUJO DE OPERACIÓN**

### **Como Administrador:**

1. **Acceder al Login**
2. **Ingresar contraseña** en sección "Administrador"
3. **Click en "Entrar como Administrador"**
4. **Acceso completo al sistema**:
   - Gestión de operadores
   - Gestión de equipos
   - Gestión de inventario
   - Configuración
   - Reportes completos

### **Como Operador:**

1. **Acceder al Login**
2. **Buscar tu número asignado** (el admin te lo indica)
3. **Click en tu tarjeta de operador**
4. **Acceso automático** a tu vista de operador:
   - Solo tus mantenimientos asignados
   - Solo tus requisiciones
   - Vista simplificada

---

## 🛠️ **GESTIÓN DE OPERADORES**

### **Agregar Operador (Como Admin):**

1. Login como administrador
2. Ir a **"Operadores"**
3. Click en **"+ Nuevo Operador"**
4. Llenar datos:
   ```
   - Código: OPR-XXX
   - Nombre: Juan Pérez
   - Puesto: Técnico de Mantenimiento
   - Turno: Matutino
   - Estado: Activo
   ```
5. Guardar

6. **Asignar número al operador:**
   - Los operadores se numeran automáticamente (1, 2, 3...)
   - Indicar al operador: "Tu número es el 3"
   - Operador ya puede acceder sin contraseña

---

## 🔒 **SEGURIDAD**

### **Contraseñas Hardcodeadas (Admin):**

```javascript
// En AuthContext.jsx línea ~52
const validPasswords = ['admin123', 'devad2025', 'mantenimiento'];
```

**Para cambiar las contraseñas:**

1. Editar `src/contexts/AuthContext.jsx`
2. Buscar `validPasswords`
3. Modificar array:
   ```javascript
   const validPasswords = ['miNuevaPassword123', 'otraPassword'];
   ```

### **Almacenamiento de Sesión:**

```javascript
// localStorage keys:
- 'devad-mto-user'      // Datos del usuario
- 'devad-mto-operator'  // Datos del operador
```

**Cerrar sesión limpia automáticamente localStorage**

---

## 📊 **ROLES Y PERMISOS**

### **Administrador:**
- ✅ Acceso completo
- ✅ Gestionar operadores
- ✅ Gestionar equipos
- ✅ Gestionar inventario
- ✅ Ver todos los mantenimientos
- ✅ Configuración del sistema
- ✅ Reportes completos

### **Operador:**
- ✅ Ver mantenimientos asignados
- ✅ Crear requisiciones
- ✅ Actualizar estado de mantenimientos
- ❌ No puede gestionar operadores
- ❌ No puede acceder a configuración
- ❌ No puede ver reportes completos

---

## 🧪 **PRUEBAS**

### **Test 1: Login Administrador**
```
1. Ir a http://localhost:5173/
2. Ingresar contraseña: admin123
3. Click "Entrar como Administrador"
4. ✅ Debe redirigir a Dashboard completo
```

### **Test 2: Login Operador**
```
1. Ir a http://localhost:5173/
2. Click en cualquier tarjeta de operador (ej: "1")
3. ✅ Debe redirigir a Dashboard de operador
4. ✅ Solo debe ver sus tareas asignadas
```

### **Test 3: Agregar Operador**
```
1. Login como admin
2. Ir a "Operadores"
3. Click "+ Nuevo Operador"
4. Llenar datos y guardar
5. ✅ Operador aparece en grid de login
6. ✅ Tiene número asignado automáticamente
```

### **Test 4: Persistencia de Sesión**
```
1. Login como admin o operador
2. Recargar página (F5)
3. ✅ Sesión debe mantenerse
4. ✅ No debe pedir login de nuevo
```

### **Test 5: Logout**
```
1. Estando logueado
2. Click en "Contraer" o botón de logout
3. ✅ Debe redirigir a login
4. ✅ localStorage debe estar limpio
```

---

## 🔧 **ARCHIVOS MODIFICADOS**

### **1. `src/pages/Login.jsx`**
- Nueva interfaz con dos secciones
- Grid de operadores numerados
- Formulario admin solo con contraseña

### **2. `src/contexts/AuthContext.jsx`**
- Función `loginAsAdmin(password)` - Admin con contraseña
- Función `loginAsOperator(operatorData)` - Operador sin contraseña
- Persistencia en localStorage
- Carga de sesión desde localStorage

---

## 📝 **NOTAS IMPORTANTES**

1. **Sin Supabase Auth para Operadores**: Los operadores no usan Supabase Authentication, solo localStorage local.

2. **RLS en Base de Datos**: Aunque no usan Supabase Auth, el sistema sigue respetando Row Level Security (RLS) basándose en el `operator_id` almacenado.

3. **Contraseñas en Código**: Las contraseñas de admin están hardcodeadas. Para producción, considerar usar variables de entorno.

4. **Escalabilidad**: Si tienes más de 20 operadores, el grid puede necesitar scroll. Actualmente soporta scroll automático.

5. **Estados de Operador**: Solo operadores con estado "Disponible", "Ocupado" o "activo" aparecen en el login.

---

## 🚀 **PRÓXIMAS MEJORAS SUGERIDAS**

- [ ] Agregar foto/avatar a operadores
- [ ] Permitir búsqueda de operador por nombre
- [ ] Agregar PIN opcional para operadores (4 dígitos)
- [ ] Dashboard diferenciado por rol (operador vs admin)
- [ ] Estadísticas personalizadas por operador
- [ ] Notificaciones push para nuevas asignaciones

---

## 💡 **VENTAJAS PARA ENTORNO INDUSTRIAL**

✅ **Rapidez**: Operador entra en 1 click (< 3 segundos)  
✅ **Simplicidad**: Sin necesidad de recordar contraseñas  
✅ **Control**: Admin gestiona todo centralizadamente  
✅ **Identificación**: Números fáciles de recordar (1, 2, 3...)  
✅ **Presencial**: Sistema diseñado para uso in-situ con supervisión  

---

**Creado por:** Pedro Demuner Valdivia  
**Fecha:** 23 de Octubre de 2025  
**Versión:** 1.0.0 - Login Simplificado
