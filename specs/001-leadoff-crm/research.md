# Technology Research: LeadOff CRM

**Date**: 2025-11-13
**Branch**: 001-leadoff-crm
**Purpose**: Resolve technical unknowns and select appropriate technologies for Phase 1 implementation

---

## 1. Frontend Framework Selection

### Decision: **React 18+ with TypeScript**

### Rationale:

1. **Narrow-screen layout support**: React's component-based architecture makes it easy to build responsive layouts with CSS modules or Tailwind. Excellent support for media queries and conditional rendering based on viewport width.

2. **Drag-and-drop libraries**: Multiple mature options available (@dnd-kit/core is modern and actively maintained, supports accessibility, works well with narrow layouts)

3. **Developer ecosystem**: Largest ecosystem of UI component libraries, excellent TypeScript support, extensive documentation and community resources

4. **Bundle size**: With tree-shaking and code-splitting (React.lazy, Suspense), can achieve reasonable bundle sizes. Vite as build tool provides optimal development experience and production builds.

5. **Learning curve**: Well-documented with extensive tutorials and resources, making it easier for future maintainers

### Alternatives Considered:

- **Vue 3**: Excellent framework, but slightly smaller ecosystem for drag-and-drop. Pinia state management is simple, but React's Context API + hooks is sufficient for single-user app.
- **Svelte**: Smallest bundle size and simplest syntax, but smaller ecosystem and fewer drag-and-drop libraries. Less familiar to most developers.

### Implementation Details:

- **Build tool**: Vite (fast development, optimized production builds)
- **Styling**: Tailwind CSS (utility-first, excellent for responsive design, small production bundle)
- **Type safety**: TypeScript for better IDE support and fewer runtime errors

---

## 2. Backend Framework Selection

### Decision: **Node.js with TypeScript + Fastify**

### Rationale:

1. **Type safety**: TypeScript on both frontend and backend allows sharing of types/interfaces (Lead, Activity, etc.) in the `/shared/types` directory. This reduces bugs from API contract mismatches.

2. **Development speed**: JavaScript/TypeScript developers can work on both frontend and backend. Single language reduces context switching.

3. **Fastify benefits**:
   - Fastest Node.js web framework (important for <1s search requirement)
   - Built-in schema validation (JSON Schema for request/response validation)
   - Excellent TypeScript support
   - Plugin ecosystem for database, CORS, etc.

4. **ORM quality**: Prisma ORM provides excellent TypeScript integration, type-safe database queries, and easy migrations. Auto-generates types from schema.

5. **Testing ecosystem**: Vitest for unit tests (same as frontend), Supertest for API integration tests

### Alternatives Considered:

- **Python (FastAPI)**: Excellent framework, but requires maintaining two type systems (Python types + TypeScript). Slightly slower for high-throughput search operations.
- **Python (Django)**: Full-featured but heavier than needed for single-user CRM. More boilerplate for simple CRUD operations.
- **NestJS**: More opinionated and enterprise-focused, adds unnecessary complexity for this project scale.

### Implementation Details:

- **Runtime**: Node.js 20 LTS (latest stable with long-term support)
- **ORM**: Prisma (type-safe database client, excellent migrations)
- **Validation**: Zod or JSON Schema (request/response validation)
- **API Documentation**: Auto-generated from JSON Schema (Fastify plugin)

---

## 3. Database Selection

### Decision: **SQLite for Phase 1, PostgreSQL-ready**

### Rationale:

1. **Local development ease**: SQLite requires no separate database server, perfect for single-user Phase 1. Zero-configuration setup - just a file.

2. **Relational support**: Full SQL support for complex queries (lead age calculations, pipeline aggregations, win/loss analysis). Foreign keys, indexes, transactions all supported.

3. **Migration path**: Prisma supports both SQLite and PostgreSQL with minimal changes. When multi-user support is needed, can migrate to PostgreSQL by changing connection string.

4. **Performance**: For 500 leads, SQLite performance is excellent (<1ms queries with proper indexes). Full-text search supported via FTS5 extension.

5. **Portability**: Single file database makes backup and deployment trivial. Can be version-controlled if needed for testing.

### Alternatives Considered:

