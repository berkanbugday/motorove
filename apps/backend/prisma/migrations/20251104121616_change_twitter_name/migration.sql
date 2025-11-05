/*
  Warnings:

  - The values [TWITTER] on the enum `SocialMediaPlatform` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SocialMediaPlatform_new" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'TIKTOK', 'LINKEDIN', 'X');
ALTER TABLE "SocialMedia" ALTER COLUMN "platform" TYPE "SocialMediaPlatform_new" USING ("platform"::text::"SocialMediaPlatform_new");
ALTER TYPE "SocialMediaPlatform" RENAME TO "SocialMediaPlatform_old";
ALTER TYPE "SocialMediaPlatform_new" RENAME TO "SocialMediaPlatform";
DROP TYPE "SocialMediaPlatform_old";
COMMIT;
