-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "organizedByGroupId" TEXT,
ADD COLUMN     "organizedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Event_organizedByUserId_idx" ON "Event"("organizedByUserId");

-- CreateIndex
CREATE INDEX "Event_organizedByGroupId_idx" ON "Event"("organizedByGroupId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizedByUserId_fkey" FOREIGN KEY ("organizedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizedByGroupId_fkey" FOREIGN KEY ("organizedByGroupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