- **PostgreSQL**: More scalable but overkill for single-user Phase 1. Requires separate database server setup.
- **MySQL**: Similar to PostgreSQL but no strong advantages for this use case.

### Implementation Details:

- **File location**: `./data/leadoff.db` (ignored in .gitignore)
- **Migrations**: Prisma Migrate for schema versioning
- **Full-text search**: SQLite FTS5 for company/contact name search
- **Indexes**: On frequently queried fields (stage, follow_up_date, company_name)

---

## 4. Drag-and-Drop Library

### Decision: **@dnd-kit/core + @dnd-kit/sortable**

### Rationale:

1. **Modern and maintained**: Built for React hooks, actively developed, frequent updates

2. **Accessibility**: Built-in keyboard navigation and screen reader support (important for professional software)

3. **Narrow-screen support**: Works well with responsive layouts, supports touch events for tablets

4. **Performance**: Uses CSS transforms for smooth animations, virtualizes lists for performance

5. **Flexibility**: Highly customizable, supports multiple drop zones (pipeline columns), can handle nested drag-drop if needed later

### Alternatives Considered:

- **react-beautiful-dnd**: Popular but no longer actively maintained. Airbnb has sunset the library.
- **react-dnd**: Lower-level, more complex API. More power than needed for kanban board.

### Implementation Details:

- **Components**: DndContext wrapper, Droppable zones (pipeline columns), Draggable items (lead cards)
- **Persistence**: onDragEnd handler updates lead stage via API, optimistic UI updates
- **Narrow screen**: On <600px width, kanban columns stack vertically or horizontal scroll with snap points

---

## 5. State Management

### Decision: **React Context API + useReducer**

### Rationale:

1. **Sufficient for single-user app**: No complex global state, most state is server-synchronized (leads, activities)

2. **No additional dependencies**: Built into React, zero bundle size overhead

3. **Simple learning curve**: Easy to understand and maintain, no boilerplate

4. **Server state handled separately**: Use React Query (TanStack Query) for server state caching, refetching, optimistic updates

### Alternatives Considered:

- **Redux**: Overkill for this application size. Significant boilerplate for small benefit.
- **Zustand**: Simpler than Redux but still an additional dependency. Context API is sufficient.

### Implementation Details:

- **Context structure**:
  - LeadContext: Current lead filter/search state
  - UIContext: Modal states, sidebar state, focus view preferences
- **Server state**: React Query for API data caching, automatic refetch on window focus, optimistic updates
- **Local storage**: Persist user preferences (column widths, view mode, etc.)

---

## 6. Date/Time Handling

### Decision: **date-fns**

### Rationale:

1. **Modular**: Import only needed functions, small bundle size (2-5kb for typical usage)

2. **Immutable**: Doesn't mutate dates, reduces bugs

3. **Functional**: Pure functions, tree-shakeable

4. **Follow-up calculations**: Easy to add days/hours (`addDays`, `addHours`), format dates, calculate differences

5. **Timezone handling**: Via date-fns-tz addon if needed (likely not needed for Phase 1 single-user)

### Alternatives Considered:

- **Luxon**: More powerful but larger bundle size (15kb+). Overkill for simple date arithmetic.
- **Day.js**: Similar to date-fns but uses mutable API (like Moment.js). Prefer immutability.

### Implementation Details:

- **Functions used**: `addDays`, `format`, `differenceInDays`, `isPast`, `isFuture`, `parseISO`
- **Date storage**: Store as ISO 8601 strings in database, parse to Date objects in JavaScript
- **Display formats**: "MMM dd, yyyy" for dates, "h:mm a" for times

---

## 7. Reporting/Export

### Decision: **CSV via papaparse (client-side) + jsPDF (basic PDF)**

### Rationale:

1. **CSV export**: Simplest and most universal format. Papaparse handles edge cases (commas, quotes). Can open in Excel/Google Sheets.

2. **PDF export**: jsPDF for basic table-based reports. No server-side rendering needed for Phase 1.

3. **Client-side processing**: No server load, works offline, faster for small datasets (500 leads)

4. **Future enhancement**: Can add server-side PDF generation (Puppeteer) in Phase 2 if complex layouts needed

