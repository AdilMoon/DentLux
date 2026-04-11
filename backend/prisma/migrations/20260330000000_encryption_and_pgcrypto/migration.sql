-- Включаем расширение pgcrypto для шифрования внутри БД
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Пример функции для шифрования данных внутри PostgreSQL
-- Использует AES (bf - blowfish или aes)
-- В реальной системе ключ должен передаваться извне или храниться в защищенном месте
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(plain_text TEXT, secret_key TEXT)
RETURNS TEXT AS $$
BEGIN
    IF plain_text IS NULL THEN
        RETURN NULL;
    END IF;
    -- Шифруем данные и возвращаем в формате base64
    RETURN encode(encrypt(plain_text::bytea, secret_key::bytea, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Функция для дешифрования
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_text TEXT, secret_key TEXT)
RETURNS TEXT AS $$
BEGIN
    IF encrypted_text IS NULL THEN
        RETURN NULL;
    END IF;
    -- Дешифруем данные
    RETURN convert_from(decrypt(decode(encrypted_text, 'base64'), secret_key::bytea, 'aes'), 'utf8');
END;
$$ LANGUAGE plpgsql;

-- Пример триггера для автоматического шифрования (демонстрация)
-- Мы можем создать таблицу для демонстрации или использовать существующую
-- Для данного задания просто создадим функции, которыми можно пользоваться
