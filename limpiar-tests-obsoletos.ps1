# ============================================================
# LIMPIEZA DE ARCHIVOS DE TEST OBSOLETOS
# ============================================================

$baseDir = $PSScriptRoot
$eliminarDir = Join-Path $baseDir "por-eliminar"

# Crear carpeta si no existe
if (-not (Test-Path $eliminarDir)) {
    New-Item -ItemType Directory -Path $eliminarDir | Out-Null
}

Write-Host "`n$('=' * 60)" -ForegroundColor Cyan
Write-Host "  LIMPIEZA DE ARCHIVOS DE TEST OBSOLETOS" -ForegroundColor Cyan
Write-Host "$('=' * 60)`n" -ForegroundColor Cyan

# ============================================================
# Tests de Template Service (OBSOLETOS)
# ============================================================
Write-Host "[OBSOLETO] Tests de Template Service:" -ForegroundColor Red

$testObsoletos = @(
    "test-template-service.js",
    "check-recurring.js",
    "migrate-recurring.js",
    "verify-template-table.js"
)

foreach ($archivo in $testObsoletos) {
    $origen = Join-Path $baseDir $archivo
    if (Test-Path $origen) {
        $destino = Join-Path $eliminarDir $archivo
        Move-Item -Path $origen -Destination $destino -Force
        Write-Host "  [OK] $archivo -> por-eliminar/" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $archivo (no encontrado)" -ForegroundColor Gray
    }
}

# ============================================================
# Scripts de Usuarios (YA NO NECESARIOS)
# ============================================================
Write-Host "`n[OBSOLETO] Scripts de Usuarios:" -ForegroundColor Red

$usuariosObsoletos = @(
    "crear-usuarios-auth.js",
    "crear-usuarios-metodo-correcto.js",
    "crear-usuarios-nuevos.js",
    "verificar-nuevo-auth.js",
    "verificar-usuarios-completo.js",
    "eliminar-usuarios.ps1"
)

foreach ($archivo in $usuariosObsoletos) {
    $origen = Join-Path $baseDir $archivo
    if (Test-Path $origen) {
        $destino = Join-Path $eliminarDir $archivo
        Move-Item -Path $origen -Destination $destino -Force
        Write-Host "  [OK] $archivo -> por-eliminar/" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $archivo (no encontrado)" -ForegroundColor Gray
    }
}

# ============================================================
# Verificaciones de Estructura (YA NO NECESARIAS)
# ============================================================
Write-Host "`n[OBSOLETO] Verificaciones de Estructura:" -ForegroundColor Red

$verificacionesObsoletas = @(
    "verificar-estructura-maintenance.js",
    "verificar-estructura-operators.js",
    "test-supabase-connection.js"
)

foreach ($archivo in $verificacionesObsoletas) {
    $origen = Join-Path $baseDir $archivo
    if (Test-Path $origen) {
        $destino = Join-Path $eliminarDir $archivo
        Move-Item -Path $origen -Destination $destino -Force
        Write-Host "  [OK] $archivo -> por-eliminar/" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $archivo (no encontrado)" -ForegroundColor Gray
    }
}

# ============================================================
# RESUMEN
# ============================================================
Write-Host "`n$('=' * 60)" -ForegroundColor Yellow
Write-Host "  RESUMEN DE LIMPIEZA" -ForegroundColor Yellow
Write-Host "$('=' * 60)" -ForegroundColor Yellow

$totalMovidos = (Get-ChildItem $eliminarDir -File).Count
Write-Host "`n  [INFO] Total de archivos movidos: $totalMovidos" -ForegroundColor White

Write-Host "`n  [MANTENIDOS] Archivos para debugging:" -ForegroundColor Green
Write-Host "     * test-supabase.js (test conexion completo)" -ForegroundColor Cyan
Write-Host "     * verify-system.js (verificacion general)" -ForegroundColor Cyan
Write-Host "     * test-browser-render.html (pruebas navegador)" -ForegroundColor Cyan

Write-Host "`n  [CARPETA] Archivos movidos a carpeta 'por-eliminar'" -ForegroundColor Gray
Write-Host "     Verifica que no los necesitas antes de eliminar definitivamente.`n" -ForegroundColor Gray

Write-Host "  [OK] Limpieza completada exitosamente!`n" -ForegroundColor Green
