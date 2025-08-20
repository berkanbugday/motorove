-- CreateEnum
CREATE TYPE "SupportCategory" AS ENUM ('ACCOUNT', 'TECHNICAL', 'FEEDBACK', 'FEATURE_REQUEST', 'BUG_REPORT', 'OTHER');

-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BusinessDescription" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WorkingHour" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "SupportRequest" (
    "id" TEXT NOT NULL,
    "category" "SupportCategory" NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "deviceInfo" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SupportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupportRequest_category_idx" ON "SupportRequest"("category");

-- CreateIndex
CREATE INDEX "SupportRequest_createdById_idx" ON "SupportRequest"("createdById");

-- CreateIndex
CREATE INDEX "SupportRequest_isActive_idx" ON "SupportRequest"("isActive");

-- AddForeignKey
ALTER TABLE "SupportRequest" ADD CONSTRAINT "SupportRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportRequest" ADD CONSTRAINT "SupportRequest_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
