@echo off
echo Запуск проекта через Docker Compose...
docker-compose up -d --build
if %errorlevel% neq 0 (
    echo [ERROR] Не удалось запустить проект. Убедитесь, что Docker Desktop запущен.
    pause
    exit /b %errorlevel%
)
echo.
echo ✅ Все сервисы запущены!
echo 🌐 Frontend: http://localhost
echo ⚙️  Backend API: http://localhost:4000/api
echo 🐳 Portainer: http://localhost:9000
echo.
echo Для остановки нажмите любую клавишу...
pause
docker-compose down
