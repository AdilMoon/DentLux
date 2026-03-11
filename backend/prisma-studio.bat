@echo off
chcp 65001 >nul
echo Запуск Prisma Studio...
echo.
cd /d "%~dp0"
npx prisma studio
pause



