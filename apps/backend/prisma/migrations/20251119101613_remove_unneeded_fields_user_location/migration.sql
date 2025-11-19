/*
  Warnings:

  - You are about to drop the column `accuracy` on the `UserLocation` table. All the data in the column will be lost.
  - You are about to drop the column `heading` on the `UserLocation` table. All the data in the column will be lost.
  - You are about to drop the column `speed` on the `UserLocation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserLocation" DROP COLUMN "accuracy",
DROP COLUMN "heading",
DROP COLUMN "speed";
