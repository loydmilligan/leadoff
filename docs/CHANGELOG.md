# Changelog

All notable changes to LeadOff CRM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Phase 8 - Lead Lifecycle Management (2025-11-18)

#### Added

**Action Buttons**
- Close as Won action with required notes
- Close as Lost action with competitor tracking and reason selection
- Move to Nurture action with 30-day and 90-day options
- Action buttons available on lead cards and detail pages
- Action preview showing what will happen before confirmation

**Next Action Tracking**
- Next action fields: type, description, and due date
- Next action types: CALL, EMAIL, MEETING, PROPOSAL, FOLLOW_UP
- Visual indicators for overdue and upcoming actions
- Next action display on lead cards and detail pages

**Communication Templates**
- Template system for common messages (EMAIL, PHONE_CALL, TEXT_MESSAGE)
- Load template button in activity forms
- Template variable substitution ({{companyName}}, {{contactName}})
- Template management via API

**Proposal File Attachments**
- PDF proposal upload support
- Excel price sheet upload support
- File storage in backend/uploads directory
- Download links for uploaded files
- File validation (type and size limits)

**Planner View**
- Overdue actions section
- Today's actions section
- This week's actions section
- Auto-grouping by due date
- Quick access to leads needing attention

**CSV Import**
- Upload CSV file with lead data
- Field mapping interface
- Validation and error reporting
- Bulk lead creation
- Sample CSV template download

**Archive System**
- Archive leads to remove from active views
- Archive reason tracking
- Restore archived leads
- Archive view page with filtering
- Archive date tracking

**AI Integration**
- Activity summarization using Claude API
- Summarize button on activities with long notes
- AI-generated bullet-point summaries
- Summary storage for future reference

#### Changed

**Lead Stages**
- Added NURTURE_30_DAY stage for short-term nurture
- Added NURTURE_90_DAY stage for long-term nurture
- Updated stage transitions to support nurture flow

**Database Schema**
- Added nextActionType, nextActionDescription, nextActionDueDate to Lead model
- Added isArchived, archivedAt, archiveReason to Lead model
- Added proposalFilePath, priceSheetPath, proposalFileName, priceSheetFileName to Proposal model
- Added aiSummary to Activity model
- Added Template model

**API Endpoints**
- POST /api/leads/:id/close-won - Close lead as won
- POST /api/leads/:id/close-lost - Close lead as lost
- POST /api/leads/:id/move-to-nurture - Move lead to nurture
- POST /api/leads/:id/archive - Archive a lead
- POST /api/leads/:id/restore - Restore an archived lead
- GET /api/leads/archived - Get archived leads
- GET /api/leads/planner - Get leads for planner view
- POST /api/leads/import - Import leads from CSV
- GET /api/templates - Get templates by type
- POST /api/proposals - Create proposal with file uploads
- POST /api/activities/:id/summarize - Summarize activity with AI

### Phase 6 - Demo & Opportunity Tracking (2025-11-15)

#### Added
- Demo scheduling and tracking
- Opportunity value estimation
- Reports page with analytics
- Pipeline value charts
- Win/loss analysis

### Initial Release (2025-11-13)

#### Added
- Lead management (CRUD operations)
- Pipeline Kanban board
- Activity logging
- Stage progression
- Contact information tracking
- Search and filtering
