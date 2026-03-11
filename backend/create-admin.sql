-- SQL скрипт для создания администраторского аккаунта
-- Выполните этот скрипт в SQL Server Management Studio (SSMS)

USE dentreserve_pro;
GO

-- Замените эти значения на ваши данные
DECLARE @email NVARCHAR(255) = 'biba@a.com';  -- ВАШ EMAIL
DECLARE @password NVARCHAR(255) = 'bibaba123+';  -- ВАШ ПАРОЛЬ
DECLARE @fullName NVARCHAR(255) = 'Bibinur';  -- ВАШЕ ИМЯ
DECLARE @phone NVARCHAR(50) = NULL;  -- ВАШ ТЕЛЕФОН (или NULL)

-- Проверка существования пользователя
IF EXISTS (SELECT 1 FROM users WHERE email = @email)
BEGIN
    PRINT '❌ Пользователь с таким email уже существует!';
    RETURN;
END

-- ВАЖНО: Пароль должен быть хэширован с помощью bcrypt
-- Для простоты здесь используется простая вставка, но в production нужен хэшированный пароль
-- Рекомендуется использовать Node.js скрипт create-admin.js для правильного хэширования

-- Если вы хотите создать временный пароль для первого входа, используйте этот код:
-- Затем измените пароль через интерфейс приложения

-- Пример с простым паролем (НЕ РЕКОМЕНДУЕТСЯ для production!)
-- Для правильного создания используйте Node.js скрипт: node create-admin.js

PRINT '⚠️  ВНИМАНИЕ: Этот SQL скрипт НЕ хэширует пароль!';
PRINT '   Для безопасного создания используйте: node create-admin.js';
PRINT '   Или создайте пользователя через интерфейс регистрации и измените роль на ADMIN';

-- Альтернатива: если вам нужен временный аккаунт, можете создать его вручную
-- и затем изменить роль через UPDATE запрос:

-- UPDATE users SET role = 'ADMIN' WHERE email = 'ваш_email@example.com';

GO
