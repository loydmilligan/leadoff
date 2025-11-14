# Implementation Plan: LeadOff CRM

**Branch**: `001-leadoff-crm` | **Date**: 2025-11-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-leadoff-crm/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

LeadOff is a web-based CRM application designed to prevent leads from falling through the cracks by providing centralized lead tracking, automated follow-up reminders, and pipeline visualization. The system supports the complete sales lifecycle from inquiry through close, with a critical requirement for narrow-screen layout (400-600px) to run side-by-side with the legacy EDIprod system. Phase 1 focuses on manual lead management with quick-entry forms, kanban-style pipeline visualization, automated reminders, and essential reporting (pipeline value, lead age, weekly activity, win/loss analysis).

## Terminology & Clarifications

**Focus View**: The narrow-screen layout mode (400-600px width) that allows LeadOff to run side-by-side with the legacy EDIprod system. This is the PRIMARY interface mode for Phase 1. Implementation details:
  - Responsive design with mobile-first approach
  - Single-column layout for forms and lists
  - Collapsible sections to conserve vertical space
  - Sticky headers for navigation within narrow viewport
  - Keyboard shortcuts for common actions (Ctrl+N for new lead, / for search)

**Demo Complete vs DEMO_COMPLETE Stage**:
  - `DEMO_COMPLETE` (all caps): The **stage** in the sales pipeline that a lead enters AFTER a demo meeting has occurred
  - "Demo complete" (lowercase): Informal phrase meaning "the demo meeting is finished"
  - **Data Model**: `DEMO_COMPLETE` is a value in the `Stage` enum (see data-model.md line 47)
  - **Transition Rule**: Lead moves from `DEMO_SCHEDULED` → `DEMO_COMPLETE` when `DemoDetails.demoDate` is in the past AND `DemoDetails.demoOutcome` is recorded
  - **Not a Boolean**: There is no `isComplete` flag on DemoDetails - completion is determined by stage value

**Lead Age**: Number of calendar days since `Lead.createdAt` timestamp. Used in "Lead Age Report" (FR-017) to identify stagnating leads.

**Follow-up Reminder**: A lead with `nextFollowUpDate <= today` and `currentStage NOT IN ('CLOSED_WON', 'CLOSED_LOST')`. Displayed prominently on dashboard.

**Pipeline Value**: Sum of `Proposal.estimatedValue` for all leads in stages `PROPOSAL_SENT`, `NEGOTIATION`, or `CLOSED_WON` (FR-015).

**Quick-Entry Form**: Minimal lead creation form requiring only `companyName`, `contactName`, and `phone` OR `email` (see Stage Validation Matrix in data-model.md). Designed for <30 second lead creation time (constraint).

## Technical Context

**Language/Version**: TypeScript 5.x (frontend + backend), Node.js 20 LTS
**Primary Dependencies**:
  - Frontend: React 18, Vite, Tailwind CSS, React Query, @dnd-kit, React Hook Form, Zod
  - Backend: Fastify, Prisma ORM, Zod, date-fns
**Storage**: SQLite (Phase 1) with Prisma ORM, PostgreSQL-ready for future multi-user support
**Testing**: Vitest (unit tests), Supertest (API integration), Playwright (E2E)
**Target Platform**: Web application (desktop browsers: Chrome, Firefox, Safari, Edge - modern versions)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <1 second search response for 1000 leads, <2 seconds dashboard load, <3 seconds report generation
**Constraints**: Must support narrow-screen layout (400-600px width), <30 seconds lead creation time, single-user Phase 1
**Scale/Scope**: 500+ active leads, 5 prioritized user stories, 33 functional requirements, 10 success criteria

### Validation Rules

**Field-Level Validation** (enforced by Zod schemas + custom validators):

