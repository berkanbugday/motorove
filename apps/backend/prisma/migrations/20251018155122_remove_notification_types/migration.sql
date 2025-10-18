/*
  Warnings:

  - The values [EVENT_INVITATION_ACCEPTED,EVENT_INVITATION_REJECTED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('SYSTEM', 'SHARED_POST_IN_GROUP', 'POST_LIKE', 'POST_COMMENT', 'POST_SAVE', 'USER_FOLLOW_REQUEST', 'USER_FOLLOW_REQUEST_ACCEPTED', 'NEW_FOLLOWER', 'GROUP_CHANGED_INFO', 'GROUP_JOIN_REQUEST', 'GROUP_JOIN_REQUEST_ACCEPTED', 'USER_JOINED_GROUP', 'USER_LEAVE_GROUP', 'ADMIN_REMOVED_GROUP_MEMBER', 'ADMIN_CHANGED_GROUP_MEMBER_ROLE', 'EVENT_INVITATION', 'EVENT_REMINDER', 'EVENT_CANCELLED', 'EVENT_UPDATED');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;
