@echo off
chcp 65001 >nul
echo ========================================
echo   Запуск DentReserve Pro
echo ========================================
echo.

echo [1/2] Запуск Backend...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Запуск Frontend...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================
echo   Оба сервера запущены!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Нажмите любую клавишу для выхода...
pause >nul
