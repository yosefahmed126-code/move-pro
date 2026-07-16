/*
  Warnings:

  - You are about to drop the column `branch` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `branchId` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT,
    "birthDate" DATETIME,
    "mobile" TEXT NOT NULL,
    "mobile2" TEXT,
    "email" TEXT,
    "nationalId" TEXT,
    "address" TEXT,
    "therapist" TEXT,
    "branchId" INTEGER NOT NULL,
    "package" TEXT,
    "remaining" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("address", "birthDate", "code", "createdAt", "email", "gender", "id", "mobile", "mobile2", "name", "nationalId", "package", "remaining", "status", "therapist", "updatedAt") SELECT "address", "birthDate", "code", "createdAt", "email", "gender", "id", "mobile", "mobile2", "name", "nationalId", "package", "remaining", "status", "therapist", "updatedAt" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_code_key" ON "Patient"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
