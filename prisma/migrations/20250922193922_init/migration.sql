-- CreateEnum
CREATE TYPE "public"."MaterialType" AS ENUM ('PA', 'PP', 'ALARM');

-- CreateEnum
CREATE TYPE "public"."RechargeType" AS ENUM ('WATER_ADD', 'POWDER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Material" (
    "id" TEXT NOT NULL,
    "type" "public"."MaterialType" NOT NULL,
    "validityTime" INTEGER NOT NULL,
    "timeBeforeControl" INTEGER NOT NULL,
    "timeBeforeReload" INTEGER,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_equipments" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "commissioningDate" TIMESTAMP(3) NOT NULL,
    "lastVerificationDate" TIMESTAMP(3),
    "lastRechargeDate" TIMESTAMP(3),
    "rechargeType" "public"."RechargeType",
    "volume" INTEGER,
    "notes" TEXT,

    CONSTRAINT "client_equipments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "client_equipments_clientId_idx" ON "public"."client_equipments"("clientId");

-- CreateIndex
CREATE INDEX "client_equipments_materialId_idx" ON "public"."client_equipments"("materialId");

-- AddForeignKey
ALTER TABLE "public"."client_equipments" ADD CONSTRAINT "client_equipments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_equipments" ADD CONSTRAINT "client_equipments_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "public"."Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
