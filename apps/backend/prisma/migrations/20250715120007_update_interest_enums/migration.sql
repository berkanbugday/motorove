/*
  Warnings:

  - The values [BIKE_CUSTOMIZATION,VINTAGE_BIKES,ELECTRIC_BIKES,RIDING_ABROAD] on the enum `Interest` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Interest_new" AS ENUM ('MOTORCYCLE_CUSTOMIZATION', 'DIY_MAINTENANCE', 'VINTAGE_MOTORCYCLES', 'ELECTRIC_MOTORCYCLES', 'RIDING_SKILLS', 'MOTO_PHOTOGRAPHY', 'CONTENT_CREATION', 'MEETING_RIDERS', 'COMMUNITY_EVENTS', 'MOTO_FESTIVALS', 'EXPLORING_NATURE', 'MOUNTAIN_ROADS', 'COASTAL_RIDES', 'CROSS_BORDER_TRIPS');
ALTER TABLE "User" ALTER COLUMN "interests" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "interests" TYPE "Interest_new"[] USING ("interests"::text::"Interest_new"[]);
ALTER TYPE "Interest" RENAME TO "Interest_old";
ALTER TYPE "Interest_new" RENAME TO "Interest";
DROP TYPE "Interest_old";
ALTER TABLE "User" ALTER COLUMN "interests" SET DEFAULT ARRAY[]::"Interest"[];
COMMIT;
