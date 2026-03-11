@echo off
echo ========================================
echo Исправление полей в таблице payments
echo ========================================
echo.

echo Выполняется миграция для добавления полей gateway...
echo.

cd /d "%~dp0"

REM Попробуем автоматическую миграцию
npx prisma migrate deploy

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Миграция успешно применена!
    echo.
    echo Теперь перегенерируйте Prisma Client:
    npx prisma generate
    echo.
    echo Готово!
) else (
    echo.
    echo ⚠️ Автоматическая миграция не удалась.
    echo.
    echo Выполните SQL скрипт вручную:
    echo 1. Откройте вашу базу данных PostgreSQL
    echo 2. Выполните SQL из файла: fix-payment-fields.sql
    echo 3. Затем выполните: npx prisma generate
    echo.
)

pause
