@echo off
echo Creating medical_records table...
cd /d "%~dp0"
echo.
echo Applying migration...
npx prisma migrate deploy
echo.
echo Regenerating Prisma Client...
npx prisma generate
echo.
echo Done! Please restart your backend server.
pause
