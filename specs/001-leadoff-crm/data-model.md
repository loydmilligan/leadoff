# Data Model: LeadOff CRM

**Date**: 2025-11-13
**Branch**: 001-leadoff-crm
**Database**: SQLite (Prisma ORM)

---

## Overview

This document defines the database schema for LeadOff CRM. The model supports the complete sales lifecycle from inquiry through close, with emphasis on lead tracking, follow-up management, and reporting.

**Key Design Principles**:
- Relational integrity with foreign keys
- Audit trails for stage transitions
- Flexible storage for optional data (JSON fields where appropriate)
- Optimized for search and reporting queries

---

## Entity Relationship Diagram

```
┌─────────────┐
│    Lead     │──┐
└─────────────┘  │
       │         │
       │ 1       │ 1
       │         │
       ▼ *       ▼ 0..1
┌─────────────┐ ┌──────────────────┐
│  Activity   │ │ OrganizationInfo │
└─────────────┘ └──────────────────┘
                         │
       ┌─────────────────┼─────────────────┐
       │ 0..1            │ 0..1            │ 0..1
       ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ DemoDetails │   │  Proposal   │   │ LostReason  │
└─────────────┘   └─────────────┘   └─────────────┘
```

---

## Entities

### 1. Lead (Primary Entity)

Represents a potential customer opportunity.

**Prisma Schema**:

```prisma
model Lead {
  id                String    @id @default(cuid())

  // Core contact information (required)
  companyName       String
  contactName       String
  phone             String
  email             String

  // Optional contact details
  contactTitle      String?
  companyDescription String?
  leadSource        LeadSource @default(EMAIL)

  // Sales process tracking
  currentStage      Stage     @default(INQUIRY)
  estimatedValue    Decimal?  @db.Decimal(10, 2)

  // Follow-up management
  nextFollowUpDate  DateTime?
  lastActivityDate  DateTime?

  // Metadata
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relationships
  activities        Activity[]
  organizationInfo  OrganizationInfo?
  demoDetails       DemoDetails?
  proposal          Proposal?
  lostReason        LostReason?
  stageHistory      StageHistory[]

  @@index([companyName])
  @@index([contactName])
  @@index([email])
  @@index([currentStage])
  @@index([nextFollowUpDate])
  @@index([createdAt])
}

enum LeadSource {
  EMAIL
  PHONE
  WEBSITE
  REFERRAL
  TRADE_SHOW
  OTHER
}

enum Stage {
  INQUIRY
  QUALIFICATION
  OPPORTUNITY
  DEMO_SCHEDULED
  DEMO_COMPLETE
  PROPOSAL_SENT
  NEGOTIATION
  CLOSED_WON
  CLOSED_LOST
}
```

**Field Details**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (CUID) | Yes | Unique identifier |
| companyName | String | Yes | Company/organization name |
| contactName | String | Yes | Primary contact person |
| phone | String | Yes | Contact phone number |
| email | String | Yes | Contact email address |
| contactTitle | String | No | Contact's job title |
| companyDescription | String | No | Brief company/situation description |
| leadSource | Enum | Yes (default EMAIL) | How lead was acquired |
| currentStage | Enum | Yes (default INQUIRY) | Current position in sales pipeline |
| estimatedValue | Decimal | No | Estimated deal value in currency |
| nextFollowUpDate | DateTime | No | When to follow up next |
| lastActivityDate | DateTime | No | Most recent activity timestamp |
| createdAt | DateTime | Yes | Record creation timestamp |
| updatedAt | DateTime | Yes | Last modification timestamp |

**Validation Rules**:
- `email`: Must be valid email format
- `phone`: Must be non-empty string (format validation optional)
- `estimatedValue`: If set, must be >= 0
- `nextFollowUpDate`: If set, should be >= current date (warning if in past)

