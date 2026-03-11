@echo off
echo Поиск процесса на порту 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Найден процесс с PID: %%a
    taskkill /PID %%a /F
    echo Процесс завершен
)
echo Готово!
pause


