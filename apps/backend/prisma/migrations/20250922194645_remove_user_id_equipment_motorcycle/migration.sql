/*
  Warnings:

  - You are about to drop the column `userId` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Motorcycle` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Motorcycle" DROP CONSTRAINT "Motorcycle_userId_fkey";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Motorcycle" DROP COLUMN "userId";
