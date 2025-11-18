# Lead Lifecycle Management Design
**Date:** 2025-11-18
**Status:** Approved for Implementation

## Overview
This design adds comprehensive lead lifecycle management to LeadOff CRM, including action buttons for closing deals, nurture workflows, next action tracking, communication templates, file attachments, planning views, CSV import, archive functionality, and AI-powered activity summarization.

## Problem Statement
Current CRM only supports forward movement through pipeline stages. Missing critical features:
- No easy way to close deals (won/lost) with proper tracking
- No nurture workflow for cold leads
- Only tracks WHEN to follow up, not WHAT to do
- No communication templates or scripts
- No file attachments for proposals
- No planning/calendar view for upcoming actions
- No way to import existing leads
- No way to clean up test data
- No AI assistance

## Design Sections

### 1. Lead Lifecycle & Stage Management

**New Stages:**
- `NURTURE_30_DAY` - Lead goes cold, follow up in 30 days
- `NURTURE_90_DAY` - Lead goes cold, follow up in 90 days
- Keep existing `CLOSED_WON` and `CLOSED_LOST`

**Closing Actions:**

**Won:**
- Required: notes
- Auto-creates: handoff workflow next action
- Auto-sets: stage to CLOSED_WON
- Creates: Activity record + StageHistory entry

**Lost:**
- Required: competitor name (or "Unknown"), reason selection, notes
- Auto-creates: 6-month follow-up with snooze capability
- Auto-sets: stage to CLOSED_LOST
- Creates: Activity record + StageHistory entry + LostReason record

**Nurture:**
- Required: notes, selection of 30 or 90 day option
- Auto-creates: follow-up date based on selection
- Auto-sets: stage to NURTURE_30_DAY or NURTURE_90_DAY
- Creates: Activity record + StageHistory entry

All actions pull leads out of active pipeline and maintain audit trail.

### 2. Next Action System

**Database Changes:**
Add to Lead model:
```typescript
nextActionType: String?         // ActivityType enum (EMAIL, PHONE_CALL, MEETING)
nextActionDescription: String?  // Specific details
nextActionDueDate: DateTime?    // When action should be completed
```

**UI Implementation:**
- Lead detail page: Prominent "Next Action" card at top with icon, description, due date
- Quick inline edit to update next action
- Activity log form: "Set Next Action" option when logging activities
- Planner view: Groups leads by next action type

**Future Growth:**
- Template selector replaces free-text description
- Templates pre-fill activity forms
- Track template conversion rates

### 3. Action Buttons & UI Placement

**Pipeline Card Quick Actions (Modal):**
- Three-dot menu or action icons on each lead card
- Opens modal with options:
  - Log Activity - quick activity form
  - Close as Won - won flow with required notes
  - Close as Lost - lost flow with competitor/reason
  - Move to Nurture - nurture flow with 30/90 day choice
- Streamlined forms with only essential fields
- Auto-creates Activity + updates Stage + sets follow-ups

**Lead Detail Page (In-page):**
- Prominent action button bar near lead name
- Same actions but with expanded forms for complex entries
- "Log Activity" scrolls to activity form at bottom
- Close actions show inline forms with all fields
- Archive button in overflow menu

**Workflow:**
Quick decisions → use cards. Complex notes → use detail page.

### 4. Template System

