@echo off
chcp 65001 >nul
echo Создание администраторского аккаунта...
echo.
node create-admin.js
pause
