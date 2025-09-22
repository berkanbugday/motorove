/*
  Warnings:

  - You are about to drop the column `garageId` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `garageId` on the `Motorcycle` table. All the data in the column will be lost.
  - You are about to drop the `Garage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_garageId_fkey";

-- DropForeignKey
ALTER TABLE "Garage" DROP CONSTRAINT "Garage_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Garage" DROP CONSTRAINT "Garage_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Motorcycle" DROP CONSTRAINT "Motorcycle_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Motorcycle" DROP CONSTRAINT "Motorcycle_garageId_fkey";

-- DropIndex
DROP INDEX "Equipment_garageId_idx";

-- DropIndex
DROP INDEX "Motorcycle_garageId_idx";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "garageId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Motorcycle" DROP COLUMN "garageId",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "Garage";

-- CreateIndex
CREATE INDEX "Equipment_createdById_idx" ON "Equipment"("createdById");

-- CreateIndex
CREATE INDEX "Motorcycle_createdById_idx" ON "Motorcycle"("createdById");

-- AddForeignKey
ALTER TABLE "Motorcycle" ADD CONSTRAINT "Motorcycle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motorcycle" ADD CONSTRAINT "Motorcycle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
