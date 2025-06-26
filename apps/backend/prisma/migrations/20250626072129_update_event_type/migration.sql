/*
  Warnings:

  - The values [SOCIAL_MEET_UP,WORKSHOP_TRAINING,CHARITY_RIDE] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('SOLO_RIDE', 'GROUP_RIDE', 'CAMPING_RIDE', 'MEET_UP', 'TRAINING', 'SOCIAL_RESPONSIBILITY');
ALTER TABLE "Event" ALTER COLUMN "eventType" TYPE "EventType_new" USING ("eventType"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "EventType_old";
COMMIT;
