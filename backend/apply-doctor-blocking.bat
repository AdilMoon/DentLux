@echo off
echo Applying doctor blocking migration...
cd /d "%~dp0"
npx prisma migrate deploy
echo.
echo Regenerating Prisma Client...
npx prisma generate
echo.
echo Done! Please restart your backend server.
pause
