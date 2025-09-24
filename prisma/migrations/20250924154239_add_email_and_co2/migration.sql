-- AlterEnum
ALTER TYPE "public"."MaterialType" ADD VALUE 'CO2';

-- AlterTable
ALTER TABLE "public"."clients" ADD COLUMN     "email" TEXT;
