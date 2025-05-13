-- CreateEnum
CREATE TYPE "GroupMembershipStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "GroupMembership" ADD COLUMN     "status" "GroupMembershipStatus" NOT NULL DEFAULT 'PENDING';
