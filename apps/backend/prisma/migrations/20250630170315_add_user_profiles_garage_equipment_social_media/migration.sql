/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "RidingStyle" AS ENUM ('TOURING', 'COMMUTING', 'OFF_ROAD', 'ADVENTURE', 'TRACK', 'CAFE_RACER', 'CRUISER', 'SPORT', 'STUNT', 'GROUP_RIDE', 'SOLO_RIDE', 'TOURING_WITH_CAMPING', 'SCOOTER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('FULL_FACE_HELMET', 'MODULAR_HELMET', 'OPEN_FACE_HELMET', 'OFF_ROAD_HELMET', 'HALF_HELMET', 'RIDING_JACKET', 'ARMOR', 'BACK_PROTECTOR', 'AIRBAG_VEST', 'RIDING_PANTS', 'KNEE_GUARDS', 'GLOVES', 'BOOTS', 'GOGGLES', 'RAIN_SUIT', 'INTERCOM', 'CAMERA', 'GPS_DEVICE', 'FIRST_AID_KIT');

-- CreateEnum
CREATE TYPE "SocialMediaPlatform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TWITTER', 'YOUTUBE', 'TIKTOK', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "Interest" AS ENUM ('BIKE_CUSTOMIZATION', 'DIY_MAINTENANCE', 'VINTAGE_BIKES', 'ELECTRIC_BIKES', 'RIDING_SKILLS', 'MOTO_PHOTOGRAPHY', 'CONTENT_CREATION', 'MEETING_RIDERS', 'COMMUNITY_EVENTS', 'MOTO_FESTIVALS', 'EXPLORING_NATURE', 'MOUNTAIN_ROADS', 'COASTAL_RIDES', 'CROSS_BORDER_TRIPS', 'RIDING_ABROAD');

-- AlterEnum
ALTER TYPE "EventType" ADD VALUE 'MOTOFEST';

-- DropIndex
DROP INDEX "User_email_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "interests" "Interest"[] DEFAULT ARRAY[]::"Interest"[],
ADD COLUMN     "ridingStyle" "RidingStyle"[] DEFAULT ARRAY[]::"RidingStyle"[],
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Garage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Garage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motorcycle" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "description" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "garageId" TEXT NOT NULL,
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
    "garageId" TEXT NOT NULL,
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

-- CreateIndex
CREATE INDEX "Garage_createdById_idx" ON "Garage"("createdById");

-- CreateIndex
CREATE INDEX "Garage_isActive_idx" ON "Garage"("isActive");

-- CreateIndex
CREATE INDEX "Motorcycle_garageId_idx" ON "Motorcycle"("garageId");

-- CreateIndex
CREATE INDEX "Motorcycle_brand_idx" ON "Motorcycle"("brand");

-- CreateIndex
CREATE INDEX "Motorcycle_isActive_idx" ON "Motorcycle"("isActive");

-- CreateIndex
CREATE INDEX "Equipment_garageId_idx" ON "Equipment"("garageId");

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
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_ridingStyle_idx" ON "User"("ridingStyle");

-- CreateIndex
CREATE INDEX "User_gender_idx" ON "User"("gender");

-- CreateIndex
CREATE INDEX "User_interests_idx" ON "User"("interests");

-- AddForeignKey
ALTER TABLE "Garage" ADD CONSTRAINT "Garage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garage" ADD CONSTRAINT "Garage_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motorcycle" ADD CONSTRAINT "Motorcycle_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "Garage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motorcycle" ADD CONSTRAINT "Motorcycle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motorcycle" ADD CONSTRAINT "Motorcycle_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "Garage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
