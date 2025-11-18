-- CreateTable
CREATE TABLE "Lead" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'NOTE',
    "subject" TEXT NOT NULL,
    "notes" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "employeeCount" INTEGER,
    "annualRevenue" REAL,
    "industry" TEXT,
    "decisionMaker" TEXT,
    "decisionMakerRole" TEXT,
    "currentSolution" TEXT,
    "painPoints" TEXT,
    "budget" REAL,
    "timeline" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrganizationInfo_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DemoDetails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "demoDate" DATETIME NOT NULL,
    "demoType" TEXT NOT NULL DEFAULT 'ONLINE',
    "attendees" TEXT,
    "demoOutcome" TEXT,
    "userCountEstimate" INTEGER,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DemoDetails_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "proposalDate" DATETIME NOT NULL,
    "estimatedValue" REAL NOT NULL,
    "products" TEXT,
    "contractTerm" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Proposal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LostReason" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "competitorName" TEXT,
    "lostDate" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LostReason_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StageHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "fromStage" TEXT,
    "toStage" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "StageHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Lead_companyName_idx" ON "Lead"("companyName");

-- CreateIndex
CREATE INDEX "Lead_contactName_idx" ON "Lead"("contactName");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_currentStage_idx" ON "Lead"("currentStage");

-- CreateIndex
CREATE INDEX "Lead_nextFollowUpDate_idx" ON "Lead"("nextFollowUpDate");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Activity_leadId_idx" ON "Activity"("leadId");

-- CreateIndex
CREATE INDEX "Activity_dueDate_idx" ON "Activity"("dueDate");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInfo_leadId_key" ON "OrganizationInfo"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "DemoDetails_leadId_key" ON "DemoDetails"("leadId");

-- CreateIndex
CREATE INDEX "DemoDetails_demoDate_idx" ON "DemoDetails"("demoDate");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_leadId_key" ON "Proposal"("leadId");

-- CreateIndex
CREATE INDEX "Proposal_proposalDate_idx" ON "Proposal"("proposalDate");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LostReason_leadId_key" ON "LostReason"("leadId");

-- CreateIndex
CREATE INDEX "LostReason_lostDate_idx" ON "LostReason"("lostDate");

-- CreateIndex
CREATE INDEX "LostReason_reason_idx" ON "LostReason"("reason");

-- CreateIndex
CREATE INDEX "StageHistory_leadId_idx" ON "StageHistory"("leadId");

-- CreateIndex
CREATE INDEX "StageHistory_changedAt_idx" ON "StageHistory"("changedAt");
