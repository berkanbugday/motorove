/*
  Warnings:

  - The values [TRACK_DAY_RACE] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('GROUP_RIDE', 'CAMPING_RIDE', 'SOCIAL_MEET_UP', 'WORKSHOP_TRAINING', 'CHARITY_RIDE', 'SOLO_RIDE');
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "EventType_old";
COMMIT;