**Indexes**:
- `companyName`: For search queries
- `contactName`: For search queries
- `email`: For duplicate detection and search
- `currentStage`: For pipeline grouping
- `nextFollowUpDate`: For follow-up reminder queries
- `createdAt`: For sorting and date-range reporting

---

### 2. Activity

Represents logged interactions and follow-ups with a lead.

**Prisma Schema**:

```prisma
model Activity {
  id          String       @id @default(cuid())
  leadId      String
  lead        Lead         @relation(fields: [leadId], references: [id], onDelete: Cascade)

  type        ActivityType
  description String       @db.Text
  activityDate DateTime

  // Next action tracking
  nextFollowUpDate DateTime?

  createdAt   DateTime     @default(now())
  createdBy   String       @default("user") // For future multi-user support

  @@index([leadId])
  @@index([activityDate])
  @@index([type])
}

enum ActivityType {
  CALL
  EMAIL
  MEETING
  NOTE
  DEMO
  PROPOSAL_SENT
  CONTRACT_SENT
  OTHER
}
```

**Field Details**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (CUID) | Yes | Unique identifier |
| leadId | String | Yes | Foreign key to Lead |
| type | Enum | Yes | Type of activity |
| description | Text | Yes | Activity notes/details |
| activityDate | DateTime | Yes | When activity occurred |
| nextFollowUpDate | DateTime | No | When to follow up after this activity |
| createdAt | DateTime | Yes | Record creation timestamp |
| createdBy | String | Yes (default "user") | Who logged the activity |

**Validation Rules**:
- `description`: Must be non-empty, max 10,000 characters
- `activityDate`: Should be <= current date (warning if future)
- `nextFollowUpDate`: If set, should be > activityDate

---

### 3. OrganizationInfo

Detailed organization information captured during Opportunity stage.

**Prisma Schema**:

