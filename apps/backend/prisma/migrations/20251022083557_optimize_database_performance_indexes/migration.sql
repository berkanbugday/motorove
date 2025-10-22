-- DropIndex
DROP INDEX "Address_businessId_idx";

-- DropIndex
DROP INDEX "Address_country_idx";

-- DropIndex
DROP INDEX "Address_eventId_idx";

-- DropIndex
DROP INDEX "Address_language_idx";

-- DropIndex
DROP INDEX "Address_latitude_longitude_idx";

-- DropIndex
DROP INDEX "Address_postId_idx";

-- DropIndex
DROP INDEX "Address_type_idx";

-- DropIndex
DROP INDEX "Business_category_idx";

-- DropIndex
DROP INDEX "Business_isActive_idx";

-- DropIndex
DROP INDEX "Business_name_idx";

-- DropIndex
DROP INDEX "Business_status_idx";

-- DropIndex
DROP INDEX "Business_verified_idx";

-- DropIndex
DROP INDEX "BusinessDescription_businessId_idx";

-- DropIndex
DROP INDEX "BusinessDescription_isActive_idx";

-- DropIndex
DROP INDEX "BusinessDescription_language_idx";

-- DropIndex
DROP INDEX "City_value_idx";

-- DropIndex
DROP INDEX "Comment_createdAt_idx";

-- DropIndex
DROP INDEX "Comment_createdById_idx";

-- DropIndex
DROP INDEX "Comment_isActive_idx";

-- DropIndex
DROP INDEX "Comment_parentId_idx";

-- DropIndex
DROP INDEX "Comment_postId_idx";

-- DropIndex
DROP INDEX "DeviceToken_isActive_idx";

-- DropIndex
DROP INDEX "DeviceToken_type_idx";

-- DropIndex
DROP INDEX "DeviceToken_userId_idx";

-- DropIndex
DROP INDEX "Equipment_brand_idx";

-- DropIndex
DROP INDEX "Equipment_createdById_idx";

-- DropIndex
DROP INDEX "Equipment_isActive_idx";

-- DropIndex
DROP INDEX "Equipment_type_idx";

-- DropIndex
DROP INDEX "Event_createdById_idx";

-- DropIndex
DROP INDEX "Event_eventType_idx";

-- DropIndex
DROP INDEX "Event_isActive_idx";

-- DropIndex
DROP INDEX "Event_isPrivate_idx";

-- DropIndex
DROP INDEX "Event_organizedByGroupId_idx";

-- DropIndex
DROP INDEX "Event_startDateTime_idx";

-- DropIndex
DROP INDEX "Event_status_idx";

-- DropIndex
DROP INDEX "EventInvitation_createdAt_idx";

-- DropIndex
DROP INDEX "EventInvitation_createdById_idx";

-- DropIndex
DROP INDEX "EventInvitation_eventId_idx";

-- DropIndex
DROP INDEX "EventInvitation_inviteeId_idx";

-- DropIndex
DROP INDEX "EventInvitation_isActive_idx";

-- DropIndex
DROP INDEX "EventInvitation_status_idx";

-- DropIndex
DROP INDEX "EventParticipant_createdAt_idx";

-- DropIndex
DROP INDEX "EventParticipant_createdById_idx";

-- DropIndex
DROP INDEX "EventParticipant_eventId_idx";

-- DropIndex
DROP INDEX "EventParticipant_isActive_idx";

-- DropIndex
DROP INDEX "EventParticipant_status_idx";

-- DropIndex
DROP INDEX "Group_cityId_idx";

-- DropIndex
DROP INDEX "Group_privacy_idx";

-- DropIndex
DROP INDEX "GroupMembership_groupId_idx";

-- DropIndex
DROP INDEX "GroupMembership_isActive_idx";

-- DropIndex
DROP INDEX "GroupMembership_role_idx";

-- DropIndex
DROP INDEX "GroupMembership_status_idx";

-- DropIndex
DROP INDEX "GroupMembership_userId_idx";

-- DropIndex
DROP INDEX "Motorcycle_brand_idx";

-- DropIndex
DROP INDEX "Motorcycle_createdById_idx";

-- DropIndex
DROP INDEX "Motorcycle_isActive_idx";

-- DropIndex
DROP INDEX "Notification_channel_idx";

-- DropIndex
DROP INDEX "Notification_createdAt_idx";

