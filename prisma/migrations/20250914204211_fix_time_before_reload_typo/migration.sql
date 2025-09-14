/*
  Warnings:

  - You are about to drop the column `timeBeforeRealod` on the `Material` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "validityTime" INTEGER NOT NULL,
    "timeBeforeControl" INTEGER NOT NULL,
    "timeBeforeReload" INTEGER
);
INSERT INTO "new_Material" ("id", "timeBeforeControl", "type", "validityTime") SELECT "id", "timeBeforeControl", "type", "validityTime" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
