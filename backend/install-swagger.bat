@echo off
echo Installing Swagger dependencies...
cd /d "%~dp0"
npm install swagger-ui-express swagger-jsdoc --save
echo.
echo Installation complete!
pause
