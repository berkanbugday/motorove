-- CreateTable
CREATE TABLE "BusinessComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "businessId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BusinessComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessComment_createdById_idx" ON "BusinessComment"("createdById");

-- CreateIndex
CREATE INDEX "BusinessComment_businessId_idx" ON "BusinessComment"("businessId");

-- AddForeignKey
ALTER TABLE "BusinessComment" ADD CONSTRAINT "BusinessComment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessComment" ADD CONSTRAINT "BusinessComment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessComment" ADD CONSTRAINT "BusinessComment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
