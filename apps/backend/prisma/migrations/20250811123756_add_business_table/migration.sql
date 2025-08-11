/*
  Warnings:

  - A unique constraint covering the columns `[businessId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId,language,type]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "BusinessCategory" AS ENUM ('SALES', 'DEALERSHIP', 'USED_DEALER', 'REPAIR', 'MAINTENANCE', 'ENGINE_REPAIR', 'ENGINE_REBUILDING', 'ELECTRICAL_REPAIR', 'TIRE_SERVICE', 'OIL_CHANGE', 'BATTERY_SERVICE', 'BRAKE_SERVICE', 'SUSPENSION_REPAIR', 'TRANSMISSION_REPAIR', 'PARTS_STORE', 'ACCESSORIES', 'PROTECTIVE_GEAR', 'EXHAUST_SYSTEMS', 'ELECTRONICS', 'LIGHTING', 'INTERCOMS', 'RENTAL', 'TOWING', 'PARKING', 'STORAGE', 'CUSTOMIZATION', 'RESTORATION', 'INSPECTION', 'FINANCING', 'INSURANCE', 'TRADE_IN', 'ELECTRIC_MOTORCYCLES', 'SCOOTERS', 'ATV', 'DETAILED_CLEANING', 'TRAINING', 'TRANSPORT_SHIPPING', 'TOURS', 'OTHER');

-- AlterEnum
ALTER TYPE "AddressType" ADD VALUE 'BUSINESS_LOCATION';

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "businessId" TEXT,
ADD COLUMN     "country" TEXT;

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mainCategory" "BusinessCategory" NOT NULL,
    "subCategories" "BusinessCategory"[],
    "phoneNumber" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessDescription" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "businessId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BusinessDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingHour" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startHour" TEXT,
    "endHour" TEXT,
    "isOpen24h" BOOLEAN NOT NULL DEFAULT false,
    "businessId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WorkingHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Business_name_idx" ON "Business"("name");

-- CreateIndex
CREATE INDEX "Business_mainCategory_idx" ON "Business"("mainCategory");

-- CreateIndex
CREATE INDEX "Business_verified_idx" ON "Business"("verified");

-- CreateIndex
CREATE INDEX "Business_isActive_idx" ON "Business"("isActive");

-- CreateIndex
CREATE INDEX "BusinessDescription_businessId_idx" ON "BusinessDescription"("businessId");

-- CreateIndex
CREATE INDEX "BusinessDescription_language_idx" ON "BusinessDescription"("language");

-- CreateIndex
CREATE INDEX "BusinessDescription_isActive_idx" ON "BusinessDescription"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessDescription_businessId_language_key" ON "BusinessDescription"("businessId", "language");

-- CreateIndex
CREATE INDEX "WorkingHour_businessId_idx" ON "WorkingHour"("businessId");

-- CreateIndex
CREATE INDEX "WorkingHour_dayOfWeek_idx" ON "WorkingHour"("dayOfWeek");

-- CreateIndex
CREATE INDEX "WorkingHour_isActive_idx" ON "WorkingHour"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHour_businessId_dayOfWeek_key" ON "WorkingHour"("businessId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "Address_businessId_key" ON "Address"("businessId");

-- CreateIndex
CREATE INDEX "Address_businessId_idx" ON "Address"("businessId");

-- CreateIndex
CREATE INDEX "Address_country_idx" ON "Address"("country");

-- CreateIndex
CREATE UNIQUE INDEX "Address_businessId_language_type_key" ON "Address"("businessId", "language", "type");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessDescription" ADD CONSTRAINT "BusinessDescription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingHour" ADD CONSTRAINT "WorkingHour_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
