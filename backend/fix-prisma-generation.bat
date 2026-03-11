@echo off
echo Stopping Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Regenerating Prisma Client...
cd /d "%~dp0"
npx prisma generate
echo.
if %ERRORLEVEL% EQU 0 (
    echo Prisma Client regenerated successfully!
) else (
    echo Error occurred. Try again after closing all Node.js processes.
)
pause
