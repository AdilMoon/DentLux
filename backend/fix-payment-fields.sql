-- Добавление недостающих полей в таблицу payments
-- Выполните этот SQL скрипт в вашей базе данных PostgreSQL

-- Добавляем поля для gateway транзакций
ALTER TABLE "payments" 
ADD COLUMN IF NOT EXISTS "gateway_transaction_id" TEXT,
ADD COLUMN IF NOT EXISTS "gateway_type" TEXT,
ADD COLUMN IF NOT EXISTS "payment_url" TEXT;

-- Создаем индекс для gateway_transaction_id (если еще не существует)
CREATE INDEX IF NOT EXISTS "payments_gateway_transaction_id_idx" ON "payments"("gateway_transaction_id");

-- Проверка: должны быть видны все колонки
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'payments' 
-- ORDER BY ordinal_position;
