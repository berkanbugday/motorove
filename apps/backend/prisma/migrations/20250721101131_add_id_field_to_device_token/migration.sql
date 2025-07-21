/*
  Warnings:

  - The primary key for the `DeviceToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[token,userId]` on the table `DeviceToken` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `DeviceToken` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "DeviceToken" DROP CONSTRAINT "DeviceToken_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_token_userId_key" ON "DeviceToken"("token", "userId");
