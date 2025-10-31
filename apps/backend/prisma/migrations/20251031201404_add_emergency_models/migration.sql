-- CreateEnum
CREATE TYPE "EmergencyType" AS ENUM ('ACCIDENT', 'BREAKDOWN', 'MEDICAL', 'FUEL_SHORTAGE', 'TIRE_PROBLEM', 'BATTERY_DEAD', 'LOST', 'OTHER');

-- CreateTable
CREATE TABLE "Emergency" (
    "id" TEXT NOT NULL,
    "type" "EmergencyType" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'ACCEPTED',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Emergency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyDescription" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'TR',
    "emergencyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EmergencyDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyAddress" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "countryCode" TEXT,
    "language" "Language" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "emergencyId" TEXT NOT NULL,

    CONSTRAINT "EmergencyAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Emergency_createdById_idx" ON "Emergency"("createdById");

-- CreateIndex
CREATE INDEX "Emergency_type_idx" ON "Emergency"("type");

-- CreateIndex
CREATE INDEX "EmergencyDescription_emergencyId_idx" ON "EmergencyDescription"("emergencyId");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyDescription_emergencyId_language_key" ON "EmergencyDescription"("emergencyId", "language");

-- CreateIndex
CREATE INDEX "EmergencyAddress_emergencyId_idx" ON "EmergencyAddress"("emergencyId");

-- CreateIndex
CREATE INDEX "EmergencyAddress_latitude_longitude_idx" ON "EmergencyAddress"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyAddress_emergencyId_language_key" ON "EmergencyAddress"("emergencyId", "language");

-- AddForeignKey
ALTER TABLE "Emergency" ADD CONSTRAINT "Emergency_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emergency" ADD CONSTRAINT "Emergency_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyDescription" ADD CONSTRAINT "EmergencyDescription_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "Emergency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAddress" ADD CONSTRAINT "EmergencyAddress_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "Emergency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
