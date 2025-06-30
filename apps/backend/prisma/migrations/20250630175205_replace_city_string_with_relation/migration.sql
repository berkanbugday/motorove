/*
  Warnings:

  - You are about to drop the column `invitedGroupIds` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `invitedUserIds` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EventParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_EventInvitedUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GroupTag" AS ENUM ('BEGINNER', 'ADVANCED', 'CAMPING', 'TOURING', 'OFF_ROAD', 'CITY_RIDES', 'TRACK_DAY', 'SCOOTER_GROUP', 'WOMEN_ONLY', 'WEEKEND_RIDERS', 'CROSS_COUNTRY', 'BORDER_RIDES', 'DIY_AND_CUSTOM', 'MECHANIC_DISCUSSION', 'EVENT_ORGANIZERS', 'SOCIAL_RESPONSIBILITY');

-- DropForeignKey
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "_EventInvitedUsers" DROP CONSTRAINT "_EventInvitedUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventInvitedUsers" DROP CONSTRAINT "_EventInvitedUsers_B_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "invitedGroupIds",
DROP COLUMN "invitedUserIds";

-- AlterTable
ALTER TABLE "EventParticipant" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "tags" "GroupTag"[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "city",
ADD COLUMN     "cityId" TEXT;

-- DropTable
DROP TABLE "_EventInvitedUsers";

-- CreateIndex
CREATE INDEX "City_value_idx" ON "City"("value");

-- CreateIndex
CREATE INDEX "User_cityId_idx" ON "User"("cityId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
