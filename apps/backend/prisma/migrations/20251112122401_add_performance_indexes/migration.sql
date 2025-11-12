-- CreateIndex
CREATE INDEX "BusinessComment_businessId_isActive_createdAt_idx" ON "BusinessComment"("businessId", "isActive", "createdAt");

-- CreateIndex
CREATE INDEX "Emergency_isActive_status_createdAt_idx" ON "Emergency"("isActive", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Emergency_type_isActive_status_idx" ON "Emergency"("type", "isActive", "status");

-- CreateIndex
CREATE INDEX "Event_isActive_status_isPrivate_startDateTime_idx" ON "Event"("isActive", "status", "isPrivate", "startDateTime");

-- CreateIndex
CREATE INDEX "Event_status_isActive_startDateTime_idx" ON "Event"("status", "isActive", "startDateTime");

-- CreateIndex
CREATE INDEX "EventInvitation_inviteeId_status_isActive_idx" ON "EventInvitation"("inviteeId", "status", "isActive");

-- CreateIndex
CREATE INDEX "EventInvitation_eventId_isActive_status_idx" ON "EventInvitation"("eventId", "isActive", "status");

-- CreateIndex
CREATE INDEX "EventParticipant_eventId_status_isActive_idx" ON "EventParticipant"("eventId", "status", "isActive");

-- CreateIndex
CREATE INDEX "EventParticipant_createdById_status_isActive_idx" ON "EventParticipant"("createdById", "status", "isActive");

-- CreateIndex
CREATE INDEX "GroupMembership_groupId_userId_isActive_status_idx" ON "GroupMembership"("groupId", "userId", "isActive", "status");

-- CreateIndex
CREATE INDEX "GroupMembership_userId_status_isActive_idx" ON "GroupMembership"("userId", "status", "isActive");

-- CreateIndex
CREATE INDEX "Notification_userId_read_isActive_idx" ON "Notification"("userId", "read", "isActive");

-- CreateIndex
CREATE INDEX "Notification_userId_isActive_createdAt_idx" ON "Notification"("userId", "isActive", "createdAt");

-- CreateIndex
CREATE INDEX "Post_isActive_createdAt_idx" ON "Post"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "Post_groupId_isActive_createdAt_idx" ON "Post"("groupId", "isActive", "createdAt");

-- CreateIndex
CREATE INDEX "PostComment_postId_isActive_createdAt_idx" ON "PostComment"("postId", "isActive", "createdAt");

-- CreateIndex
CREATE INDEX "UserFollowing_followerId_isActive_status_idx" ON "UserFollowing"("followerId", "isActive", "status");

-- CreateIndex
CREATE INDEX "UserFollowing_followingId_status_isActive_idx" ON "UserFollowing"("followingId", "status", "isActive");

-- CreateIndex
CREATE INDEX "Warning_isActive_status_createdAt_idx" ON "Warning"("isActive", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Warning_type_isActive_status_idx" ON "Warning"("type", "isActive", "status");
