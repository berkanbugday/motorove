/*
  Warnings:

  - The values [SCOOTER,DUAL_SPORT,DIRT_BIKE,CHOPPER,BOBBER,ENDURO,MOTO_CROSS,SUPER_MOTO,TRIKE,SIDECAR,CLASSIC,PROFESSIONAL,NIGHT_RIDER,MOUNTAIN_RIDER,COASTAL_RIDER,TRACK_DAY,OFF_ROAD,PHOTOGRAPHY,ECO_FRIENDLY,TECHNOLOGY,VINTAGE_ENTHUSIAST,RALLY,CHARITY_RIDE,TRACK_EVENT,COMPETITION,TRAINING] on the enum `GroupTag` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GroupTag_new" AS ENUM ('TOURING', 'CAFE_RACER', 'CRUISER', 'SPORT', 'ADVENTURE', 'NAKED', 'CUSTOM', 'VINTAGE', 'ELECTRIC', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'WEEKEND_RIDER', 'DAILY_COMMUTER', 'LONG_DISTANCE', 'URBAN_RIDER', 'MECHANICS', 'CUSTOMIZATION', 'RESTORATION', 'MEETUP');
ALTER TABLE "Group" ALTER COLUMN "tags" TYPE "GroupTag_new"[] USING ("tags"::text::"GroupTag_new"[]);
ALTER TYPE "GroupTag" RENAME TO "GroupTag_old";
ALTER TYPE "GroupTag_new" RENAME TO "GroupTag";
DROP TYPE "GroupTag_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "Role";
