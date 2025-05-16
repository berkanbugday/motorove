-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'GROUP_MEMBERSHIP_STATUS_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_MEMBERSHIP_ROLE_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_MEMBERSHIP_REMOVED';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_MEMBERSHIP_ADDED';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_MEMBERSHIP_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_MEMBERSHIP_REQUEST_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_MEMBERSHIP_REQUEST_REJECTED';
