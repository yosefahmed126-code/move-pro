-- CreateTable
CREATE TABLE "TherapistWorkingHour" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "therapistId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TherapistWorkingHour_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TherapistWorkingHour_therapistId_idx" ON "TherapistWorkingHour"("therapistId");

-- CreateIndex
CREATE INDEX "TherapistWorkingHour_dayOfWeek_idx" ON "TherapistWorkingHour"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistWorkingHour_therapistId_dayOfWeek_key" ON "TherapistWorkingHour"("therapistId", "dayOfWeek");
