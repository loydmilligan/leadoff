<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0 (added documentation maintenance principle)
Ratification Date: 2025-11-13
Last Amended: 2025-11-13

Added Principles:
- VI. Documentation Maintenance & Repository Hygiene (NEW)

Modified Principles:
- None (existing principles unchanged)

Added Sections:
- Documentation Update Protocol (under Principle VI)
- Repository Cleanup Checklist (under Principle VI)
- Artifact Sync Requirements (under Principle VI)

Templates Requiring Updates:
✅ tasks-template.md - Should include documentation update tasks
✅ plan-template.md - No structural changes required
✅ spec-template.md - No structural changes required

Follow-up TODOs:
- None - all placeholders filled

Changes Summary:
- Added Principle VI to combat AI-generated repository bloat
- Mandates documentation synchronization after code changes
- Requires cleanup of unused files, dead code, and orphaned artifacts
- Establishes documentation-as-source-of-truth for repository structure
- Includes pre-PR checklist for documentation verification
-->

# LeadOff Constitution

## Core Principles

### I. Verification Before Success (NON-NEGOTIABLE)

**Never claim completion without evidence.**

- **MUST verify** before marking any task complete:
  - Run the actual command/test that proves success
  - Capture and confirm the output
  - Include verification evidence in completion report
- **MUST NOT** rely on:
  - Assumptions ("it should work")
  - Partial testing ("ran one test")
  - Memory ("I think I did this before")
- **Verification checklist** for every task:
  1. Identify verification command(s) from done statement(s)
  2. Execute each verification command
  3. Confirm output matches expected success criteria
  4. Only then mark task complete

**Rationale**: Prevents false confidence, catches integration issues early, ensures actual
working software rather than "probably works" code. This is the foundation of reliable
delivery.

**Examples**:
- ❌ "Task complete: Added login endpoint" → No evidence
- ✅ "Task complete: Added login endpoint. Verified with `curl -X POST
  http://localhost:3000/api/login` returning 200 OK"

### II. Git Worktree Isolation

**Use separate worktrees for all feature work (non-bug/fix changes).**

- **MUST use worktrees** for:
  - New features (any user-facing addition)
  - Refactoring (code restructuring)
  - Documentation (major updates)
  - Infrastructure changes
- **MAY use main branch** for:
  - Bug fixes (fixing broken behavior)
  - Hotfixes (urgent production fixes)
  - Minor documentation typos
- **Worktree naming convention**: `worktrees/<branch-name>`
- **Worktree lifecycle**:
  1. Create: `git worktree add worktrees/001-feature-name 001-feature-name`
  2. Develop in isolated directory
  3. Test in isolation
  4. Merge/PR when complete
  5. Remove: `git worktree remove worktrees/001-feature-name`

**Rationale**: Prevents context switching overhead, allows parallel work on multiple
features, keeps main branch clean, reduces merge conflicts, enables easy comparison between
branches.

### III. Testing Strategy

**Pragmatic testing: unit tests with minimal mocking + Playwright E2E as soon as feasible.**

- **Unit Testing**:
  - **DO**: Test business logic, utility functions, data transformations
  - **DO**: Use real data structures (Lead, Activity objects)
  - **DO**: Keep tests isolated (one concern per test)
  - **AVOID**: Excessive mocking - prefer real objects
  - **AVOID**: Testing framework internals (React rendering details)
  - **When to mock**: External services (APIs, databases) during unit tests only
- **Playwright E2E Testing**:
  - **MUST add** as soon as basic UI exists (P1 user story implementation)
  - **MUST test** critical user flows:
    - Lead creation via quick-entry form
    - Lead search and filtering
    - Stage progression (drag-and-drop or dropdown)
    - Follow-up reminder display
  - **Test against real backend** (not mocked API)
  - **Use test database** (SQLite file, reset between runs)
- **Integration Testing**:
  - **API contract tests**: Request/response validation against OpenAPI spec
  - **Database integration**: Prisma queries against test database
- **Testing is NOT TDD**:
  - Write tests alongside implementation, not strictly before
  - Tests should verify behavior, not dictate design
  - Refactor tests when code changes

**Rationale**: Real object testing catches integration bugs earlier than mocks. Playwright
confirms actual user experience. Minimal mocking reduces test maintenance burden. Not TDD
because strict red-green-refactor can slow pragmatic development.

