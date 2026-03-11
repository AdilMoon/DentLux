-- Добавляем поле avatar_url в таблицу users
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;

-- Создаем таблицу client_blocks
CREATE TABLE IF NOT EXISTS "client_blocks" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "blocked_by" TEXT NOT NULL,
    "reason" TEXT,
    "appointment_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "unblocked_at" TIMESTAMP(3),
    "unblocked_by" TEXT,

    CONSTRAINT "client_blocks_pkey" PRIMARY KEY ("id")
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS "client_blocks_client_id_idx" ON "client_blocks"("client_id");
CREATE INDEX IF NOT EXISTS "client_blocks_is_active_idx" ON "client_blocks"("is_active");
CREATE INDEX IF NOT EXISTS "client_blocks_appointment_id_idx" ON "client_blocks"("appointment_id");
CREATE INDEX IF NOT EXISTS "client_blocks_created_at_idx" ON "client_blocks"("created_at");

-- Добавляем внешние ключи
ALTER TABLE "client_blocks" ADD CONSTRAINT "client_blocks_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_blocks" ADD CONSTRAINT "client_blocks_blocked_by_fkey" FOREIGN KEY ("blocked_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "client_blocks" ADD CONSTRAINT "client_blocks_unblocked_by_fkey" FOREIGN KEY ("unblocked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "client_blocks" ADD CONSTRAINT "client_blocks_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
