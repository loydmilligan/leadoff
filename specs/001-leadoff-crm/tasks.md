# Implementation Tasks: LeadOff CRM

**Branch**: `001-leadoff-crm`
**Feature**: Lead tracking and management CRM
**Strategy**: User story-driven, incremental delivery (MVP = User Story 1)

---

## Overview

This document breaks down implementation into phases aligned with user stories (P1-P5). Each user story is independently testable and delivers incremental value.

**Total Tasks**: 114 tasks
**Parallelizable Tasks**: 49 tasks marked with [P]
**User Stories**: 5 (P1-P5 priority order)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**User Story 1 (P1)** - Quick Lead Entry and Tracking
- Delivers core value: prevent leads from falling through cracks
- Independently testable via manual lead entry and list viewing
- Estimated: 46 tasks (Phases 1 + 2 + 3)

### Incremental Delivery
1. **Phase 1**: Setup (project initialization)
2. **Phase 2**: Foundational (database, API foundation, shared types)
3. **Phase 3**: User Story 1 (P1) - Quick Lead Entry ← **MVP**
4. **Phase 4**: User Story 2 (P2) - Follow-up Management
5. **Phase 5**: User Story 3 (P3) - Pipeline Visualization
6. **Phase 6**: User Story 4 (P4) - Demo Tracking
7. **Phase 7**: User Story 5 (P5) - Reporting
8. **Phase 8**: Polish & Cross-Cutting

---

## Phase 1: Project Setup

**Goal**: Initialize project structure, install dependencies, configure tooling

**Phase Done Checklist**:
- [ ] Done: Project directories created per plan.md structure (backend/, frontend/, shared/)
- [ ] Done: All dependencies installed (frontend and backend) - `pnpm install` succeeds
- [ ] Done: Development servers start successfully - `pnpm dev` runs both frontend and backend
- [ ] Done: TypeScript compilation succeeds - `pnpm typecheck` exits 0 in both workspaces

### Tasks

- [ ] T001 Create git worktree for feature branch at worktrees/001-leadoff-crm
  - **Done when**: `git worktree list` shows worktrees/001-leadoff-crm directory
  - **Done when**: `cd worktrees/001-leadoff-crm && git branch` shows 001-leadoff-crm

- [ ] T002 Initialize project root structure (backend/, frontend/, shared/)
  - **Done when**: Directories backend/, frontend/, shared/ exist in worktree root
  - **Done when**: `ls -d backend frontend shared` succeeds

- [ ] T003 [P] Initialize backend Node.js project in backend/
  - **Done when**: backend/package.json exists with name "leadoff-backend"
  - **Done when**: `cd backend && pnpm install` completes successfully
  - **Dependencies**: @fastify/cors, fastify, prisma, @prisma/client, zod, date-fns
  - **DevDependencies**: @types/node, typescript, tsx, vitest, supertest

- [ ] T004 [P] Initialize frontend React project in frontend/
  - **Done when**: frontend/package.json exists with name "leadoff-frontend"
  - **Done when**: `cd frontend && pnpm install` completes successfully
  - **Done when**: `cd frontend && pnpm dev` starts Vite dev server on port 5173
  - **Dependencies**: react, react-dom, @tanstack/react-query, @dnd-kit/core, @dnd-kit/sortable, react-hook-form, zod, date-fns
  - **DevDependencies**: @types/react, @vitejs/plugin-react, typescript, vite, tailwindcss, vitest, @playwright/test

- [ ] T005 [P] Create shared types package in shared/types/
  - **Done when**: shared/types/package.json exists
  - **Done when**: shared/types/index.ts exports at least Stage and LeadSource enums

- [ ] T006 Configure TypeScript for backend in backend/tsconfig.json
  - **Done when**: backend/tsconfig.json exists with strict mode enabled
  - **Done when**: `cd backend && pnpm typecheck` (npx tsc --noEmit) exits 0

