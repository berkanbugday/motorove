-- CreateEnum
CREATE TYPE "GroupPrivacy" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "GroupMemberRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'SHARED_POST_IN_GROUP', 'POST_LIKE', 'POST_COMMENT', 'POST_SAVE', 'USER_FOLLOW_REQUEST', 'USER_FOLLOW_REQUEST_ACCEPTED', 'NEW_FOLLOWER', 'GROUP_CHANGED_INFO', 'GROUP_JOIN_REQUEST', 'GROUP_JOIN_REQUEST_ACCEPTED', 'USER_JOINED_GROUP', 'USER_LEAVE_GROUP', 'ADMIN_REMOVED_GROUP_MEMBER', 'ADMIN_CHANGED_GROUP_MEMBER_ROLE', 'EVENT_INVITATION', 'EVENT_INVITATION_REMINDER', 'EVENT_REMINDER', 'EVENT_CANCELLED', 'EVENT_UPDATED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'NOT_SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationPermission" AS ENUM ('ALLOWED', 'NOT_ALLOWED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'EMAIL');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SOLO_RIDE', 'GROUP_RIDE', 'CAMPING_RIDE', 'MEET_UP', 'TRAINING', 'MOTOFEST', 'SOCIAL_RESPONSIBILITY');

-- CreateEnum
CREATE TYPE "RoadType" AS ENUM ('ASPHALT', 'OFF_ROAD', 'MIXED');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');

