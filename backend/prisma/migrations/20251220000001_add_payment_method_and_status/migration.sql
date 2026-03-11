-- Добавляем PENDING в PaymentStatus enum
-- В PostgreSQL нельзя просто добавить значение в существующий enum, поэтому создаем новый тип
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PENDING' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PaymentStatus')) THEN
        ALTER TYPE "PaymentStatus" ADD VALUE 'PENDING';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Создаем PaymentMethod enum
DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM('CASH', 'CARD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Добавляем поле payment_method в таблицу payments
ALTER TABLE "payments" 
ADD COLUMN IF NOT EXISTS "payment_method" "PaymentMethod";

-- Устанавливаем дефолтное значение для существующих записей
UPDATE "payments" 
SET "payment_method" = 'CASH' 
WHERE "payment_method" IS NULL;

-- Теперь делаем поле NOT NULL с дефолтом
ALTER TABLE "payments" 
ALTER COLUMN "payment_method" SET NOT NULL,
ALTER COLUMN "payment_method" SET DEFAULT 'CASH';
