@echo off
chcp 65001 >nul
echo Проверка подключения к SQL Server ARSEN...
echo.
node check-connection.js
pause
