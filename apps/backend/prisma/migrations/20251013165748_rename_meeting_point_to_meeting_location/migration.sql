/*
  Warnings:

  - The values [EVENT_MEETING_POINT] on the enum `AddressType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AddressType_new" AS ENUM ('POST_LOCATION', 'EVENT_MEETING_LOCATION', 'EVENT_START_LOCATION', 'EVENT_FINISH_LOCATION', 'BUSINESS_LOCATION');
ALTER TABLE "Address" ALTER COLUMN "type" TYPE "AddressType_new" USING ("type"::text::"AddressType_new");
ALTER TYPE "AddressType" RENAME TO "AddressType_old";
ALTER TYPE "AddressType_new" RENAME TO "AddressType";
DROP TYPE "AddressType_old";
COMMIT;
