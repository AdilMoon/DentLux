# PowerShell скрипт для создания .env файла
$envPath = Join-Path $PSScriptRoot ".env"
$examplePath = Join-Path $PSScriptRoot "env.example.txt"

if (Test-Path $envPath) {
    Write-Host ".env файл уже существует!" -ForegroundColor Yellow
    Write-Host "Путь: $envPath" -ForegroundColor Gray
    $response = Read-Host "Перезаписать? (y/n)"
    if ($response -ne "y") {
        Write-Host "Отменено." -ForegroundColor Red
        exit
    }
}

if (-not (Test-Path $examplePath)) {
    Write-Host "Ошибка: env.example.txt не найден!" -ForegroundColor Red
    Write-Host "Путь: $examplePath" -ForegroundColor Gray
    exit 1
}

Copy-Item $examplePath $envPath -Force
Write-Host "✅ .env файл создан!" -ForegroundColor Green
Write-Host "Путь: $envPath" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  ВАЖНО: Откройте файл .env и заполните:" -ForegroundColor Yellow
Write-Host "   - DB_PASSWORD (ваш пароль SQL Server)" -ForegroundColor Yellow
Write-Host "   - JWT_SECRET (безопасный ключ минимум 32 символа)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Для Windows Authentication установите:" -ForegroundColor Cyan
Write-Host "   DB_TRUSTED_CONNECTION=true" -ForegroundColor Cyan

