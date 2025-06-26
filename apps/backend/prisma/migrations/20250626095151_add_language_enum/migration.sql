/*
  Warnings:

  - The values [INVITED,DECLINED] on the enum `EventParticipantStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `finishLocation` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `finishLocationLat` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `finishLocationLng` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `meetingPoint` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `meetingPointLat` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `meetingPointLng` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startLocation` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startLocationLat` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startLocationLng` on the `Event` table. All the data in the column will be lost.
  - The `status` column on the `EventInvitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `GroupMembership` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `latitude` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `PostAddress` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('POST_LOCATION', 'EVENT_MEETING_POINT', 'EVENT_START_LOCATION', 'EVENT_FINISH_LOCATION');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'TR');

-- AlterEnum
BEGIN;
CREATE TYPE "EventParticipantStatus_new" AS ENUM ('JOINED', 'LEFT');
ALTER TABLE "EventParticipant" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "EventParticipant" ALTER COLUMN "status" TYPE "EventParticipantStatus_new" USING ("status"::text::"EventParticipantStatus_new");
ALTER TYPE "EventParticipantStatus" RENAME TO "EventParticipantStatus_old";
ALTER TYPE "EventParticipantStatus_new" RENAME TO "EventParticipantStatus";
DROP TYPE "EventParticipantStatus_old";
ALTER TABLE "EventParticipant" ALTER COLUMN "status" SET DEFAULT 'JOINED';
COMMIT;

-- DropForeignKey
ALTER TABLE "PostAddress" DROP CONSTRAINT "PostAddress_postId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "finishLocation",
DROP COLUMN "finishLocationLat",
DROP COLUMN "finishLocationLng",
DROP COLUMN "meetingPoint",
DROP COLUMN "meetingPointLat",
DROP COLUMN "meetingPointLng",
DROP COLUMN "startLocation",
DROP COLUMN "startLocationLat",
DROP COLUMN "startLocationLng";

-- AlterTable
ALTER TABLE "EventInvitation" DROP COLUMN "status",
ADD COLUMN     "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "GroupMembership" DROP COLUMN "status",
ADD COLUMN     "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- DropTable
DROP TABLE "PostAddress";

-- DropEnum
DROP TYPE "EventInvitationStatus";

-- DropEnum
DROP TYPE "GroupMembershipStatus";

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "type" "AddressType" NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "postId" TEXT,
    "eventId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_postId_idx" ON "Address"("postId");

-- CreateIndex
CREATE INDEX "Address_eventId_idx" ON "Address"("eventId");

-- CreateIndex
CREATE INDEX "Address_language_idx" ON "Address"("language");

-- CreateIndex
CREATE INDEX "Address_type_idx" ON "Address"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Address_postId_language_type_key" ON "Address"("postId", "language", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Address_eventId_language_type_key" ON "Address"("eventId", "language", "type");

-- CreateIndex
CREATE INDEX "EventInvitation_status_idx" ON "EventInvitation"("status");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
