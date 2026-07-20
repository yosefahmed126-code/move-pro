/*
  Warnings:

  - You are about to drop the column `appointmentDate` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `date` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "therapistId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 40,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("branchId", "createdAt", "id", "notes", "patientId", "status", "therapistId", "updatedAt") SELECT "branchId", "createdAt", "id", "notes", "patientId", "status", "therapistId", "updatedAt" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
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
    "therapistId" INTEGER,
    "branchId" INTEGER NOT NULL,
    "packageId" INTEGER,
    "remaining" INTEGER NOT NULL DEFAULT 0,
    "usedExcuses" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Patient_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Patient_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("address", "birthDate", "branchId", "code", "createdAt", "email", "gender", "id", "mobile", "mobile2", "name", "nationalId", "packageId", "remaining", "status", "therapistId", "updatedAt") SELECT "address", "birthDate", "branchId", "code", "createdAt", "email", "gender", "id", "mobile", "mobile2", "name", "nationalId", "packageId", "remaining", "status", "therapistId", "updatedAt" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_code_key" ON "Patient"("code");
CREATE INDEX "Patient_branchId_idx" ON "Patient"("branchId");
CREATE INDEX "Patient_packageId_idx" ON "Patient"("packageId");
CREATE INDEX "Patient_therapistId_idx" ON "Patient"("therapistId");
CREATE INDEX "Patient_status_idx" ON "Patient"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
