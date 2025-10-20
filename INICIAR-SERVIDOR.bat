@echo off
echo ========================================
echo   DEVAD-MTO - Iniciar Servidor
echo ========================================
echo.
echo Navegando al directorio del proyecto...
cd /d "C:\Users\pedro\OneDrive - Instituto Tecnológico Superior de Huatusco\Escritorio\DEVAD-MTO\DEVAD-MTO-APP"
echo.
echo Iniciando servidor de desarrollo...
echo.
echo El servidor se abrira en: http://localhost:5173
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.
npm run dev
pause
