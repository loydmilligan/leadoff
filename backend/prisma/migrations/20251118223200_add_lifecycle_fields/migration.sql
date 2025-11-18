-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactTitle" TEXT,
    "companyDescription" TEXT,
    "leadSource" TEXT NOT NULL DEFAULT 'EMAIL',
    "currentStage" TEXT NOT NULL DEFAULT 'INQUIRY',
    "estimatedValue" REAL,
    "nextFollowUpDate" DATETIME,
    "lastActivityDate" DATETIME,
    "nextActionType" TEXT,
    "nextActionDescription" TEXT,
    "nextActionDueDate" DATETIME,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" DATETIME,
    "archiveReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Lead" ("companyDescription", "companyName", "contactName", "contactTitle", "createdAt", "currentStage", "email", "estimatedValue", "id", "lastActivityDate", "leadSource", "nextFollowUpDate", "phone", "updatedAt") SELECT "companyDescription", "companyName", "contactName", "contactTitle", "createdAt", "currentStage", "email", "estimatedValue", "id", "lastActivityDate", "leadSource", "nextFollowUpDate", "phone", "updatedAt" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE INDEX "Lead_companyName_idx" ON "Lead"("companyName");
CREATE INDEX "Lead_contactName_idx" ON "Lead"("contactName");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");
CREATE INDEX "Lead_currentStage_idx" ON "Lead"("currentStage");
CREATE INDEX "Lead_nextFollowUpDate_idx" ON "Lead"("nextFollowUpDate");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "Lead_nextActionDueDate_idx" ON "Lead"("nextActionDueDate");
CREATE INDEX "Lead_isArchived_idx" ON "Lead"("isArchived");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