```prisma
model OrganizationInfo {
  id              String   @id @default(cuid())
  leadId          String   @unique
  lead            Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  industry        String?
  employeeCount   Int?
  decisionTimeline String?
  keyStakeholders Json?    // Array of {name, title, role}
  specificNeeds   String?  @db.Text
  currentSolution String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Field Details**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (CUID) | Yes | Unique identifier |
| leadId | String | Yes (unique) | Foreign key to Lead (1:1) |
| industry | String | No | Industry/sector |
| employeeCount | Int | No | Number of employees |
| decisionTimeline | String | No | When decision expected (e.g., "Q1 2025") |
| keyStakeholders | JSON | No | Array of decision-makers |
| specificNeeds | Text | No | Detailed needs description |
| currentSolution | Text | No | What they currently use |

**JSON Structure for keyStakeholders**:
```json
[
  {
    "name": "John Doe",
    "title": "CTO",
    "role": "Technical Decision Maker"
  },
  {
    "name": "Jane Smith",
    "title": "CFO",
    "role": "Budget Approver"
  }
]
```

---

### 4. DemoDetails

Information gathered during product demonstration.

**Prisma Schema**:

```prisma
model DemoDetails {
  id                String   @id @default(cuid())
  leadId            String   @unique
  lead              Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  demoDate          DateTime
  demoTime          String?  // Optional time string (e.g., "2:00 PM EST")
  meetingLink       String?

  userCountEstimate Int?
  requiredModules   Json?    // Array of module names
  cardlockVolume    String?
  demoNotes         String?  @db.Text
  attendees         Json?    // Array of {name, title}
  followUpItems     Json?    // Array of action items

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Field Details**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (CUID) | Yes | Unique identifier |
| leadId | String | Yes (unique) | Foreign key to Lead (1:1) |
| demoDate | DateTime | Yes | Scheduled demo date |
| demoTime | String | No | Time of demo (stored as string for flexibility) |
| meetingLink | String | No | Teams/Zoom/etc. meeting URL |
| userCountEstimate | Int | No | Estimated number of users |
| requiredModules | JSON | No | List of modules they need |
| cardlockVolume | String | No | Cardlock business volume (text field) |
| demoNotes | Text | No | General demo notes |
| attendees | JSON | No | Who attended the demo |
| followUpItems | JSON | No | Action items from demo |

**JSON Structure Examples**:

```json
// requiredModules
["Inventory Management", "Reporting", "Mobile Access", "API Integration"]

// attendees
[
  {"name": "John Doe", "title": "CTO"},
  {"name": "Jane Smith", "title": "Operations Manager"}
]

// followUpItems
[
  "Send API documentation",
  "Schedule technical deep-dive for integration team",
  "Provide case study from similar industry"
]
```

---

### 5. Proposal

Quote/proposal information.

**Prisma Schema**:

```prisma
model Proposal {
  id                String         @id @default(cuid())
  leadId            String         @unique
  lead              Lead           @relation(fields: [leadId], references: [id], onDelete: Cascade)

  proposalDate      DateTime       @default(now())
  estimatedValue    Decimal        @db.Decimal(10, 2)
  documentUrl       String?        // Link to proposal document
  validUntil        DateTime?
  status            ProposalStatus @default(SENT)

  notes             String?        @db.Text

  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
}

enum ProposalStatus {
  DRAFT
  SENT
  VIEWED
  ACCEPTED
  REJECTED
  EXPIRED
}
```

**Field Details**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (CUID) | Yes | Unique identifier |
| leadId | String | Yes (unique) | Foreign key to Lead (1:1) |
| proposalDate | DateTime | Yes | When proposal was created |
| estimatedValue | Decimal | Yes | Quote amount |
| documentUrl | String | No | Link to proposal PDF/document |
| validUntil | DateTime | No | Proposal expiration date |
| status | Enum | Yes (default SENT) | Proposal status |
| notes | Text | No | Internal notes about proposal |

---

### 6. LostReason

Reason why a lead was marked as Closed-Lost.

**Prisma Schema**:

```prisma
model LostReason {
  id          String   @id @default(cuid())
  leadId      String   @unique
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  reason      String   // e.g., "Price too high", "Went with competitor", "No budget"
  details     String?  @db.Text
  competitor  String?  // Who they chose instead

  createdAt   DateTime @default(now())

  @@index([reason])
}
```

**Field Details**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (CUID) | Yes | Unique identifier |
| leadId | String | Yes (unique) | Foreign key to Lead (1:1) |
| reason | String | Yes | Primary reason for loss |
| details | Text | No | Additional context |
| competitor | String | No | Competitor they chose |

**Common Reason Values** (not enforced, but suggested):
- "Price too high"
- "Went with competitor"
- "No budget"
- "Timeline too long"
- "Feature gaps"
- "Not interested"
- "Unresponsive"
- "Other"

---

### 7. StageHistory

Audit trail of stage transitions.

**Prisma Schema**:

```prisma
model StageHistory {
  id          String   @id @default(cuid())
  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  fromStage   Stage?   // NULL for initial creation
  toStage     Stage
  changedAt   DateTime @default(now())
  changedBy   String   @default("user")
  notes       String?  @db.Text

  @@index([leadId])
  @@index([changedAt])
}
```

**Field Details**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (CUID) | Yes | Unique identifier |
| leadId | String | Yes | Foreign key to Lead |
| fromStage | Stage | No (NULL for new leads) | Previous stage |
| toStage | Stage | Yes | New stage |
| changedAt | DateTime | Yes | When change occurred |
| changedBy | String | Yes | Who made the change |
| notes | Text | No | Optional note explaining change |

**Purpose**:
- Provides complete audit trail of lead progression
- Enables reporting on conversion rates between stages
- Helps calculate average time in each stage
- Supports backward stage movement detection

---

## Database Indexes

### Primary Indexes (for queries):
1. **Lead.companyName** - Search by company
2. **Lead.contactName** - Search by contact
3. **Lead.email** - Duplicate detection, search
4. **Lead.currentStage** - Pipeline grouping
5. **Lead.nextFollowUpDate** - Follow-up reminders (ordered queries)
6. **Lead.createdAt** - Date-range reports, sorting
7. **Activity.leadId** - Activity history queries
8. **Activity.activityDate** - Timeline views
9. **StageHistory.leadId** - Stage transition history
10. **LostReason.reason** - Win/loss analysis grouping

### Full-Text Search (SQLite FTS5):

Create virtual table for fast text search:

```sql
CREATE VIRTUAL TABLE lead_fts USING fts5(
  company_name,
  contact_name,
  email,
  company_description,
  content=lead,
  content_rowid=rowid
);
```

**Supported Queries**:
- Search across company name, contact name, email, description
- Prefix matching: "acme*" matches "Acme Corp", "Acme Industries"
- Phrase search: "john smith" matches exact phrase
- Boolean operators: "acme AND software"

---

## Data Integrity Rules

### Cascade Deletes:
- Deleting a Lead cascades to:
  - All Activities
  - OrganizationInfo (if exists)
  - DemoDetails (if exists)
  - Proposal (if exists)
  - LostReason (if exists)
  - All StageHistory entries

### Unique Constraints:
- Lead.email (optional, for duplicate detection warning)
- OrganizationInfo.leadId (1:1 relationship)
- DemoDetails.leadId (1:1 relationship)
- Proposal.leadId (1:1 relationship)
- LostReason.leadId (1:1 relationship)

### Check Constraints (application-level):
- estimatedValue >= 0
- userCountEstimate > 0
- Stage transitions follow logical flow (warnings for backward movement)

---

## State Transitions

### Stage Progression Flow:

```
INQUIRY → QUALIFICATION → OPPORTUNITY → DEMO_SCHEDULED → DEMO_COMPLETE
  → PROPOSAL_SENT → NEGOTIATION → CLOSED_WON
                                   └→ CLOSED_LOST
```

**Backward Movement**: Allowed but logged in StageHistory with optional note.

**Required Data by Stage**:
- **OPPORTUNITY**: OrganizationInfo should exist (warning if missing)
- **DEMO_SCHEDULED**: DemoDetails with demoDate required
- **DEMO_COMPLETE**: DemoDetails.userCountEstimate recommended
- **PROPOSAL_SENT**: Proposal required
- **CLOSED_WON**: Proposal.estimatedValue required
- **CLOSED_LOST**: LostReason required

### Stage Validation Matrix (FR-033):

**Implementation**: `backend/src/utils/stageValidator.ts`

This table defines the minimum required information for transitioning TO each stage:

| Target Stage | Required Fields | Optional But Recommended | Validation Behavior |
|-------------|----------------|-------------------------|---------------------|
| **INQUIRY** | `companyName`, `contactName`, `phone` OR `email` | `email` if phone provided | Hard block - cannot create lead without minimum info |
| **QUALIFICATION** | (inherits INQUIRY requirements) | `email`, `phone`, initial activity note | Soft warning if missing recommended fields |
| **OPPORTUNITY** | `OrganizationInfo.employeeCount`, `OrganizationInfo.industry` | `OrganizationInfo.annualRevenue`, `OrganizationInfo.decisionMaker` | Soft warning - can proceed but shows alert |
| **DEMO_SCHEDULED** | `DemoDetails.demoDate`, `DemoDetails.demoType` | `DemoDetails.attendees` | Hard block - cannot schedule without date |
| **DEMO_COMPLETE** | `DemoDetails.demoDate` (must be past), `DemoDetails.demoOutcome` | `DemoDetails.userCountEstimate`, `DemoDetails.followUpRequired` | Hard block - must have demo details |
| **PROPOSAL_SENT** | `Proposal.proposalDate`, `Proposal.estimatedValue` | `Proposal.products`, `Proposal.notes` | Hard block - cannot send proposal without value |
| **NEGOTIATION** | (inherits PROPOSAL_SENT) | Activity notes documenting negotiation points | Soft warning if no recent activities |
| **CLOSED_WON** | `Proposal.estimatedValue`, activity note with close details | `Proposal.products`, `Proposal.contractTerm` | Hard block - must have final value |
| **CLOSED_LOST** | `LostReason.reason`, `LostReason.lostDate` | `LostReason.competitorName`, `LostReason.notes` | Hard block - must document why lost |

**Validation Modes**:
- **Hard Block**: API returns `400 Bad Request` with list of missing required fields
- **Soft Warning**: API returns `200 OK` but includes `warnings` array in response
- **Force Override**: Client can pass `force: true` in request body to bypass soft warnings (not hard blocks)

**API Response Format** (validation failure):
```json
{
  "error": "VALIDATION_FAILED",
  "message": "Cannot transition to PROPOSAL_SENT without required information",
  "missingFields": [
    {
      "field": "Proposal.proposalDate",
      "reason": "Proposal date is required before sending proposal"
    },
    {
      "field": "Proposal.estimatedValue",
      "reason": "Estimated value must be set for proposal stage"
    }
  ],
  "canForce": false
}
```

---

## Sample Queries

### 1. Find all overdue follow-ups:

```sql
SELECT * FROM Lead
WHERE nextFollowUpDate < datetime('now')
  AND currentStage NOT IN ('CLOSED_WON', 'CLOSED_LOST')
ORDER BY nextFollowUpDate ASC;
```

### 2. Pipeline value by stage:

```sql
SELECT
  currentStage,
  COUNT(*) as lead_count,
  SUM(estimatedValue) as total_value
FROM Lead
WHERE currentStage NOT IN ('CLOSED_WON', 'CLOSED_LOST')
GROUP BY currentStage
ORDER BY
  CASE currentStage
    WHEN 'INQUIRY' THEN 1
    WHEN 'QUALIFICATION' THEN 2
    WHEN 'OPPORTUNITY' THEN 3
    WHEN 'DEMO_SCHEDULED' THEN 4
    WHEN 'DEMO_COMPLETE' THEN 5
    WHEN 'PROPOSAL_SENT' THEN 6
    WHEN 'NEGOTIATION' THEN 7
  END;
```

### 3. Lead age (time in current stage):

```sql
SELECT
  id,
  companyName,
  currentStage,
  julianday('now') - julianday(
    COALESCE(
      (SELECT changedAt FROM StageHistory
       WHERE leadId = Lead.id
       ORDER BY changedAt DESC LIMIT 1),
      createdAt
    )
  ) as days_in_stage
FROM Lead
WHERE currentStage NOT IN ('CLOSED_WON', 'CLOSED_LOST')
ORDER BY days_in_stage DESC;
```

### 4. Win rate by lost reason:

```sql
SELECT
  reason,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Lead WHERE currentStage = 'CLOSED_LOST'), 2) as percentage
FROM LostReason
GROUP BY reason
ORDER BY count DESC;
```

### 5. Average sales cycle length:

```sql
SELECT
  AVG(julianday(
    (SELECT changedAt FROM StageHistory
     WHERE leadId = Lead.id AND toStage = 'CLOSED_WON' LIMIT 1)
  ) - julianday(createdAt)) as avg_days
FROM Lead
WHERE currentStage = 'CLOSED_WON';
```

---

## Migration Strategy

### Initial Schema:
1. Create all tables via Prisma migrate
2. Create FTS5 virtual table for search
3. Create indexes

### Sample Data (for development):
- 20-30 leads across different stages
- 50-100 activities
- 5-10 complete opportunities with all related data
- 3-5 closed-won deals
- 3-5 closed-lost deals with reasons

### Future Enhancements:
- Custom fields support (JSON column on Lead)
- Tags/labels for categorization
- Email integration (store email threads)
- Document attachments (file uploads)
- Multi-user support (user table, permissions)
- Notification preferences
- Custom stage definitions per sales process
