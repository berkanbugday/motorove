/*
  Warnings:

  - You are about to drop the column `organizedByUserId` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_organizedByUserId_fkey";

-- DropIndex
DROP INDEX "Event_organizedByUserId_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "organizedByUserId";
