-- AlterTable
ALTER TABLE "UserFollowing" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING';
