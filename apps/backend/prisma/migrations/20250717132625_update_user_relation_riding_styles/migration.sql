/*
  Warnings:

  - You are about to drop the column `ridingStyle` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_ridingStyle_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "ridingStyle",
ADD COLUMN     "ridingStyles" "RidingStyle"[] DEFAULT ARRAY[]::"RidingStyle"[];

-- CreateIndex
CREATE INDEX "User_ridingStyles_idx" ON "User"("ridingStyles");
