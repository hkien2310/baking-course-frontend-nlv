-- CreateTable
CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "maxDiscount" INTEGER,
    "minOrderValue" INTEGER NOT NULL DEFAULT 0,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- AlterTable (Adding Loyalty fields to User)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='memberTier') THEN
        ALTER TABLE "User" ADD COLUMN "memberTier" TEXT NOT NULL DEFAULT 'NONE';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='points') THEN
        ALTER TABLE "User" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='totalSpent') THEN
        ALTER TABLE "User" ADD COLUMN "totalSpent" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- AlterTable (Adding Payment/Loyalty fields to Order)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Order' AND column_name='gatewayResponseCode') THEN
        ALTER TABLE "Order" ADD COLUMN "gatewayResponseCode" TEXT;
        ALTER TABLE "Order" ADD COLUMN "gatewayTransactionNo" TEXT;
        ALTER TABLE "Order" ADD COLUMN "gatewayTransactionStatus" TEXT;
        ALTER TABLE "Order" ADD COLUMN "gatewayTxnRef" TEXT;
        ALTER TABLE "Order" ADD COLUMN "paidAt" TIMESTAMP(3);
        ALTER TABLE "Order" ADD COLUMN "paymentExpiresAt" TIMESTAMP(3);
        ALTER TABLE "Order" ADD COLUMN "paymentInitiatedAt" TIMESTAMP(3);
        ALTER TABLE "Order" ADD COLUMN "paymentMethod" TEXT;
        ALTER TABLE "Order" ADD COLUMN "paymentProvider" TEXT;
        ALTER TABLE "Order" ADD COLUMN "paymentUrl" TEXT;
        ALTER TABLE "Order" ADD COLUMN "rawGatewayPayload" JSONB;
        ALTER TABLE "Order" ADD COLUMN "companyAddress" TEXT;
        ALTER TABLE "Order" ADD COLUMN "companyName" TEXT;
        ALTER TABLE "Order" ADD COLUMN "invoiceEmail" TEXT;
        ALTER TABLE "Order" ADD COLUMN "requiresInvoice" BOOLEAN NOT NULL DEFAULT false;
        ALTER TABLE "Order" ADD COLUMN "subTotal" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "Order" ADD COLUMN "taxCode" TEXT;
        ALTER TABLE "Order" ADD COLUMN "vatAmount" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "Order" ADD COLUMN "appliedDiscounts" TEXT[] DEFAULT ARRAY[]::TEXT[];
        ALTER TABLE "Order" ADD COLUMN "pointsDiscount" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "Order" ADD COLUMN "pointsEarned" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "Order" ADD COLUMN "pointsUsed" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "Order" ADD COLUMN "promoCodeDiscount" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "Order" ADD COLUMN "promoCodeId" TEXT;
        ALTER TABLE "Order" ADD COLUMN "tierDiscount" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "PromoCode_code_key" ON "PromoCode"("code");

-- AddForeignKey (Only if not already there, but usually okay for simple re-runs)
-- Note: Foreign keys can be tricky to check, but since we are fixing a failed state:
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='RefreshToken_userId_fkey') THEN
        ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Order_promoCodeId_fkey') THEN
        ALTER TABLE "Order" ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