### IV. Done Statements (NON-NEGOTIABLE)

**Every task and phase MUST have explicit, testable done statement(s).**

- **Task Done Statements**:
  - **Format**: "This task is done when [condition]"
  - **Multiple conditions**: Each written separately and independently testable
  - **Minimum number**: As many as needed to cover all independent completion criteria
  - **Example**: Task "Set up database"
    - Done when: Prisma migrations run successfully
    - Done when: Test database contains seed data
    - Done when: `pnpm db:studio` opens Prisma Studio GUI
- **Phase Done Statements**:
  - **Format**: "This phase is done when [condition]"
  - **Must cover**: All critical deliverables for the phase
  - **Example**: Phase "Backend API Setup"
    - Done when: All API endpoints return 200 for valid requests
    - Done when: OpenAPI spec matches implemented routes
    - Done when: Integration tests pass
- **Writing Done Statements**:
  - Use **specific, measurable criteria** (not vague)
  - Include **verification command** when applicable
  - Make **independently testable** (can verify each without others)
  - Avoid **implementation details** (focus on outcomes)

**Rationale**: Done statements eliminate ambiguity, enable objective verification, prevent
premature completion claims, provide clear acceptance criteria, support incremental progress
tracking.

**Examples of Good Done Statements**:
- ✅ "Done when: `curl http://localhost:3000/api/leads` returns JSON array"
- ✅ "Done when: Playwright test `lead-creation.spec.ts` passes"
- ✅ "Done when: All TypeScript errors resolved (`pnpm typecheck` exits 0)"

**Examples of Bad Done Statements**:
- ❌ "Done when: Code is written" (too vague)
- ❌ "Done when: Everything works" (not measurable)
- ❌ "Done when: I think it's complete" (subjective)

### V. Phase Progress Tracking

**Maintain clear visibility of phase completion status.**

- **After each task completion**:
  - List all done statements for the completed task
  - Confirm each done statement is verified as true
  - Report: "Task X complete: M/N tasks complete for Phase Y"
- **When phase completes**:
  1. Review all phase-level done statements
  2. Verify each phase done statement is true
  3. List ALL task done statements from the phase
  4. Confirm cumulative completion (X/X tasks complete)
- **Progress reporting format**:
  ```
  Task 3 Complete: "Add Prisma schema"
  ✓ Done: Prisma schema file created at backend/prisma/schema.prisma
  ✓ Done: Schema includes Lead, Activity, OrganizationInfo models
  ✓ Done: `pnpm db:migrate` runs without errors

  Progress: 3/8 tasks complete for Phase 1 (Backend Setup)
  ```

- **Phase completion report format**:
  ```
  Phase 1 Complete: "Backend Setup"

  Phase Done Statements:
  ✓ Done: Backend server starts on port 3000
  ✓ Done: All API endpoints respond to requests
  ✓ Done: Database migrations applied successfully

  All Tasks from Phase 1:
  ✓ Task 1: Initialize backend project - Done: package.json created, dependencies installed
  ✓ Task 2: Set up Fastify server - Done: Server starts, responds to health check
  ✓ Task 3: Add Prisma schema - Done: Schema created, migrations run
  ...
  ✓ Task 8: Write API integration tests - Done: All tests pass

  Phase Summary: 8/8 tasks complete
  ```

**Rationale**: Provides clear progress visibility, prevents tasks from being forgotten,
ensures all work is verified before moving forward, creates audit trail of completion.

### VI. Documentation Maintenance & Repository Hygiene

**Documentation is the source of truth. Keep it synchronized with code and ruthlessly
eliminate repository bloat.**

AI-assisted development generates substantial "extra stuff" - commented code, unused files,
orphaned experiments, outdated docs. This principle prevents that accumulation.

- **Documentation Update Protocol** (MUST follow after ANY code change):
  1. **Identify affected docs**: What specifications, plans, or guides reference changed code?
  2. **Update before commit**: Documentation changes MUST be in the same commit as code
  3. **Verify accuracy**: Changed docs must match actual implementation (no stale examples)
  4. **Update contracts**: If API/interface changed, update OpenAPI/contract specs

