/*
  Warnings:

  - You are about to drop the column `reloadType` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `timeBeforeChange` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `volumeType` on the `Material` table. All the data in the column will be lost.
  - Added the required column `validityTime` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "validityTime" INTEGER NOT NULL,
    "timeBeforeControl" INTEGER NOT NULL,
    "timeBeforeRealod" INTEGER
);
INSERT INTO "new_Material" ("id", "timeBeforeControl", "type") SELECT "id", "timeBeforeControl", "type" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
