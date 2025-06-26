/*
  Warnings:

  - You are about to drop the column `groupId` on the `Event` table. All the data in the column will be lost.
  - Made the column `latitude` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `Address` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_groupId_fkey";

-- DropIndex
DROP INDEX "Event_groupId_idx";

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "groupId",
ADD COLUMN     "invitedGroupIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "invitedUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "_EventToGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventToGroup_B_index" ON "_EventToGroup"("B");

-- CreateIndex
CREATE INDEX "Address_latitude_longitude_idx" ON "Address"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_isActive_idx" ON "Comment"("isActive");

-- CreateIndex
CREATE INDEX "DeviceToken_type_idx" ON "DeviceToken"("type");

-- CreateIndex
CREATE INDEX "Event_isPrivate_idx" ON "Event"("isPrivate");

-- CreateIndex
CREATE INDEX "EventInvitation_createdAt_idx" ON "EventInvitation"("createdAt");

-- CreateIndex
CREATE INDEX "EventParticipant_createdAt_idx" ON "EventParticipant"("createdAt");

-- CreateIndex
CREATE INDEX "Group_cityId_idx" ON "Group"("cityId");

-- CreateIndex
CREATE INDEX "Group_privacy_idx" ON "Group"("privacy");

-- CreateIndex
CREATE INDEX "GroupMembership_groupId_idx" ON "GroupMembership"("groupId");

-- CreateIndex
CREATE INDEX "GroupMembership_userId_idx" ON "GroupMembership"("userId");

-- CreateIndex
CREATE INDEX "GroupMembership_status_idx" ON "GroupMembership"("status");

-- CreateIndex
CREATE INDEX "GroupMembership_role_idx" ON "GroupMembership"("role");

-- CreateIndex
CREATE INDEX "GroupMembership_isActive_idx" ON "GroupMembership"("isActive");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_isActive_idx" ON "Notification"("isActive");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_isActive_idx" ON "Post"("isActive");

-- CreateIndex
CREATE INDEX "PostLike_createdAt_idx" ON "PostLike"("createdAt");

-- CreateIndex
CREATE INDEX "PostSave_createdAt_idx" ON "PostSave"("createdAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_supabaseId_idx" ON "User"("supabaseId");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "UserFollowing_createdAt_idx" ON "UserFollowing"("createdAt");

-- AddForeignKey
ALTER TABLE "_EventToGroup" ADD CONSTRAINT "_EventToGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToGroup" ADD CONSTRAINT "_EventToGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
