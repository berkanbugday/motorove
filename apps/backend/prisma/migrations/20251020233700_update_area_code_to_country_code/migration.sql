/*
  Warnings:

  - You are about to drop the column `areaCode` on the `Business` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "areaCode",
ADD COLUMN     "countryCode" TEXT;
