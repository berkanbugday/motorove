/*
  Warnings:

  - You are about to drop the `SocialMedia` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SocialMedia" DROP CONSTRAINT "SocialMedia_createdById_fkey";

-- DropForeignKey
ALTER TABLE "SocialMedia" DROP CONSTRAINT "SocialMedia_updatedById_fkey";

-- DropTable
DROP TABLE "SocialMedia";

-- CreateTable
CREATE TABLE "UserSocialMediaProfile" (
    "id" TEXT NOT NULL,
    "platform" "SocialMediaPlatform" NOT NULL,
    "username" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSocialMediaProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSocialMediaProfile_createdById_idx" ON "UserSocialMediaProfile"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "UserSocialMediaProfile_createdById_platform_key" ON "UserSocialMediaProfile"("createdById", "platform");

-- AddForeignKey
ALTER TABLE "UserSocialMediaProfile" ADD CONSTRAINT "UserSocialMediaProfile_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
