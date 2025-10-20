# ========================================
# 🚀 GUÍA PARA SUBIR A GITHUB
# ========================================

# OPCIÓN A: Si Git NO está instalado
# ------------------------------------
# 1. Descargar Git desde: https://git-scm.com/download/win
# 2. Instalar con opciones por defecto
# 3. Reiniciar PowerShell/VS Code
# 4. Continuar con comandos abajo


# OPCIÓN B: Usar GitHub Desktop (Recomendado para principiantes)
# ---------------------------------------------------------------
# 1. Descargar GitHub Desktop: https://desktop.github.com/
# 2. Instalar y hacer login con tu cuenta de GitHub
# 3. File → Add Local Repository → Seleccionar carpeta DEVAD-MTO-APP
# 4. Create Repository → Publish to GitHub
# ¡Listo! GitHub Desktop maneja todo automáticamente.


# OPCIÓN C: Comandos de Git (Si tienes experiencia)
# --------------------------------------------------

# 1. Inicializar repositorio Git
git init

# 2. Configurar tu nombre y email (primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@ejemplo.com"

# 3. Agregar todos los archivos
git add .

# 4. Hacer primer commit
git commit -m "Initial commit - Sistema de Mantenimiento con Plantillas Recurrentes"

# 5. Crear repositorio en GitHub (web)
# - Ve a https://github.com/new
# - Nombre: DEVAD-MTO
# - Descripción: Sistema de Mantenimiento Industrial con Plantillas Recurrentes
# - Privado o Público (tu elección)
# - NO marcar "Initialize with README" (ya lo tenemos)
# - Crear repositorio

# 6. Conectar con tu repositorio remoto
# Reemplaza TU_USUARIO con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/DEVAD-MTO.git

# 7. Verificar conexión
git remote -v

# 8. Subir código a GitHub
git branch -M main
git push -u origin main

# ========================================
# 🎯 COMANDOS ÚTILES DESPUÉS
# ========================================

# Ver estado de cambios
git status

# Ver historial de commits
git log --oneline

# Agregar cambios nuevos
git add .
git commit -m "Descripción de cambios"
git push

# Crear una rama nueva
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Fusionar rama
git merge feature/nueva-funcionalidad

# ========================================
# 📋 CHECKLIST ANTES DE SUBIR
# ========================================

# ✅ Verificar .gitignore
# - node_modules/ debe estar ignorado
# - .env debe estar ignorado (NUNCA subir credenciales)
# - Archivos temporales ignorados

# ✅ Verificar .env.example
# - Debe existir como plantilla (sin credenciales reales)

# ✅ README.md completo
# - Descripción del proyecto
# - Instrucciones de instalación
# - Credenciales de prueba (sin revelar las reales)

# ✅ Limpiar archivos innecesarios
# - Backups (.backup)
# - Tests obsoletos (ya movidos a por-eliminar/)
# - Archivos temporales

# ========================================
# 🔒 SEGURIDAD - MUY IMPORTANTE
# ========================================

# NUNCA SUBIR:
# ❌ .env (credenciales reales)
# ❌ node_modules/ (se regenera con npm install)
# ❌ Contraseñas en código
# ❌ API keys reales
# ❌ Datos de producción

# SIEMPRE SUBIR:
# ✅ .env.example (plantilla sin valores reales)
# ✅ README.md con instrucciones
# ✅ .gitignore completo
# ✅ Código fuente (src/)
# ✅ Scripts SQL necesarios

# ========================================
# 🎨 ESTRUCTURA IDEAL EN GITHUB
# ========================================

# Tu repositorio debe verse así:
# 
# DEVAD-MTO/
# ├── 📄 README.md (descripción completa)
# ├── 📄 .gitignore (archivos ignorados)
# ├── 📄 .env.example (plantilla de variables)
# ├── 📄 package.json (dependencias)
# ├── 📁 src/ (código fuente)
# ├── 📁 sql-scripts/ (scripts SQL)
# ├── 📁 textos/ (documentación)
# └── 📁 electron/ (si usas Electron)

# ========================================
# 💡 TIPS Y MEJORES PRÁCTICAS
# ========================================

# 1. Commits descriptivos
# ✅ BIEN: "Agregar generación automática de instancias recurrentes"
# ❌ MAL: "fix" o "cambios"

# 2. Hacer commits frecuentes
# - Cada funcionalidad nueva = 1 commit
# - Cada bug fix = 1 commit
# - No esperar a tener muchos cambios

# 3. Usar ramas para features
# - main/master = código estable
# - feature/plantillas-recurrentes = trabajo en progreso
# - bugfix/error-jsonb = correcciones

# 4. Pull Requests para revisar código
# - Especialmente si trabajas en equipo

# 5. Agregar badges al README
# - Build status
# - Versión
# - Licencia

# ========================================
# 🆘 AYUDA Y RECURSOS
# ========================================

# Si tienes problemas:
# 1. GitHub Docs: https://docs.github.com/es
# 2. Git Tutorial: https://git-scm.com/book/es/v2
# 3. GitHub Learning Lab: https://lab.github.com/

# Comandos de emergencia:
# - Deshacer último commit (sin perder cambios): git reset --soft HEAD~1
# - Ver diferencias: git diff
# - Descartar cambios locales: git checkout -- archivo.js
# - Actualizar desde GitHub: git pull

# ========================================
# ✅ LISTO PARA GITHUB
# ========================================

# Tu proyecto ya tiene:
# ✅ README.md completo y profesional
# ✅ .gitignore optimizado
# ✅ Estructura de carpetas organizada
# ✅ Documentación en textos/
# ✅ Scripts SQL en sql-scripts/
# ✅ Código limpio sin archivos obsoletos

# Solo falta:
# 1. Instalar Git o GitHub Desktop
# 2. Ejecutar comandos de la OPCIÓN C
# 3. ¡Subir a GitHub!

# ========================================
# 🎉 ¡ÉXITO!
# ========================================

# Una vez subido, tu repositorio estará en:
# https://github.com/TU_USUARIO/DEVAD-MTO

# Podrás:
# - Compartir el proyecto
# - Trabajar desde cualquier computadora
# - Colaborar con otros desarrolladores
# - Tener historial completo de cambios
# - Hacer rollback si algo sale mal

# ========================================
