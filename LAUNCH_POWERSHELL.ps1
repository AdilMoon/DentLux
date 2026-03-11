# Скрипт для запуска всех компонентов
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Запуск DentReserve Pro" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

# Проверка .env файлов
Write-Host "[Проверка] .env файлы..." -ForegroundColor Yellow

$backendEnv = Join-Path $backendPath ".env"
$frontendEnv = Join-Path $frontendPath ".env"

if (-not (Test-Path $backendEnv)) {
    Write-Host "⚠️  Backend .env не найден!" -ForegroundColor Red
    Write-Host "   Создайте файл: $backendEnv" -ForegroundColor Yellow
    Write-Host "   Или выполните: cd backend && npm run setup-env" -ForegroundColor Yellow
}

if (-not (Test-Path $frontendEnv)) {
    Write-Host "⚠️  Frontend .env не найден! Создаю..." -ForegroundColor Yellow
    Set-Content -Path $frontendEnv -Value "VITE_API_BASE_URL=http://localhost:3000/api" -Encoding UTF8
    Write-Host "✅ Frontend .env создан" -ForegroundColor Green
}

Write-Host ""
Write-Host "[1/2] Запуск Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "[2/2] Запуск Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Серверы запущены!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Нажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
