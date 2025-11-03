/*
  Warnings:

  - You are about to drop the `_EmergencySelectedUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EmergencySelectedUsers" DROP CONSTRAINT "_EmergencySelectedUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_EmergencySelectedUsers" DROP CONSTRAINT "_EmergencySelectedUsers_B_fkey";

-- DropTable
DROP TABLE "_EmergencySelectedUsers";