- [ ] T007 Configure TypeScript for frontend in frontend/tsconfig.json
  - **Done when**: frontend/tsconfig.json exists with paths alias @/* configured
  - **Done when**: `cd frontend && pnpm typecheck` exits 0

- [ ] T008 [P] Configure Tailwind CSS in frontend/
  - **Done when**: frontend/tailwind.config.js exists
  - **Done when**: frontend/src/index.css includes Tailwind directives
  - **Done when**: Tailwind utilities render correctly in browser

- [ ] T009 Configure ESLint and Prettier for both frontend and backend
  - **Done when**: Root .eslintrc.js and .prettierrc exist
  - **Done when**: `pnpm lint` runs without errors
  - **Done when**: `pnpm format` formats all files

- [ ] T010 Set up root package.json and pnpm workspace configuration
  - **Done when**: Root package.json has workspaces: ["backend", "frontend", "shared"]
  - **Done when**: pnpm-workspace.yaml exists with packages: ["backend", "frontend", "shared"]
  - **Done when**: `pnpm install` from root installs all workspace dependencies
  - **Done when**: `pnpm dev` starts both frontend and backend concurrently

**Phase 1 Progress**: 0/10 tasks complete

---

## Phase 2: Foundational Layer

**Goal**: Database schema, API foundation, shared types, test infrastructure

**Phase Done Checklist**:
- [ ] Done: Database migrations run successfully - `pnpm prisma migrate dev` creates leadoff.db
- [ ] Done: Prisma Client generates types - @prisma/client imports work in backend
- [ ] Done: API server starts and responds to health check - `curl localhost:3000/health` returns 200
- [ ] Done: Shared TypeScript types available - frontend and backend can import from shared/types/
- [ ] Done: Test frameworks configured and sample tests pass - `pnpm test:unit`, `pnpm test:integration`, `pnpm test:e2e` all succeed

### Tasks

- [ ] T011 Create Prisma schema in backend/prisma/schema.prisma
  - **Done when**: schema.prisma defines all 7 models (Lead, Activity, OrganizationInfo, DemoDetails, Proposal, LostReason, StageHistory)
  - **Done when**: All enums defined (Stage, LeadSource, ActivityType, ProposalStatus)
  - **Done when**: All indexes specified per data-model.md

- [ ] T012 Run initial Prisma migration
  - **Done when**: `cd backend && pnpm prisma migrate dev --name init` succeeds
  - **Done when**: SQLite database file created at backend/data/leadoff.db
  - **Done when**: `pnpm prisma studio` opens GUI at localhost:5555

- [ ] T013 Generate Prisma Client types
  - **Done when**: `pnpm prisma generate` completes
  - **Done when**: @prisma/client types available for import in backend/src/

- [ ] T014 [P] Create shared TypeScript types in shared/types/
  - **Done when**: shared/types/lead.ts exports Lead, Activity, OrganizationInfo types
  - **Done when**: shared/types/enums.ts exports Stage, LeadSource, ActivityType, ProposalStatus
  - **Done when**: shared/types/api.ts exports API request/response types

- [ ] T015 Set up Fastify server in backend/src/server.ts
  - **Done when**: `pnpm dev:backend` starts server on port 3000
  - **Done when**: Server logs "Server listening at http://localhost:3000"
  - **Done when**: Health check endpoint GET /health returns 200 OK

- [ ] T016 Configure CORS for frontend origin in backend/src/server.ts
  - **Done when**: CORS allows origin http://localhost:5173
  - **Done when**: Preflight OPTIONS requests succeed from frontend

- [ ] T017 [P] Set up Vitest for backend unit tests in backend/tests/
  - **Done when**: backend/vitest.config.ts exists
  - **Done when**: `cd backend && pnpm test:unit` runs Vitest
  - **Done when**: Sample test backend/tests/unit/sample.test.ts passes

- [ ] T018 [P] Set up Supertest for backend integration tests in backend/tests/integration/
  - **Done when**: backend/tests/integration/health.test.ts tests health endpoint
  - **Done when**: `cd backend && pnpm test:integration` passes

- [ ] T019 [P] Set up Vitest for frontend unit tests in frontend/tests/unit/
  - **Done when**: frontend/vitest.config.ts exists with jsdom environment
  - **Done when**: `cd frontend && pnpm test:unit` runs Vitest
  - **Done when**: Sample component test passes

- [ ] T020 [P] Set up Playwright for E2E tests in frontend/tests/e2e/
  - **Done when**: playwright.config.ts exists
  - **Done when**: `pnpm exec playwright install` installs browsers
  - **Done when**: Sample E2E test frontend/tests/e2e/example.spec.ts passes

- [ ] T021 Create database seed script in backend/prisma/seed.ts
  - **Done when**: seed.ts creates 20-30 sample leads across all stages
  - **Done when**: `pnpm prisma db seed` populates database
  - **Done when**: Prisma Studio shows seed data

**Phase 2 Progress**: 0/11 tasks complete

---

## Phase 3: User Story 1 (P1) - Quick Lead Entry and Tracking

**Goal**: Core MVP - Enable quick lead creation, viewing lead list, search, and stage updates

**Independent Test**: Manually enter lead from email, view in list, search by name, update stage to Opportunity

**Phase Done Checklist**:
- [ ] Done: Quick-entry form creates new leads in Inquiry stage - Playwright test `lead-creation.spec.ts` passes
- [ ] Done: Lead list displays all leads with stage, contact info, last activity - Dashboard shows all test leads
- [ ] Done: Search filters leads by company/contact name within 1 second - Playwright test `lead-search.spec.ts` passes
- [ ] Done: Stage dropdown updates lead stage (including to Opportunity) - Playwright test `stage-update.spec.ts` passes
- [ ] Done: Narrow-screen layout (400-600px) works without horizontal scroll - Playwright test `narrow-layout.spec.ts` passes at 400px

### Backend Tasks (US1)

- [ ] T022 [P] [US1] Create Lead model types in backend/src/models/lead.ts
  - **Done when**: LeadModel class exports create, findAll, findById, update, delete methods
  - **Done when**: All methods use Prisma Client with proper TypeScript types

- [ ] T023 [P] [US1] Create LeadService in backend/src/services/leadService.ts
  - **Done when**: LeadService.createLead validates input with Zod schema
  - **Done when**: LeadService.getLeads supports pagination and filtering
  - **Done when**: LeadService.searchLeads uses SQLite FTS5 for full-text search
  - **Done when**: LeadService.updateStage handles stage transitions and creates StageHistory

- [ ] T024 [P] [US1] Create Activity model and service in backend/src/models/activity.ts and backend/src/services/activityService.ts
  - **Done when**: ActivityService.logActivity creates Activity records
  - **Done when**: ActivityService.getActivitiesByLead retrieves lead history

- [ ] T025 [US1] Implement POST /api/v1/leads endpoint in backend/src/api/routes/leads.ts
  - **Done when**: curl -X POST localhost:3000/api/v1/leads with valid payload returns 201
  - **Done when**: Response includes created lead with id, currentStage=INQUIRY

- [ ] T026 [US1] Implement GET /api/v1/leads endpoint with pagination and search
  - **Done when**: curl localhost:3000/api/v1/leads returns paginated lead list
  - **Done when**: Query param ?search=acme filters by company name
  - **Done when**: Query param ?stage=INQUIRY filters by stage

- [ ] T027 [US1] Implement GET /api/v1/leads/:id endpoint
  - **Done when**: curl localhost:3000/api/v1/leads/{id} returns lead with activities

- [ ] T028 [US1] Implement PATCH /api/v1/leads/:id/stage endpoint
  - **Done when**: curl -X PATCH localhost:3000/api/v1/leads/{id}/stage with toStage=OPPORTUNITY succeeds
  - **Done when**: StageHistory record created
  - **Done when**: Response includes updated lead

- [ ] T029 [US1] Write integration tests for Lead endpoints in backend/tests/integration/leads.test.ts
  - **Done when**: All CRUD operations tested (create, read, update, delete)
  - **Done when**: Search and pagination tested
  - **Done when**: Stage update tested with StageHistory verification
  - **Done when**: `pnpm test:integration` passes all lead tests

- [ ] T029a [P] [US1] Implement duplicate detection in backend/src/services/duplicateDetection.ts
  - **Done when**: Service checks for exact email match OR similar company+contact name (>80% similarity)
  - **Done when**: POST /api/v1/leads returns 409 Conflict with existing lead data if duplicate found
  - **Done when**: Integration test verifies duplicate detection for email and name similarity
  - **Dependencies**: Requires string similarity library (e.g., fuzzball or string-similarity)

- [ ] T029b [P] [US1] Add stage validation middleware in backend/src/utils/stageValidator.ts
  - **Done when**: Middleware validates required fields per stage before allowing stage transition
  - **Done when**: Returns 400 Bad Request with missing field list if validation fails
  - **Done when**: Allows override with `force: true` flag and creates note in StageHistory
  - **Done when**: Unit test covers all stage transition validation rules

### Frontend Tasks (US1)

- [ ] T030 [P] [US1] Create API client in frontend/src/services/api.ts
  - **Done when**: Axios instance configured with baseURL http://localhost:3000/api/v1
  - **Done when**: Generic request/response handlers with error handling

- [ ] T031 [P] [US1] Create React Query hooks in frontend/src/services/leadHooks.ts
  - **Done when**: useLeads() hook fetches paginated leads
  - **Done when**: useCreateLead() mutation creates new lead
  - **Done when**: useUpdateLeadStage() mutation updates stage
  - **Done when**: useSearchLeads() hook debounces search input (300ms)

- [ ] T032 [P] [US1] Create LeadForm component in frontend/src/components/LeadForm.tsx
  - **Done when**: Form includes fields: companyName, contactName, phone, email, contactTitle (optional)
  - **Done when**: React Hook Form validates required fields
  - **Done when**: Zod schema validates email format
  - **Done when**: Form submission calls useCreateLead mutation

- [ ] T033 [P] [US1] Create LeadCard component in frontend/src/components/LeadCard.tsx
  - **Done when**: Displays company name, contact name, stage, phone, email
  - **Done when**: Shows last activity date if available
  - **Done when**: Stage displayed as badge with color-coding by stage

- [ ] T034 [P] [US1] Create SearchBar component in frontend/src/components/SearchBar.tsx
  - **Done when**: Input field debounces at 300ms
  - **Done when**: Triggers search on value change
  - **Done when**: Shows "No results" when search returns empty

- [ ] T035 [P] [US1] Create StageSelect component in frontend/src/components/StageSelect.tsx
  - **Done when**: Dropdown includes all stages (Inquiry, Qualification, Opportunity, etc.)
  - **Done when**: onChange triggers useUpdateLeadStage mutation
  - **Done when**: Optimistic update shows new stage immediately

- [ ] T036 [US1] Create Dashboard page in frontend/src/pages/Dashboard.tsx
  - **Done when**: Renders LeadForm, SearchBar, and lead list
  - **Done when**: Lead list maps over useLeads() data
  - **Done when**: Each lead rendered as LeadCard
  - **Done when**: Pagination controls (next/prev) work

- [ ] T037 [US1] Implement narrow-screen layout in frontend/src/layouts/NarrowScreenLayout.tsx
  - **Done when**: Layout uses Tailwind classes for 400-600px width
  - **Done when**: All form fields stack vertically
  - **Done when**: No horizontal scroll at 400px viewport width
  - **Done when**: Browser DevTools responsive mode at 500px shows full functionality

- [ ] T038 [US1] Apply NarrowScreenLayout to Dashboard
  - **Done when**: Dashboard wrapped in NarrowScreenLayout
  - **Done when**: Search bar, lead form, and lead list all render within 400-600px
  - **Done when**: Visual testing at 400px, 500px, 600px confirms readability

- [ ] T039 [US1] Write unit tests for LeadForm component in frontend/tests/unit/LeadForm.test.tsx
  - **Done when**: Test validates required field errors
  - **Done when**: Test validates email format
  - **Done when**: Test simulates form submission
  - **Done when**: `pnpm test:unit` passes

- [ ] T040 [US1] Write unit tests for LeadCard component
  - **Done when**: Test renders lead data correctly
  - **Done when**: Test displays stage badge
  - **Done when**: `pnpm test:unit` passes

### E2E Tests (US1)

- [ ] T041 [US1] Write Playwright test for lead creation in frontend/tests/e2e/lead-creation.spec.ts
  - **Done when**: Test navigates to dashboard
  - **Done when**: Test fills lead form with valid data
  - **Done when**: Test submits form and verifies lead appears in list
  - **Done when**: `pnpm test:e2e` passes

- [ ] T042 [US1] Write Playwright test for lead search in frontend/tests/e2e/lead-search.spec.ts
  - **Done when**: Test enters search term in SearchBar
  - **Done when**: Test verifies filtered results appear
  - **Done when**: `pnpm test:e2e` passes

- [ ] T043 [US1] Write Playwright test for stage update in frontend/tests/e2e/stage-update.spec.ts
  - **Done when**: Test selects different stage from dropdown
  - **Done when**: Test verifies lead stage updates in UI
  - **Done when**: `pnpm test:e2e` passes

- [ ] T044 [US1] Write Playwright test for narrow-screen layout in frontend/tests/e2e/narrow-layout.spec.ts
  - **Done when**: Test sets viewport to 400px width
  - **Done when**: Test verifies no horizontal scroll
  - **Done when**: Test verifies form is fully functional
  - **Done when**: `pnpm test:e2e` passes

**Phase 3 Progress**: 0/25 tasks complete

---

## Phase 4: User Story 2 (P2) - Automated Follow-up Management

**Goal**: Prevent missed follow-ups via automated reminders and focus view

**Independent Test**: Create lead, set follow-up date, verify reminder appears on dashboard with overdue indicators

**Phase Done Checklist**:
- [ ] Done: New leads auto-suggest follow-up dates based on stage - Creating Inquiry sets nextFollowUpDate to +24h
- [ ] Done: Dashboard shows leads requiring action today or overdue - FocusView component displays categorized leads
- [ ] Done: Overdue leads highlighted with days overdue count - FollowUpIndicator shows "Overdue: X days" badge
- [ ] Done: Activity logging updates follow-up date - ActivityLogForm updates nextFollowUpDate
- [ ] Done: Focus View ranks top 5-10 leads by priority - Playwright test `follow-ups.spec.ts` verifies prioritization

### Backend Tasks (US2)

- [ ] T045 [P] [US2] Add follow-up date calculation utility in backend/src/utils/followUpCalculator.ts
  - **Done when**: calculateNextFollowUp(stage) returns correct date (Inquiry +24h, Qualification +48h, etc.)
  - **Done when**: Unit test verifies all stage calculations

- [ ] T046 [P] [US2] Update LeadService.createLead to auto-set nextFollowUpDate
  - **Done when**: Creating Inquiry lead sets nextFollowUpDate to now + 24 hours
  - **Done when**: Integration test verifies auto-set follow-up date

- [ ] T047 [P] [US2] Implement GET /api/v1/leads/follow-ups endpoint in backend/src/api/routes/leads.ts
  - **Done when**: Returns { overdue: [], today: [], upcoming: [] }
  - **Done when**: Overdue includes leads where nextFollowUpDate < now
  - **Done when**: Today includes leads where nextFollowUpDate is today
  - **Done when**: curl localhost:3000/api/v1/leads/follow-ups returns correct data

- [ ] T048 [US2] Write integration test for follow-ups endpoint in backend/tests/integration/followups.test.ts
  - **Done when**: Test creates leads with past, today, and future follow-up dates
  - **Done when**: Test verifies correct categorization (overdue, today, upcoming)
  - **Done when**: `pnpm test:integration` passes

### Frontend Tasks (US2)

- [ ] T049 [P] [US2] Create React Query hook useFollowUps in frontend/src/services/leadHooks.ts
  - **Done when**: useFollowUps() fetches /api/v1/leads/follow-ups
  - **Done when**: Data cached with refetch interval (5 minutes)

- [ ] T050 [P] [US2] Create FollowUpIndicator component in frontend/src/components/FollowUpIndicator.tsx
  - **Done when**: Shows "Due Today" badge for today's follow-ups
  - **Done when**: Shows "Overdue: X days" badge for overdue leads
  - **Done when**: Color-coded: green (upcoming), yellow (today), red (overdue)

- [ ] T051 [P] [US2] Create FocusView component in frontend/src/components/FocusView.tsx
  - **Done when**: Renders top 5-10 leads from useFollowUps()
  - **Done when**: Sorts by: overdue desc, estimatedValue desc, decision timeline asc
  - **Done when**: Each lead shows FollowUpIndicator

- [ ] T052 [US2] Add FocusView to Dashboard page
  - **Done when**: FocusView appears above lead list
  - **Done when**: Shows "Focus View: X leads require attention"
  - **Done when**: Click on lead in FocusView scrolls to lead in main list

- [ ] T053 [US2] Update LeadCard to display FollowUpIndicator
  - **Done when**: Each LeadCard shows follow-up status badge
  - **Done when**: Badge updates when follow-up date changes

- [ ] T054 [US2] Create ActivityLogForm component in frontend/src/components/ActivityLogForm.tsx
  - **Done when**: Form includes type (call, email, meeting, note), description, activityDate, nextFollowUpDate
  - **Done when**: Submission calls useLogActivity mutation
  - **Done when**: Auto-suggests next follow-up date based on stage

- [ ] T055 [US2] Add activity logging to LeadDetail page (create if not exists) in frontend/src/pages/LeadDetail.tsx
  - **Done when**: Page displays lead info and activity history
  - **Done when**: ActivityLogForm renders at bottom
  - **Done when**: Activity history shows all activities chronologically

### E2E Tests (US2)

- [ ] T056 [US2] Write Playwright test for follow-up reminders in frontend/tests/e2e/follow-ups.spec.ts
  - **Done when**: Test creates lead with follow-up date = yesterday
  - **Done when**: Test verifies overdue indicator appears on dashboard
  - **Done when**: `pnpm test:e2e` passes

- [ ] T057 [US2] Write Playwright test for activity logging in frontend/tests/e2e/activity-log.spec.ts
  - **Done when**: Test navigates to lead detail
  - **Done when**: Test fills activity form and submits
  - **Done when**: Test verifies activity appears in history
  - **Done when**: `pnpm test:e2e` passes

**Phase 4 Progress**: 0/13 tasks complete

---

## Phase 5: User Story 3 (P3) - Pipeline Visualization and Stage Management

**Goal**: Kanban board for visual pipeline management with drag-and-drop

**Independent Test**: Create leads in different stages, drag between columns, verify stage updates

**Phase Done Checklist**:
- [ ] Done: Kanban view shows columns for each stage - PipelineBoard renders all active stages
- [ ] Done: Leads appear as cards in correct stage column - Each lead displays in current stage column
- [ ] Done: Drag-and-drop updates lead stage - Playwright test `pipeline-drag.spec.ts` passes
- [ ] Done: Stage-specific prompts appear (e.g., Lost Reason modal) - StagePromptModal appears for CLOSED_LOST
- [ ] Done: Narrow-screen view adapts (vertical stack or horizontal scroll) - Pipeline works at 400px width

### Backend Tasks (US3)

- [ ] T058 [P] [US3] Add LostReason model and service in backend/src/models/lostReason.ts and backend/src/services/lostReasonService.ts
  - **Done when**: LostReasonService.create saves lost reason
  - **Done when**: LostReasonService.getByLeadId retrieves reason

- [ ] T059 [US3] Update PATCH /api/v1/leads/:id/stage to handle Closed-Won and Closed-Lost
  - **Done when**: Moving to CLOSED_WON marks lead as won
  - **Done when**: Moving to CLOSED_LOST requires lostReason in request body
  - **Done when**: Integration test verifies closed stages

### Frontend Tasks (US3)

- [ ] T060 [P] [US3] Install and configure @dnd-kit/core and @dnd-kit/sortable
  - **Done when**: Dependencies installed
  - **Done when**: DndContext wrapper setup in a test component

- [ ] T061 [P] [US3] Create PipelineColumn component in frontend/src/components/PipelineColumn.tsx
  - **Done when**: Column renders stage name as header
  - **Done when**: Column uses Droppable from @dnd-kit
  - **Done when**: Shows lead count and total value in header

- [ ] T062 [P] [US3] Create DraggableLeadCard component in frontend/src/components/DraggableLeadCard.tsx
  - **Done when**: Card uses Draggable from @dnd-kit
  - **Done when**: Card displays lead data (company name, contact, value, days in stage)
  - **Done when**: Drag handle visible and functional

- [ ] T063 [US3] Create PipelineBoard component in frontend/src/components/PipelineBoard.tsx
  - **Done when**: Renders PipelineColumn for each active stage (excludes CLOSED_WON, CLOSED_LOST)
  - **Done when**: onDragEnd updates lead stage via useUpdateLeadStage
  - **Done when**: Optimistic update moves card to new column immediately

- [ ] T064 [US3] Create StagePromptModal component in frontend/src/components/StagePromptModal.tsx
  - **Done when**: Modal appears when moving to Demo Scheduled (prompts for demo date)
  - **Done when**: Modal appears when moving to Closed-Lost (prompts for lost reason)
  - **Done when**: Modal submission includes additional data in stage update

- [ ] T065 [US3] Create Pipeline page in frontend/src/pages/Pipeline.tsx
  - **Done when**: Page renders PipelineBoard
  - **Done when**: DndContext wraps board
  - **Done when**: Keyboard navigation works (tab, arrow keys)

- [ ] T066 [US3] Implement narrow-screen responsive design for Pipeline
  - **Done when**: At <600px width, columns stack vertically
  - **Done when**: Alternative: horizontal scroll with snap points
  - **Done when**: Card readability maintained at 400px

- [ ] T067 [US3] Add Pipeline link to main navigation
  - **Done when**: Nav bar includes "Dashboard" and "Pipeline" links
  - **Done when**: Clicking Pipeline navigates to /pipeline route

### E2E Tests (US3)

- [ ] T068 [US3] Write Playwright test for drag-and-drop in frontend/tests/e2e/pipeline-drag.spec.ts
  - **Done when**: Test navigates to pipeline view
  - **Done when**: Test drags lead card from Inquiry to Qualification column
  - **Done when**: Test verifies card appears in new column
  - **Done when**: `pnpm test:e2e` passes

- [ ] T069 [US3] Write Playwright test for closed stages in frontend/tests/e2e/closed-stages.spec.ts
  - **Done when**: Test moves lead to Closed-Lost
  - **Done when**: Test fills lost reason modal
  - **Done when**: Test verifies lead removed from active pipeline
  - **Done when**: `pnpm test:e2e` passes

**Phase 5 Progress**: 0/12 tasks complete

---

## Phase 6: User Story 4 (P4) - Demo and Opportunity Tracking

**Goal**: Capture organization details and demo information for qualified opportunities

**Independent Test**: Convert Inquiry to Opportunity, enter org details, schedule demo, capture demo notes

**Phase Done Checklist**:
- [ ] Done: Organization details form captures industry, employee count, stakeholders, timeline - Playwright test `organization.spec.ts` passes
- [ ] Done: Demo details form captures date/time, user count, modules, cardlock volume - Playwright test `demo.spec.ts` passes
- [ ] Done: Lead detail view shows all captured information - OpportunitySummary displays all fields
- [ ] Done: Narrow-screen layout works for all forms - All forms functional at 400px width

### Backend Tasks (US4)

- [ ] T070 [P] [US4] Create OrganizationInfo service in backend/src/services/organizationService.ts
  - **Done when**: OrganizationService.upsert creates or updates organization info
  - **Done when**: OrganizationService.getByLeadId retrieves info

- [ ] T071 [P] [US4] Create DemoDetails service in backend/src/services/demoService.ts
  - **Done when**: DemoService.upsert creates or updates demo details
  - **Done when**: DemoService.getByLeadId retrieves details

- [ ] T072 [US4] Implement PUT /api/v1/leads/:id/organization endpoint
  - **Done when**: curl -X PUT localhost:3000/api/v1/leads/{id}/organization with org data succeeds
  - **Done when**: Response includes saved organization info

- [ ] T073 [US4] Implement PUT /api/v1/leads/:id/demo endpoint
  - **Done when**: curl -X PUT localhost:3000/api/v1/leads/{id}/demo with demo data succeeds
  - **Done when**: Response includes saved demo details

- [ ] T074 [US4] Write integration tests for organization and demo endpoints
  - **Done when**: Test creates organization info
  - **Done when**: Test updates organization info (upsert)
  - **Done when**: Test creates demo details
  - **Done when**: `pnpm test:integration` passes

### Frontend Tasks (US4)

- [ ] T075 [P] [US4] Create OrganizationForm component in frontend/src/components/OrganizationForm.tsx
  - **Done when**: Form includes industry, employeeCount, decisionTimeline, keyStakeholders (array)
  - **Done when**: Key stakeholders allows adding multiple entries (name, title, role)
  - **Done when**: Submission calls useUpdateOrganization mutation

- [ ] T076 [P] [US4] Create DemoForm component in frontend/src/components/DemoForm.tsx
  - **Done when**: Form includes demoDate, demoTime, meetingLink, userCountEstimate, requiredModules (multi-select), cardlockVolume, demoNotes
  - **Done when**: Submission calls useUpdateDemo mutation

- [ ] T077 [US4] Update LeadDetail page to include OrganizationForm and DemoForm
  - **Done when**: Page shows tabs: "Details", "Organization", "Demo", "Activities"
  - **Done when**: Organization tab renders OrganizationForm with existing data
  - **Done when**: Demo tab renders DemoForm with existing data

- [ ] T078 [US4] Create OpportunitySummary component in frontend/src/components/OpportunitySummary.tsx
  - **Done when**: Component displays all org and demo details in read-only view
  - **Done when**: Formatted for easy reference (bullet points, sections)

- [ ] T079 [US4] Add OpportunitySummary to LeadDetail page
  - **Done when**: Summary tab shows all captured information
  - **Done when**: "Copy to Clipboard" button copies formatted summary

- [ ] T079a [P] [US4] Create Proposal service in backend/src/services/proposalService.ts
  - **Done when**: ProposalService.upsert creates or updates proposal
  - **Done when**: ProposalService.getByLeadId retrieves proposal
  - **Done when**: Service tracks proposal status (DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED)

- [ ] T079b [US4] Implement PUT /api/v1/leads/:id/proposal endpoint
  - **Done when**: curl -X PUT localhost:3000/api/v1/leads/{id}/proposal with proposal data succeeds
  - **Done when**: Response includes saved proposal with estimatedValue and documentUrl
  - **Done when**: Integration test verifies proposal upsert

- [ ] T079c [P] [US4] Create ProposalForm component in frontend/src/components/ProposalForm.tsx
  - **Done when**: Form includes estimatedValue, documentUrl, validUntil, status, notes
  - **Done when**: Submission calls useUpdateProposal mutation
  - **Done when**: Form shows in LeadDetail "Proposal" tab

### E2E Tests (US4)

- [ ] T080 [US4] Write Playwright test for organization details in frontend/tests/e2e/organization.spec.ts
  - **Done when**: Test navigates to lead detail
  - **Done when**: Test fills organization form
  - **Done when**: Test verifies data saved (refresh page, data persists)
  - **Done when**: `pnpm test:e2e` passes

- [ ] T081 [US4] Write Playwright test for demo details in frontend/tests/e2e/demo.spec.ts
  - **Done when**: Test fills demo form
  - **Done when**: Test verifies demo details saved
  - **Done when**: `pnpm test:e2e` passes

**Phase 6 Progress**: 0/15 tasks complete

---

## Phase 7: User Story 5 (P5) - Reporting and Analytics

**Goal**: Generate reports for pipeline value, lead age, weekly activity, win/loss analysis

**Independent Test**: Create leads with varied data, generate each report type, export to CSV/PDF

**Phase Done Checklist**:
- [ ] Done: Pipeline Value report shows value by stage with conversion rates - Report endpoint returns correct aggregations
- [ ] Done: Lead Age report shows time in stage with stale indicators - Stale leads (>14 days) highlighted
- [ ] Done: Weekly Activity Summary shows counts of new leads, progressions, demos, deals - All counts accurate
- [ ] Done: Win/Loss Analysis shows win rate, avg deal size, lost reasons - Calculations verified with test data
- [ ] Done: Reports exportable as CSV and PDF - Playwright test `export.spec.ts` passes

### Backend Tasks (US5)

- [ ] T082 [P] [US5] Create ReportService in backend/src/services/reportService.ts
  - **Done when**: ReportService.pipelineValue aggregates by stage
  - **Done when**: ReportService.leadAge calculates days in stage
  - **Done when**: ReportService.weeklySummary counts activities
  - **Done when**: ReportService.winLossAnalysis calculates win rate and lost reasons

- [ ] T083 [US5] Implement GET /api/v1/reports/pipeline-value endpoint
  - **Done when**: curl localhost:3000/api/v1/reports/pipeline-value returns stages with counts and values
  - **Done when**: Includes conversion rates between stages

- [ ] T084 [US5] Implement GET /api/v1/reports/lead-age endpoint
  - **Done when**: curl localhost:3000/api/v1/reports/lead-age returns leads with daysInStage
  - **Done when**: Query param ?threshold=14 highlights stale leads

- [ ] T085 [US5] Implement GET /api/v1/reports/weekly-summary endpoint
  - **Done when**: Returns counts: newLeads, stageProgressions, demosScheduled, demosCompleted, proposalsSent, dealsWon, dealsLost

- [ ] T086 [US5] Implement GET /api/v1/reports/win-loss endpoint
  - **Done when**: Returns winRate, totalDeals, won, lost, averageDealSize, averageSalesCycle, lostReasons array

- [ ] T087 [US5] Write integration tests for report endpoints in backend/tests/integration/reports.test.ts
  - **Done when**: All 4 report endpoints tested
  - **Done when**: Tests verify correct calculations
  - **Done when**: `pnpm test:integration` passes

### Frontend Tasks (US5)

- [ ] T088 [P] [US5] Create Reports page in frontend/src/pages/Reports.tsx
  - **Done when**: Page includes tabs for each report type
  - **Done when**: Each tab fetches and displays corresponding report

- [ ] T089 [P] [US5] Install papaparse and jsPDF for export functionality
  - **Done when**: Dependencies installed
  - **Done when**: Sample CSV export works

- [ ] T090 [P] [US5] Create ReportExport component in frontend/src/components/ReportExport.tsx
  - **Done when**: Component has "Export CSV" and "Export PDF" buttons
  - **Done when**: CSV export uses papaparse to generate file
  - **Done when**: PDF export uses jsPDF with table plugin

- [ ] T091 [P] [US5] Create PipelineValueReport component in frontend/src/components/reports/PipelineValueReport.tsx
  - **Done when**: Displays table with stage, count, total value, conversion rate
  - **Done when**: Bar chart visualization (optional, basic table acceptable)

- [ ] T092 [P] [US5] Create LeadAgeReport component in frontend/src/components/reports/LeadAgeReport.tsx
  - **Done when**: Displays table sorted by daysInStage desc
  - **Done when**: Highlights stale leads (>14 days) in red

- [ ] T093 [P] [US5] Create WeeklySummaryReport component in frontend/src/components/reports/WeeklySummaryReport.tsx
  - **Done when**: Displays counts for all activity types
  - **Done when**: Shows date range of report

- [ ] T094 [P] [US5] Create WinLossReport component in frontend/src/components/reports/WinLossReport.tsx
  - **Done when**: Displays win rate percentage, avg deal size, avg cycle
  - **Done when**: Shows lost reasons table with counts

- [ ] T095 [US5] Integrate all report components into Reports page
  - **Done when**: Each report tab renders corresponding component
  - **Done when**: ReportExport available for each report

### E2E Tests (US5)

- [ ] T096 [US5] Write Playwright test for report generation in frontend/tests/e2e/reports.spec.ts
  - **Done when**: Test navigates to Reports page
  - **Done when**: Test switches between all 4 report tabs
  - **Done when**: Test verifies each report displays data
  - **Done when**: `pnpm test:e2e` passes

- [ ] T097 [US5] Write Playwright test for CSV export in frontend/tests/e2e/export.spec.ts
  - **Done when**: Test clicks "Export CSV" on a report
  - **Done when**: Test verifies download triggered
  - **Done when**: `pnpm test:e2e` passes

**Phase 7 Progress**: 0/16 tasks complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Error handling, loading states, accessibility, documentation, deployment prep

**Phase Done Checklist**:
- [ ] Done: All API errors display user-friendly messages - Error boundary catches errors, toasts show on failures
- [ ] Done: Loading spinners show during async operations - All mutations and queries show loading states
- [ ] Done: Keyboard navigation works throughout app - Tab order logical, Escape closes modals, Enter submits forms
- [ ] Done: README with setup instructions complete - README includes all quickstart steps
- [ ] Done: Production build succeeds - `pnpm build` completes for both frontend and backend

### Tasks

- [ ] T098 [P] Add global error boundary in frontend/src/components/ErrorBoundary.tsx
  - **Done when**: Component catches React errors and displays fallback UI
  - **Done when**: Error logged to console

- [ ] T099 [P] Add loading indicators to all async operations
  - **Done when**: All useQuery hooks show loading spinner when isLoading=true
  - **Done when**: All useMutation hooks disable submit buttons during mutation

- [ ] T100 [P] Implement toast notifications for success/error messages
  - **Done when**: Install react-hot-toast or similar library
  - **Done when**: Success toasts appear on create/update/delete operations
  - **Done when**: Error toasts appear on API failures

- [ ] T101 [P] Add form validation error messages to all forms
  - **Done when**: Required field errors display below each field
  - **Done when**: Email format errors display for invalid emails

- [ ] T102 [P] Ensure keyboard navigation works on all interactive elements
  - **Done when**: Tab order is logical on all pages
  - **Done when**: Escape key closes modals
  - **Done when**: Enter key submits forms

- [ ] T103 Add ARIA labels to all interactive elements
  - **Done when**: Screen reader testing passes on key pages (Dashboard, Pipeline, Reports)

- [ ] T104 Create README.md with setup instructions
  - **Done when**: README includes prerequisites, installation steps, running dev servers
  - **Done when**: README includes test commands
  - **Done when**: README references quickstart.md

- [ ] T105 Add environment variable documentation in .env.example
  - **Done when**: All required env vars documented with example values
  - **Done when**: .env.example committed to repo

- [ ] T106 Test production build for frontend
  - **Done when**: `cd frontend && pnpm build` succeeds
  - **Done when**: Build output in frontend/dist/ is deployable

- [ ] T107 Test production build for backend
  - **Done when**: `cd backend && pnpm build` succeeds
  - **Done when**: TypeScript compiles without errors

- [ ] T108 Run all tests in CI mode
  - **Done when**: `pnpm test:unit` passes in all workspaces
  - **Done when**: `pnpm test:integration` passes
  - **Done when**: `pnpm test:e2e` passes in headless mode

- [ ] T109 Create deployment documentation in docs/deployment.md
  - **Done when**: Document includes database setup, env vars, build steps
  - **Done when**: Document includes hosting options (Vercel, Railway, etc.)

**Phase 8 Progress**: 0/12 tasks complete

---

## Dependencies and Execution Order

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational)
                      ↓
                  Phase 3 (US1: P1) ← MVP
                      ↓
              ┌───────┴───────┐
              ↓               ↓
      Phase 4 (US2: P2)   Phase 5 (US3: P3)
              ↓               ↓
              └───────┬───────┘
                      ↓
              Phase 6 (US4: P4)
                      ↓
              Phase 7 (US5: P5)
                      ↓
              Phase 8 (Polish)
```

**Notes**:
- US1 (P1) is the MVP - fully functional standalone
- US2 and US3 can be developed in parallel after US1
- US4 and US5 depend on earlier stories but can parallelize some tasks
- Polish phase runs after all user stories complete

### Within-Phase Parallelization

Each phase has tasks marked [P] for parallel execution:

**Example: Phase 3 (US1) Parallelization**:
- Backend tasks (T022-T029) can run in parallel with Frontend tasks (T030-T040)
- E2E tests (T041-T044) must wait for both backend and frontend completion
- Within backend: Models (T022) can run parallel with Activity model (T024)
- Within frontend: Components (T032-T035) can all be built in parallel

---

## Task Summary

**Total Tasks**: 114
**By Phase**:
- Phase 1 (Setup): 10 tasks
- Phase 2 (Foundational): 11 tasks
- Phase 3 (US1 - P1 MVP): 25 tasks
- Phase 4 (US2 - P2): 13 tasks
- Phase 5 (US3 - P3): 12 tasks
- Phase 6 (US4 - P4): 15 tasks
- Phase 7 (US5 - P5): 16 tasks
- Phase 8 (Polish): 12 tasks

**Parallelizable Tasks**: 51 tasks marked with [P]

---

## MVP Recommendation

**Suggested MVP**: Complete through Phase 3 (User Story 1)
- **Total Tasks**: 46 tasks (Phases 1, 2, 3)
- **Estimated Timeline**: 1-2 weeks
- **Value Delivered**: Core lead tracking, search, stage management
- **Independent Test**: Manually enter lead, search, update stage
- **Deploy Decision Point**: Validate core value proposition before continuing

---

## Verification Protocol (Per Constitution)

### After Each Task Completion:

1. Review all done statements for the task
2. Execute verification commands listed in done statements
3. Confirm all done statements are TRUE
4. Report: "Task TXX complete: M/N tasks complete for Phase Y"

**Example**:
```
Task T025 Complete: "Implement POST /api/v1/leads endpoint"
✓ Done: curl -X POST localhost:3000/api/v1/leads with valid payload returns 201
✓ Done: Response includes created lead with id, currentStage=INQUIRY

Progress: 4/23 tasks complete for Phase 3 (US1 - Quick Lead Entry)
```

### After Each Phase Completion:

1. Review all phase-level done statements
2. Verify each phase done statement is TRUE
3. List ALL task done statements from the phase
4. Confirm cumulative completion (X/X tasks complete)

**Example**:
```
Phase 3 Complete: "User Story 1 (P1) - Quick Lead Entry and Tracking"

Phase Done Statements:
✓ Done: Quick-entry form creates new leads in Inquiry stage
✓ Done: Lead list displays all leads with stage, contact info, last activity
✓ Done: Search filters leads by company/contact name within 1 second
✓ Done: Stage dropdown updates lead stage (including to Opportunity)
✓ Done: Narrow-screen layout (400-600px) works without horizontal scroll

All Tasks from Phase 3:
✓ T022: Lead model types - Verified exports and Prisma types
✓ T023: LeadService - Verified validation, search, stage updates
...
✓ T044: Narrow-layout E2E test - Verified 400px viewport functionality

Phase Summary: 23/23 tasks complete
```

---

## Getting Started

1. **Create worktree**: `git worktree add worktrees/001-leadoff-crm 001-leadoff-crm`
2. **Navigate**: `cd worktrees/001-leadoff-crm`
3. **Start with Phase 1**: Begin with T001
4. **Follow done statements**: Verify each before marking complete
5. **Report progress**: After each task, update phase progress counter

---

**Ready to begin implementation!** Start with Task T001.
