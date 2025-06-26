/*
  Warnings:

  - Changed the type of `language` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL;

-- CreateIndex
CREATE INDEX "Address_language_idx" ON "Address"("language");

-- CreateIndex
CREATE UNIQUE INDEX "Address_postId_language_type_key" ON "Address"("postId", "language", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Address_eventId_language_type_key" ON "Address"("eventId", "language", "type");
