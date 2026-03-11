-- Добавляем поля блокировки доктора
ALTER TABLE "doctors"
ADD COLUMN IF NOT EXISTS "is_blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "blocked_until" TIMESTAMP(3);

-- Создаем индекс для быстрого поиска заблокированных докторов
CREATE INDEX IF NOT EXISTS "doctors_is_blocked_idx" ON "doctors"("is_blocked");