-- DropIndex
DROP INDEX "Notification_isActive_idx";

-- DropIndex
DROP INDEX "Notification_read_idx";

-- DropIndex
DROP INDEX "Notification_status_idx";

-- DropIndex
DROP INDEX "Notification_type_idx";

-- DropIndex
DROP INDEX "Notification_userId_idx";

-- DropIndex
DROP INDEX "Post_createdAt_idx";

-- DropIndex
DROP INDEX "Post_createdById_idx";

-- DropIndex
DROP INDEX "Post_groupId_idx";

-- DropIndex
DROP INDEX "Post_isActive_idx";

-- DropIndex
DROP INDEX "PostLike_createdAt_idx";

-- DropIndex
DROP INDEX "PostLike_postId_idx";

-- DropIndex
DROP INDEX "PostLike_userId_idx";

-- DropIndex
DROP INDEX "PostSave_createdAt_idx";

-- DropIndex
DROP INDEX "PostSave_postId_idx";

-- DropIndex
DROP INDEX "PostSave_userId_idx";

-- DropIndex
DROP INDEX "SocialMedia_createdById_idx";

-- DropIndex
DROP INDEX "SocialMedia_isActive_idx";

-- DropIndex
DROP INDEX "SocialMedia_platform_idx";

-- DropIndex
DROP INDEX "SupportRequest_category_idx";

-- DropIndex
DROP INDEX "SupportRequest_createdById_idx";

-- DropIndex
DROP INDEX "SupportRequest_isActive_idx";

-- DropIndex
DROP INDEX "User_cityId_idx";

-- DropIndex
DROP INDEX "User_gender_idx";

-- DropIndex
DROP INDEX "User_interests_idx";

-- DropIndex
DROP INDEX "User_isActive_idx";

-- DropIndex
DROP INDEX "User_ridingStyles_idx";

-- DropIndex
DROP INDEX "UserFollowing_createdAt_idx";

-- DropIndex
DROP INDEX "UserFollowing_followerId_idx";

-- DropIndex
DROP INDEX "UserFollowing_followingId_idx";

-- DropIndex
DROP INDEX "UserFollowing_isActive_idx";

-- DropIndex
DROP INDEX "UserFollowing_status_idx";

-- DropIndex
DROP INDEX "UserSetting_notificationPermission_idx";

-- DropIndex
DROP INDEX "UserSetting_preferredLanguage_idx";

-- DropIndex
DROP INDEX "UserSetting_userId_idx";

-- DropIndex
DROP INDEX "WorkingHour_businessId_idx";

-- DropIndex
DROP INDEX "WorkingHour_dayOfWeek_idx";

-- DropIndex
DROP INDEX "WorkingHour_isActive_idx";

-- CreateIndex
CREATE INDEX "Equipment_updatedById_idx" ON "Equipment"("updatedById");

-- CreateIndex
CREATE INDEX "Event_updatedById_idx" ON "Event"("updatedById");

-- CreateIndex
CREATE INDEX "EventInvitation_updatedById_idx" ON "EventInvitation"("updatedById");

-- CreateIndex
CREATE INDEX "EventParticipant_updatedById_idx" ON "EventParticipant"("updatedById");

-- CreateIndex
CREATE INDEX "Group_createdById_idx" ON "Group"("createdById");

-- CreateIndex
CREATE INDEX "Group_updatedById_idx" ON "Group"("updatedById");

-- CreateIndex
CREATE INDEX "GroupMembership_createdById_idx" ON "GroupMembership"("createdById");

-- CreateIndex
CREATE INDEX "GroupMembership_updatedById_idx" ON "GroupMembership"("updatedById");

-- CreateIndex
CREATE INDEX "Motorcycle_updatedById_idx" ON "Motorcycle"("updatedById");

-- CreateIndex
CREATE INDEX "Notification_createdById_idx" ON "Notification"("createdById");

-- CreateIndex
CREATE INDEX "Notification_updatedById_idx" ON "Notification"("updatedById");

-- CreateIndex
CREATE INDEX "Post_updatedById_idx" ON "Post"("updatedById");

-- CreateIndex
CREATE INDEX "SocialMedia_updatedById_idx" ON "SocialMedia"("updatedById");

-- CreateIndex
CREATE INDEX "SupportRequest_updatedById_idx" ON "SupportRequest"("updatedById");
