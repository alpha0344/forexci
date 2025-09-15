-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "client_equipments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "commissioningDate" DATETIME NOT NULL,
    "lastVerificationDate" DATETIME,
    "lastRechargeDate" DATETIME,
    "rechargeType" TEXT,
    "volume" INTEGER,
    "notes" TEXT,
    CONSTRAINT "client_equipments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "client_equipments_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "client_equipments_clientId_idx" ON "client_equipments"("clientId");

-- CreateIndex
CREATE INDEX "client_equipments_materialId_idx" ON "client_equipments"("materialId");
