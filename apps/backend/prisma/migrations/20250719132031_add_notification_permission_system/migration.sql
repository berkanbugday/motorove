/*
  Warnings:

  - Added the required column `channel` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationPermission" AS ENUM ('ALLOWED', 'BLOCKED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'EMAIL');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "channel" "NotificationChannel" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationPermission" "NotificationPermission" NOT NULL DEFAULT 'UNKNOWN';

-- CreateTable
CREATE TABLE "UserNotificationSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserNotificationSetting_userId_idx" ON "UserNotificationSetting"("userId");

-- CreateIndex
CREATE INDEX "UserNotificationSetting_notificationType_idx" ON "UserNotificationSetting"("notificationType");

-- CreateIndex
CREATE INDEX "UserNotificationSetting_channel_idx" ON "UserNotificationSetting"("channel");

-- CreateIndex
CREATE INDEX "UserNotificationSetting_isEnabled_idx" ON "UserNotificationSetting"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationSetting_userId_notificationType_channel_key" ON "UserNotificationSetting"("userId", "notificationType", "channel");

-- CreateIndex
CREATE INDEX "Notification_channel_idx" ON "Notification"("channel");

-- CreateIndex
CREATE INDEX "User_notificationPermission_idx" ON "User"("notificationPermission");

-- AddForeignKey
ALTER TABLE "UserNotificationSetting" ADD CONSTRAINT "UserNotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
