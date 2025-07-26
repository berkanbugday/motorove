/*
  Warnings:

  - You are about to drop the column `notificationPermission` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_notificationPermission_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "notificationPermission";

-- AlterTable
ALTER TABLE "UserSetting" ADD COLUMN     "notificationPermission" "NotificationPermission" NOT NULL DEFAULT 'UNKNOWN';

-- CreateIndex
CREATE INDEX "UserSetting_notificationPermission_idx" ON "UserSetting"("notificationPermission");
