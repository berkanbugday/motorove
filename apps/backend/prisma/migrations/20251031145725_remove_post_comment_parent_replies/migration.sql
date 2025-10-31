/*
  Warnings:

  - You are about to drop the column `parentId` on the `PostComment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_parentId_fkey";

-- DropIndex
DROP INDEX "PostComment_parentId_idx";

-- AlterTable
ALTER TABLE "PostComment" DROP COLUMN "parentId";
