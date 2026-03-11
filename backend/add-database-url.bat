@echo off
chcp 65001 >nul
echo Проверка и добавление DATABASE_URL в .env файл...
echo.

cd /d "%~dp0"

if not exist .env (
    echo Создание нового .env файла...
    (
        echo # Server
        echo PORT=4000
        echo NODE_ENV=development
        echo.
        echo # PostgreSQL Database
        echo DATABASE_URL="postgresql://postgres:12345@localhost:5432/dentreserve_pro?schema=public"
        echo.
        echo # JWT
        echo JWT_SECRET=ваш_секретный_ключ_минимум_32_символа_для_jwt_токенов_и_безопасности
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # CORS
        echo ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:3100,http://localhost:3200,http://localhost:4000
    ) > .env
    echo ✅ Создан новый .env файл с DATABASE_URL
) else (
    findstr /C:"DATABASE_URL" .env >nul
    if errorlevel 1 (
        echo Добавление DATABASE_URL в существующий .env файл...
        echo. >> .env
        echo # PostgreSQL Database >> .env
        echo DATABASE_URL="postgresql://postgres:12345@localhost:5432/dentreserve_pro?schema=public" >> .env
        echo ✅ DATABASE_URL добавлен в .env файл
    ) else (
        echo ✅ DATABASE_URL уже существует в .env файле
        echo.
        echo Проверьте, что значение правильное:
        findstr /C:"DATABASE_URL" .env
    )
)

echo.
echo 📝 Проверьте DATABASE_URL в файле .env
echo    Формат: DATABASE_URL="postgresql://postgres:ПАРОЛЬ@localhost:5432/dentreserve_pro?schema=public"
echo    Текущий пароль установлен из вашего запроса.
echo.
pause
