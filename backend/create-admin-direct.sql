-- Прямой SQL скрипт для создания администратора с хэшированным паролем
-- ВНИМАНИЕ: Вы должны сначала получить хэш пароля из Node.js скрипта
-- 
-- Для получения хэша пароля:
-- 1. Откройте Node.js консоль в папке backend
-- 2. Выполните: const bcrypt = require('bcrypt'); bcrypt.hash('ваш_пароль', 10).then(console.log);
-- 3. Скопируйте полученный хэш и вставьте в @passwordHash ниже

USE dentreserve_pro;
GO

-- ВАШИ ДАННЫЕ (замените значения)
DECLARE @email NVARCHAR(255) = 'biba@a.com';
DECLARE @passwordHash NVARCHAR(255) = '';  -- ВСТАВЬТЕ ХЭШ ПАРОЛЯ СЮДА
DECLARE @fullName NVARCHAR(255) = 'Bibinur';
DECLARE @phone NVARCHAR(50) = NULL;
DECLARE @role NVARCHAR(20) = 'ADMIN';

-- Проверка существования пользователя
IF EXISTS (SELECT 1 FROM users WHERE email = @email)
BEGIN
    PRINT '❌ Пользователь с таким email уже существует!';
    PRINT '   Используйте UPDATE запрос для изменения роли:';
    PRINT '   UPDATE users SET role = ''ADMIN'' WHERE email = ''' + @email + ''';';
    RETURN;
END

-- Вставка администратора
IF @passwordHash = ''
BEGIN
    PRINT '❌ ОШИБКА: Пароль не указан!';
    PRINT '';
    PRINT 'Для получения хэша пароля выполните в Node.js:';
    PRINT '  const bcrypt = require(''bcrypt'');';
    PRINT '  bcrypt.hash(''ваш_пароль'', 10).then(console.log);';
    RETURN;
END

INSERT INTO users (email, password_hash, role, full_name, phone)
VALUES (@email, @passwordHash, @role, @fullName, @phone);

PRINT '✅ Администратор успешно создан!';
PRINT '   Email: ' + @email;
PRINT '   Имя: ' + @fullName;
PRINT '   Роль: ' + @role;
GO
