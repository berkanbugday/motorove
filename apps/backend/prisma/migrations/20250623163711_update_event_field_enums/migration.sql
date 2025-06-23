/*
  Warnings:

  - The values [MODERATE] on the enum `DifficultyLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DifficultyLevel_new" AS ENUM ('EASY', 'MEDIUM', 'HARD');
ALTER TYPE "DifficultyLevel" RENAME TO "DifficultyLevel_old";
ALTER TYPE "DifficultyLevel_new" RENAME TO "DifficultyLevel";
DROP TYPE "DifficultyLevel_old";
COMMIT;
