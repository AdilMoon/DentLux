-- Простой скрипт для изменения роли пользователя на ADMIN
-- Используйте этот скрипт ПОСЛЕ регистрации через форму на сайте

USE dentreserve_pro;
GO

-- Замените email на ваш email
DECLARE @email NVARCHAR(255) = 'biba@a.com';

-- Проверка существования пользователя
IF NOT EXISTS (SELECT 1 FROM users WHERE email = @email)
BEGIN
    PRINT '❌ Пользователь с email ' + @email + ' не найден!';
    PRINT '   Сначала зарегистрируйтесь через форму на сайте.';
    RETURN;
END

-- Изменение роли на ADMIN
UPDATE users 
SET role = 'ADMIN'
WHERE email = @email;

-- Проверка результата
IF @@ROWCOUNT > 0
BEGIN
    SELECT 
        id,
        email,
        full_name,
        role,
        phone,
        created_at
    FROM users 
    WHERE email = @email;
    
    PRINT '';
    PRINT '✅ Роль пользователя успешно изменена на ADMIN!';
    PRINT '   Теперь вы можете войти в систему с правами администратора.';
END
ELSE
BEGIN
    PRINT '❌ Не удалось изменить роль пользователя.';
END
GO
