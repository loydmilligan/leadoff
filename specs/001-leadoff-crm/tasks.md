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
- [X] Done: Project directories created per plan.md structure (backend/, frontend/, shared/)
- [X] Done: All dependencies installed (frontend and backend) - `pnpm install` succeeds
- [X] Done: Development servers start successfully - `pnpm dev` runs both frontend and backend
- [X] Done: TypeScript compilation succeeds - `pnpm typecheck` exits 0 in both workspaces

### Tasks

- [X] T001 Create git worktree for feature branch at worktrees/001-leadoff-crm
  - **Done when**: The feature branch is isolated in a dedicated worktree, enabling parallel development without disrupting the main repository, and the worktree location is documented and verifiable
  - **Verification**: `git worktree list` shows worktrees/001-leadoff-crm with branch 001-leadoff-crm

- [X] T002 Initialize project root structure (backend/, frontend/, shared/)
  - **Done when**: The project structure matches the architecture documented in plan.md, making it immediately clear to any developer where to add backend, frontend, or shared code
  - **Verification**: Directories backend/, frontend/, shared/ exist and align with plan.md structure

- [X] T003 [P] Initialize backend Node.js project in backend/
  - **Done when**: The backend workspace is ready for API development with all required dependencies (Fastify, Prisma, Zod, etc.) installed, configured, and verified to work together
  - **Verification**: backend/package.json exists and `pnpm install` completes successfully with all dependencies resolved
  - **Dependencies**: @fastify/cors, fastify, prisma, @prisma/client, zod, date-fns
  - **DevDependencies**: @types/node, typescript, tsx, vitest, supertest

- [X] T004 [P] Initialize frontend React project in frontend/
  - **Done when**: The frontend workspace is ready for UI development with all dependencies installed, the development server accessible in a browser, and hot-reload functioning for rapid iteration
  - **Verification**: `pnpm dev` starts Vite on port 5173, application loads in browser, and changes trigger immediate rebuild
  - **Dependencies**: react, react-dom, @tanstack/react-query, @dnd-kit/core, @dnd-kit/sortable, react-hook-form, zod, date-fns
  - **DevDependencies**: @types/react, @vitejs/plugin-react, typescript, vite, tailwindcss, vitest, @playwright/test

- [X] T005 [P] Create shared types package in shared/types/
  - **Done when**: Shared types are available to both frontend and backend workspaces, ensuring type consistency across the application and preventing data structure mismatches between layers
  - **Verification**: shared/types exports Stage, LeadSource, and other enums, importable from both workspaces via @leadoff/types

- [X] T006 Configure TypeScript for backend in backend/tsconfig.json
  - **Done when**: Backend TypeScript is configured with strict type checking to catch errors early, path aliases are set up for clean imports, and all code compiles without errors
  - **Verification**: backend/tsconfig.json has strict: true and `pnpm typecheck` exits 0