### Alternatives Considered:

- **Server-side PDF (Puppeteer)**: High quality but requires headless browser on server. Overkill for Phase 1.
- **HTML to PDF services**: External dependency, cost, privacy concerns.
- **xlsx library**: Could add Excel export, but CSV is sufficient for Phase 1.

### Implementation Details:

- **CSV export**: Frontend button triggers papaparse.unparse(), downloads via blob URL
- **PDF export**: jsPDF with autoTable plugin for tabular reports
- **Format**: Reports include header (date, filters), data table, footer (total counts)

---

## 8. Additional Dependencies

### Search/Filtering:

- **Frontend**: Fuse.js for client-side fuzzy search (if all leads loaded), or server-side SQL LIKE queries
- **Backend**: SQLite FTS5 for full-text search on company name, contact name, notes

### Form Handling:

- **React Hook Form**: Minimal re-renders, excellent TypeScript support, built-in validation
- **Zod**: Schema validation library, can generate TypeScript types from schemas

### UI Components:

- **Headless UI**: Accessible, unstyled components (modals, dropdowns, etc.) from Tailwind team
- **Radix UI**: Alternative headless components with excellent accessibility

### HTTP Client:

- **Axios**: Standard choice, interceptors for error handling, automatic JSON parsing
- **React Query**: For server state management, caching, refetching

---

## Summary of Technology Stack

### Frontend:
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **State**: Context API + React Query
- **Drag-drop**: @dnd-kit
- **Forms**: React Hook Form + Zod
- **Dates**: date-fns
- **Export**: papaparse (CSV), jsPDF (PDF)

### Backend:
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify + TypeScript
- **ORM**: Prisma
- **Database**: SQLite (Phase 1)
- **Validation**: Zod
- **Testing**: Vitest + Supertest

### Development:
- **Language**: TypeScript (shared types)
- **Package manager**: pnpm (faster than npm, saves disk space)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Linting**: ESLint + Prettier
- **Git hooks**: Husky + lint-staged

---

## Performance Considerations

### Search Performance (<1 second for 1000 leads):
- SQLite with FTS5 index on searchable fields
- Frontend debouncing (300ms) to avoid excessive API calls
- React Query caching to avoid redundant searches

### Dashboard Load (<2 seconds):
- Paginated lead list (50 per page)
- Lazy load pipeline view (only load visible columns)
- Use React.memo for lead cards to prevent unnecessary re-renders

### Report Generation (<3 seconds):
- Database-level aggregations (COUNT, SUM, AVG)
- Index on stage and created_at columns
- Limit reports to last 90 days by default (user can expand)

---

## Security Best Practices

### Input Validation:
- Zod schemas for all API inputs
- Sanitize user input before database queries
- Prisma provides SQL injection protection

### Data Storage:
- No sensitive data in Phase 1 (no passwords/credit cards)
- Lead data stored locally in SQLite file
- Future: Add encryption at rest if needed

### API Security:
- CORS configured for frontend domain
- Rate limiting on search endpoints
- Input length limits to prevent DoS

---

## Development Workflow

### Setup:
1. Clone repo
2. `pnpm install` (installs both frontend and backend dependencies)
3. `pnpm db:migrate` (runs Prisma migrations, creates SQLite file)
4. `pnpm dev` (starts both frontend and backend in parallel)

### Testing:
- `pnpm test:unit` - Unit tests (Vitest)
- `pnpm test:integration` - API integration tests
- `pnpm test:e2e` - End-to-end tests (Playwright)

### Git Workflow:
- Feature branches from main
- Husky pre-commit: lint, type-check, test
- Conventional commits (feat:, fix:, docs:, etc.)

---

## Next Steps (Phase 1)

With technology decisions made, we can now proceed to:

1. **Data Model Design** (`data-model.md`): Define Prisma schema for Lead, Activity, Organization, Demo, Proposal entities
2. **API Contracts** (`/contracts/api.yaml`): OpenAPI spec for REST endpoints
3. **Quickstart Guide** (`quickstart.md`): Developer setup instructions
4. **Task Generation** (`tasks.md` via `/speckit.tasks`): Dependency-ordered implementation tasks
