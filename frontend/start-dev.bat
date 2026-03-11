@echo off
chcp 65001 >nul
echo Запуск frontend dev сервера...
echo.
if not exist "node_modules" (
    echo Папка node_modules не найдена. Устанавливаю зависимости...
    echo.
    call npm install
    echo.
)
npm run dev
pause