- [X] T007 Configure TypeScript for frontend in frontend/tsconfig.json
  - **Done when**: Frontend TypeScript is configured with path aliases (@/* for clean imports), React JSX support, and strict checking, ensuring type safety throughout the UI layer
  - **Verification**: frontend/tsconfig.json configured correctly and `pnpm typecheck` exits 0

- [X] T008 [P] Configure Tailwind CSS in frontend/
  - **Done when**: Tailwind CSS is fully integrated with custom narrow-screen layout support (400-600px), enabling rapid UI development that meets the EDIprod side-by-side display requirement
  - **Verification**: tailwind.config.js includes narrow-screen breakpoints, utility classes render in browser, and custom components use Tailwind

- [X] T009 Configure ESLint and Prettier for both frontend and backend
  - **Done when**: Code quality tools are configured and working across all workspaces, ensuring consistent code style, catching common errors automatically, and formatting code uniformly
  - **Verification**: ESLint and Prettier configs exist, `pnpm lint` passes, and `pnpm format` produces consistent output

- [X] T010 Set up root package.json and pnpm workspace configuration
  - **Done when**: The monorepo workspace is fully configured, allowing developers to install all dependencies with a single command, run all development servers concurrently, and execute commands across workspaces efficiently
  - **Verification**: pnpm-workspace.yaml and root package.json configured, `pnpm install` succeeds, and `pnpm dev` starts both servers

**Phase 1 Progress**: 10/10 tasks complete ✓

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
  - **Done when**: Database schema is fully defined with all 7 models (Lead, Activity, OrganizationInfo, DemoDetails, Proposal, LostReason, StageHistory), complete enums for stage tracking and metadata, and performance indexes per data-model.md ensuring query efficiency
  - **Verification**: schema.prisma contains all models with relations, enums, and indexes; no validation errors in file

- [ ] T012 Run initial Prisma migration
  - **Done when**: Initial migration succeeds, SQLite database is ready for API development, and Prisma Studio is accessible for visual data inspection and debugging
  - **Verification**: `cd backend && pnpm prisma migrate dev --name init` exits 0; backend/data/leadoff.db exists; `pnpm prisma studio` opens at localhost:5555

- [ ] T013 Generate Prisma Client types
  - **Done when**: Prisma Client types are generated and available for import in backend code, enabling type-safe database queries without manual type definitions
  - **Verification**: `pnpm prisma generate` exits 0; @prisma/client types importable and contain all models

- [ ] T014 [P] Create shared TypeScript types in shared/types/
  - **Done when**: Shared types are centralized and available to both frontend and backend, ensuring type consistency across layers and preventing API response/request mismatches
  - **Verification**: shared/types/lead.ts, shared/types/enums.ts, and shared/types/api.ts exist and are importable from both workspaces via @leadoff/types

- [ ] T015 Set up Fastify server in backend/src/server.ts
  - **Done when**: API server starts successfully on port 3000 and responds to health checks, signaling the backend is ready for endpoint development and integration testing
  - **Verification**: `pnpm dev:backend` starts Fastify; GET /health returns 200 OK with valid JSON response

- [ ] T016 Configure CORS for frontend origin in backend/src/server.ts
  - **Done when**: CORS is configured for frontend requests (http://localhost:5173), enabling secure cross-origin communication during development without browser blocking
  - **Verification**: OPTIONS preflight requests from frontend to backend succeed; wildcard or specific origin configured in Fastify CORS plugin

- [ ] T017 [P] Set up Vitest for backend unit tests in backend/tests/
  - **Done when**: Backend test infrastructure is ready for isolated unit testing of services and utilities, enabling fast verification of business logic before integration testing
  - **Verification**: backend/vitest.config.ts configured; `cd backend && pnpm test:unit` runs and sample test passes

- [ ] T018 [P] Set up Supertest for backend integration tests in backend/tests/integration/
  - **Done when**: Integration test framework is configured to test complete request/response cycles with real database, validating API contracts before frontend integration
  - **Verification**: backend/tests/integration/health.test.ts exists; `cd backend && pnpm test:integration` passes health check test

- [ ] T019 [P] Set up Vitest for frontend unit tests in frontend/tests/unit/
  - **Done when**: Frontend test infrastructure is ready for component unit testing in jsdom environment, enabling verification of component behavior in isolation
  - **Verification**: frontend/vitest.config.ts configured with jsdom; `cd frontend && pnpm test:unit` runs and sample component test passes

- [ ] T020 [P] Set up Playwright for E2E tests in frontend/tests/e2e/
  - **Done when**: End-to-end test infrastructure is ready with browsers installed, enabling full user journey validation from frontend to backend to database
  - **Verification**: playwright.config.ts configured; `pnpm exec playwright install` succeeds; sample E2E test runs and passes

- [ ] T021 Create database seed script in backend/prisma/seed.ts
  - **Done when**: Database seed script populates realistic test data (20-30 leads across all stages), enabling manual testing and E2E tests without manual data entry
  - **Verification**: seed.ts creates Lead, Activity, and Stage records; `pnpm prisma db seed` succeeds; Prisma Studio displays seed data

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
  - **Done when**: Lead data access layer is abstraction-ready with type-safe CRUD methods, providing a clean interface that services depend on for consistent database operations
  - **Verification**: LeadModel class exports create, findAll, findById, update, delete methods; all use Prisma Client with proper TypeScript types

- [ ] T023 [P] [US1] Create LeadService in backend/src/services/leadService.ts
  - **Done when**: Business logic layer validates and processes lead operations (creation, retrieval, search, stage transitions) with type safety and audit trail tracking (StageHistory)
  - **Verification**: Services include input validation via Zod, pagination support, full-text search, stage transition handling; `pnpm test:unit` passes for LeadService tests

- [ ] T024 [P] [US1] Create Activity model and service in backend/src/models/activity.ts and backend/src/services/activityService.ts
  - **Done when**: Activity tracking layer logs all lead interactions and events, providing searchable history needed for follow-up context and sales pipeline analytics
  - **Verification**: ActivityService.logActivity creates records; ActivityService.getActivitiesByLead retrieves complete lead history with timestamps

- [ ] T025 [US1] Implement POST /api/v1/leads endpoint in backend/src/api/routes/leads.ts
  - **Done when**: API endpoint creates new leads with automatic Inquiry stage assignment, returning 201 Created with complete lead object, enabling frontend lead creation
  - **Verification**: `curl -X POST http://localhost:3000/api/v1/leads` with valid JSON body returns 201; response includes id and currentStage=INQUIRY

- [ ] T026 [US1] Implement GET /api/v1/leads endpoint with pagination and search
  - **Done when**: API endpoint retrieves leads with pagination and filtering support, enabling dashboard to display leads efficiently at scale and support live search
  - **Verification**: GET /api/v1/leads returns paginated list; ?page=1&limit=20 works; ?search=acme filters by company name; ?stage=INQUIRY filters by stage

- [ ] T027 [US1] Implement GET /api/v1/leads/:id endpoint
  - **Done when**: Single lead retrieval endpoint includes complete lead record with full activity history, supporting lead detail view and history inspection
  - **Verification**: GET /api/v1/leads/{id} returns lead object with activities array populated; 404 when lead not found

- [ ] T028 [US1] Implement PATCH /api/v1/leads/:id/stage endpoint
  - **Done when**: Stage transition endpoint updates lead stage with audit trail (StageHistory) recording who changed what when, supporting pipeline management and deal progression tracking
  - **Verification**: PATCH /api/v1/leads/{id}/stage with valid JSON body updates stage; StageHistory record created; response includes updated lead

- [ ] T029 [US1] Write integration tests for Lead endpoints in backend/tests/integration/leads.test.ts
  - **Done when**: API contract is fully verified with comprehensive tests covering all CRUD operations, search, pagination, and stage transitions, providing confidence for frontend integration
  - **Verification**: `pnpm test:integration` passes all lead tests; coverage includes create, read, update, delete, search, pagination, stage updates with StageHistory

- [ ] T029a [P] [US1] Implement duplicate detection in backend/src/services/duplicateDetection.ts
  - **Done when**: Duplicate detection prevents lead data fragmentation by identifying exact email matches and similar company+name combinations (>80% similarity), protecting data quality
  - **Verification**: Service implements email exact match and name fuzzy matching; POST /api/v1/leads returns 409 Conflict with existing lead info on duplicate; integration test verifies both match types

- [ ] T029b [P] [US1] Add stage validation middleware in backend/src/utils/stageValidator.ts
  - **Done when**: Validation middleware prevents invalid stage transitions by enforcing required fields per stage while allowing overrides with force flag, maintaining data consistency
  - **Verification**: Middleware rejects stage transitions with missing required fields; returns 400 with field list; force flag allows override and logs to StageHistory; unit tests cover all stages

### Frontend Tasks (US1)

- [ ] T030 [P] [US1] Create API client in frontend/src/services/api.ts
  - **Done when**: Centralized API client provides consistent request/response handling and error management across frontend, reducing duplication and enabling global error handling
  - **Verification**: Axios instance configured with http://localhost:3000/api/v1 base URL; request/response interceptors handle errors; request timeout configured

- [ ] T031 [P] [US1] Create React Query hooks in frontend/src/services/leadHooks.ts
  - **Done when**: React Query hooks manage server state caching and synchronization, enabling real-time UI updates, offline handling, and automatic request deduplication
  - **Verification**: useLeads() fetches paginated leads; useCreateLead() mutation creates; useUpdateLeadStage() updates; useSearchLeads() debounces at 300ms

- [ ] T032 [P] [US1] Create LeadForm component in frontend/src/components/LeadForm.tsx
  - **Done when**: Lead entry form validates all inputs with error messaging, enabling users to create leads quickly with data validation before backend submission
  - **Verification**: Form includes companyName, contactName, phone, email, contactTitle fields; React Hook Form validates; Zod schema validates email; submission calls useCreateLead

- [ ] T033 [P] [US1] Create LeadCard component in frontend/src/components/LeadCard.tsx
  - **Done when**: Lead display card renders essential information with visual stage indicators, providing quick reference for lead status and contact details
  - **Verification**: Component displays company, contact name, stage, phone, email; stage shown as color-coded badge; last activity date shown if available

- [ ] T034 [P] [US1] Create SearchBar component in frontend/src/components/SearchBar.tsx
  - **Done when**: Debounced search component enables efficient lead filtering without excessive API calls, providing responsive search experience
  - **Verification**: Input field debounces at 300ms; search triggered on value change; empty state shows "No results" message

- [ ] T035 [P] [US1] Create StageSelect component in frontend/src/components/StageSelect.tsx
  - **Done when**: Stage dropdown with optimistic updates provides instant visual feedback on stage changes while API request completes, improving perceived responsiveness
  - **Verification**: Dropdown includes all stages; onChange triggers useUpdateLeadStage; UI updates immediately; correct stage persists after server confirmation

- [ ] T036 [US1] Create Dashboard page in frontend/src/pages/Dashboard.tsx
  - **Done when**: Dashboard integrates lead entry, search, and list views in one location, enabling rapid lead creation and pipeline review without navigation
  - **Verification**: Page renders LeadForm, SearchBar, and lead list; pagination controls work; each lead shown as LeadCard with data from useLeads()

- [ ] T037 [US1] Implement narrow-screen layout in frontend/src/layouts/NarrowScreenLayout.tsx
  - **Done when**: Responsive layout supports EDIprod side-by-side requirement (400-600px) with no horizontal scrolling, enabling use on compact displays
  - **Verification**: Tailwind classes configure 400-600px width; form fields stack vertically; 400px DevTools test shows no horizontal scroll and all content visible

- [ ] T038 [US1] Apply NarrowScreenLayout to Dashboard
  - **Done when**: Dashboard is fully functional in narrow viewport, meeting the business requirement for use on side-by-side displays
  - **Verification**: Dashboard wrapped in NarrowScreenLayout; all components render within bounds; manual testing at 400px, 500px, 600px confirms readability

- [ ] T039 [US1] Write unit tests for LeadForm component in frontend/tests/unit/LeadForm.test.tsx
  - **Done when**: Component tests verify validation logic and form behavior in isolation, catching regressions before E2E testing
  - **Verification**: Tests validate required field errors; test email format validation; test form submission; `pnpm test:unit` passes

- [ ] T040 [US1] Write unit tests for LeadCard component
  - **Done when**: Component tests verify correct rendering of lead data and styling, ensuring visual consistency across lead displays
  - **Verification**: Tests render lead correctly; verify stage badge displays; `pnpm test:unit` passes

### E2E Tests (US1)

- [ ] T041 [US1] Write Playwright test for lead creation in frontend/tests/e2e/lead-creation.spec.ts
  - **Done when**: End-to-end test validates complete lead creation flow from form submission through list display, verifying user story 1 core functionality
  - **Verification**: Test navigates to dashboard; fills form with valid data; submits; verifies lead appears in list with correct data; `pnpm test:e2e` passes

- [ ] T042 [US1] Write Playwright test for lead search in frontend/tests/e2e/lead-search.spec.ts
  - **Done when**: Search test validates filter functionality works end-to-end from UI input through API to list updates, meeting the "search within 1 second" requirement
  - **Verification**: Test enters search term; verifies filtered results appear; verifies no unrelated leads shown; `pnpm test:e2e` passes

- [ ] T043 [US1] Write Playwright test for stage update in frontend/tests/e2e/stage-update.spec.ts
  - **Done when**: Stage update test validates drag-free stage changes work end-to-end, verifying pipeline progression without Kanban drag-drop
  - **Verification**: Test selects new stage from dropdown; verifies UI updates immediately; verifies data persists on refresh; `pnpm test:e2e` passes

- [ ] T044 [US1] Write Playwright test for narrow-screen layout in frontend/tests/e2e/narrow-layout.spec.ts
  - **Done when**: Responsive design test validates all functionality works at 400px width, confirming EDIprod side-by-side display support
  - **Verification**: Test sets viewport to 400px; verifies no horizontal scroll; verifies form submission works; verifies leads display correctly; `pnpm test:e2e` passes

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
  - **Done when**: Follow-up date calculator encodes stage-specific timing rules (Inquiry +24h, Qualification +48h, etc.), enabling consistent follow-up prompting across the system
  - **Verification**: calculateNextFollowUp(stage) returns correct dates for all stages; unit tests verify calculations; function exported and testable

- [ ] T046 [P] [US2] Update LeadService.createLead to auto-set nextFollowUpDate
  - **Done when**: New leads automatically receive calculated follow-up dates, ensuring no lead goes without a scheduled follow-up action
  - **Verification**: New leads auto-set nextFollowUpDate to now + 24 hours; integration test verifies field populated; stored in database correctly

- [ ] T047 [P] [US2] Implement GET /api/v1/leads/follow-ups endpoint in backend/src/api/routes/leads.ts
  - **Done when**: Follow-ups endpoint categorizes leads by urgency (overdue, today, upcoming), enabling focus on high-priority follow-ups
  - **Verification**: GET /api/v1/leads/follow-ups returns { overdue, today, upcoming } arrays; overdue includes nextFollowUpDate < now; today includes date = today; curl returns valid JSON

- [ ] T048 [US2] Write integration test for follow-ups endpoint in backend/tests/integration/followups.test.ts
  - **Done when**: Integration tests validate follow-up categorization logic end-to-end, ensuring focus view displays correct leads
  - **Verification**: Tests create leads with past/today/future dates; verify correct categorization; `pnpm test:integration` passes all follow-up tests

### Frontend Tasks (US2)

- [ ] T049 [P] [US2] Create React Query hook useFollowUps in frontend/src/services/leadHooks.ts
  - **Done when**: Follow-ups hook caches categorized leads with periodic refresh, enabling dashboard to show current urgent items without constant API calls
  - **Verification**: useFollowUps() fetches /api/v1/leads/follow-ups; data cached with 5-minute refetch interval; returns typed data

- [ ] T050 [P] [US2] Create FollowUpIndicator component in frontend/src/components/FollowUpIndicator.tsx
  - **Done when**: Visual follow-up badges provide at-a-glance status signaling whether action is needed (color-coded red/yellow/green), reducing cognitive load
  - **Verification**: Component shows "Due Today" for today; "Overdue: X days" for overdue; color-coded per status; renders correctly in unit tests

- [ ] T051 [P] [US2] Create FocusView component in frontend/src/components/FocusView.tsx
  - **Done when**: FocusView prioritizes top 5-10 most urgent leads (overdue, high value, tight timeline), focusing sales team on highest-impact activities
  - **Verification**: Component renders top 5-10 leads; sorts by overdue desc, value desc, timeline asc; displays FollowUpIndicator per lead

- [ ] T052 [US2] Add FocusView to Dashboard page
  - **Done when**: Focus section appears above main lead list, drawing attention to urgent follow-ups before general lead browsing
  - **Verification**: FocusView appears above lead list; shows count of leads requiring attention; clicking lead scrolls to main list entry

- [ ] T053 [US2] Update LeadCard to display FollowUpIndicator
  - **Done when**: All lead cards display follow-up status, enabling quick assessment of who needs follow-up within the main list
  - **Verification**: LeadCard includes FollowUpIndicator; badge updates when follow-up date changes; correctly shows all follow-up statuses

- [ ] T054 [US2] Create ActivityLogForm component in frontend/src/components/ActivityLogForm.tsx
  - **Done when**: Activity logging form captures interaction type and updates follow-up date, creating audit trail and ensuring continuous follow-up scheduling
  - **Verification**: Form includes type/description/date/nextFollowUpDate fields; submission calls useLogActivity; auto-suggests next date based on stage

- [ ] T055 [US2] Add activity logging to LeadDetail page (create if not exists) in frontend/src/pages/LeadDetail.tsx
  - **Done when**: Lead detail page displays complete lead context with activity history and logging capability, enabling informed follow-up decisions
  - **Verification**: Page displays lead info and chronological activity history; ActivityLogForm at bottom; new activities appear in history

### E2E Tests (US2)

- [ ] T056 [US2] Write Playwright test for follow-up reminders in frontend/tests/e2e/follow-ups.spec.ts
  - **Done when**: End-to-end test validates focus view correctly identifies and displays overdue leads, confirming follow-up reminder functionality
  - **Verification**: Test creates lead with yesterday follow-up date; verifies overdue indicator on dashboard; test passes in headless mode

- [ ] T057 [US2] Write Playwright test for activity logging in frontend/tests/e2e/activity-log.spec.ts
  - **Done when**: Activity logging E2E test validates complete flow from form submission through history display, verifying audit trail functionality
  - **Verification**: Test navigates to lead detail; fills activity form; submits; verifies activity appears in history with correct details; `pnpm test:e2e` passes

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
  - **Done when**: Lost reason data layer stores detailed closure information, enabling post-mortem analysis and sales coaching on why deals were lost
  - **Verification**: LostReasonService.create saves reason; LostReasonService.getByLeadId retrieves; service tested with unit and integration tests

- [ ] T059 [US3] Update PATCH /api/v1/leads/:id/stage to handle Closed-Won and Closed-Lost
  - **Done when**: Closed stage transitions capture won/lost outcomes with required metadata (lost reason), ensuring complete deal lifecycle tracking
  - **Verification**: Moving to CLOSED_WON succeeds; moving to CLOSED_LOST requires lostReason; integration test verifies both transitions; StageHistory records reason

### Frontend Tasks (US3)

- [ ] T060 [P] [US3] Install and configure @dnd-kit/core and @dnd-kit/sortable
  - **Done when**: Drag-and-drop dependencies are installed and DndContext provider is ready, enabling visual pipeline reordering
  - **Verification**: Dependencies installed in frontend/package.json; DndContext wrapper works in test component; no console errors

- [ ] T061 [P] [US3] Create PipelineColumn component in frontend/src/components/PipelineColumn.tsx
  - **Done when**: Pipeline columns display stage with lead count and total value, providing visual pipeline overview at a glance
  - **Verification**: Component renders stage name header; uses @dnd-kit Droppable; displays lead count and value sum; styled with Tailwind

- [ ] T062 [P] [US3] Create DraggableLeadCard component in frontend/src/components/DraggableLeadCard.tsx
  - **Done when**: Draggable card displays lead context (company, contact, estimated value, days in stage) with visual drag handle
  - **Verification**: Card uses @dnd-kit Draggable; displays all context info; drag handle visible; unit test verifies rendering

- [ ] T063 [US3] Create PipelineBoard component in frontend/src/components/PipelineBoard.tsx
  - **Done when**: Kanban board displays all active stages with leads, enabling visual pipeline management with instant drag-drop updates
  - **Verification**: Renders PipelineColumn per stage; onDragEnd triggers useUpdateLeadStage; optimistic update immediate; card moves to new column

- [ ] T064 [US3] Create StagePromptModal component in frontend/src/components/StagePromptModal.tsx
  - **Done when**: Stage-specific modals capture required metadata (demo date for Demo Scheduled, lost reason for Closed-Lost) ensuring data completeness
  - **Verification**: Modal appears when transitioning to Demo Scheduled; prompts for demo date; modal for Closed-Lost prompts for lost reason; data included in update

- [ ] T065 [US3] Create Pipeline page in frontend/src/pages/Pipeline.tsx
  - **Done when**: Pipeline page displays Kanban board with full keyboard navigation support, enabling accessibility for all users
  - **Verification**: Page renders PipelineBoard; DndContext wraps board; tab/arrow key navigation works; Escape cancels drag

- [ ] T066 [US3] Implement narrow-screen responsive design for Pipeline
  - **Done when**: Pipeline adapts to narrow viewport (400-600px) through vertical stacking or horizontal scroll, maintaining EDIprod side-by-side support
  - **Verification**: At <600px width, columns stack vertically or scroll horizontally; card readability at 400px; DevTools test confirms layout

- [ ] T067 [US3] Add Pipeline link to main navigation
  - **Done when**: Navigation menu includes links to Dashboard and Pipeline, enabling easy switching between views
  - **Verification**: Nav bar renders both links; clicking Pipeline navigates to /pipeline route; active link highlighted

### E2E Tests (US3)

- [ ] T068 [US3] Write Playwright test for drag-and-drop in frontend/tests/e2e/pipeline-drag.spec.ts
  - **Done when**: End-to-end test validates drag-and-drop updates lead stage in real-time, verifying Kanban pipeline functionality
  - **Verification**: Test navigates to pipeline; drags lead from Inquiry to Qualification; verifies card appears in new column; verifies database persisted; `pnpm test:e2e` passes

- [ ] T069 [US3] Write Playwright test for closed stages in frontend/tests/e2e/closed-stages.spec.ts
  - **Done when**: Closed stage E2E test validates complete deal closure flow including metadata capture and removal from active pipeline
  - **Verification**: Test moves lead to Closed-Lost; fills lost reason modal; verifies lead removed from active columns; verifies data persisted; `pnpm test:e2e` passes

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
  - **Done when**: Organization service stores prospect company context (industry, size, decision timeline, stakeholders), enabling informed sales strategy and objection handling
  - **Verification**: OrganizationService.upsert creates/updates org info with validation; OrganizationService.getByLeadId retrieves complete org record; tested with unit and integration tests

- [ ] T071 [P] [US4] Create DemoDetails service in backend/src/services/demoService.ts
  - **Done when**: Demo service captures engagement details (date, participants, modules, requirements), enabling demo preparation and follow-up tracking
  - **Verification**: DemoService.upsert creates/updates demo details; DemoService.getByLeadId retrieves record; service tested end-to-end

- [ ] T072 [US4] Implement PUT /api/v1/leads/:id/organization endpoint
  - **Done when**: Organization endpoint persists company context to database, enabling lead detail view to display qualified opportunity context
  - **Verification**: PUT /api/v1/leads/{id}/organization with valid JSON succeeds; response includes saved org data; data persists in database

- [ ] T073 [US4] Implement PUT /api/v1/leads/:id/demo endpoint
  - **Done when**: Demo endpoint persists demo scheduling and details, enabling sales team to manage engagement logistics
  - **Verification**: PUT /api/v1/leads/{id}/demo with valid JSON succeeds; response includes saved demo data; database persists correctly

- [ ] T074 [US4] Write integration tests for organization and demo endpoints
  - **Done when**: Integration tests validate complete org and demo workflows (create, read, update), ensuring data integrity across API calls
  - **Verification**: Tests create org info with upsert pattern; tests create demo details; tests verify data persistence; `pnpm test:integration` passes

### Frontend Tasks (US4)

- [ ] T075 [P] [US4] Create OrganizationForm component in frontend/src/components/OrganizationForm.tsx
  - **Done when**: Organization form captures prospect company details and stakeholder contacts, enabling discovery of decision-makers and timeline
  - **Verification**: Form includes industry, employeeCount, decisionTimeline, keyStakeholders; supports multiple stakeholders (name/title/role); submission calls useUpdateOrganization

- [ ] T076 [P] [US4] Create DemoForm component in frontend/src/components/DemoForm.tsx
  - **Done when**: Demo form captures scheduling and configuration details, enabling sales team to prepare and track engagement logistics
  - **Verification**: Form includes demoDate, demoTime, meetingLink, userCountEstimate, requiredModules, cardlockVolume, demoNotes; submission calls useUpdateDemo

- [ ] T077 [US4] Update LeadDetail page to include OrganizationForm and DemoForm
  - **Done when**: Lead detail page organizes qualified opportunity information in tabs, providing context view for sales team decision-making
  - **Verification**: Page shows tabs: "Details", "Organization", "Demo", "Activities"; org and demo tabs render forms with existing data pre-populated

- [ ] T078 [US4] Create OpportunitySummary component in frontend/src/components/OpportunitySummary.tsx
  - **Done when**: Summary view displays all captured opportunity data in read-only format, enabling quick reference and sharing without editing
  - **Verification**: Component displays org and demo data in formatted sections; bullet points organize info; styled for easy reading

- [ ] T079 [US4] Add OpportunitySummary to LeadDetail page
  - **Done when**: Summary tab provides one-page view of complete opportunity for sharing with stakeholders
  - **Verification**: Summary tab displays all info; "Copy to Clipboard" button copies formatted summary; shared format includes all fields

- [ ] T079a [P] [US4] Create Proposal service in backend/src/services/proposalService.ts
  - **Done when**: Proposal service tracks proposal lifecycle (draft to expired), enabling sales team to manage quote status and expiration
  - **Verification**: ProposalService.upsert creates/updates proposal; tracks status (DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED); getByLeadId retrieves record

- [ ] T079b [US4] Implement PUT /api/v1/leads/:id/proposal endpoint
  - **Done when**: Proposal endpoint persists deal value and quote document, enabling pipeline value tracking and proposal management
  - **Verification**: PUT /api/v1/leads/{id}/proposal with valid JSON succeeds; response includes savedproposal with estimatedValue and documentUrl; data persists

- [ ] T079c [P] [US4] Create ProposalForm component in frontend/src/components/ProposalForm.tsx
  - **Done when**: Proposal form captures deal value and quote document, enabling sales team to track proposal status and deal economics
  - **Verification**: Form includes estimatedValue, documentUrl, validUntil, status, notes fields; submission calls useUpdateProposal; form displays in LeadDetail "Proposal" tab

### E2E Tests (US4)

- [ ] T080 [US4] Write Playwright test for organization details in frontend/tests/e2e/organization.spec.ts
  - **Done when**: End-to-end test validates organization details flow (entry, persistence, display), confirming company context capture
  - **Verification**: Test navigates to lead detail; fills organization form with data; submits; refreshes page; verifies data persists; `pnpm test:e2e` passes

- [ ] T081 [US4] Write Playwright test for demo details in frontend/tests/e2e/demo.spec.ts
  - **Done when**: Demo E2E test validates complete demo scheduling flow, confirming engagement logistics capture and persistence
  - **Verification**: Test fills demo form with date/time/modules; submits; refreshes page; verifies persistence; `pnpm test:e2e` passes

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
  - **Done when**: Report service aggregates lead and activity data into actionable business metrics, enabling data-driven sales pipeline management
  - **Verification**: Services include pipelineValue, leadAge, weeklySummary, winLossAnalysis methods; all methods tested with unit tests; calculations verified

- [ ] T083 [US5] Implement GET /api/v1/reports/pipeline-value endpoint
  - **Done when**: Pipeline value report reveals stage-by-stage economics and conversion rates, identifying bottlenecks and revenue impact
  - **Verification**: GET /api/v1/reports/pipeline-value returns stages with counts, values, and conversion rates; curl returns valid JSON

- [ ] T084 [US5] Implement GET /api/v1/reports/lead-age endpoint
  - **Done when**: Lead age report identifies stale leads at risk of falling through cracks, enabling timely intervention
  - **Verification**: GET /api/v1/reports/lead-age returns leads with daysInStage; ?threshold=14 highlights stale leads; query parameter working

- [ ] T085 [US5] Implement GET /api/v1/reports/weekly-summary endpoint
  - **Done when**: Weekly activity summary tracks team productivity and pipeline motion week-over-week
  - **Verification**: GET /api/v1/reports/weekly-summary returns counts for newLeads, stageProgressions, demosScheduled, demosCompleted, proposalsSent, dealsWon, dealsLost

- [ ] T086 [US5] Implement GET /api/v1/reports/win-loss endpoint
  - **Done when**: Win/loss analysis reveals deal closure metrics and loss patterns, informing sales strategy refinement
  - **Verification**: GET /api/v1/reports/win-loss returns winRate %, totalDeals, won/lost counts, averageDealSize, averageSalesCycle, lostReasons with counts

- [ ] T087 [US5] Write integration tests for report endpoints in backend/tests/integration/reports.test.ts
  - **Done when**: Integration tests verify report calculations with realistic data, ensuring accuracy for business decisions
  - **Verification**: All 4 report endpoints tested with sample data; calculations verified correct; `pnpm test:integration` passes all report tests

### Frontend Tasks (US5)

- [ ] T088 [P] [US5] Create Reports page in frontend/src/pages/Reports.tsx
  - **Done when**: Reports dashboard organizes business metrics into focused tabs, enabling quick insights into pipeline health and team performance
  - **Verification**: Page includes tabs for each report type; each tab fetches and displays corresponding report data; tab switching works

- [ ] T089 [P] [US5] Install papaparse and jsPDF for export functionality
  - **Done when**: Export libraries are available for generating downloadable reports, enabling stakeholders to share data externally
  - **Verification**: papaparse and jsPDF installed in package.json; sample CSV export works; no console errors

- [ ] T090 [P] [US5] Create ReportExport component in frontend/src/components/ReportExport.tsx
  - **Done when**: Export buttons enable reports to be downloaded as CSV and PDF, supporting external analysis and stakeholder sharing
  - **Verification**: Component includes "Export CSV" and "Export PDF" buttons; CSV uses papaparse; PDF uses jsPDF; downloads trigger correctly

- [ ] T091 [P] [US5] Create PipelineValueReport component in frontend/src/components/reports/PipelineValueReport.tsx
  - **Done when**: Pipeline value table with conversion rates visualizes economic stage progression, identifying conversion bottlenecks
  - **Verification**: Component displays table with stage, count, total value, conversion rate columns; optional bar chart; sorted by stage order

- [ ] T092 [P] [US5] Create LeadAgeReport component in frontend/src/components/reports/LeadAgeReport.tsx
  - **Done when**: Stale lead highlighting (red for >14 days) draws attention to aging leads requiring action
  - **Verification**: Component displays table sorted by daysInStage descending; stale leads >14 days highlighted in red; table readable

- [ ] T093 [P] [US5] Create WeeklySummaryReport component in frontend/src/components/reports/WeeklySummaryReport.tsx
  - **Done when**: Weekly activity counts track team velocity and pipeline momentum, enabling performance coaching and forecasting
  - **Verification**: Component displays counts for all activity types; date range shown; metrics clearly labeled

- [ ] T094 [P] [US5] Create WinLossReport component in frontend/src/components/reports/WinLossReport.tsx
  - **Done when**: Win rate, deal size, and lost reason analysis reveal sales effectiveness and competitive patterns
  - **Verification**: Component displays win rate %, avg deal size, avg cycle duration; lost reasons table with counts; metrics formatted clearly

- [ ] T095 [US5] Integrate all report components into Reports page
  - **Done when**: All reports are accessible from a single dashboard, enabling comprehensive business review in one location
  - **Verification**: Each report tab renders corresponding component with data; ReportExport available for all reports; all components load without errors

### E2E Tests (US5)

- [ ] T096 [US5] Write Playwright test for report generation in frontend/tests/e2e/reports.spec.ts
  - **Done when**: End-to-end report test validates data flows from database through aggregation to display, confirming report accuracy
  - **Verification**: Test navigates to Reports; switches between all 4 tabs; verifies each displays data; `pnpm test:e2e` passes

- [ ] T097 [US5] Write Playwright test for CSV export in frontend/tests/e2e/export.spec.ts
  - **Done when**: Export E2E test validates download functionality works end-to-end, enabling reliable report sharing
  - **Verification**: Test clicks "Export CSV"; verifies download triggered; verifies CSV file is valid; `pnpm test:e2e` passes

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
  - **Done when**: Error boundary catches React rendering errors and displays user-friendly fallback, preventing white-screen crashes and guiding users to recover
  - **Verification**: Component catches React errors; displays fallback UI with recovery option; error logged to console; tested with ErrorBoundary.test.tsx

- [ ] T099 [P] Add loading indicators to all async operations
  - **Done when**: Loading states (spinners, disabled buttons) provide visual feedback during data fetching, reducing perceived latency and confusion
  - **Verification**: All useQuery hooks show spinner when isLoading=true; all useMutation hooks disable submit buttons during loading; tested in unit tests

- [ ] T100 [P] Implement toast notifications for success/error messages
  - **Done when**: Toast notifications deliver non-intrusive feedback on form submissions and API errors, keeping users informed without modal disruption
  - **Verification**: react-hot-toast installed; success toasts appear on create/update/delete; error toasts appear on failures; tested with integration tests

- [ ] T101 [P] Add form validation error messages to all forms
  - **Done when**: Inline validation errors guide users to fix inputs before submission, reducing API errors and improving user experience
  - **Verification**: Required field errors display below each field; email format errors show for invalid emails; error styling consistent across all forms

- [ ] T102 [P] Ensure keyboard navigation works on all interactive elements
  - **Done when**: Keyboard-only navigation (tab order, Escape, Enter) ensures accessibility for keyboard users and enables faster power-user workflows
  - **Verification**: Tab order logical on all pages; Escape closes modals; Enter submits forms; tested with keyboard-only navigation test in Playwright

- [ ] T103 Add ARIA labels to all interactive elements
  - **Done when**: ARIA labels enable screen reader users to navigate and use the application, meeting accessibility standards and supporting inclusive design
  - **Verification**: aria-label, aria-describedby, role attributes on all buttons, inputs, modals; screen reader testing passes on Dashboard, Pipeline, Reports

- [ ] T104 Create README.md with setup instructions
  - **Done when**: README provides clear onboarding guide for new developers, reducing setup time and enabling rapid project contribution
  - **Verification**: README includes prerequisites, installation steps, dev server startup; test commands documented; references quickstart.md

- [ ] T105 Add environment variable documentation in .env.example
  - **Done when**: Documented env vars enable secure configuration and reproducible deployments across environments
  - **Verification**: .env.example includes all required vars with example values; comments explain each variable; committed to repo

- [ ] T106 Test production build for frontend
  - **Done when**: Production build succeeds and output is optimized and deployable, validating that minification and bundling work correctly
  - **Verification**: `cd frontend && pnpm build` succeeds with exit code 0; frontend/dist/ contains optimized assets; gzip size reasonable

- [ ] T107 Test production build for backend
  - **Done when**: Backend production build compiles TypeScript without errors, ensuring code quality at deployment
  - **Verification**: `cd backend && pnpm build` succeeds; TypeScript compilation has zero errors; compiled output ready for Node.js execution

- [ ] T108 Run all tests in CI mode
  - **Done when**: All tests pass in CI pipeline configuration, validating code quality before merge and preventing regressions
  - **Verification**: `pnpm test:unit` passes in all workspaces; `pnpm test:integration` passes; `pnpm test:e2e` passes in headless mode; total coverage captured

- [ ] T109 Create deployment documentation in docs/deployment.md
  - **Done when**: Deployment guide enables repeatable deployments to production with clear prerequisites and environment configuration
  - **Verification**: Document includes database setup, env var configuration, build steps, and hosting options (Vercel, Railway, etc.); document is clear and complete

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
