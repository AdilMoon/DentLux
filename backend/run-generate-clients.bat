@echo off
chcp 65001 >nul
echo Запуск генерации 150 клиентов...
node generate-clients.js
pause
