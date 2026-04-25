-- Enum для журнала аудита
CREATE TYPE "AuditAction" AS ENUM (
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'APPROVE',
  'REJECT',
  'CANCEL'
);

-- Отзывы пациентов
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "doctor_id" TEXT,
    "service_id" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reviews_appointment_id_key" ON "reviews"("appointment_id");
CREATE INDEX "reviews_client_id_idx" ON "reviews"("client_id");
CREATE INDEX "reviews_doctor_id_idx" ON "reviews"("doctor_id");
CREATE INDEX "reviews_service_id_idx" ON "reviews"("service_id");
CREATE INDEX "reviews_appointment_id_idx" ON "reviews"("appointment_id");
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX "reviews_is_approved_idx" ON "reviews"("is_approved");
CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Журнал аудита
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "changes" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");
CREATE INDEX "audit_logs_entity_id_idx" ON "audit_logs"("entity_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
