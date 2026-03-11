@echo off
chcp 65001 >nul
echo Установка Prisma и PostgreSQL...
echo.
cd /d "%~dp0"
npm install prisma @prisma/client pg --save
echo.
echo Установка завершена!
pause



