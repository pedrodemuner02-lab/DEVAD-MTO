# ============================================================
# 🧹 SCRIPT DE LIMPIEZA - Mover archivos obsoletos
# ============================================================

$baseDir = "c:\Users\pedro\OneDrive - Instituto Tecnológico Superior de Huatusco\Escritorio\DEVAD-MTO\DEVAD-MTO-APP"
$eliminarDir = Join-Path $baseDir "por-eliminar"

# Crear carpeta si no existe
if (-not (Test-Path $eliminarDir)) {
    New-Item -ItemType Directory -Path $eliminarDir | Out-Null
    Write-Host "✅ Carpeta 'por-eliminar' creada" -ForegroundColor Green
}

# ============================================================
# 📋 ARCHIVOS SQL OBSOLETOS
# ============================================================
$sqlObsoletos = @(
    "CREAR-OPERADORES-SOLO.sql",
    "CREAR-SISTEMA-AUTH-CORREGIDO.sql",
    "CREAR-SISTEMA-AUTH-PERSONALIZADO.sql",
    "LIMPIAR-TABLAS-INNECESARIAS.sql",
    "LIMPIAR-USUARIOS.sql",
    "arreglar-rls-operators.sql",
    "CREAR-ADMIN-USERS.sql",
    "CREAR-USUARIOS-DEFINITIVO.sql",
    "DIAGNOSTICO-COMPLETO.sql",
    "DIAGNOSTICO-MAINTENANCE.sql",
    "INSERTAR-EQUIPOS-EJEMPLO.sql",
    "verificar-emails-operators.sql"
)

Write-Host "`n🔄 Moviendo archivos SQL obsoletos..." -ForegroundColor Cyan

foreach ($archivo in $sqlObsoletos) {
    $origen = Join-Path $baseDir $archivo
    if (Test-Path $origen) {
        $destino = Join-Path $eliminarDir $archivo
        Move-Item -Path $origen -Destination $destino -Force
        Write-Host "  ✅ $archivo → por-eliminar/" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  $archivo (no encontrado)" -ForegroundColor Gray
    }
}

# ============================================================
# 📋 ARCHIVOS MD OBSOLETOS (guías viejas)
# ============================================================
$mdObsoletos = @(
    "CRUD-IMPLEMENTATION.md",
    "CRUD-QUICK-REFERENCE.md",
    "FASE-2-IMPLEMENTACION.md",
    "FEATURE-INDEFINIDO.md",
    "INICIO-RAPIDO.md",
    "INSTALACION.md",
    "INTEGRATION-SUMMARY.md",
    "MAINTENANCE-EQUIPMENT-LINK.md",
    "MEJORAS-RECURRENCIA.md",
    "RESUMEN-FASE-2.md",
    "SISTEMA-AUTENTICACION-OPERADORES.md"
)

Write-Host "`n🔄 Moviendo documentación obsoleta..." -ForegroundColor Cyan

$textosDir = Join-Path $baseDir "textos"
$eliminarTextosDir = Join-Path $eliminarDir "textos"

if (-not (Test-Path $eliminarTextosDir)) {
    New-Item -ItemType Directory -Path $eliminarTextosDir | Out-Null
}

foreach ($archivo in $mdObsoletos) {
    $origen = Join-Path $textosDir $archivo
    if (Test-Path $origen) {
        $destino = Join-Path $eliminarTextosDir $archivo
        Move-Item -Path $origen -Destination $destino -Force
        Write-Host "  ✅ textos/$archivo → por-eliminar/textos/" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  textos/$archivo (no encontrado)" -ForegroundColor Gray
    }
}

# ============================================================
# 📊 RESUMEN
# ============================================================
Write-Host "`n📊 RESUMEN DE LIMPIEZA:" -ForegroundColor Yellow
$movidosSql = (Get-ChildItem $eliminarDir -Filter "*.sql").Count
$movidosMd = (Get-ChildItem $eliminarTextosDir -Filter "*.md" -ErrorAction SilentlyContinue).Count

Write-Host "  📄 Archivos SQL movidos: $movidosSql" -ForegroundColor White
Write-Host "  📝 Archivos MD movidos: $movidosMd" -ForegroundColor White
Write-Host "`n✅ Limpieza completada. Verifica carpeta 'por-eliminar' antes de eliminar definitivamente." -ForegroundColor Green

# ============================================================
# 🎯 ARCHIVOS IMPORTANTES QUE SE MANTIENEN
# ============================================================
Write-Host "`n🎯 ARCHIVOS IMPORTANTES MANTENIDOS:" -ForegroundColor Cyan
Write-Host "  ✅ REDISEÑO-MANTENIMIENTO-HIBRIDO.sql (columnas sistema híbrido)" -ForegroundColor Green
Write-Host "  ✅ LIMPIEZA-SELECTIVA-INTELIGENTE.sql (limpieza tablas obsoletas)" -ForegroundColor Green
Write-Host "  ✅ AGREGAR-COLUMNAS-RECURRENCIA.sql (columnas recurrencia)" -ForegroundColor Green
Write-Host "  ✅ ESPECIFICACION-PLANTILLAS-RECURRENTES.md (especificación completa)" -ForegroundColor Green
Write-Host "  ✅ RESUMEN-IMPLEMENTACION-RECURRENCIA.md (resumen implementación)" -ForegroundColor Green
Write-Host "  ✅ textos/README.md (documentación principal)" -ForegroundColor Green
Write-Host "  ✅ textos/SUPABASE-SETUP.md (configuración Supabase)" -ForegroundColor Green
Write-Host "  ✅ textos/RESUMEN-SISTEMA-COMPLETO.md (resumen completo)" -ForegroundColor Green
Write-Host "  ✅ textos/CREDENCIALES-ACCESO.md (credenciales)" -ForegroundColor Green