| Field | Format Rules | Custom Logic | Error Messages |
|-------|-------------|--------------|----------------|
| **email** | RFC 5322 email format (Zod `.email()`) | Must be unique per lead (database constraint) | "Invalid email format" / "Email already exists" |
| **phone** | North American: `(XXX) XXX-XXXX`, `XXX-XXX-XXXX`, `XXXXXXXXXX` (10 digits). International: `+X XXX XXX XXXX` (E.164 format with optional spaces/dashes) | Normalize to E.164 before storage | "Phone must be 10 digits or international format (+X...)" |
| **companyName** | 2-200 characters, allow letters/numbers/spaces/punctuation | Trim whitespace, check duplicate detection before save | "Company name required (2-200 chars)" |
| **contactName** | 2-100 characters, allow letters/spaces/hyphens/apostrophes | Trim whitespace | "Contact name required (2-100 chars)" |
| **estimatedValue** | Positive number, up to 2 decimal places, max 999999999.99 | Format as currency in UI, store as Decimal | "Must be positive number (max $999,999,999.99)" |
| **nextFollowUpDate** | ISO 8601 date, must be today or future | Warn if >90 days in future | "Follow-up date cannot be in the past" / "Warning: Follow-up is 90+ days away" |
| **demoDate** | ISO 8601 datetime, must be reasonable (not >2 years future, not >2 years past) | Allow past dates for logging completed demos | "Demo date must be within reasonable timeframe" |

**Cross-Field Validation**:
- **phone OR email required**: At least one contact method must be provided (enforced at INQUIRY stage minimum)
- **Proposal date <= today**: Cannot send proposal in future
- **Demo date consistency**: If `currentStage >= DEMO_SCHEDULED`, `DemoDetails.demoDate` must exist
- **Proposal value consistency**: If `currentStage >= PROPOSAL_SENT`, `Proposal.estimatedValue` must exist

**Custom Validation Functions** (beyond Zod):
1. **Duplicate Detection** (`validateNoDuplicate`): Checks email match or 80% name similarity (see Phase 0 research, item 8)
2. **Stage Transition** (`validateStageTransition`): Checks required fields per Stage Validation Matrix (data-model.md)
3. **Phone Normalization** (`normalizePhoneNumber`): Converts various phone formats to E.164
4. **Date Range** (`validateDateRange`): Ensures dates are reasonable (not year 1900 or 2999)

**Validation Timing**:
- **Frontend**: React Hook Form + Zod schemas provide instant feedback (on blur, on submit)
- **Backend**: Fastify request validation (Zod schemas) + custom middleware for stage transitions
- **Database**: Unique constraints on email, foreign key constraints, NOT NULL constraints

**Error Response Format** (API):
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "validationErrors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_FORMAT"
    },
    {
      "field": "phone",
      "message": "Phone must be 10 digits or international format",
      "code": "INVALID_FORMAT"
    }
  ]
}
```

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**LeadOff Constitution v1.1.0 Compliance**:

Reference: `.specify/memory/constitution.md`

✓ **I. Verification Before Success**: All tasks will include verification commands and evidence
✓ **II. Git Worktree Isolation**: Feature branch `001-leadoff-crm` will use worktree for development
✓ **III. Testing Strategy**: Unit tests (minimal mocking) + Playwright E2E when UI ready
✓ **IV. Done Statements**: All tasks and phases will include explicit, testable done statements
✓ **V. Phase Progress Tracking**: Task and phase completion will follow reporting protocols
✓ **VI. Documentation Maintenance**: All code changes will include synchronized documentation updates, repository cleanup checklist before commits, and pre-PR documentation verification

**Architecture Compliance**:

✓ **Technology Stack**: React, Fastify, Prisma align with pragmatic testing (real objects)
✓ **Type Safety**: TypeScript reduces errors, supports verification before success
✓ **Testing Approach**: Vitest (unit), Supertest (integration), Playwright (E2E) - not strict TDD
✓ **Verification**: All done statements will include verification commands where applicable
✓ **Worktree Ready**: Branch structure supports isolation workflow

**No constitution violations. Ready for task generation with done statements.**

## Project Structure

### Documentation (this feature)

```text
specs/001-leadoff-crm/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure
backend/
├── src/
│   ├── models/          # Lead, Activity, Organization, Demo, Proposal entities
│   ├── services/        # Business logic: lead management, follow-ups, reporting
│   ├── api/             # REST API endpoints
│   └── utils/           # Helpers: date calculations, duplicate detection, validators
└── tests/
    ├── contract/        # API contract tests
    ├── integration/     # Database + service integration tests
    └── unit/            # Model and service unit tests

frontend/
├── src/
│   ├── components/      # Reusable UI: LeadCard, SearchBar, FollowUpIndicator
│   ├── pages/           # Dashboard, Pipeline, LeadDetail, Reports
│   ├── services/        # API client, state management
│   ├── layouts/         # NarrowScreenLayout for EDIprod compatibility
│   └── utils/           # Date formatters, search helpers
└── tests/
    ├── e2e/             # Critical flows: lead creation, stage updates, search
    ├── integration/     # Component + API integration
    └── unit/            # Component logic tests

