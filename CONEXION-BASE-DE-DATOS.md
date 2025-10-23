# 🔌 CONEXIÓN A BASE DE DATOS SUPABASE (PostgreSQL)

## 📋 CREDENCIALES DE CONEXIÓN

### **Información del Proyecto:**
- **Proyecto ID:** `nhtyyfniqjkzzkswupgf`
- **URL:** `https://nhtyyfniqjkzzkswupgf.supabase.co`

### **Conexión PostgreSQL Directa:**

#### **Para VS Code Extension (PostgreSQL):**
```
Host: aws-0-us-east-1.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.nhtyyfniqjkzzkswupgf
Password: [BUSCAR EN SUPABASE]
SSL Mode: require
```

#### **Pooler Connection (Transaction Mode):**
```
Host: aws-0-us-east-1.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.nhtyyfniqjkzzkswupgf
Password: [TU_PASSWORD_DE_SUPABASE]
SSL: Enabled
```

#### **Direct Connection (Sin Pooler):**
```
Host: aws-0-us-east-1.pooler.supabase.com
Port: 5432
Database: postgres
User: postgres.nhtyyfniqjkzzkswupgf
Password: [TU_PASSWORD_DE_SUPABASE]
SSL: Enabled
```

---

## 🔑 CÓMO OBTENER LA PASSWORD:

### **Opción 1: Desde Supabase Dashboard**
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto: `nhtyyfniqjkzzkswupgf`
3. Click en **Settings** (⚙️) → **Database**
4. Busca la sección **Connection String**
5. Click en **"Connection Pooling"** o **"Direct Connection"**
6. La password estará visible ahí (o puedes resetearla)

### **Opción 2: Reset Password**
1. En Settings → Database
2. Click en **"Reset Database Password"**
3. Guarda la nueva password (¡no se mostrará de nuevo!)

---

## 🔧 EXTENSIÓN CORRECTA PARA VS CODE:

⚠️ **IMPORTANTE:** Supabase usa **PostgreSQL**, NO SQL Server.

### **Desinstalar:**
- ❌ SQL Server (mssql) - NO sirve para Supabase

### **Instalar:**
- ✅ **PostgreSQL** by Chris Kolkman (ckolkman.vscode-postgres)

**Comando para instalar:**
```bash
code --install-extension ckolkman.vscode-postgres
```

---

## 📝 CONFIGURACIÓN EN VS CODE:

### **Paso 1: Abrir PostgreSQL Explorer**
1. Click en el icono de PostgreSQL en la barra lateral (🐘)
2. Click en **"+ Add Connection"**

### **Paso 2: Llenar datos de conexión:**

**Nombre de conexión (opcional):**
```
DEVAD-MTO Supabase
```

**Host:**
```
aws-0-us-east-1.pooler.supabase.com
```

**Port:**
```
6543
```

**Database:**
```
postgres
```

**User:**
```
postgres.nhtyyfniqjkzzkswupgf
```

**Password:**
```
[TU_PASSWORD_AQUÍ]
```

**SSL Mode:**
```
Require
```

### **Paso 3: Conectar**
- Click en **"Connect"**
- La conexión aparecerá en el explorador de PostgreSQL
- Click en la base de datos para expandir tablas

---

## 🎯 CONEXIÓN ALTERNATIVA: USANDO SQL EDITOR DE SUPABASE

Si no puedes conectar desde VS Code, usa el SQL Editor integrado:

1. Ve a https://supabase.com/dashboard/project/nhtyyfniqjkzzkswupgf
2. Click en **"SQL Editor"** en el menú lateral
3. Ahí puedes ejecutar todos los scripts SQL directamente

**Ventajas:**
- ✅ No necesitas password
- ✅ Ya está autenticado
- ✅ Ejecuta scripts directamente
- ✅ Tiene autocompletado
- ✅ Muestra resultados en tablas

---

## 🚀 QUICK START:

### **Desde Supabase Web (RECOMENDADO):**
```
1. https://supabase.com/dashboard/project/nhtyyfniqjkzzkswupgf/editor
2. Click "SQL Editor"
3. Pega el código de PASOS-8-9-10-11-EJECUTAR.sql
4. Click "Run" (Ctrl+Enter)
```

### **Desde VS Code (Requiere extensión PostgreSQL):**
```
1. Instalar: ckolkman.vscode-postgres
2. Obtener password de Supabase Settings → Database
3. Crear conexión con datos de arriba
4. Ejecutar queries desde VS Code
```

---

## 📊 STRING DE CONEXIÓN COMPLETA:

```
postgresql://postgres.nhtyyfniqjkzzkswupgf:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

Reemplaza `[PASSWORD]` con tu password real.

---

## ❓ PROBLEMAS COMUNES:

### **"Cannot connect to database"**
- ✅ Verifica que usaste **PostgreSQL extension**, NO SQL Server
- ✅ Confirma que el puerto es `6543` (pooler) o `5432` (direct)
- ✅ Verifica que SSL Mode está en "Require"

### **"Password incorrect"**
- ✅ Ve a Supabase → Settings → Database → Reset Password
- ✅ Usa la nueva password

### **"Extension not working"**
- ✅ Usa Supabase SQL Editor directamente (más fácil)
- ✅ No necesitas instalar nada

---

**Creado:** 23 de octubre de 2025  
**Proyecto:** DEVAD-MTO  
**Base de datos:** Supabase PostgreSQL
