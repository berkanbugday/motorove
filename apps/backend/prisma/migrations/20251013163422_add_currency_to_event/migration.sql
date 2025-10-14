-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('TL', 'USD', 'EUR');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "currency" "Currency" DEFAULT 'TL';
