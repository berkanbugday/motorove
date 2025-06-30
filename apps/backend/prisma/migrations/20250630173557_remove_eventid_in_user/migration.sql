/*
  Warnings:

  - You are about to drop the column `eventId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `GroupTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupToTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_eventId_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToTags" DROP CONSTRAINT "_GroupToTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToTags" DROP CONSTRAINT "_GroupToTags_B_fkey";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "tags" "GroupTag"[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "eventId",
DROP COLUMN "username";

-- DropTable
DROP TABLE "GroupTag" CASCADE;

-- DropTable
DROP TABLE "_GroupToTags" CASCADE;

-- CreateTable
CREATE TABLE "_EventInvitedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventInvitedUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventInvitedUsers_B_index" ON "_EventInvitedUsers"("B");

-- AddForeignKey
ALTER TABLE "_EventInvitedUsers" ADD CONSTRAINT "_EventInvitedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventInvitedUsers" ADD CONSTRAINT "_EventInvitedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
