/*
  Warnings:

  - The values [BLOCKED] on the enum `NotificationPermission` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationPermission_new" AS ENUM ('ALLOWED', 'NOT_ALLOWED', 'UNKNOWN');
ALTER TABLE "User" ALTER COLUMN "notificationPermission" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "notificationPermission" TYPE "NotificationPermission_new" USING ("notificationPermission"::text::"NotificationPermission_new");
ALTER TYPE "NotificationPermission" RENAME TO "NotificationPermission_old";
ALTER TYPE "NotificationPermission_new" RENAME TO "NotificationPermission";
DROP TYPE "NotificationPermission_old";
ALTER TABLE "User" ALTER COLUMN "notificationPermission" SET DEFAULT 'UNKNOWN';
COMMIT;
