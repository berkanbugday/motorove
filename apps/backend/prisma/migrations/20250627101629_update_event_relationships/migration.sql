/*
  Warnings:

  - You are about to drop the column `inviterId` on the `EventInvitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventId,createdById]` on the table `EventParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `EventInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `EventParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EventInvitation" DROP CONSTRAINT "EventInvitation_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_userId_fkey";

-- DropIndex
DROP INDEX "EventInvitation_inviterId_idx";

-- DropIndex
DROP INDEX "EventParticipant_eventId_userId_key";

-- DropIndex
DROP INDEX "EventParticipant_userId_idx";

-- AlterTable
ALTER TABLE "EventInvitation" DROP COLUMN "inviterId",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "EventParticipant" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedById" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "EventInvitation_createdById_idx" ON "EventInvitation"("createdById");

-- CreateIndex
CREATE INDEX "EventInvitation_isActive_idx" ON "EventInvitation"("isActive");

-- CreateIndex
CREATE INDEX "EventParticipant_createdById_idx" ON "EventParticipant"("createdById");

-- CreateIndex
CREATE INDEX "EventParticipant_isActive_idx" ON "EventParticipant"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipant_eventId_createdById_key" ON "EventParticipant"("eventId", "createdById");

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