-- CreateEnum
CREATE TYPE "EventParticipantStatus" AS ENUM ('JOINED', 'LEFT');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'UPCOMING', 'PAST');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('POST_LOCATION', 'EVENT_MEETING_LOCATION', 'EVENT_START_LOCATION', 'EVENT_FINISH_LOCATION', 'BUSINESS_LOCATION');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('TL', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'TR');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "RidingStyle" AS ENUM ('TOURING', 'COMMUTING', 'OFF_ROAD', 'ADVENTURE', 'TRACK', 'CAFE_RACER', 'CRUISER', 'SPORT', 'STUNT', 'GROUP_RIDE', 'SOLO_RIDE', 'TOURING_WITH_CAMPING', 'SCOOTER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('FULL_FACE_HELMET', 'MODULAR_HELMET', 'OPEN_FACE_HELMET', 'OFF_ROAD_HELMET', 'HALF_HELMET', 'RIDING_JACKET', 'ARMOR', 'BACK_PROTECTOR', 'AIRBAG_VEST', 'RIDING_PANTS', 'KNEE_GUARDS', 'GLOVES', 'BOOTS', 'GOGGLES', 'RAIN_SUIT', 'INTERCOM', 'CAMERA', 'GPS_DEVICE', 'FIRST_AID_KIT');

-- CreateEnum
CREATE TYPE "SocialMediaPlatform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TWITTER', 'YOUTUBE', 'TIKTOK', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "Interest" AS ENUM ('MOTORCYCLE_CUSTOMIZATION', 'DIY_MAINTENANCE', 'VINTAGE_MOTORCYCLES', 'ELECTRIC_MOTORCYCLES', 'RIDING_SKILLS', 'MOTO_PHOTOGRAPHY', 'CONTENT_CREATION', 'MEETING_RIDERS', 'COMMUNITY_EVENTS', 'MOTO_FESTIVALS', 'EXPLORING_NATURE', 'MOUNTAIN_ROADS', 'COASTAL_RIDES', 'CROSS_BORDER_TRIPS');

-- CreateEnum
CREATE TYPE "BusinessCategory" AS ENUM ('SALES', 'DEALERSHIP', 'USED_DEALER', 'REPAIR', 'MAINTENANCE', 'ENGINE_REPAIR', 'ENGINE_REBUILDING', 'ELECTRICAL_REPAIR', 'TIRE_SERVICE', 'OIL_CHANGE', 'BATTERY_SERVICE', 'BRAKE_SERVICE', 'SUSPENSION_REPAIR', 'TRANSMISSION_REPAIR', 'PARTS_STORE', 'ACCESSORIES', 'PROTECTIVE_GEAR', 'EXHAUST_SYSTEMS', 'ELECTRONICS', 'LIGHTING', 'INTERCOMS', 'RENTAL', 'TOWING', 'PARKING', 'STORAGE', 'CUSTOMIZATION', 'RESTORATION', 'INSPECTION', 'FINANCING', 'INSURANCE', 'TRADE_IN', 'ELECTRIC_MOTORCYCLES', 'SCOOTERS', 'ATV', 'DETAILED_CLEANING', 'TRAINING', 'TRANSPORT_SHIPPING', 'TOURS', 'OTHER');

-- CreateEnum
CREATE TYPE "GroupTag" AS ENUM ('ADVENTURE', 'BEGINNERS_WELCOME', 'CAMPING', 'CHOPPER', 'CLASSIC_MOTORCYCLE', 'CULTURAL_TOURS', 'CUSTOM_MOTORCYCLE', 'DAILY_RIDE', 'ELECTRIC_MOTORCYCLE', 'ENDURO', 'EVENT_ORGANIZERS', 'EXPERIENCED_RIDERS', 'EXPLORATION', 'FAMILY_FRIENDLY', 'FUN_RIDES', 'INTERNATIONAL_RIDERS', 'MUSIC_CULTURE', 'OFF_ROAD', 'PHOTOGRAPHY', 'RIDER_EDUCATION', 'SCOOTER', 'SOCIAL_RESPONSIBILITY', 'TOURING', 'TRACK', 'VINTAGE_LOVERS', 'WOMEN_RIDERS', 'YOUNG_RIDERS');

-- CreateEnum
CREATE TYPE "SupportCategory" AS ENUM ('ACCOUNT', 'TECHNICAL', 'FEEDBACK', 'FEATURE_REQUEST', 'BUG_REPORT', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "cityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hasCompletedSetup" BOOLEAN NOT NULL DEFAULT false,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "ridingStyles" "RidingStyle"[] DEFAULT ARRAY[]::"RidingStyle"[],
    "interests" "Interest"[] DEFAULT ARRAY[]::"Interest"[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motorcycle" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "description" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Motorcycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EquipmentType" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "description" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMedia" (
    "id" TEXT NOT NULL,
    "platform" "SocialMediaPlatform" NOT NULL,
    "username" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" TEXT,
    "cover" TEXT,
    "cityId" TEXT NOT NULL,
    "privacy" "GroupPrivacy" NOT NULL,
    "tags" "GroupTag"[],
    "membersCapacity" INTEGER,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GroupMemberRole" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "data" JSONB DEFAULT '{}',
    "userId" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[],
    "groupId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostSave" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "country" TEXT,
    "language" "Language" NOT NULL,
    "type" "AddressType" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "postId" TEXT,
    "eventId" TEXT,
    "businessId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "BusinessCategory" NOT NULL,
    "areaCode" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessDescription" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "businessId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BusinessDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingHour" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startHour" TEXT,
    "endHour" TEXT,
    "isOpen24h" BOOLEAN NOT NULL DEFAULT false,
    "businessId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WorkingHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFollowing" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserFollowing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3),
    "maxParticipants" INTEGER,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[],
    "organizedByGroupId" TEXT,
    "roadType" "RoadType",
    "difficultyLevel" "DifficultyLevel",
    "routeDescription" TEXT,
    "restStops" TEXT,
    "campingInfo" TEXT,
    "equipmentChecklist" TEXT,
    "instructorInfo" TEXT,
    "topicsCovered" TEXT,
    "experienceLevel" "ExperienceLevel",
    "price" DOUBLE PRECISION,
    "currency" "Currency" DEFAULT 'TL',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "EventParticipantStatus" NOT NULL DEFAULT 'JOINED',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventInvitation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EventInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "autoAcceptFollowers" BOOLEAN NOT NULL DEFAULT false,
    "preferredLanguage" "Language" NOT NULL DEFAULT 'TR',
    "notificationPermission" "NotificationPermission" NOT NULL DEFAULT 'UNKNOWN',
    "notificationPreferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportRequest" (
    "id" TEXT NOT NULL,
    "category" "SupportCategory" NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "deviceInfo" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SupportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventToGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_supabaseId_idx" ON "User"("supabaseId");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_ridingStyles_idx" ON "User"("ridingStyles");

-- CreateIndex
CREATE INDEX "User_gender_idx" ON "User"("gender");

-- CreateIndex
CREATE INDEX "User_interests_idx" ON "User"("interests");

-- CreateIndex
CREATE INDEX "User_cityId_idx" ON "User"("cityId");

-- CreateIndex
CREATE INDEX "Motorcycle_createdById_idx" ON "Motorcycle"("createdById");

-- CreateIndex
CREATE INDEX "Motorcycle_brand_idx" ON "Motorcycle"("brand");

-- CreateIndex
CREATE INDEX "Motorcycle_isActive_idx" ON "Motorcycle"("isActive");

-- CreateIndex
CREATE INDEX "Equipment_createdById_idx" ON "Equipment"("createdById");

-- CreateIndex
CREATE INDEX "Equipment_type_idx" ON "Equipment"("type");

-- CreateIndex
CREATE INDEX "Equipment_brand_idx" ON "Equipment"("brand");

-- CreateIndex
CREATE INDEX "Equipment_isActive_idx" ON "Equipment"("isActive");

-- CreateIndex
CREATE INDEX "SocialMedia_createdById_idx" ON "SocialMedia"("createdById");

-- CreateIndex
CREATE INDEX "SocialMedia_platform_idx" ON "SocialMedia"("platform");

-- CreateIndex
CREATE INDEX "SocialMedia_isActive_idx" ON "SocialMedia"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMedia_createdById_platform_key" ON "SocialMedia"("createdById", "platform");

-- CreateIndex
CREATE INDEX "City_value_idx" ON "City"("value");

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
CREATE UNIQUE INDEX "GroupMembership_groupId_userId_key" ON "GroupMembership"("groupId", "userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_channel_idx" ON "Notification"("channel");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_isActive_idx" ON "Notification"("isActive");

-- CreateIndex
CREATE INDEX "DeviceToken_userId_idx" ON "DeviceToken"("userId");

-- CreateIndex
CREATE INDEX "DeviceToken_isActive_idx" ON "DeviceToken"("isActive");

-- CreateIndex
CREATE INDEX "DeviceToken_type_idx" ON "DeviceToken"("type");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_userId_key" ON "DeviceToken"("userId");

-- CreateIndex
CREATE INDEX "Post_createdById_idx" ON "Post"("createdById");

-- CreateIndex
CREATE INDEX "Post_groupId_idx" ON "Post"("groupId");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_isActive_idx" ON "Post"("isActive");

-- CreateIndex
CREATE INDEX "Comment_createdById_idx" ON "Comment"("createdById");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_isActive_idx" ON "Comment"("isActive");

-- CreateIndex
CREATE INDEX "PostLike_postId_idx" ON "PostLike"("postId");

-- CreateIndex
CREATE INDEX "PostLike_userId_idx" ON "PostLike"("userId");

-- CreateIndex
CREATE INDEX "PostLike_createdAt_idx" ON "PostLike"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "PostSave_postId_idx" ON "PostSave"("postId");

-- CreateIndex
CREATE INDEX "PostSave_userId_idx" ON "PostSave"("userId");

-- CreateIndex
CREATE INDEX "PostSave_createdAt_idx" ON "PostSave"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PostSave_postId_userId_key" ON "PostSave"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_businessId_key" ON "Address"("businessId");

-- CreateIndex
CREATE INDEX "Address_postId_idx" ON "Address"("postId");

-- CreateIndex
CREATE INDEX "Address_eventId_idx" ON "Address"("eventId");

-- CreateIndex
CREATE INDEX "Address_businessId_idx" ON "Address"("businessId");

-- CreateIndex
CREATE INDEX "Address_language_idx" ON "Address"("language");

-- CreateIndex
CREATE INDEX "Address_type_idx" ON "Address"("type");

-- CreateIndex
CREATE INDEX "Address_country_idx" ON "Address"("country");

-- CreateIndex
CREATE INDEX "Address_latitude_longitude_idx" ON "Address"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "Address_postId_language_type_key" ON "Address"("postId", "language", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Address_eventId_language_type_key" ON "Address"("eventId", "language", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Address_businessId_language_type_key" ON "Address"("businessId", "language", "type");

-- CreateIndex
CREATE INDEX "Business_name_idx" ON "Business"("name");

-- CreateIndex
CREATE INDEX "Business_category_idx" ON "Business"("category");

-- CreateIndex
CREATE INDEX "Business_verified_idx" ON "Business"("verified");

-- CreateIndex
CREATE INDEX "Business_status_idx" ON "Business"("status");

-- CreateIndex
CREATE INDEX "Business_isActive_idx" ON "Business"("isActive");

-- CreateIndex
CREATE INDEX "BusinessDescription_businessId_idx" ON "BusinessDescription"("businessId");

-- CreateIndex
CREATE INDEX "BusinessDescription_language_idx" ON "BusinessDescription"("language");

-- CreateIndex
CREATE INDEX "BusinessDescription_isActive_idx" ON "BusinessDescription"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessDescription_businessId_language_key" ON "BusinessDescription"("businessId", "language");

-- CreateIndex
CREATE INDEX "WorkingHour_businessId_idx" ON "WorkingHour"("businessId");

-- CreateIndex
CREATE INDEX "WorkingHour_dayOfWeek_idx" ON "WorkingHour"("dayOfWeek");

-- CreateIndex
CREATE INDEX "WorkingHour_isActive_idx" ON "WorkingHour"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHour_businessId_dayOfWeek_key" ON "WorkingHour"("businessId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "UserFollowing_followerId_idx" ON "UserFollowing"("followerId");

-- CreateIndex
CREATE INDEX "UserFollowing_followingId_idx" ON "UserFollowing"("followingId");

-- CreateIndex
CREATE INDEX "UserFollowing_createdAt_idx" ON "UserFollowing"("createdAt");

-- CreateIndex
CREATE INDEX "UserFollowing_status_idx" ON "UserFollowing"("status");

-- CreateIndex
CREATE INDEX "UserFollowing_isActive_idx" ON "UserFollowing"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UserFollowing_followerId_followingId_key" ON "UserFollowing"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_startDateTime_idx" ON "Event"("startDateTime");

-- CreateIndex
CREATE INDEX "Event_createdById_idx" ON "Event"("createdById");

-- CreateIndex
CREATE INDEX "Event_organizedByGroupId_idx" ON "Event"("organizedByGroupId");

-- CreateIndex
CREATE INDEX "Event_isActive_idx" ON "Event"("isActive");

-- CreateIndex
CREATE INDEX "Event_isPrivate_idx" ON "Event"("isPrivate");

-- CreateIndex
CREATE INDEX "EventParticipant_eventId_idx" ON "EventParticipant"("eventId");

-- CreateIndex
CREATE INDEX "EventParticipant_createdById_idx" ON "EventParticipant"("createdById");

-- CreateIndex
CREATE INDEX "EventParticipant_status_idx" ON "EventParticipant"("status");

-- CreateIndex
CREATE INDEX "EventParticipant_createdAt_idx" ON "EventParticipant"("createdAt");

-- CreateIndex
CREATE INDEX "EventParticipant_isActive_idx" ON "EventParticipant"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipant_eventId_createdById_key" ON "EventParticipant"("eventId", "createdById");

-- CreateIndex
CREATE INDEX "EventInvitation_eventId_idx" ON "EventInvitation"("eventId");

-- CreateIndex
CREATE INDEX "EventInvitation_createdById_idx" ON "EventInvitation"("createdById");

-- CreateIndex
CREATE INDEX "EventInvitation_inviteeId_idx" ON "EventInvitation"("inviteeId");

-- CreateIndex
CREATE INDEX "EventInvitation_status_idx" ON "EventInvitation"("status");

-- CreateIndex
CREATE INDEX "EventInvitation_createdAt_idx" ON "EventInvitation"("createdAt");

-- CreateIndex
CREATE INDEX "EventInvitation_isActive_idx" ON "EventInvitation"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "EventInvitation_eventId_inviteeId_key" ON "EventInvitation"("eventId", "inviteeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");

-- CreateIndex
CREATE INDEX "UserSetting_userId_idx" ON "UserSetting"("userId");

-- CreateIndex
CREATE INDEX "UserSetting_notificationPermission_idx" ON "UserSetting"("notificationPermission");

-- CreateIndex
CREATE INDEX "UserSetting_preferredLanguage_idx" ON "UserSetting"("preferredLanguage");

-- CreateIndex
CREATE INDEX "SupportRequest_category_idx" ON "SupportRequest"("category");

-- CreateIndex
CREATE INDEX "SupportRequest_createdById_idx" ON "SupportRequest"("createdById");

-- CreateIndex
CREATE INDEX "SupportRequest_isActive_idx" ON "SupportRequest"("isActive");

-- CreateIndex
CREATE INDEX "_EventToGroup_B_index" ON "_EventToGroup"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motorcycle" ADD CONSTRAINT "Motorcycle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motorcycle" ADD CONSTRAINT "Motorcycle_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostSave" ADD CONSTRAINT "PostSave_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostSave" ADD CONSTRAINT "PostSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessDescription" ADD CONSTRAINT "BusinessDescription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingHour" ADD CONSTRAINT "WorkingHour_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollowing" ADD CONSTRAINT "UserFollowing_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollowing" ADD CONSTRAINT "UserFollowing_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizedByGroupId_fkey" FOREIGN KEY ("organizedByGroupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportRequest" ADD CONSTRAINT "SupportRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportRequest" ADD CONSTRAINT "SupportRequest_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToGroup" ADD CONSTRAINT "_EventToGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToGroup" ADD CONSTRAINT "_EventToGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
