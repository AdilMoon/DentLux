@echo off
chcp 65001 >nul
echo Диагностика подключения к SQL Server...
echo.
node diagnose-connection.js
pause
