@echo off
chcp 65001 >nul
echo ========================================
echo Настройка Prisma для PostgreSQL
echo ========================================
echo.

cd /d "%~dp0"

echo Шаг 1: Генерация Prisma Client...
call npx prisma generate
echo.

echo Шаг 2: Создание миграций и таблиц...
call npx prisma migrate dev --name init
echo.

echo Шаг 3: Заполнение базы данных начальными данными...
call npx prisma db seed
echo.

echo ========================================
echo Настройка завершена!
echo ========================================
pause



