# ========================================
# 🚀 SCRIPT DE INICIALIZACIÓN DE GIT
# ========================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  GIT INITIALIZATION SCRIPT" -ForegroundColor Cyan
Write-Host "  DEVAD-MTO - Sistema de Mantenimiento" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# 1. Verificar si Git está instalado
Write-Host "1. Verificando instalación de Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "   [OK] Git instalado: $gitVersion" -ForegroundColor Green
    $gitInstalled = $true
} catch {
    Write-Host "   [ERROR] Git NO está instalado" -ForegroundColor Red
    Write-Host "   Descarga Git desde: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "   O usa GitHub Desktop: https://desktop.github.com/`n" -ForegroundColor Yellow
    $gitInstalled = $false
}

if (-not $gitInstalled) {
    Write-Host "`nPresiona cualquier tecla para salir..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# 2. Verificar si ya es un repositorio Git
Write-Host "`n2. Verificando estado del repositorio..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "   [OK] Ya es un repositorio Git" -ForegroundColor Green
    $isRepo = $true
} else {
    Write-Host "   [INFO] NO es un repositorio Git todavía" -ForegroundColor Yellow
    $isRepo = $false
}

# 3. Inicializar repositorio si no existe
if (-not $isRepo) {
    Write-Host "`n3. Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
    Write-Host "   [OK] Repositorio inicializado" -ForegroundColor Green
}

# 4. Configurar nombre y email (si no está configurado)
Write-Host "`n4. Configurando usuario..." -ForegroundColor Yellow
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName) {
    $userName = Read-Host "   Ingresa tu nombre"
    git config --global user.name "$userName"
    Write-Host "   [OK] Nombre configurado: $userName" -ForegroundColor Green
} else {
    Write-Host "   [OK] Usuario ya configurado: $userName" -ForegroundColor Green
}

if (-not $userEmail) {
    $userEmail = Read-Host "   Ingresa tu email"
    git config --global user.email "$userEmail"
    Write-Host "   [OK] Email configurado: $userEmail" -ForegroundColor Green
} else {
    Write-Host "   [OK] Email ya configurado: $userEmail" -ForegroundColor Green
}

# 5. Verificar archivos a incluir
Write-Host "`n5. Verificando archivos..." -ForegroundColor Yellow
$filesCount = (git status --short 2>$null).Count
if ($filesCount -eq 0) {
    Write-Host "   [INFO] No hay cambios nuevos para agregar" -ForegroundColor Yellow
} else {
    Write-Host "   [INFO] Archivos detectados: $filesCount" -ForegroundColor Cyan
}

# 6. Mostrar estado
Write-Host "`n6. Estado del repositorio:" -ForegroundColor Yellow
git status --short

# 7. Preguntar si desea hacer commit
Write-Host "`n============================================" -ForegroundColor Cyan
$doCommit = Read-Host "¿Deseas agregar archivos y hacer commit? (S/N)"

if ($doCommit -eq "S" -or $doCommit -eq "s") {
    Write-Host "`n7. Agregando archivos..." -ForegroundColor Yellow
    git add .
    Write-Host "   [OK] Archivos agregados" -ForegroundColor Green
    
    $commitMessage = Read-Host "`n   Mensaje del commit (Enter para usar mensaje por defecto)"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "Initial commit - Sistema de Mantenimiento con Plantillas Recurrentes"
    }
    
    Write-Host "`n8. Haciendo commit..." -ForegroundColor Yellow
    git commit -m "$commitMessage"
    Write-Host "   [OK] Commit realizado" -ForegroundColor Green
} else {
    Write-Host "   [INFO] Commit cancelado" -ForegroundColor Yellow
}

# 8. Verificar si tiene remote
Write-Host "`n9. Verificando repositorio remoto..." -ForegroundColor Yellow
$remote = git remote -v 2>$null
if ($remote) {
    Write-Host "   [OK] Repositorio remoto configurado:" -ForegroundColor Green
    git remote -v
    
    $doPush = Read-Host "`n   ¿Deseas hacer push a GitHub? (S/N)"
    if ($doPush -eq "S" -or $doPush -eq "s") {
        Write-Host "`n   Haciendo push..." -ForegroundColor Yellow
        git push
        Write-Host "   [OK] Código subido a GitHub" -ForegroundColor Green
    }
} else {
    Write-Host "   [INFO] No hay repositorio remoto configurado" -ForegroundColor Yellow
    Write-Host "`n   Pasos para conectar con GitHub:" -ForegroundColor Cyan
    Write-Host "   1. Crea un repositorio en https://github.com/new" -ForegroundColor White
    Write-Host "   2. Nombre sugerido: DEVAD-MTO" -ForegroundColor White
    Write-Host "   3. NO marcar 'Initialize with README'" -ForegroundColor White
    Write-Host "   4. Ejecuta estos comandos:" -ForegroundColor White
    Write-Host "      git remote add origin https://github.com/TU_USUARIO/DEVAD-MTO.git" -ForegroundColor Gray
    Write-Host "      git branch -M main" -ForegroundColor Gray
    Write-Host "      git push -u origin main" -ForegroundColor Gray
}

# Resumen final
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Git instalado: " -NoNewline -ForegroundColor White
Write-Host "$gitInstalled" -ForegroundColor $(if ($gitInstalled) { "Green" } else { "Red" })
Write-Host "  Repositorio inicializado: " -NoNewline -ForegroundColor White
Write-Host "$isRepo" -ForegroundColor $(if ($isRepo) { "Green" } else { "Yellow" })
Write-Host "  Usuario configurado: " -NoNewline -ForegroundColor White
Write-Host "$userName" -ForegroundColor Green
Write-Host "  Email configurado: " -NoNewline -ForegroundColor White
Write-Host "$userEmail" -ForegroundColor Green

Write-Host "`n  Archivos importantes creados:" -ForegroundColor White
Write-Host "  [OK] README.md - Documentacion completa" -ForegroundColor Green
Write-Host "  [OK] .gitignore - Archivos a ignorar" -ForegroundColor Green
Write-Host "  [OK] .env.example - Plantilla de variables" -ForegroundColor Green
Write-Host "  [OK] GUIA-GITHUB.md - Guia detallada" -ForegroundColor Green

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  PROXIMO PASO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

if (-not $remote) {
    Write-Host "  Crea tu repositorio en GitHub y conectalo:" -ForegroundColor Yellow
    Write-Host "  https://github.com/new`n" -ForegroundColor Cyan
} else {
    Write-Host "  Tu codigo esta listo en GitHub!" -ForegroundColor Green
    Write-Host "  Comparte tu repositorio con el equipo.`n" -ForegroundColor Cyan
}

Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