- **Documentation Synchronization Requirements**:
  - **Code → Docs**: When implementation diverges from spec, update spec IMMEDIATELY
  - **Docs → Code**: If spec changes during development, code MUST reflect that change
  - **Examples in docs**: Code snippets MUST be tested/verified (copy-paste working code)
  - **File paths in docs**: MUST match actual repository structure
  - **Version numbers**: Keep consistent across README, package.json, constitution, specs

- **Repository Cleanup Checklist** (MUST verify before EVERY commit):
  1. **No commented-out code**: Delete it (git history preserves it)
  2. **No unused imports**: Remove dead imports from all files
  3. **No orphaned files**: Delete files not referenced by build/test/docs
  4. **No TODO comments**: Convert to tasks in tasks.md or delete
  5. **No debug artifacts**: Remove console.log, temporary test files, debug configs
  6. **No duplicate logic**: Consolidate repeated code into shared utilities
  7. **No stale branches**: Delete merged feature branches and worktrees

- **Pre-PR Documentation Verification**:
  - [ ] README.md reflects current project state
  - [ ] specs/<feature>/plan.md matches implementation approach
  - [ ] specs/<feature>/tasks.md shows completed tasks accurately
  - [ ] API contracts (OpenAPI) match implemented endpoints
  - [ ] quickstart.md commands actually work (test them)
  - [ ] No references to removed/renamed files or functions
  - [ ] All example code snippets execute without errors

- **Artifact Sync Requirements**:
  - **When spec.md changes**: Update plan.md if approach affected, regenerate tasks.md if
    requirements change
  - **When data-model.md changes**: Update Prisma schema, update API contracts if entities
    change
  - **When API contract changes**: Update frontend API client types, update integration tests
  - **When constitution changes**: Update plan.md Constitution Check, review tasks.md for
    compliance

- **Repository Organization Rules**:
  - **One source of truth**: If information exists in multiple places, eliminate duplicates
  - **Directory structure matches docs**: Actual folders must match structure in plan.md and
    quickstart.md
  - **Dead code = deleted code**: If it's not called, imported, or tested, delete it
  - **Experiments in branches**: Exploratory code stays in worktrees, not main
  - **Generated files gitignored**: Build output, logs, caches never committed

**Rationale**: AI coding accelerates development but creates maintenance debt through
documentation drift and file proliferation. Without discipline, repositories become
archaeological sites where current truth is buried under obsolete artifacts. Documentation
synchronization ensures specs remain trustworthy. Cleanup discipline keeps repositories
navigable and prevents "works on my machine" issues from stale configs.

**Examples**:
- ❌ Commit adds `/api/v2/leads` endpoint but OpenAPI spec still shows `/api/v1/leads`
- ✅ Commit adds endpoint + updates OpenAPI spec + updates quickstart.md example
- ❌ Rename `LeadService` to `LeadManager` but leave old references in plan.md
- ✅ Rename service + update all doc references + verify examples still work
- ❌ Add temporary `debug.ts` file for testing, forget to delete before commit
- ✅ Use worktree for experiments, delete debug files before PR

## Task and Phase Completion Requirements

### Task Completion Protocol

1. **Before marking complete**:
   - Review all done statements for the task
   - Execute verification commands for each done statement
   - Confirm all done statements are true

2. **Completion report**:
   - List each done statement with ✓ or ✗
   - For any ✗, explain blocker and next steps
   - Report phase progress (X/N tasks complete)

