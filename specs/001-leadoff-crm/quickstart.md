# LeadOff CRM - Developer Quickstart Guide

**Branch**: 001-leadoff-crm
**Date**: 2025-11-13

This guide will get you up and running with LeadOff CRM development environment in under 10 minutes.

---

## Prerequisites

Ensure you have the following installed on your development machine:

### Required:
- **Node.js**: Version 20.x LTS ([Download](https://nodejs.org/))
  ```bash
  node --version  # Should be v20.x.x
  ```

- **pnpm**: Fast package manager ([Install](https://pnpm.io/installation))
  ```bash
  npm install -g pnpm
  pnpm --version  # Should be 8.x or higher
  ```

- **Git**: Version control ([Download](https://git-scm.com/))
  ```bash
  git --version
  ```

### Optional (Recommended):
- **VS Code**: IDE with excellent TypeScript support
- **VS Code Extensions**:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense
  - REST Client (for testing API endpoints)

---

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url> leadoff-crm
cd leadoff-crm
git checkout 001-leadoff-crm
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all frontend and backend dependencies in one command.

**What gets installed:**
- Frontend: React, Vite, Tailwind CSS, React Query, @dnd-kit, etc.
- Backend: Fastify, Prisma, Zod, date-fns, etc.
- Dev tools: TypeScript, ESLint, Prettier, Vitest, Playwright

### 3. Set Up Environment Variables

```bash
# Create environment file
cp .env.example .env
```

Edit `.env` if needed (defaults should work for local development):

```bash
# Database
DATABASE_URL="file:./data/leadoff.db"

# Server
PORT=3000
NODE_ENV=development

# Frontend (for API calls)
VITE_API_URL=http://localhost:3000/api/v1
```

### 4. Initialize Database

```bash
pnpm db:setup
```

This command:
1. Creates the `./data` directory
2. Runs Prisma migrations (creates SQLite database)
3. Seeds database with sample data (optional)

**Expected output:**
```
✓ Database directory created
✓ Prisma migrations applied
✓ Sample data seeded (20 leads, 50 activities)
```

### 5. Start Development Servers

```bash
pnpm dev
```

This starts both frontend and backend concurrently:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3000 (Fastify server)
- **API Docs**: http://localhost:3000/docs (Auto-generated from OpenAPI)

**Wait for:**
```
[frontend] ➜  Local:   http://localhost:5173/
[backend]  Server listening at http://localhost:3000
```

### 6. Open Application

Navigate to **http://localhost:5173** in your browser.

You should see the LeadOff CRM dashboard with sample leads.

---

## Project Structure

```
leadoff-crm/
├── backend/
│   ├── src/
│   │   ├── models/          # Prisma schema (data model)
│   │   ├── services/        # Business logic
│   │   ├── api/             # REST API routes
│   │   ├── utils/           # Helpers (validation, date calculations)
│   │   └── server.ts        # Fastify server setup
│   ├── tests/
│   │   ├── unit/            # Service unit tests
│   │   ├── integration/     # API integration tests
│   │   └── contract/        # API contract tests
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── migrations/      # Migration history
│   │   └── seed.ts          # Sample data generator
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API client, state management
│   │   ├── layouts/         # Layout components (narrow-screen)
│   │   ├── utils/           # Frontend helpers
│   │   └── main.tsx         # React entry point
│   ├── tests/
│   │   ├── unit/            # Component unit tests
│   │   ├── integration/     # Component + API tests
│   │   └── e2e/             # Playwright end-to-end tests
│   ├── public/              # Static assets
│   └── package.json
│
├── shared/
│   └── types/               # Shared TypeScript types
│
├── data/
│   └── leadoff.db           # SQLite database (gitignored)
│
├── specs/
│   └── 001-leadoff-crm/     # Feature specification
│
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
├── package.json             # Root package.json (workspace)
├── pnpm-workspace.yaml      # pnpm workspace config
└── README.md
```

---

## Available Scripts

Run from project root:

### Development:
```bash
pnpm dev              # Start both frontend & backend
pnpm dev:frontend     # Start only frontend
pnpm dev:backend      # Start only backend
```

### Database:
```bash
pnpm db:setup         # Initialize database with migrations
pnpm db:migrate       # Run new migrations
pnpm db:seed          # Seed with sample data
pnpm db:reset         # Reset database (WARNING: deletes all data)
pnpm db:studio        # Open Prisma Studio (GUI for database)
```

### Testing:
```bash
pnpm test             # Run all tests
pnpm test:unit        # Unit tests only (Vitest)
pnpm test:integration # API integration tests
pnpm test:e2e         # End-to-end tests (Playwright)
pnpm test:watch       # Run tests in watch mode
```

### Code Quality:
```bash
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
pnpm typecheck        # TypeScript type checking
```

### Build:
```bash
pnpm build            # Build both frontend & backend
pnpm build:frontend   # Build frontend only
pnpm build:backend    # Build backend only
```

---

## Development Workflow

### 1. Create a New Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit files in `frontend/src` or `backend/src`.

**Hot Reload:**
- Frontend: Vite watches for changes (instant refresh)
- Backend: Nodemon restarts server on file changes

### 3. Run Tests

```bash
pnpm test:watch
```

Keep tests running in a separate terminal.

### 4. Check Code Quality

Before committing:

```bash
pnpm lint:fix
pnpm format
pnpm typecheck
```

Or use the pre-commit hook (auto-runs via Husky):
```bash
git add .
git commit -m "feat: your commit message"
# Husky runs lint, format, typecheck automatically
```

### 5. Database Changes

If you modify the Prisma schema:

```bash
# 1. Edit backend/prisma/schema.prisma
# 2. Create migration
pnpm db:migrate --name add_new_field

# 3. Regenerate Prisma Client
# (happens automatically in db:migrate)
```

---

## Common Tasks

### Add a New API Endpoint

1. **Define route** in `backend/src/api/routes/`
   ```typescript
   // backend/src/api/routes/leads.ts
   export async function leadRoutes(fastify: FastifyInstance) {
     fastify.get('/leads', async (request, reply) => {
       // Handler logic
     });
   }
   ```

2. **Add service logic** in `backend/src/services/`
   ```typescript
   // backend/src/services/leadService.ts
   export async function getLeads(filters) {
     return prisma.lead.findMany({ where: filters });
   }
   ```

3. **Write tests** in `backend/tests/integration/`
   ```typescript
   test('GET /api/v1/leads returns leads', async () => {
     const response = await app.inject({
       method: 'GET',
       url: '/api/v1/leads'
     });
     expect(response.statusCode).toBe(200);
   });
   ```

4. **Update OpenAPI spec** in `specs/001-leadoff-crm/contracts/api.yaml`

### Add a New React Component

1. **Create component** in `frontend/src/components/`
   ```tsx
   // frontend/src/components/LeadCard.tsx
   export function LeadCard({ lead }: { lead: Lead }) {
     return <div>{lead.companyName}</div>;
   }
   ```

2. **Write tests** in `frontend/tests/unit/`
   ```tsx
   test('LeadCard displays company name', () => {
     render(<LeadCard lead={mockLead} />);
     expect(screen.getByText('Acme Corp')).toBeInTheDocument();
   });
   ```

3. **Use in page** `frontend/src/pages/Dashboard.tsx`

### Modify Database Schema

1. **Edit schema** in `backend/prisma/schema.prisma`
   ```prisma
   model Lead {
     // ... existing fields
     customField String? // New field
   }
   ```

2. **Create migration**
   ```bash
   pnpm db:migrate --name add_custom_field
   ```

3. **Update seed data** in `backend/prisma/seed.ts` (optional)

4. **Update TypeScript types** (auto-generated by Prisma)

---

## Testing Guide

### Unit Tests (Vitest)

**Frontend:**
```bash
cd frontend
pnpm test:unit
```

**Backend:**
```bash
cd backend
pnpm test:unit
```

**Write a test:**
```typescript
// frontend/tests/unit/utils/dateHelpers.test.ts
import { describe, test, expect } from 'vitest';
import { calculateDaysInStage } from '@/utils/dateHelpers';

describe('calculateDaysInStage', () => {
  test('calculates correct number of days', () => {
    const result = calculateDaysInStage(new Date('2025-01-01'), new Date('2025-01-10'));
    expect(result).toBe(9);
  });
});
```

### Integration Tests (API)

```bash
cd backend
pnpm test:integration
```

**Write a test:**
```typescript
// backend/tests/integration/leads.test.ts
import { test, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../helper';

test('POST /api/v1/leads creates a new lead', async () => {
  const app = await build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/leads',
    payload: {
      companyName: 'Test Corp',
      contactName: 'John Doe',
      phone: '555-1234',
      email: 'john@test.com'
    }
  });

  expect(response.statusCode).toBe(201);
  expect(response.json()).toMatchObject({
    companyName: 'Test Corp',
    currentStage: 'INQUIRY'
  });

  await app.close();
});
```

### End-to-End Tests (Playwright)

```bash
pnpm test:e2e
```

**Write a test:**
```typescript
// frontend/tests/e2e/lead-creation.spec.ts
import { test, expect } from '@playwright/test';

test('user can create a new lead', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await page.click('button:has-text("New Lead")');
  await page.fill('input[name="companyName"]', 'Acme Corp');
  await page.fill('input[name="contactName"]', 'Jane Smith');
  await page.fill('input[name="phone"]', '555-9999');
  await page.fill('input[name="email"]', 'jane@acme.com');
  await page.click('button:has-text("Create")');

  await expect(page.locator('text=Acme Corp')).toBeVisible();
});
```

---

## Debugging

### Backend API

**Use VS Code debugger:**

1. Set breakpoint in `backend/src/api/routes/leads.ts`
2. Run debug configuration: "Debug Backend"
3. Make API request from frontend or REST client

**Or use console.log:**
```typescript
fastify.get('/leads', async (request, reply) => {
  console.log('Query params:', request.query);
  // ...
});
```

### Frontend

**React DevTools:**
- Install React DevTools browser extension
- Inspect component props and state

**Browser DevTools:**
- Network tab: Inspect API requests/responses
- Console: View console.log statements

### Database

**Prisma Studio:**
```bash
pnpm db:studio
```

Opens GUI at http://localhost:5555 to view/edit database records.

**SQL Queries:**
```bash
# Open SQLite CLI
sqlite3 data/leadoff.db

# Run query
SELECT * FROM Lead WHERE currentStage = 'INQUIRY';
```

---

## Environment Configuration

### Development (.env)

```bash
DATABASE_URL="file:./data/leadoff.db"
PORT=3000
NODE_ENV=development
VITE_API_URL=http://localhost:3000/api/v1
```

### Production (.env.production)

```bash
DATABASE_URL="postgresql://user:pass@host:5432/leadoff"
PORT=3000
NODE_ENV=production
VITE_API_URL=https://api.leadoff.com/v1
```

---

## Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port in .env
PORT=3001
```

### Database Locked

**Error:** `database is locked`

**Solution:**
```bash
# Close all connections (Prisma Studio, SQLite CLI)
# Reset database
pnpm db:reset
```

### Module Not Found

**Error:** `Cannot find module '@/components/LeadCard'`

**Solution:**
```bash
# Ensure path aliases are configured in tsconfig.json
# Restart TypeScript server in VS Code (Cmd+Shift+P → "Restart TS Server")
```

### Prisma Client Out of Sync

**Error:** `Prisma schema changed, please run prisma generate`

**Solution:**
```bash
cd backend
npx prisma generate
```

---

## Next Steps

1. **Read the Feature Spec**: [specs/001-leadoff-crm/spec.md](./spec.md)
2. **Review Data Model**: [specs/001-leadoff-crm/data-model.md](./data-model.md)
3. **Check API Contracts**: [specs/001-leadoff-crm/contracts/api.yaml](./contracts/api.yaml)
4. **Start Implementing**: Run `/speckit.tasks` to generate implementation tasks

---

## Useful Links

- **React Docs**: https://react.dev
- **Fastify Docs**: https://fastify.dev
- **Prisma Docs**: https://prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vitest**: https://vitest.dev
- **Playwright**: https://playwright.dev

---

## Getting Help

- **Project Issues**: Create GitHub issue
- **Questions**: Check docs or ask in team chat
- **Bugs**: Include console errors, API logs, and reproduction steps

Happy coding!
