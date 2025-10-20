# Script para eliminar usuarios de Supabase usando PowerShell

$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoamZvdGx4dmJsdHZ1a2Rkem9qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc3NDQ5MCwiZXhwIjoyMDc1MzUwNDkwfQ.LRUZF6FA3HqQPweiJZsZTa_2fKU7UvXlICq8dpFGe9o"
$PROJECT_REF = "whjfotlxvbltvukddzoj"

# IDs de los usuarios a eliminar (de tu captura)
$userIds = @(
    "3ee62409-1957-4f7c-a125-b90bd93880f2",  # admin.mto@devad.com
    "b29d9415-b973-4549-ba9d-2590b7f5a97b",  # jefe.mto@devad.com
    "fc888602-99e8-4641-9896-9a06c59c8623"   # operador.mto@devad.com
)

Write-Host "🗑️ ELIMINANDO USUARIOS DE SUPABASE..." -ForegroundColor Yellow
Write-Host ""

foreach ($id in $userIds) {
    Write-Host "Eliminando usuario: $id" -ForegroundColor Cyan
    
    $url = "https://$PROJECT_REF.supabase.co/auth/v1/admin/users/$id"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method DELETE `
            -Headers @{
                "Authorization" = "Bearer $SERVICE_ROLE_KEY"
                "apikey" = "$SERVICE_ROLE_KEY"
            } `
            -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Usuario eliminado exitosamente" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Código de respuesta: $($response.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Error al eliminar: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora ejecuta: node crear-usuarios-auth.js" -ForegroundColor Cyan
