# leadoff Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-15

## Active Technologies

- React 18, TypeScript 5.x, Vite, Tailwind CSS
- Node.js 20 LTS, Fastify, Prisma ORM
- SQLite (development), PostgreSQL-ready

## Project Structure

```text
worktrees/001-leadoff-crm/
  backend/          # Fastify API server
  frontend/         # React SPA
  shared/types/     # Shared TypeScript types
  specs/            # Feature specifications
```

## Commands

```bash
# Start development servers
pnpm dev                    # Both backend and frontend
pnpm --filter leadoff-backend dev
pnpm --filter leadoff-frontend dev

# Testing
pnpm test:unit              # Unit tests
pnpm test:integration       # Integration tests
pnpm test:e2e              # E2E tests (Playwright)

# Database
pnpm prisma migrate dev     # Run migrations
pnpm prisma db seed        # Seed database
```

## Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Single quotes, no semicolons, 100 char width

## Testing & Quality Assurance

### Critical Testing Principles

**NEVER claim success when critical issues exist:**
- Manually constructing URLs is NOT a workaround - it's a broken feature
- If users cannot complete a core workflow (like clicking to view a lead), the app is not functional
- ALL issues found during testing MUST be documented before claiming completion

### Issue Documentation Protocol

1. **Capture ALL issues immediately** when discovered during testing
2. **Document in ISSUES.md** with:
   - Version number
   - Last modified date
   - Severity level (Critical/High/Medium/Low)
   - Impact on user workflows
3. **Critical issues MUST be fixed** before claiming phase/feature completion
4. **Test fixes with Playwright MCP** to verify resolution

### Testing Checklist

Before claiming any feature is complete:
- [ ] Test all user-facing click interactions
- [ ] Test all navigation paths
- [ ] Test forms with validation
- [ ] Test error states
- [ ] Test loading states
- [ ] Verify with Playwright MCP automated tests
- [ ] Document any issues in ISSUES.md
- [ ] Fix all Critical and High severity issues

## Development Environment

### Hot-Reload Requirements

Hot-reload is MANDATORY for efficient development:
- Backend: `tsx watch` auto-restarts on .ts file changes
- Frontend: Vite HMR for instant updates
- Environment variables: Use dotenv-cli or nodemon for .env changes
- Database schema: Prisma generates client on schema changes

### Port Configuration

- Backend: 3000 (configurable via PORT env var)
- Frontend: 5174 (configurable via vite.config.ts)
- CORS: Ensure FRONTEND_ORIGIN matches frontend port

## Navigation Architecture

### Lead Navigation Points

Multiple places where users can click to view lead details:
1. **Dashboard lead cards** - Must navigate to `/leads/:id`
2. **Pipeline Kanban cards** - Must navigate to `/leads/:id`
3. **Search results** - Must navigate to `/leads/:id`
4. **Focus View cards** - Must navigate to `/leads/:id`

**Implementation**: All lead cards must use React Router `Link` or `useNavigate` hook

## Lead Lifecycle Management

### New Stages

Phase 8 introduces nurture stages for long-term follow-up:
- **NURTURE_30_DAY**: Short-term nurture (30-day follow-up)
- **NURTURE_90_DAY**: Long-term nurture (90-day follow-up)

### Next Action Tracking

Leads can have a "next action" to ensure timely follow-up:
- **nextActionType**: Type of action (CALL, EMAIL, MEETING, PROPOSAL, FOLLOW_UP)
- **nextActionDescription**: Description of what needs to be done
- **nextActionDueDate**: When the action is due

### Communication Templates

Templates allow quick insertion of common messages:
- Stored in `Template` model with type (EMAIL, PHONE_CALL, TEXT_MESSAGE)
- Load via API: `GET /api/templates?type=EMAIL`
- Templates support variable substitution ({{companyName}}, {{contactName}})

### File Upload Configuration

Proposal attachments support:
- **Allowed types**: PDF (.pdf), Excel (.xlsx, .xls)
- **Storage**: `backend/uploads/` directory
- **Max size**: 10MB per file
- **Fields**: `proposalFilePath`, `priceSheetPath` in Proposal model

### AI Integration Setup

AI-powered activity summarization:
- **Provider**: Anthropic Claude (claude-3-5-sonnet-20241022)
- **API Key**: Set `ANTHROPIC_API_KEY` in backend/.env
- **Endpoint**: `POST /api/activities/:id/summarize`
- **Usage**: Summarizes long activity notes into concise bullet points

## Recent Changes

- 2025-11-18: Phase 8 completed (Lead Lifecycle Management)
- 2025-11-15: Phase 6 completed (Demo & Opportunity Tracking)
- 2025-11-15: Added testing protocol and issue tracking requirements
- 2025-11-13: Project initialized

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