3. **Edge cases**:
   - If task has dependent tasks, verify dependencies first
   - If verification fails, task remains incomplete
   - If new work discovered, create new task (don't expand current)

### Phase Completion Protocol

1. **Before marking phase complete**:
   - Verify all tasks in phase are complete (N/N)
   - Review all phase-level done statements
   - Execute verification commands for phase done statements

2. **Phase completion report**:
   - List all phase done statements with verification status
   - List ALL task done statements from entire phase
   - Provide phase summary (X/X tasks complete)
   - Note any follow-up phases or dependencies

3. **Phase transition**:
   - Document lessons learned (optional)
   - Archive phase artifacts if applicable
   - Begin next phase only when current phase fully complete

### Done Statement Writing Guidelines

**For Tasks**:
- Minimum 1 done statement per task
- Add more done statements when:
  - Task produces multiple independent artifacts
  - Multiple verification steps required
  - Task affects multiple system components

**For Phases**:
- Minimum 1 done statement per phase
- Should cover:
  - Primary deliverable(s) of the phase
  - Integration points verified
  - Quality gates passed (tests, linting, etc.)

**Testing Done Statements**:
- Each done statement must be independently verifiable
- Should not depend on other done statements for verification
- Must be boolean (true/false, not partial completion)

**Example: Multi-Statement Task**

Task: "Set up frontend development environment"

Done Statements:
1. Done when: `pnpm dev` starts Vite dev server on port 5173
2. Done when: TypeScript compilation succeeds (`pnpm typecheck` exits 0)
3. Done when: ESLint runs without errors (`pnpm lint` exits 0)
4. Done when: Tailwind CSS classes render correctly in browser

Each statement is independently testable. If statement 3 fails, statements 1, 2, and 4 can
still be verified separately.

## Development Workflow

### Feature Development Process

1. **Start Feature**:
   - Create worktree: `git worktree add worktrees/<branch> <branch>`
   - Navigate to worktree directory
   - Read spec, plan, tasks for the feature

2. **Implement Tasks**:
   - Work on one task at a time
   - Write code + tests together (not strict TDD)
   - Update documentation alongside code changes (Principle VI)
   - Verify done statements before marking complete
   - Report progress after each task

3. **Add Playwright Tests** (as soon as UI exists):
   - Create `frontend/tests/e2e/<feature>.spec.ts`
   - Test critical user flows
   - Run against real backend with test database
   - Add to CI pipeline

4. **Complete Phase**:
   - Verify all phase done statements
   - Run repository cleanup checklist (Principle VI)
   - Generate phase completion report
   - Commit work

5. **Merge/PR**:
   - Ensure all tests pass (unit, integration, E2E)
   - Verify Pre-PR Documentation Checklist (Principle VI)
   - Create PR with description referencing spec
   - After merge, remove worktree

### Bug/Fix Process

1. **Small fixes**: Work directly in main branch
2. **Reproduce**: Create failing test first
3. **Fix**: Implement fix
4. **Verify**: Ensure test passes
5. **Update docs**: If behavior changed, update relevant documentation
6. **Commit**: Reference issue number in commit message

### Testing Workflow

1. **Unit Tests**:
   - Run during development: `pnpm test:watch`
   - Keep tests passing continuously
   - Minimal mocking - use real objects

2. **Integration Tests**:
   - Run before commits: `pnpm test:integration`
   - Test API contracts and database queries

3. **Playwright E2E**:
   - Run before PR: `pnpm test:e2e`
   - Test critical user flows
   - Against test database (reset between runs)

4. **Pre-commit Checks**:
   - Linting, type-checking, formatting
   - Unit tests (fast subset if available)
   - Documentation sync verification (Principle VI)

## Governance

### Constitution Authority

- This constitution supersedes informal practices and verbal agreements
- All development work MUST comply with principles herein
- Agents (AI assistants) MUST enforce constitution requirements
- Violations must be corrected before proceeding

### Amendment Process

1. **Propose**: Document proposed change with rationale
2. **Review**: Evaluate impact on existing work and templates
3. **Version**: Increment version (MAJOR.MINOR.PATCH)
4. **Update**: Modify constitution and sync dependent artifacts
5. **Commit**: Commit with descriptive message

**Version Semantics**:
- **MAJOR**: Removing or fundamentally changing a principle
- **MINOR**: Adding new principle or major section
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance Verification

- **Every task completion**: Check done statements verified
- **Every phase completion**: Check phase done statements + all task done statements reviewed
- **Every commit**: Run repository cleanup checklist (Principle VI)
- **Every PR/review**: Verify worktree usage (if feature), testing coverage, verification
  evidence, documentation synchronization
- **Complexity exceptions**: Must be explicitly justified with "why simpler approach
  insufficient"

### Runtime Guidance

For day-to-day development guidance, refer to:
- `specs/<feature>/spec.md` - Feature requirements
- `specs/<feature>/plan.md` - Implementation approach
- `specs/<feature>/tasks.md` - Task breakdown with done statements
- `specs/<feature>/quickstart.md` - Developer setup

**Version**: 1.1.0 | **Ratified**: 2025-11-13 | **Last Amended**: 2025-11-13