**Database Schema:**
```typescript
model Template {
  id          String   @id @default(cuid())
  type        String   // EMAIL, PHONE_CALL, TEXT_MESSAGE
  name        String   // "Initial Outreach Email", "Demo Follow-up Call"
  subject     String?  // For emails
  body        String   // Template content with {{placeholders}}
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Placeholder System:**
Supported variables:
- `{{companyName}}`, `{{contactName}}`, `{{contactTitle}}`
- `{{currentStage}}`, `{{estimatedValue}}`
- Auto-replaced when template is used

**UI Flow:**
1. Click "Log Activity" → Select type (Email/Call/Text)
2. "Load Template" dropdown appears
3. Select template → form pre-fills with personalized content
4. Edit as needed → save

**Initial Seed Templates:**
- "Initial Inquiry Response Email"
- "Demo Scheduling Call Script"
- "Proposal Follow-up Email"
- "Check-in Text Message"

**Future Growth:**
Stage-specific templates, template analytics, custom placeholders.

### 5. Proposal File Attachments

**Database Changes:**
Add to Proposal model:
```typescript
proposalFilePath    String?  // /uploads/proposals/{leadId}/proposal.pdf
priceSheetPath      String?  // /uploads/proposals/{leadId}/prices.xlsx
proposalFileName    String?  // Original filename
priceSheetFileName  String?  // Original filename
```

**File Storage:**
- Filesystem: `/uploads/proposals/{leadId}/`
- Docker volume mount for persistence
- Max file size: 10MB per file
- API designed for easy S3 migration

**API Endpoints:**
```
POST   /api/v1/proposals/{id}/upload-proposal
POST   /api/v1/proposals/{id}/upload-price-sheet
GET    /api/v1/proposals/{id}/files/proposal
GET    /api/v1/proposals/{id}/files/price-sheet
DELETE /api/v1/proposals/{id}/files/{type}
```

**UI Features:**
- Drag-and-drop upload or file picker
- PDF preview in browser (native viewer)
- Excel download (no preview initially)
- File size/type validation (frontend + backend)

### 6. Planner View

**Purpose:** Daily/weekly planning dashboard.

**View Sections:**

**Overdue (Red):**
- Next actions past due
- Overdue follow-ups
- Incomplete scheduled activities

**Today:**
- Next actions due today
- Today's follow-ups
- Today's activities

**This Week (Next 7 days):**
- Upcoming next actions
- Scheduled follow-ups
- Future activities

**No Date Set (Warning):**
- Active leads with no next action or follow-up
- Prevents leads falling through cracks

**UI Layout:**
- Collapsible section cards
- Compact rows: Company, contact, next action, due date
- Click row → lead detail page
- Quick "Complete" button → log activity + set new next action
- Filter by action type (calls/emails/meetings)
- Date range selector (today/week/2 weeks/custom)

### 7. CSV Import System

**CSV Format:**
```csv
companyName,contactName,phone,email,contactTitle,currentStage,estimatedValue,nextActionType,nextActionDescription,nextFollowUpDate,leadSource,notes
"Acme Corp","John Smith","555-0100","john@acme.com","CEO","QUALIFICATION",50000,"PHONE_CALL","Discuss pricing and timeline","2025-11-20","REFERRAL","Referred by existing customer"
"TechStart Inc","Jane Doe","555-0101","jane@techstart.com","CTO","DEMO_SCHEDULED",75000,"MEETING","Product demo scheduled","2025-11-19","WEBSITE","Submitted contact form"
"Global Solutions","Bob Johnson","555-0102","bob@global.com","VP Sales","PROPOSAL_SENT",120000,"EMAIL","Follow up on proposal questions","2025-11-21","TRADE_SHOW","Met at conference"
```

**Features:**
- Drag-and-drop or file picker upload
- Preview first 5 rows before import
- Validation: required fields (companyName, contactName, phone, email)
- Optional fields populate if provided
- Creates initial Activity if notes provided
- Import summary: "10 imported, 2 failed (with reasons)"
- Failed rows downloadable for correction

**API Endpoint:**
```
POST /api/v1/leads/import
```

### 8. Archive System

**Database Changes:**
Add to Lead model:
```typescript
isArchived      Boolean   @default(false)
archivedAt      DateTime?
archiveReason   String?   // Optional note
```

**Archive View:**
- Route: `/archive`
- Table of archived leads
- Columns: Company, Contact, Stage when archived, Archived date, Reason
- Search and filter
- Actions per lead:
  - Restore - sets isArchived=false
  - Permanently Delete - hard delete (admin, with confirmation)

**Archive Actions:**
- "Archive" button in lead detail overflow menu
- Bulk archive from lead list (multi-select)
- Modal asks for optional reason
- Archived leads hidden from all main views
- Reports filter: "Include archived leads" checkbox (default off)

**Use Cases:**
- Clean up test/dummy data
- Remove old lost leads
- Hide duplicates or invalid entries

### 9. AI Integration with OpenRouter

**Initial Scope:** Activity note summarization only.

**Implementation:**

**Database:**
Add to Activity model:
```typescript
aiSummary   String?  // AI-generated summary
```

**OpenRouter Setup:**
- Environment variable: `OPENROUTER_API_KEY`
- Model: `anthropic/claude-3-haiku` (fast, cheap)
- Service: `backend/src/services/aiService.ts`

**Feature: Summarize Activity Notes**
- Long notes show "Summarize" button
- Calls OpenRouter with prompt:
  ```
  Summarize this CRM activity note in 1-2 sentences,
  focusing on key outcomes and next steps:

  {notes}
  ```
- Displays summary, saves to aiSummary field
- Cost: ~$0.0001 per summary

**Future Growth:**
- Email draft generation
- Next-best-action suggestions
- Lead scoring
- Template personalization

## Implementation Priority

**Phase 1 (Core Lifecycle):**
1. Database schema updates (stages, next action fields, archive)
2. Action buttons (Won/Lost/Nurture) with modals
3. Next action system
4. Archive functionality

**Phase 2 (Planning & Import):**
5. Planner view
6. CSV import with sample file

**Phase 3 (Templates & Files):**
7. Template system with seed data
8. Proposal file attachments

**Phase 4 (AI):**
9. OpenRouter integration for activity summarization

## Success Criteria

- Can close deals from pipeline cards in <30 seconds
- Can see week's planned actions at a glance
- Can import 10 real leads via CSV
- Can clean up all test data with archive
- Templates reduce email writing time by 50%
- AI summaries provide quick activity context

## Technical Notes

**Database Migrations:**
- Add new enum values to Stage
- Add fields to Lead, Activity, Proposal models
- Create Template model
- Indexes on nextActionDueDate, isArchived

**File Upload:**
- Use `multer` middleware for file handling
- Validate MIME types (PDF, Excel)
- Store with deterministic paths for easy recovery
- Docker volume: `/app/uploads` → named volume

**OpenRouter:**
- Async processing for summaries
- Error handling for API failures
- Rate limiting (10 requests/minute to start)
- Cost tracking in logs

## Future Enhancements (Not in Scope)

- Slack/Email notifications for overdue actions
- Calendar sync (Google Calendar, Outlook)
- Mobile app for on-the-go updates
- Advanced AI features (scoring, recommendations)
- Template A/B testing
- S3/cloud file storage
- Multi-user permissions
- Custom fields and pipeline stages
