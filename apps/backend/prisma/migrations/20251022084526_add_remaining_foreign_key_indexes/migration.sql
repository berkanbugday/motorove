-- DropIndex
DROP INDEX "Comment_updatedById_idx";

-- DropIndex
DROP INDEX "Equipment_updatedById_idx";

-- DropIndex
DROP INDEX "Event_updatedById_idx";

-- DropIndex
DROP INDEX "EventInvitation_updatedById_idx";

-- DropIndex
DROP INDEX "EventParticipant_updatedById_idx";

-- DropIndex
DROP INDEX "Group_updatedById_idx";

-- DropIndex
DROP INDEX "GroupMembership_updatedById_idx";

-- DropIndex
DROP INDEX "Motorcycle_updatedById_idx";

-- DropIndex
DROP INDEX "Notification_updatedById_idx";

-- DropIndex
DROP INDEX "Post_updatedById_idx";

-- DropIndex
DROP INDEX "SocialMedia_updatedById_idx";

-- DropIndex
DROP INDEX "SupportRequest_updatedById_idx";

-- CreateIndex
CREATE INDEX "Comment_createdById_idx" ON "Comment"("createdById");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Equipment_createdById_idx" ON "Equipment"("createdById");

-- CreateIndex
CREATE INDEX "Event_createdById_idx" ON "Event"("createdById");

-- CreateIndex
CREATE INDEX "Event_organizedByGroupId_idx" ON "Event"("organizedByGroupId");

-- CreateIndex
CREATE INDEX "EventInvitation_createdById_idx" ON "EventInvitation"("createdById");

-- CreateIndex
CREATE INDEX "EventInvitation_inviteeId_idx" ON "EventInvitation"("inviteeId");

-- CreateIndex
CREATE INDEX "EventParticipant_createdById_idx" ON "EventParticipant"("createdById");

-- CreateIndex
CREATE INDEX "Group_cityId_idx" ON "Group"("cityId");

-- CreateIndex
CREATE INDEX "GroupMembership_userId_idx" ON "GroupMembership"("userId");

-- CreateIndex
CREATE INDEX "Motorcycle_createdById_idx" ON "Motorcycle"("createdById");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Post_createdById_idx" ON "Post"("createdById");

-- CreateIndex
CREATE INDEX "Post_groupId_idx" ON "Post"("groupId");

-- CreateIndex
CREATE INDEX "PostLike_userId_idx" ON "PostLike"("userId");

-- CreateIndex
CREATE INDEX "PostSave_userId_idx" ON "PostSave"("userId");

-- CreateIndex
CREATE INDEX "SocialMedia_createdById_idx" ON "SocialMedia"("createdById");

-- CreateIndex
CREATE INDEX "SupportRequest_createdById_idx" ON "SupportRequest"("createdById");

-- CreateIndex
CREATE INDEX "User_cityId_idx" ON "User"("cityId");

-- CreateIndex
CREATE INDEX "UserFollowing_followingId_idx" ON "UserFollowing"("followingId");