shared/
└── types/               # Shared TypeScript types/interfaces (if TypeScript chosen)
```

**Structure Decision**: Standard web application structure with separated frontend and backend. This supports:
- Independent development and testing of UI and API
- Clear API contracts between layers
- Ability to deploy frontend and backend separately if needed
- Frontend framework flexibility (React/Vue/Svelte decision in research phase)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations identified. Standard web application architecture aligns with industry best practices.

---

## Phase 0: Research & Technology Decisions

**Status**: PENDING

**Unknowns to Resolve**:

1. **Frontend Framework Selection**
   - Options: React, Vue 3, Svelte
   - Criteria: Narrow-screen layout support, drag-and-drop libraries (kanban), developer familiarity, bundle size

2. **Backend Framework Selection**
   - Options: Node.js (Express/Fastify), Python (FastAPI/Django), TypeScript (NestJS)
   - Criteria: Development speed, type safety, ORM quality, testing ecosystem

3. **Database Selection**
   - Options: PostgreSQL, MySQL, SQLite
   - Criteria: Relational support (lead relationships), local development ease, production scalability

4. **Drag-and-Drop Library** (for kanban pipeline)
   - Options: react-beautiful-dnd, dnd-kit, Vue Draggable, sortable.js
   - Criteria: Framework compatibility, touch support, accessibility

5. **State Management** (frontend)
   - Options: Context API, Redux, Zustand, Pinia (Vue), Svelte stores
   - Criteria: Complexity vs needs, learning curve, bundle size

6. **Date/Time Handling**
   - Options: date-fns, day.js, Luxon
   - Criteria: Timezone support, follow-up calculations, size

7. **Reporting/Export**
   - Options: jsPDF + html2canvas, server-side PDF generation (puppeteer/wkhtmltopdf), CSV libraries
   - Criteria: PDF quality, performance, server requirements

8. **Duplicate Detection Algorithm** (FR-032)
   - **Requirement**: Detect potential duplicate leads before creation
   - **Algorithm**: A lead is considered a potential duplicate if:
     - **Exact email match**: `email` field matches existing lead (case-insensitive), OR
     - **Name similarity**: `(companyName + " " + contactName)` matches existing lead with >80% similarity using Levenshtein distance
   - **Implementation**:
     - Backend service: `backend/src/services/duplicateDetection.ts`
     - API behavior: `POST /api/v1/leads` returns `409 Conflict` with existing lead data if duplicate detected
     - Frontend behavior: Display warning modal with options to "View Existing Lead" or "Create Anyway"
   - **Library**: Use `string-similarity` npm package (or `fuzzball`) for fuzzy string matching
   - **Performance**: Index email field, cache normalized names for comparison
   - **Edge Cases**:
     - Empty email: Only check name similarity
     - Multiple matches: Return all potential duplicates (up to 5)
     - Force create: Accept `force: true` flag in request body to bypass duplicate check

**Research Outputs**: `research.md` will document decisions, rationale, and alternatives for each unknown.

---

## Phase 1: Design Artifacts

**Status**: PENDING (blocked by Phase 0)

**Planned Outputs**:

### 1. Data Model (`data-model.md`)

Entities to define:
- Lead (primary entity)
- Activity (follow-ups and interactions)
- Organization Details (captured during Opportunity stage)
- Demo Details (from demo meetings)
- Proposal (quote information)
- Stage (enumeration)

### 2. API Contracts (`/contracts/`)

REST API specification (OpenAPI 3.0):
- Lead CRUD operations
- Lead stage updates
- Activity logging
- Search and filtering
- Follow-up reminders
- Reporting endpoints (pipeline value, lead age, weekly summary, win/loss)

### 3. Quickstart Guide (`quickstart.md`)

Developer setup instructions:
- Prerequisites (language runtime, database)
- Installation steps
- Local development workflow
- Running tests
- Project conventions

---

## Phase 2: Task Generation

**Status**: NOT STARTED (use `/speckit.tasks` command after Phase 1 complete)

Will generate `tasks.md` with:
- Dependency-ordered implementation tasks
- Test-first approach for each task
- Estimated complexity/priority
- Verification steps
