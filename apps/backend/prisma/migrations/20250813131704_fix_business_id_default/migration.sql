-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add default UUID generation to Business table
ALTER TABLE "Business" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to BusinessDescription table
ALTER TABLE "BusinessDescription" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to WorkingHour table
ALTER TABLE "WorkingHour" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
