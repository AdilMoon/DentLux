-- AlterTable
ALTER TABLE "payments" ADD COLUMN "gateway_transaction_id" TEXT,
ADD COLUMN "gateway_type" TEXT,
ADD COLUMN "payment_url" TEXT;

-- CreateIndex
CREATE INDEX "payments_gateway_transaction_id_idx" ON "payments"("gateway_transaction_id");
