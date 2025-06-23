/*
  Warnings:

  - The values [PAVED] on the enum `RoadType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoadType_new" AS ENUM ('ASPHALT', 'OFF_ROAD', 'MIXED');
ALTER TYPE "RoadType" RENAME TO "RoadType_old";
ALTER TYPE "RoadType_new" RENAME TO "RoadType";
DROP TYPE "RoadType_old";
COMMIT;
