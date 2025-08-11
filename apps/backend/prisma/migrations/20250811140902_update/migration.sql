/*
  Warnings:

  - The `status` column on the `EventInvitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `GroupMembership` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `UserFollowing` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "EventInvitation" DROP COLUMN "status",
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "GroupMembership" DROP COLUMN "status",
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "UserFollowing" DROP COLUMN "status",
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "InvitationStatus";

-- CreateIndex
CREATE INDEX "Business_status_idx" ON "Business"("status");

-- CreateIndex
CREATE INDEX "EventInvitation_status_idx" ON "EventInvitation"("status");

-- CreateIndex
CREATE INDEX "GroupMembership_status_idx" ON "GroupMembership"("status");

-- CreateIndex
CREATE INDEX "UserFollowing_status_idx" ON "UserFollowing"("status");
