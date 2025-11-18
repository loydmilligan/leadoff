# Lead Lifecycle Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add comprehensive lead lifecycle management including action buttons, next actions, templates, file attachments, planner view, CSV import, archive, and AI summarization.

**Architecture:** Four-phase implementation: (1) Core lifecycle with database schema and action buttons, (2) Planning and import features, (3) Templates and file attachments, (4) AI integration. Each phase builds incrementally with TDD where applicable.

**Tech Stack:** Prisma ORM, Fastify, React 18, React Query, Multer (file uploads), OpenRouter API (AI)

---

## Phase 1: Core Lifecycle Management

### Task 1: Update Database Schema - Add New Stages and Fields

**Files:**
- Modify: `shared/types/index.ts`
- Modify: `backend/prisma/schema.prisma`

**Step 1: Add new Stage enum values**

Edit `shared/types/index.ts`:
```typescript
export enum Stage {
  INQUIRY = 'INQUIRY',
  QUALIFICATION = 'QUALIFICATION',
  OPPORTUNITY = 'OPPORTUNITY',
  DEMO_SCHEDULED = 'DEMO_SCHEDULED',
  DEMO_COMPLETE = 'DEMO_COMPLETE',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
  NURTURE_30_DAY = 'NURTURE_30_DAY',    // NEW
  NURTURE_90_DAY = 'NURTURE_90_DAY',    // NEW
}
```

**Step 2: Add next action fields to Lead model**

Edit `backend/prisma/schema.prisma`, add to Lead model:
```prisma
  // Next Action tracking
  nextActionType        String?
  nextActionDescription String?
  nextActionDueDate     DateTime?

  // Archive support
  isArchived            Boolean   @default(false)
  archivedAt            DateTime?
  archiveReason         String?
```

**Step 3: Add index for next action queries**

Add to Lead model indexes:
```prisma
  @@index([nextActionDueDate])
  @@index([isArchived])
```

**Step 4: Create migration**

Run:
```bash
cd backend
pnpm exec prisma migrate dev --name add_lifecycle_fields
```

Expected: Migration created and applied successfully

**Step 5: Commit schema changes**

```bash
git add shared/types/index.ts backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "feat: add lifecycle management fields to schema

- Add NURTURE_30_DAY and NURTURE_90_DAY stages
- Add nextActionType, nextActionDescription, nextActionDueDate to Lead
- Add isArchived, archivedAt, archiveReason to Lead
- Add indexes for nextActionDueDate and isArchived"
```

### Task 2: Create Lead Action Service

**Files:**
- Create: `backend/src/services/leadActionService.ts`
- Modify: `backend/src/services/reportService.ts` (update stage filters)

**Step 1: Create leadActionService.ts**

Create `backend/src/services/leadActionService.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import { Stage, ActivityType } from '@leadoff/types'

const prisma = new PrismaClient()

export interface CloseAsWonInput {
  leadId: string
  notes: string
}

export interface CloseAsLostInput {
  leadId: string
  competitorName: string
  reason: string
  notes: string
}

export interface MoveToNurtureInput {
  leadId: string
  nurturePeriod: 30 | 90
  notes: string
}

export async function closeAsWon(input: CloseAsWonInput) {
  const { leadId, notes } = input

  // Update lead to CLOSED_WON
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      currentStage: Stage.CLOSED_WON,
      nextActionType: ActivityType.TASK,
      nextActionDescription: 'Complete handoff workflow',
      nextActionDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  // Create activity record
  await prisma.activity.create({
    data: {
      leadId,
      type: ActivityType.NOTE,
      subject: 'Deal Closed - Won',
      notes,
      completed: true,
      completedAt: new Date(),
    },
  })

  // Create stage history
  await prisma.stageHistory.create({
    data: {
      leadId,
      fromStage: lead.currentStage,
      toStage: Stage.CLOSED_WON,
      note: notes,
    },
  })

  return lead
}

export async function closeAsLost(input: CloseAsLostInput) {
  const { leadId, competitorName, reason, notes } = input

  // Update lead to CLOSED_LOST
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      currentStage: Stage.CLOSED_LOST,
      nextActionType: ActivityType.EMAIL,
      nextActionDescription: 'Follow up to check if situation changed',
      nextActionDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    },
  })

  // Create/update lost reason
  await prisma.lostReason.upsert({
    where: { leadId },
    create: {
      leadId,
      reason,
      competitorName,
      lostDate: new Date(),
      notes,
    },
    update: {
      reason,
      competitorName,
      lostDate: new Date(),
      notes,
    },
  })

  // Create activity record
  await prisma.activity.create({
    data: {
      leadId,
      type: ActivityType.NOTE,
      subject: 'Deal Closed - Lost',
      notes: `Lost to: ${competitorName}\nReason: ${reason}\n\n${notes}`,
      completed: true,
      completedAt: new Date(),
    },
  })

  // Create stage history
  await prisma.stageHistory.create({
    data: {
      leadId,
      fromStage: lead.currentStage,
      toStage: Stage.CLOSED_LOST,
      note: notes,
    },
  })

  return lead
}

export async function moveToNurture(input: MoveToNurtureInput) {
  const { leadId, nurturePeriod, notes } = input

  const newStage = nurturePeriod === 30 ? Stage.NURTURE_30_DAY : Stage.NURTURE_90_DAY
  const followUpDate = new Date(Date.now() + nurturePeriod * 24 * 60 * 60 * 1000)

  // Update lead to nurture stage
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      currentStage: newStage,
      nextActionType: ActivityType.EMAIL,
      nextActionDescription: 'Check in to see if timing has improved',
      nextActionDueDate: followUpDate,
      nextFollowUpDate: followUpDate,
    },
  })

  // Create activity record
  await prisma.activity.create({
    data: {
      leadId,
      type: ActivityType.NOTE,
      subject: `Moved to Nurture (${nurturePeriod} days)`,
      notes,
      completed: true,
      completedAt: new Date(),
    },
  })

  // Create stage history
  await prisma.stageHistory.create({
    data: {
      leadId,
      fromStage: lead.currentStage,
      toStage: newStage,
      note: notes,
    },
  })

  return lead
}
```

**Step 2: Update reportService to exclude nurture stages**

Edit `backend/src/services/reportService.ts`, update stage filters:
```typescript
// Replace all instances of:
where: {
  currentStage: {
    notIn: [Stage.CLOSED_WON, Stage.CLOSED_LOST],
  },
}

// With:
where: {
  currentStage: {
    notIn: [Stage.CLOSED_WON, Stage.CLOSED_LOST, Stage.NURTURE_30_DAY, Stage.NURTURE_90_DAY],
  },
}
```

**Step 3: Commit service changes**

```bash
git add backend/src/services/leadActionService.ts backend/src/services/reportService.ts
git commit -m "feat: add lead action service for Won/Lost/Nurture

- closeAsWon creates handoff workflow next action
- closeAsLost requires competitor and reason, sets 6-month follow-up
- moveToNurture supports 30 or 90 day options
- All actions create activity and stage history records
- Update reports to exclude nurture stages from active pipeline"
```

### Task 3: Create Lead Action API Endpoints

**Files:**
- Create: `backend/src/api/routes/leadActions.ts`
- Modify: `backend/src/server.ts`

**Step 1: Create leadActions route file**

Create `backend/src/api/routes/leadActions.ts`:
```typescript
import { FastifyInstance } from 'fastify'
import {
  closeAsWon,
  closeAsLost,
  moveToNurture,
  CloseAsWonInput,
  CloseAsLostInput,
  MoveToNurtureInput,
} from '../../services/leadActionService'

export async function leadActionRoutes(fastify: FastifyInstance) {
  // Close as Won
  fastify.post('/api/v1/leads/:id/close-won', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { notes } = request.body as { notes: string }

    if (!notes || notes.trim().length === 0) {
      return reply.code(400).send({ error: 'Notes are required' })
    }

    const input: CloseAsWonInput = { leadId: id, notes }
    const lead = await closeAsWon(input)
    return reply.code(200).send(lead)
  })

  // Close as Lost
  fastify.post('/api/v1/leads/:id/close-lost', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { competitorName, reason, notes } = request.body as {
      competitorName: string
      reason: string
      notes: string
    }

    if (!competitorName || !reason || !notes) {
      return reply.code(400).send({
        error: 'competitorName, reason, and notes are required',
      })
    }

    const input: CloseAsLostInput = {
      leadId: id,
      competitorName,
      reason,
      notes,
    }
    const lead = await closeAsLost(input)
    return reply.code(200).send(lead)
  })

  // Move to Nurture
  fastify.post('/api/v1/leads/:id/nurture', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { nurturePeriod, notes } = request.body as {
      nurturePeriod: 30 | 90
      notes: string
    }

    if (!notes || notes.trim().length === 0) {
      return reply.code(400).send({ error: 'Notes are required' })
    }

    if (nurturePeriod !== 30 && nurturePeriod !== 90) {
      return reply.code(400).send({
        error: 'nurturePeriod must be 30 or 90',
      })
    }

    const input: MoveToNurtureInput = {
      leadId: id,
      nurturePeriod,
      notes,
    }
    const lead = await moveToNurture(input)
    return reply.code(200).send(lead)
  })
}
```

**Step 2: Register routes in server.ts**

Edit `backend/src/server.ts`, add import and register:
```typescript
import { leadActionRoutes } from './api/routes/leadActions'

// In the async function, after other route registrations:
await fastify.register(leadActionRoutes)
```

**Step 3: Test endpoints manually**

Start backend:
```bash
cd backend
pnpm dev
```

Test with curl (replace {leadId} with actual ID):
```bash
# Test close as won
curl -X POST http://localhost:3000/api/v1/leads/{leadId}/close-won \
  -H "Content-Type: application/json" \
  -d '{"notes":"Great deal! Customer signed contract."}'

# Test close as lost
curl -X POST http://localhost:3000/api/v1/leads/{leadId}/close-lost \
  -H "Content-Type: application/json" \
  -d '{"competitorName":"Competitor Inc","reason":"PRICE","notes":"Price too high"}'

# Test nurture
curl -X POST http://localhost:3000/api/v1/leads/{leadId}/nurture \
  -H "Content-Type: application/json" \
  -d '{"nurturePeriod":30,"notes":"Not ready now, follow up next month"}'
```

Expected: 200 OK with updated lead object

**Step 4: Commit API endpoints**

```bash
git add backend/src/api/routes/leadActions.ts backend/src/server.ts
git commit -m "feat: add API endpoints for lead actions

- POST /api/v1/leads/:id/close-won
- POST /api/v1/leads/:id/close-lost
- POST /api/v1/leads/:id/nurture
- Input validation for required fields
- Returns updated lead object"
```

### Task 4: Create React Hooks for Lead Actions

**Files:**
- Create: `frontend/src/services/leadActionHooks.ts`

**Step 1: Create lead action hooks**

Create `frontend/src/services/leadActionHooks.ts`:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

interface CloseAsWonInput {
  leadId: string
  notes: string
}

interface CloseAsLostInput {
  leadId: string
  competitorName: string
  reason: string
  notes: string
}

interface MoveToNurtureInput {
  leadId: string
  nurturePeriod: 30 | 90
  notes: string
}

export function useCloseAsWon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CloseAsWonInput) => {
      return await api.post(`/leads/${input.leadId}/close-won`, {
        notes: input.notes,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useCloseAsLost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CloseAsLostInput) => {
      return await api.post(`/leads/${input.leadId}/close-lost`, {
        competitorName: input.competitorName,
        reason: input.reason,
        notes: input.notes,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useMoveToNurture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: MoveToNurtureInput) => {
      return await api.post(`/leads/${input.leadId}/nurture`, {
        nurturePeriod: input.nurturePeriod,
        notes: input.notes,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
```

**Step 2: Commit hooks**

```bash
git add frontend/src/services/leadActionHooks.ts
git commit -m "feat: add React hooks for lead actions

- useCloseAsWon mutation hook
- useCloseAsLost mutation hook
- useMoveToNurture mutation hook
- Auto-invalidate leads and reports on success"
```

### Task 5: Create Action Modal Components

**Files:**
- Create: `frontend/src/components/modals/CloseAsWonModal.tsx`
- Create: `frontend/src/components/modals/CloseAsLostModal.tsx`
- Create: `frontend/src/components/modals/MoveToNurtureModal.tsx`

**Step 1: Create CloseAsWonModal**

Create `frontend/src/components/modals/CloseAsWonModal.tsx`:
```typescript
import { useState } from 'react'
import { useCloseAsWon } from '../../services/leadActionHooks'

interface CloseAsWonModalProps {
  leadId: string
  companyName: string
  isOpen: boolean
  onClose: () => void
}

export function CloseAsWonModal({
  leadId,
  companyName,
  isOpen,
  onClose,
}: CloseAsWonModalProps) {
  const [notes, setNotes] = useState('')
  const closeAsWon = useCloseAsWon()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notes.trim()) return

    await closeAsWon.mutateAsync({ leadId, notes })
    onClose()
    setNotes('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Close as Won - {companyName}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (required)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="Describe how the deal was won..."
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <p className="text-sm text-blue-900">
              This will:
              <ul className="list-disc ml-5 mt-1">
                <li>Mark lead as CLOSED_WON</li>
                <li>Create handoff workflow next action (7 days)</li>
                <li>Log activity with your notes</li>
              </ul>
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!notes.trim() || closeAsWon.isPending}
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {closeAsWon.isPending ? 'Saving...' : 'Close as Won'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

**Step 2: Create CloseAsLostModal**

Create `frontend/src/components/modals/CloseAsLostModal.tsx`:
```typescript
import { useState } from 'react'
import { useCloseAsLost } from '../../services/leadActionHooks'
import { LostReasonCategory } from '@leadoff/types'

interface CloseAsLostModalProps {
  leadId: string
  companyName: string
  isOpen: boolean
  onClose: () => void
}

export function CloseAsLostModal({
  leadId,
  companyName,
  isOpen,
  onClose,
}: CloseAsLostModalProps) {
  const [competitorName, setCompetitorName] = useState('')
  const [reason, setReason] = useState<string>(LostReasonCategory.PRICE)
  const [notes, setNotes] = useState('')
  const closeAsLost = useCloseAsLost()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!competitorName.trim() || !notes.trim()) return

    await closeAsLost.mutateAsync({
      leadId,
      competitorName,
      reason,
      notes,
    })
    onClose()
    setCompetitorName('')
    setReason(LostReasonCategory.PRICE)
    setNotes('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Close as Lost - {companyName}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competitor (or "Unknown")
            </label>
            <input
              type="text"
              value={competitorName}
              onChange={(e) => setCompetitorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Who did they choose?"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={LostReasonCategory.PRICE}>Price</option>
              <option value={LostReasonCategory.COMPETITOR}>
                Competitor Features
              </option>
              <option value={LostReasonCategory.NO_RESPONSE}>No Response</option>
              <option value={LostReasonCategory.NOT_QUALIFIED}>
                Not Qualified
              </option>
              <option value={LostReasonCategory.TIMING}>Timing</option>
              <option value={LostReasonCategory.OTHER}>Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (required)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="What was their specific reasoning? Any other context?"
              required
            />
          </div>

          <div className="bg-yellow-50 p-3 rounded-md mb-4">
            <p className="text-sm text-yellow-900">
              This will:
              <ul className="list-disc ml-5 mt-1">
                <li>Mark lead as CLOSED_LOST</li>
                <li>Set 6-month follow-up reminder</li>
                <li>Log activity with loss details</li>
              </ul>
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !competitorName.trim() ||
                !notes.trim() ||
                closeAsLost.isPending
              }
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {closeAsLost.isPending ? 'Saving...' : 'Close as Lost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

**Step 3: Create MoveToNurtureModal**

Create `frontend/src/components/modals/MoveToNurtureModal.tsx`:
```typescript
import { useState } from 'react'
import { useMoveToNurture } from '../../services/leadActionHooks'

interface MoveToNurtureModalProps {
  leadId: string
  companyName: string
  isOpen: boolean
  onClose: () => void
}

export function MoveToNurtureModal({
  leadId,
  companyName,
  isOpen,
  onClose,
}: MoveToNurtureModalProps) {
  const [nurturePeriod, setNurturePeriod] = useState<30 | 90>(30)
  const [notes, setNotes] = useState('')
  const moveToNurture = useMoveToNurture()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notes.trim()) return

    await moveToNurture.mutateAsync({
      leadId,
      nurturePeriod,
      notes,
    })
    onClose()
    setNurturePeriod(30)
    setNotes('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          Move to Nurture - {companyName}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-up Period
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={30}
                  checked={nurturePeriod === 30}
                  onChange={() => setNurturePeriod(30)}
                  className="mr-2"
                />
                <span>30 days (short nurture)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={90}
                  checked={nurturePeriod === 90}
                  onChange={() => setNurturePeriod(90)}
                  className="mr-2"
                />
                <span>90 days (long nurture)</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (required)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="Why are we nurturing this lead? What should we focus on when we follow up?"
              required
            />
          </div>

          <div className="bg-purple-50 p-3 rounded-md mb-4">
            <p className="text-sm text-purple-900">
              This will:
              <ul className="list-disc ml-5 mt-1">
                <li>
                  Move lead to NURTURE_{nurturePeriod}_DAY stage
                </li>
                <li>Set follow-up date for {nurturePeriod} days from now</li>
                <li>Remove from active pipeline</li>
                <li>Log activity with your notes</li>
              </ul>
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!notes.trim() || moveToNurture.isPending}
              className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {moveToNurture.isPending ? 'Saving...' : 'Move to Nurture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

**Step 4: Commit modal components**

```bash
git add frontend/src/components/modals/
git commit -m "feat: add action modal components

- CloseAsWonModal with required notes
- CloseAsLostModal with competitor, reason, notes
- MoveToNurtureModal with 30/90 day options
- All show preview of what will happen
- Form validation and loading states"
```

### Task 6: Add Action Buttons to Lead Cards (Pipeline View)

**Files:**
- Modify: `frontend/src/components/LeadCard.tsx`

**Step 1: Add action menu to LeadCard**

Edit `frontend/src/components/LeadCard.tsx`, add imports and state:
```typescript
import { useState } from 'react'
import { CloseAsWonModal } from './modals/CloseAsWonModal'
import { CloseAsLostModal } from './modals/CloseAsLostModal'
import { MoveToNurtureModal } from './modals/MoveToNurtureModal'

// Inside component:
const [showActionMenu, setShowActionMenu] = useState(false)
const [showWonModal, setShowWonModal] = useState(false)
const [showLostModal, setShowLostModal] = useState(false)
const [showNurtureModal, setShowNurtureModal] = useState(false)
```

**Step 2: Add action button and dropdown**

Add to LeadCard JSX (near the top right of card):
```typescript
<div className="relative">
  <button
    onClick={(e) => {
      e.stopPropagation()
      setShowActionMenu(!showActionMenu)
    }}
    className="p-1 text-gray-500 hover:text-gray-700"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  </button>

  {showActionMenu && (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowWonModal(true)
          setShowActionMenu(false)
        }}
        className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
      >
        Close as Won
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowLostModal(true)
          setShowActionMenu(false)
        }}
        className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
      >
        Close as Lost
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowNurtureModal(true)
          setShowActionMenu(false)
        }}
        className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
      >
        Move to Nurture
      </button>
    </div>
  )}
</div>

{/* Add modals at end of component */}
<CloseAsWonModal
  leadId={lead.id}
  companyName={lead.companyName}
  isOpen={showWonModal}
  onClose={() => setShowWonModal(false)}
/>
<CloseAsLostModal
  leadId={lead.id}
  companyName={lead.companyName}
  isOpen={showLostModal}
  onClose={() => setShowLostModal(false)}
/>
<MoveToNurtureModal
  leadId={lead.id}
  companyName={lead.companyName}
  isOpen={showNurtureModal}
  onClose={() => setShowNurtureModal(false)}
/>
```

**Step 3: Commit card updates**

```bash
git add frontend/src/components/LeadCard.tsx
git commit -m "feat: add action buttons to lead cards

- Three-dot menu on each card
- Quick access to Won/Lost/Nurture actions
- Opens modals for action completion
- Prevents card click-through with stopPropagation"
```

### Task 7: Add Action Buttons to Lead Detail Page

**Files:**
- Modify: `frontend/src/pages/LeadDetail.tsx`

**Step 1: Add action button bar to LeadDetail**

Edit `frontend/src/pages/LeadDetail.tsx`, add imports and state:
```typescript
import { CloseAsWonModal } from '../components/modals/CloseAsWonModal'
import { CloseAsLostModal } from '../components/modals/CloseAsLostModal'
import { MoveToNurtureModal } from '../components/modals/MoveToNurtureModal'

// Inside component:
const [showWonModal, setShowWonModal] = useState(false)
const [showLostModal, setShowLostModal] = useState(false)
const [showNurtureModal, setShowNurtureModal] = useState(false)
```

**Step 2: Add action button bar**

Add below the lead name/title section:
```typescript
<div className="flex gap-3 mb-6">
  <button
    onClick={() => setShowWonModal(true)}
    className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
  >
    Close as Won
  </button>
  <button
    onClick={() => setShowLostModal(true)}
    className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
  >
    Close as Lost
  </button>
  <button
    onClick={() => setShowNurtureModal(true)}
    className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
  >
    Move to Nurture
  </button>
</div>

{/* Add modals at end of component */}
<CloseAsWonModal
  leadId={leadId}
  companyName={lead.companyName}
  isOpen={showWonModal}
  onClose={() => setShowWonModal(false)}
/>
<CloseAsLostModal
  leadId={leadId}
  companyName={lead.companyName}
  isOpen={showLostModal}
  onClose={() => setShowLostModal(false)}
/>
<MoveToNurtureModal
  leadId={leadId}
  companyName={lead.companyName}
  isOpen={showNurtureModal}
  onClose={() => setShowNurtureModal(false)}
/>
```

**Step 3: Commit detail page updates**

```bash
git add frontend/src/pages/LeadDetail.tsx
git commit -m "feat: add action buttons to lead detail page

- Prominent action bar at top of page
- Direct access to Won/Lost/Nurture actions
- Opens same modals as card actions
- Consistent UX across views"
```

---

## Phase 2: Planning and Import

### Task 8: Create Archive API and Service

**Files:**
- Create: `backend/src/services/archiveService.ts`
- Create: `backend/src/api/routes/archive.ts`
- Modify: `backend/src/server.ts`

**Step 1: Create archive service**

Create `backend/src/services/archiveService.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function archiveLead(leadId: string, reason?: string) {
  return await prisma.lead.update({
    where: { id: leadId },
    data: {
      isArchived: true,
      archivedAt: new Date(),
      archiveReason: reason,
    },
  })
}

export async function restoreLead(leadId: string) {
  return await prisma.lead.update({
    where: { id: leadId },
    data: {
      isArchived: false,
      archivedAt: null,
      archiveReason: null,
    },
  })
}

export async function getArchivedLeads() {
  return await prisma.lead.findMany({
    where: { isArchived: true },
    orderBy: { archivedAt: 'desc' },
  })
}

export async function deleteLead(leadId: string) {
  // Hard delete - use with caution
  return await prisma.lead.delete({
    where: { id: leadId },
  })
}
```

**Step 2: Create archive routes**

Create `backend/src/api/routes/archive.ts`:
```typescript
import { FastifyInstance } from 'fastify'
import {
  archiveLead,
  restoreLead,
  getArchivedLeads,
  deleteLead,
} from '../../services/archiveService'

export async function archiveRoutes(fastify: FastifyInstance) {
  // Get all archived leads
  fastify.get('/api/v1/archive', async (request, reply) => {
    const leads = await getArchivedLeads()
    return reply.code(200).send(leads)
  })

  // Archive a lead
  fastify.post('/api/v1/leads/:id/archive', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { reason } = request.body as { reason?: string }

    const lead = await archiveLead(id, reason)
    return reply.code(200).send(lead)
  })

  // Restore a lead
  fastify.post('/api/v1/leads/:id/restore', async (request, reply) => {
    const { id } = request.params as { id: string }

    const lead = await restoreLead(id)
    return reply.code(200).send(lead)
  })

  // Permanently delete a lead
  fastify.delete('/api/v1/leads/:id/permanent', async (request, reply) => {
    const { id } = request.params as { id: string }

    await deleteLead(id)
    return reply.code(200).send({ success: true })
  })
}
```

**Step 3: Register archive routes**

Edit `backend/src/server.ts`:
```typescript
import { archiveRoutes } from './api/routes/archive'

// Register routes:
await fastify.register(archiveRoutes)
```

**Step 4: Update lead queries to filter archived**

Edit `backend/src/api/routes/leads.ts`, update GET /api/v1/leads:
```typescript
fastify.get('/api/v1/leads', async (request, reply) => {
  const leads = await prisma.lead.findMany({
    where: { isArchived: false }, // ADD THIS
    orderBy: { createdAt: 'desc' },
    include: {
      activities: true,
      organizationInfo: true,
      demoDetails: true,
      proposal: true,
      lostReason: true,
    },
  })
  return reply.code(200).send(leads)
})
```

**Step 5: Commit archive functionality**

```bash
git add backend/src/services/archiveService.ts backend/src/api/routes/archive.ts backend/src/server.ts backend/src/api/routes/leads.ts
git commit -m "feat: add archive functionality

- Archive/restore/delete lead endpoints
- Archive service with soft delete support
- Filter archived leads from main queries
- GET /api/v1/archive to view archived leads"
```

### Task 9: Create Archive View Page

**Files:**
- Create: `frontend/src/pages/Archive.tsx`
- Modify: `frontend/src/App.tsx` (add route)
- Create: `frontend/src/services/archiveHooks.ts`

**Step 1: Create archive hooks**

Create `frontend/src/services/archiveHooks.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

export function useArchivedLeads() {
  return useQuery({
    queryKey: ['archive'],
    queryFn: async () => {
      return await api.get('/archive')
    },
  })
}

export function useArchiveLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ leadId, reason }: { leadId: string; reason?: string }) => {
      return await api.post(`/leads/${leadId}/archive`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['archive'] })
    },
  })
}

export function useRestoreLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (leadId: string) => {
      return await api.post(`/leads/${leadId}/restore`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['archive'] })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (leadId: string) => {
      return await api.delete(`/leads/${leadId}/permanent`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive'] })
    },
  })
}
```

**Step 2: Create Archive page**

Create `frontend/src/pages/Archive.tsx`:
```typescript
import { useState } from 'react'
import { useArchivedLeads, useRestoreLead, useDeleteLead } from '../services/archiveHooks'

export function Archive() {
  const { data: leads, isLoading } = useArchivedLeads()
  const restoreLead = useRestoreLead()
  const deleteLead = useDeleteLead()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  if (isLoading) {
    return <div className="p-8">Loading archived leads...</div>
  }

  const handleRestore = async (leadId: string) => {
    await restoreLead.mutateAsync(leadId)
  }

  const handleDelete = async (leadId: string) => {
    if (deleteConfirmId === leadId) {
      await deleteLead.mutateAsync(leadId)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(leadId)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Archived Leads</h1>
        <p className="mt-2 text-gray-600">
          {leads?.length || 0} archived lead(s)
        </p>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No archived leads</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Archived Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead: any) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lead.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.contactName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.currentStage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.archivedAt
                      ? new Date(lead.archivedAt).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {lead.archiveReason || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRestore(lead.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      disabled={restoreLead.isPending}
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className={`${
                        deleteConfirmId === lead.id
                          ? 'text-red-800 font-bold'
                          : 'text-red-600 hover:text-red-900'
                      }`}
                      disabled={deleteLead.isPending}
                    >
                      {deleteConfirmId === lead.id ? 'Confirm Delete?' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

**Step 3: Add archive route**

Edit `frontend/src/App.tsx`:
```typescript
import { Archive } from './pages/Archive'

// Add route:
<Route path="/archive" element={<Archive />} />
```

**Step 4: Add archive link to navigation**

Edit navigation component to include Archive link.

**Step 5: Commit archive view**

```bash
git add frontend/src/pages/Archive.tsx frontend/src/services/archiveHooks.ts frontend/src/App.tsx
git commit -m "feat: add archive view page

- Table view of archived leads
- Restore and delete actions
- Double-click confirm for permanent delete
- Hooks for archive operations"
```

### Task 10: Create Planner View

**Files:**
- Create: `frontend/src/pages/Planner.tsx`
- Create: `backend/src/api/routes/planner.ts`
- Create: `backend/src/services/plannerService.ts`
- Modify: `backend/src/server.ts`
- Modify: `frontend/src/App.tsx`

**Step 1: Create planner service**

Create `backend/src/services/plannerService.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getPlannerData() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const weekEnd = new Date(todayStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  // Overdue items
  const overdue = await prisma.lead.findMany({
    where: {
      isArchived: false,
      nextActionDueDate: {
        lt: todayStart,
      },
    },
    orderBy: { nextActionDueDate: 'asc' },
  })

  // Today's items
  const today = await prisma.lead.findMany({
    where: {
      isArchived: false,
      nextActionDueDate: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
    orderBy: { nextActionDueDate: 'asc' },
  })

  // This week's items
  const thisWeek = await prisma.lead.findMany({
    where: {
      isArchived: false,
      nextActionDueDate: {
        gte: todayEnd,
        lt: weekEnd,
      },
    },
    orderBy: { nextActionDueDate: 'asc' },
  })

  // No date set (warning)
  const noDate = await prisma.lead.findMany({
    where: {
      isArchived: false,
      currentStage: {
        notIn: ['CLOSED_WON', 'CLOSED_LOST', 'NURTURE_30_DAY', 'NURTURE_90_DAY'],
      },
      OR: [
        { nextActionDueDate: null },
        { nextFollowUpDate: null },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  })

  return {
    overdue,
    today,
    thisWeek,
    noDate,
  }
}
```

**Step 2: Create planner routes**

Create `backend/src/api/routes/planner.ts`:
```typescript
import { FastifyInstance } from 'fastify'
import { getPlannerData } from '../../services/plannerService'

export async function plannerRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/planner', async (request, reply) => {
    const data = await getPlannerData()
    return reply.code(200).send(data)
  })
}
```

**Step 3: Register planner routes**

Edit `backend/src/server.ts`:
```typescript
import { plannerRoutes } from './api/routes/planner'

await fastify.register(plannerRoutes)
```

**Step 4: Create planner hooks**

Create `frontend/src/services/plannerHooks.ts`:
```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from './api'

export function usePlannerData() {
  return useQuery({
    queryKey: ['planner'],
    queryFn: async () => {
      return await api.get('/planner')
    },
    refetchInterval: 60000, // Refresh every minute
  })
}
```

**Step 5: Create Planner page**

Create `frontend/src/pages/Planner.tsx`:
```typescript
import { Link } from 'react-router-dom'
import { usePlannerData } from '../services/plannerHooks'

export function Planner() {
  const { data, isLoading } = usePlannerData()

  if (isLoading) {
    return <div className="p-8">Loading planner...</div>
  }

  const { overdue, today, thisWeek, noDate } = data || {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Planner</h1>
        <p className="mt-2 text-gray-600">Your upcoming actions and follow-ups</p>
      </div>

      {/* Overdue Section */}
      {overdue && overdue.length > 0 && (
        <div className="mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-2">
            <h2 className="text-lg font-semibold text-red-900">
              Overdue ({overdue.length})
            </h2>
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {overdue.map((lead: any) => (
              <PlannerLeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      )}

      {/* Today Section */}
      <div className="mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-2">
          <h2 className="text-lg font-semibold text-blue-900">
            Today ({today?.length || 0})
          </h2>
        </div>
        {today && today.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {today.map((lead: any) => (
              <PlannerLeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">
            No actions due today
          </div>
        )}
      </div>

      {/* This Week Section */}
      <div className="mb-6">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-2">
          <h2 className="text-lg font-semibold text-green-900">
            This Week ({thisWeek?.length || 0})
          </h2>
        </div>
        {thisWeek && thisWeek.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {thisWeek.map((lead: any) => (
              <PlannerLeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">
            No actions this week
          </div>
        )}
      </div>

      {/* No Date Set Section */}
      {noDate && noDate.length > 0 && (
        <div className="mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-2">
            <h2 className="text-lg font-semibold text-yellow-900">
              No Date Set - Needs Attention ({noDate.length})
            </h2>
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {noDate.map((lead: any) => (
              <PlannerLeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlannerLeadRow({ lead }: { lead: any }) {
  return (
    <Link
      to={`/leads/${lead.id}`}
      className="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-900">{lead.companyName}</p>
          <p className="text-sm text-gray-600">{lead.contactName}</p>
          {lead.nextActionDescription && (
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">{lead.nextActionType}:</span>{' '}
              {lead.nextActionDescription}
            </p>
          )}
        </div>
        <div className="text-right">
          {lead.nextActionDueDate && (
            <p className="text-sm text-gray-600">
              {new Date(lead.nextActionDueDate).toLocaleDateString()}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{lead.currentStage}</p>
        </div>
      </div>
    </Link>
  )
}
```

**Step 6: Add planner route**

Edit `frontend/src/App.tsx`:
```typescript
import { Planner } from './pages/Planner'

<Route path="/planner" element={<Planner />} />
```

**Step 7: Commit planner view**

```bash
git add backend/src/services/plannerService.ts backend/src/api/routes/planner.ts backend/src/server.ts frontend/src/pages/Planner.tsx frontend/src/services/plannerHooks.ts frontend/src/App.tsx
git commit -m "feat: add planner view

- Shows overdue, today, this week, and no-date items
- Backend service organizes leads by next action due date
- Auto-refreshes every minute
- Color-coded sections (red=overdue, blue=today, green=week)
- Highlights leads with no next action set"
```

### Task 11: Create CSV Import

**Files:**
- Create: `backend/src/api/routes/import.ts`
- Create: `backend/src/services/importService.ts`
- Modify: `backend/src/server.ts`
- Modify: `backend/package.json` (add papaparse)
- Create: `frontend/src/pages/Import.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `docs/sample-leads-import.csv`

**Step 1: Install CSV parsing library**

```bash
cd backend
pnpm add papaparse
pnpm add -D @types/papaparse
```

**Step 2: Create import service**

Create `backend/src/services/importService.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import Papa from 'papaparse'
import { Stage, LeadSource, ActivityType } from '@leadoff/types'

const prisma = new PrismaClient()

interface ImportRow {
  companyName: string
  contactName: string
  phone: string
  email: string
  contactTitle?: string
  currentStage?: string
  estimatedValue?: string
  nextActionType?: string
  nextActionDescription?: string
  nextFollowUpDate?: string
  leadSource?: string
  notes?: string
}

export async function importLeadsFromCSV(csvContent: string) {
  const results = Papa.parse<ImportRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  })

  const imported: any[] = []
  const failed: { row: number; reason: string; data: ImportRow }[] = []

  for (let i = 0; i < results.data.length; i++) {
    const row = results.data[i]
    const rowNumber = i + 2 // +2 because row 1 is header, array is 0-indexed

    try {
      // Validate required fields
      if (!row.companyName || !row.contactName || !row.phone || !row.email) {
        failed.push({
          row: rowNumber,
          reason: 'Missing required fields (companyName, contactName, phone, email)',
          data: row,
        })
        continue
      }

      // Parse optional fields
      const currentStage = row.currentStage || Stage.INQUIRY
      const estimatedValue = row.estimatedValue
        ? parseFloat(row.estimatedValue)
        : null
      const leadSource = row.leadSource || LeadSource.OTHER
      const nextFollowUpDate = row.nextFollowUpDate
        ? new Date(row.nextFollowUpDate)
        : null

      // Create lead
      const lead = await prisma.lead.create({
        data: {
          companyName: row.companyName,
          contactName: row.contactName,
          phone: row.phone,
          email: row.email,
          contactTitle: row.contactTitle,
          currentStage,
          estimatedValue,
          leadSource,
          nextActionType: row.nextActionType,
          nextActionDescription: row.nextActionDescription,
          nextActionDueDate: nextFollowUpDate,
          nextFollowUpDate,
        },
      })

      // Create initial activity if notes provided
      if (row.notes && row.notes.trim().length > 0) {
        await prisma.activity.create({
          data: {
            leadId: lead.id,
            type: ActivityType.NOTE,
            subject: 'Import Notes',
            notes: row.notes,
            completed: true,
            completedAt: new Date(),
          },
        })
      }

      imported.push(lead)
    } catch (error: any) {
      failed.push({
        row: rowNumber,
        reason: error.message || 'Unknown error',
        data: row,
      })
    }
  }

  return {
    imported: imported.length,
    failed: failed.length,
    failedRows: failed,
  }
}
```

**Step 3: Create import routes**

Create `backend/src/api/routes/import.ts`:
```typescript
import { FastifyInstance } from 'fastify'
import { importLeadsFromCSV } from '../../services/importService'

export async function importRoutes(fastify: FastifyInstance) {
  fastify.post('/api/v1/leads/import', async (request, reply) => {
    const { csvContent } = request.body as { csvContent: string }

    if (!csvContent) {
      return reply.code(400).send({ error: 'csvContent is required' })
    }

    const result = await importLeadsFromCSV(csvContent)
    return reply.code(200).send(result)
  })
}
```

**Step 4: Register import routes**

Edit `backend/src/server.ts`:
```typescript
import { importRoutes } from './api/routes/import'

await fastify.register(importRoutes)
```

**Step 5: Create sample CSV file**

Create `docs/sample-leads-import.csv`:
```csv
companyName,contactName,phone,email,contactTitle,currentStage,estimatedValue,nextActionType,nextActionDescription,nextFollowUpDate,leadSource,notes
"Acme Corp","John Smith","555-0100","john@acme.com","CEO","QUALIFICATION",50000,"PHONE_CALL","Discuss pricing and timeline","2025-11-20","REFERRAL","Referred by existing customer. Very interested in enterprise plan."
"TechStart Inc","Jane Doe","555-0101","jane@techstart.com","CTO","DEMO_SCHEDULED",75000,"MEETING","Product demo scheduled","2025-11-19","WEBSITE","Submitted contact form. Looking for API integration capabilities."
"Global Solutions","Bob Johnson","555-0102","bob@global.com","VP Sales","PROPOSAL_SENT",120000,"EMAIL","Follow up on proposal questions","2025-11-21","TRADE_SHOW","Met at conference. Has budget approved for Q1."
"StartupXYZ","Alice Chen","555-0103","alice@startupxyz.com","Founder","INQUIRY",25000,"EMAIL","Send product overview","2025-11-22","PHONE","Cold call - showed interest in demo."
"Enterprise Co","David Lee","555-0104","david@enterprise.co","Director IT","OPPORTUNITY",200000,"PHONE_CALL","Schedule technical deep dive","2025-11-25","REFERRAL","Referred by partner. Large deployment potential."
```

**Step 6: Create Import page (frontend)**

Create `frontend/src/pages/Import.tsx`:
```typescript
import { useState } from 'react'
import { api } from '../services/api'

export function Import() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)

    try {
      const csvContent = await file.text()
      const response = await api.post('/leads/import', { csvContent })
      setResult(response)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import Leads</h1>
        <p className="mt-2 text-gray-600">
          Upload a CSV file to bulk import leads
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">CSV Format</h2>
        <p className="text-sm text-gray-600 mb-4">
          Download the{' '}
          <a
            href="/docs/sample-leads-import.csv"
            className="text-blue-600 hover:underline"
            download
          >
            sample CSV file
          </a>{' '}
          to see the expected format.
        </p>

        <div className="bg-gray-50 p-4 rounded-md text-xs font-mono overflow-x-auto">
          <p className="mb-2">Required fields:</p>
          <ul className="list-disc ml-5 mb-4">
            <li>companyName</li>
            <li>contactName</li>
            <li>phone</li>
            <li>email</li>
          </ul>
          <p className="mb-2">Optional fields:</p>
          <ul className="list-disc ml-5">
            <li>contactTitle</li>
            <li>currentStage (default: INQUIRY)</li>
            <li>estimatedValue</li>
            <li>nextActionType (EMAIL, PHONE_CALL, MEETING)</li>
            <li>nextActionDescription</li>
            <li>nextFollowUpDate (YYYY-MM-DD format)</li>
            <li>leadSource (default: OTHER)</li>
            <li>notes</li>
          </ul>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Upload CSV</h2>

        <div className="mb-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? 'Importing...' : 'Import Leads'}
        </button>

        {result && (
          <div className="mt-6">
            {result.error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-900 font-semibold">Import Failed</p>
                <p className="text-red-700 text-sm">{result.error}</p>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <p className="text-green-900 font-semibold">
                    Import Complete
                  </p>
                  <p className="text-green-700 text-sm">
                    Successfully imported {result.imported} lead(s)
                  </p>
                  {result.failed > 0 && (
                    <p className="text-yellow-700 text-sm mt-1">
                      {result.failed} row(s) failed
                    </p>
                  )}
                </div>

                {result.failedRows && result.failedRows.length > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <p className="text-yellow-900 font-semibold mb-2">
                      Failed Rows
                    </p>
                    {result.failedRows.map((fail: any, idx: number) => (
                      <div key={idx} className="text-sm mb-2">
                        <p className="font-semibold">Row {fail.row}:</p>
                        <p className="text-yellow-800">{fail.reason}</p>
                        <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(fail.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 7: Add import route**

Edit `frontend/src/App.tsx`:
```typescript
import { Import } from './pages/Import'

<Route path="/import" element={<Import />} />
```

**Step 8: Copy sample CSV to public folder**

```bash
cd frontend
mkdir -p public/docs
cp ../docs/sample-leads-import.csv public/docs/
```

**Step 9: Commit CSV import**

```bash
git add backend/src/services/importService.ts backend/src/api/routes/import.ts backend/src/server.ts backend/package.json frontend/src/pages/Import.tsx frontend/src/App.tsx docs/sample-leads-import.csv frontend/public/docs/
git commit -m "feat: add CSV import for leads

- Import service with papaparse
- Validates required fields (company, contact, phone, email)
- Supports all optional fields including next actions
- Creates initial activity if notes provided
- Shows import summary with failed row details
- Downloadable sample CSV file"
```

---

## Phase 3: Templates and File Attachments

### Task 12: Create Template System

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/services/templateService.ts`
- Create: `backend/src/api/routes/templates.ts`
- Create: `backend/prisma/seed-templates.ts`
- Modify: `backend/src/server.ts`

**Step 1: Add Template model to schema**

Edit `backend/prisma/schema.prisma`, add:
```prisma
model Template {
  id          String   @id @default(cuid())
  type        String   // EMAIL, PHONE_CALL, TEXT_MESSAGE
  name        String
  subject     String?
  body        String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([type])
  @@index([isActive])
}
```

**Step 2: Create migration**

```bash
cd backend
pnpm exec prisma migrate dev --name add_template_model
```

**Step 3: Create template seed file**

Create `backend/prisma/seed-templates.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTemplates() {
  const templates = [
    {
      type: 'EMAIL',
      name: 'Initial Inquiry Response',
      subject: 'Re: Your inquiry about our services',
      body: `Hi {{contactName}},

Thank you for reaching out to us at {{companyName}}!

I'd love to learn more about your needs and see how we can help. Would you be available for a brief 15-minute call this week to discuss?

Looking forward to connecting!

Best regards`,
      isActive: true,
    },
    {
      type: 'PHONE_CALL',
      name: 'Demo Scheduling Call Script',
      subject: null,
      body: `**Opening:**
Hi {{contactName}}, this is [Your Name] from [Company]. How are you today?

**Purpose:**
I'm calling to schedule a personalized demo of our platform for {{companyName}}.

**Discovery Questions:**
1. What challenges are you currently facing with [problem area]?
2. How many users would need access to the system?
3. What's your timeline for making a decision?
4. Who else should be involved in the demo?

**Schedule Demo:**
Great! I have availability [dates/times]. What works best for you?

**Closing:**
Perfect! I'll send a calendar invite with the demo link. Looking forward to showing you what we can do for {{companyName}}!`,
      isActive: true,
    },
    {
      type: 'EMAIL',
      name: 'Proposal Follow-up',
      subject: 'Following up on your proposal',
      body: `Hi {{contactName}},

I wanted to follow up on the proposal I sent over for {{companyName}}.

Have you had a chance to review it? I'd be happy to schedule a call to discuss any questions or address any concerns.

The proposal includes:
- [Key feature 1]
- [Key feature 2]
- [Key feature 3]

Total investment: {{estimatedValue}}

What questions can I answer for you?

Best regards`,
      isActive: true,
    },
    {
      type: 'TEXT_MESSAGE',
      name: 'Check-in Text',
      subject: null,
      body: `Hi {{contactName}}! Just checking in to see if you had any questions about our conversation. Let me know if you'd like to schedule a follow-up call. - [Your Name]`,
      isActive: true,
    },
    {
      type: 'PHONE_CALL',
      name: 'Lost Deal Follow-up Script',
      subject: null,
      body: `**Opening:**
Hi {{contactName}}, this is [Your Name]. I hope things are going well at {{companyName}}.

**Purpose:**
I wanted to reach out because it's been 6 months since we last spoke. I understand you went with [competitor] at the time.

**Check-in Questions:**
1. How is [competitor's solution] working out for you?
2. Are there any gaps or challenges that have come up?
3. Has anything changed in your requirements or priorities?

**Value Proposition:**
We've added [new features] that specifically address [pain points you mentioned].

**Next Steps:**
Would it make sense to schedule a quick demo to show you what's new?

**Closing:**
Great talking with you! I'll send over some information and follow up next week.`,
      isActive: true,
    },
  ]

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: 'temp-' + template.name.replace(/\s/g, '-').toLowerCase() },
      update: template,
      create: template,
    })
  }

  console.log('Templates seeded successfully')
}

seedTemplates()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Step 4: Run template seed**

```bash
cd backend
pnpm exec tsx prisma/seed-templates.ts
```

**Step 5: Create template service**

Create `backend/src/services/templateService.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTemplates(type?: string) {
  return await prisma.template.findMany({
    where: {
      isActive: true,
      ...(type && { type }),
    },
    orderBy: { name: 'asc' },
  })
}

export async function getTemplate(id: string) {
  return await prisma.template.findUnique({
    where: { id },
  })
}

export function replacePlaceholders(
  template: string,
  lead: any
): string {
  let result = template

  const replacements: Record<string, string> = {
    '{{companyName}}': lead.companyName || '',
    '{{contactName}}': lead.contactName || '',
    '{{contactTitle}}': lead.contactTitle || '',
    '{{currentStage}}': lead.currentStage || '',
    '{{estimatedValue}}': lead.estimatedValue
      ? `$${lead.estimatedValue.toLocaleString()}`
      : '',
  }

  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder, 'g'), value)
  }

  return result
}
```

**Step 6: Create template routes**

Create `backend/src/api/routes/templates.ts`:
```typescript
import { FastifyInstance } from 'fastify'
import { getTemplates, getTemplate, replacePlaceholders } from '../../services/templateService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function templateRoutes(fastify: FastifyInstance) {
  // Get all templates (optionally filtered by type)
  fastify.get('/api/v1/templates', async (request, reply) => {
    const { type } = request.query as { type?: string }
    const templates = await getTemplates(type)
    return reply.code(200).send(templates)
  })

  // Get template by ID
  fastify.get('/api/v1/templates/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const template = await getTemplate(id)

    if (!template) {
      return reply.code(404).send({ error: 'Template not found' })
    }

    return reply.code(200).send(template)
  })

  // Get template with placeholders replaced for specific lead
  fastify.get('/api/v1/templates/:id/render/:leadId', async (request, reply) => {
    const { id, leadId } = request.params as { id: string; leadId: string }

    const template = await getTemplate(id)
    if (!template) {
      return reply.code(404).send({ error: 'Template not found' })
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return reply.code(404).send({ error: 'Lead not found' })
    }

    const renderedBody = replacePlaceholders(template.body, lead)
    const renderedSubject = template.subject
      ? replacePlaceholders(template.subject, lead)
      : null

    return reply.code(200).send({
      ...template,
      body: renderedBody,
      subject: renderedSubject,
    })
  })
}
```

**Step 7: Register template routes**

Edit `backend/src/server.ts`:
```typescript
import { templateRoutes } from './api/routes/templates'

await fastify.register(templateRoutes)
```

**Step 8: Commit template system**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/ backend/prisma/seed-templates.ts backend/src/services/templateService.ts backend/src/api/routes/templates.ts backend/src/server.ts
git commit -m "feat: add template system

- Template model with type, name, subject, body
- Seed 5 initial templates (emails, calls, texts)
- Placeholder replacement (companyName, contactName, etc)
- API to get templates and render for specific lead
- GET /api/v1/templates?type=EMAIL
- GET /api/v1/templates/:id/render/:leadId"
```

### Task 13: Add Template Selector to Activity Form

**Files:**
- Create: `frontend/src/services/templateHooks.ts`
- Modify: `frontend/src/components/ActivityForm.tsx` (or equivalent)

**Step 1: Create template hooks**

Create `frontend/src/services/templateHooks.ts`:
```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from './api'

export function useTemplates(type?: string) {
  return useQuery({
    queryKey: ['templates', type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : ''
      return await api.get(`/templates${params}`)
    },
  })
}

export function useRenderedTemplate(templateId: string, leadId: string) {
  return useQuery({
    queryKey: ['templates', templateId, 'render', leadId],
    queryFn: async () => {
      return await api.get(`/templates/${templateId}/render/${leadId}`)
    },
    enabled: !!templateId && !!leadId,
  })
}
```

**Step 2: Add template selector to activity form**

Edit activity form component to include template dropdown:
```typescript
import { useState, useEffect } from 'react'
import { useTemplates, useRenderedTemplate } from '../services/templateHooks'

// Inside component:
const [selectedTemplate, setSelectedTemplate] = useState<string>('')
const { data: templates } = useTemplates(activityType) // Filter by activity type
const { data: renderedTemplate } = useRenderedTemplate(selectedTemplate, leadId)

useEffect(() => {
  if (renderedTemplate) {
    setSubject(renderedTemplate.subject || '')
    setNotes(renderedTemplate.body || '')
  }
}, [renderedTemplate])

// In JSX, add template selector:
{templates && templates.length > 0 && (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Load Template
    </label>
    <select
      value={selectedTemplate}
      onChange={(e) => setSelectedTemplate(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
    >
      <option value="">-- Select a template --</option>
      {templates.map((template: any) => (
        <option key={template.id} value={template.id}>
          {template.name}
        </option>
      ))}
    </select>
  </div>
)}
```

**Step 3: Commit template integration**

```bash
git add frontend/src/services/templateHooks.ts frontend/src/components/ActivityForm.tsx
git commit -m "feat: integrate templates into activity form

- Template selector dropdown filtered by activity type
- Auto-fills subject and notes when template selected
- Uses placeholder replacement API
- User can edit template content before saving"
```

### Task 14: Add File Upload to Proposals

**Files:**
- Modify: `backend/package.json` (add multer)
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/api/routes/proposalFiles.ts`
- Modify: `backend/src/server.ts`
- Modify: `frontend/src/pages/ProposalDetail.tsx` (or create if not exists)

**Step 1: Install multer for file uploads**

```bash
cd backend
pnpm add multer
pnpm add -D @types/multer
```

**Step 2: Update Proposal schema**

Edit `backend/prisma/schema.prisma`, add to Proposal model:
```prisma
  proposalFilePath    String?
  priceSheetPath      String?
  proposalFileName    String?
  priceSheetFileName  String?
```

**Step 3: Create migration**

```bash
cd backend
pnpm exec prisma migrate dev --name add_proposal_files
```

**Step 4: Create uploads directory**

```bash
mkdir -p backend/uploads/proposals
```

**Step 5: Create proposal file routes**

Create `backend/src/api/routes/proposalFiles.ts`:
```typescript
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const proposalId = req.params.id
    const dir = path.join(__dirname, '../../../uploads/proposals', proposalId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const fieldname = req.params.type
    const ext = path.extname(file.originalname)
    const filename = fieldname === 'proposal' ? `proposal${ext}` : `pricesheet${ext}`
    cb(null, filename)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF and Excel files allowed.'))
    }
  },
})

export async function proposalFileRoutes(fastify: FastifyInstance) {
  // Upload proposal PDF
  fastify.post('/api/v1/proposals/:id/upload-proposal', async (request, reply) => {
    const { id } = request.params as { id: string }

    return new Promise((resolve, reject) => {
      upload.single('file')(request as any, reply as any, async (err: any) => {
        if (err) {
          return reply.code(400).send({ error: err.message })
        }

        const file = (request as any).file
        if (!file) {
          return reply.code(400).send({ error: 'No file uploaded' })
        }

        await prisma.proposal.update({
          where: { id },
          data: {
            proposalFilePath: file.path,
            proposalFileName: file.originalname,
          },
        })

        reply.code(200).send({ success: true, filename: file.originalname })
      })
    })
  })

  // Upload price sheet
  fastify.post('/api/v1/proposals/:id/upload-price-sheet', async (request, reply) => {
    const { id } = request.params as { id: string }

    return new Promise((resolve, reject) => {
      upload.single('file')(request as any, reply as any, async (err: any) => {
        if (err) {
          return reply.code(400).send({ error: err.message })
        }

        const file = (request as any).file
        if (!file) {
          return reply.code(400).send({ error: 'No file uploaded' })
        }

        await prisma.proposal.update({
          where: { id },
          data: {
            priceSheetPath: file.path,
            priceSheetFileName: file.originalname,
          },
        })

        reply.code(200).send({ success: true, filename: file.originalname })
      })
    })
  })

  // Download/view proposal file
  fastify.get('/api/v1/proposals/:id/files/proposal', async (request, reply) => {
    const { id } = request.params as { id: string }

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal || !proposal.proposalFilePath) {
      return reply.code(404).send({ error: 'File not found' })
    }

    return reply.sendFile(path.basename(proposal.proposalFilePath), path.dirname(proposal.proposalFilePath))
  })

  // Download price sheet
  fastify.get('/api/v1/proposals/:id/files/price-sheet', async (request, reply) => {
    const { id } = request.params as { id: string }

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal || !proposal.priceSheetPath) {
      return reply.code(404).send({ error: 'File not found' })
    }

    return reply.sendFile(path.basename(proposal.priceSheetPath), path.dirname(proposal.priceSheetPath))
  })

  // Delete proposal file
  fastify.delete('/api/v1/proposals/:id/files/proposal', async (request, reply) => {
    const { id } = request.params as { id: string }

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal || !proposal.proposalFilePath) {
      return reply.code(404).send({ error: 'File not found' })
    }

    fs.unlinkSync(proposal.proposalFilePath)

    await prisma.proposal.update({
      where: { id },
      data: {
        proposalFilePath: null,
        proposalFileName: null,
      },
    })

    return reply.code(200).send({ success: true })
  })

  // Delete price sheet
  fastify.delete('/api/v1/proposals/:id/files/price-sheet', async (request, reply) => {
    const { id } = request.params as { id: string }

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal || !proposal.priceSheetPath) {
      return reply.code(404).send({ error: 'File not found' })
    }

    fs.unlinkSync(proposal.priceSheetPath)

    await prisma.proposal.update({
      where: { id },
      data: {
        priceSheetPath: null,
        priceSheetFileName: null,
      },
    })

    return reply.code(200).send({ success: true })
  })
}
```

**Step 6: Register proposal file routes**

Edit `backend/src/server.ts`:
```typescript
import { proposalFileRoutes } from './api/routes/proposalFiles'

await fastify.register(proposalFileRoutes)
```

**Step 7: Add Docker volume for uploads**

Edit `docker-compose.yml`:
```yaml
volumes:
  - ./backend/uploads:/app/uploads
```

**Step 8: Commit file upload backend**

```bash
git add backend/package.json backend/prisma/schema.prisma backend/prisma/migrations/ backend/src/api/routes/proposalFiles.ts backend/src/server.ts docker-compose.yml
git commit -m "feat: add proposal file upload backend

- Multer middleware for PDF and Excel uploads
- 10MB file size limit
- Files stored in /uploads/proposals/{proposalId}/
- Upload, download, delete endpoints
- Docker volume mount for persistence"
```

### Task 15: Add File Upload UI to Proposal Page

**Files:**
- Create: `frontend/src/services/proposalFileHooks.ts`
- Modify: `frontend/src/pages/ProposalDetail.tsx`

**Step 1: Create proposal file hooks**

Create `frontend/src/services/proposalFileHooks.ts`:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export function useUploadProposalFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ proposalId, file }: { proposalId: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/proposals/${proposalId}/upload-proposal`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUploadPriceSheet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ proposalId, file }: { proposalId: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/proposals/${proposalId}/upload-price-sheet`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useDeleteProposalFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ proposalId, type }: { proposalId: string; type: 'proposal' | 'price-sheet' }) => {
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/proposals/${proposalId}/files/${type}`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
```

**Step 2: Add file upload UI to proposal section**

Add to proposal detail page:
```typescript
import { useUploadProposalFile, useUploadPriceSheet, useDeleteProposalFile } from '../services/proposalFileHooks'

// Inside component:
const uploadProposal = useUploadProposalFile()
const uploadPriceSheet = useUploadPriceSheet()
const deleteFile = useDeleteProposalFile()

const handleProposalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file || !proposal.id) return

  await uploadProposal.mutateAsync({ proposalId: proposal.id, file })
}

const handlePriceSheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file || !proposal.id) return

  await uploadPriceSheet.mutateAsync({ proposalId: proposal.id, file })
}

// In JSX:
<div className="mt-6">
  <h3 className="text-lg font-semibold mb-4">Attachments</h3>

  {/* Proposal PDF */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Proposal PDF
    </label>
    {proposal.proposalFileName ? (
      <div className="flex items-center gap-4">
        <a
          href={`${API_BASE_URL}/api/v1/proposals/${proposal.id}/files/proposal`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {proposal.proposalFileName}
        </a>
        <button
          onClick={() =>
            deleteFile.mutateAsync({
              proposalId: proposal.id,
              type: 'proposal',
            })
          }
          className="text-red-600 hover:text-red-900 text-sm"
        >
          Remove
        </button>
      </div>
    ) : (
      <input
        type="file"
        accept=".pdf"
        onChange={handleProposalUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    )}
  </div>

  {/* Price Sheet Excel */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Price Sheet (Excel)
    </label>
    {proposal.priceSheetFileName ? (
      <div className="flex items-center gap-4">
        <a
          href={`${API_BASE_URL}/api/v1/proposals/${proposal.id}/files/price-sheet`}
          download
          className="text-blue-600 hover:underline"
        >
          {proposal.priceSheetFileName}
        </a>
        <button
          onClick={() =>
            deleteFile.mutateAsync({
              proposalId: proposal.id,
              type: 'price-sheet',
            })
          }
          className="text-red-600 hover:text-red-900 text-sm"
        >
          Remove
        </button>
      </div>
    ) : (
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={handlePriceSheetUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    )}
  </div>
</div>
```

**Step 3: Commit file upload UI**

```bash
git add frontend/src/services/proposalFileHooks.ts frontend/src/pages/ProposalDetail.tsx
git commit -m "feat: add proposal file upload UI

- Upload PDF proposals and Excel price sheets
- View PDF in browser, download Excel
- Remove file button with confirmation
- Shows current filenames if uploaded
- File upload progress indication"
```

---

## Phase 4: AI Integration

### Task 16: Add OpenRouter AI Service

**Files:**
- Modify: `backend/package.json` (add axios for OpenRouter API)
- Create: `backend/src/services/aiService.ts`
- Create: `backend/src/api/routes/ai.ts`
- Modify: `backend/src/server.ts`
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/.env.example`

**Step 1: Add OpenRouter API dependency**

```bash
cd backend
pnpm add axios
```

**Step 2: Update Activity schema to include AI summary**

Edit `backend/prisma/schema.prisma`, add to Activity model:
```prisma
  aiSummary   String?
```

**Step 3: Create migration**

```bash
cd backend
pnpm exec prisma migrate dev --name add_ai_summary
```

**Step 4: Add environment variable example**

Edit `backend/.env.example`:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**Step 5: Create AI service**

Create `backend/src/services/aiService.ts`:
```typescript
import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function summarizeActivityNotes(
  activityId: string
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  })

  if (!activity || !activity.notes) {
    throw new Error('Activity not found or has no notes')
  }

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: `Summarize this CRM activity note in 1-2 sentences, focusing on key outcomes and next steps:\n\n${activity.notes}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const summary = response.data.choices[0].message.content

    // Save summary to database
    await prisma.activity.update({
      where: { id: activityId },
      data: { aiSummary: summary },
    })

    return summary
  } catch (error: any) {
    console.error('OpenRouter API error:', error.response?.data || error.message)
    throw new Error('Failed to generate AI summary')
  }
}
```

**Step 6: Create AI routes**

Create `backend/src/api/routes/ai.ts`:
```typescript
import { FastifyInstance } from 'fastify'
import { summarizeActivityNotes } from '../../services/aiService'

export async function aiRoutes(fastify: FastifyInstance) {
  // Summarize activity notes
  fastify.post('/api/v1/activities/:id/summarize', async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      const summary = await summarizeActivityNotes(id)
      return reply.code(200).send({ summary })
    } catch (error: any) {
      return reply.code(500).send({ error: error.message })
    }
  })
}
```

**Step 7: Register AI routes**

Edit `backend/src/server.ts`:
```typescript
import { aiRoutes } from './api/routes/ai'

await fastify.register(aiRoutes)
```

**Step 8: Commit AI service**

```bash
git add backend/package.json backend/src/services/aiService.ts backend/src/api/routes/ai.ts backend/src/server.ts backend/prisma/schema.prisma backend/prisma/migrations/ backend/.env.example
git commit -m "feat: add OpenRouter AI service for activity summarization

- AI service using OpenRouter API with Claude 3 Haiku
- Summarizes activity notes into 1-2 sentences
- Saves summary to Activity.aiSummary field
- POST /api/v1/activities/:id/summarize endpoint
- Environment variable for API key
- ~$0.0001 per summary (very cheap)"
```

### Task 17: Add AI Summary Button to Activity Display

**Files:**
- Create: `frontend/src/services/aiHooks.ts`
- Modify: `frontend/src/components/ActivityList.tsx` (or equivalent)

**Step 1: Create AI hooks**

Create `frontend/src/services/aiHooks.ts`:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

export function useSummarizeActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityId: string) => {
      return await api.post(`/activities/${activityId}/summarize`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}
```

**Step 2: Add summarize button to activity display**

Add to activity list/detail component:
```typescript
import { useSummarizeActivity } from '../services/aiHooks'

// Inside component:
const summarizeActivity = useSummarizeActivity()

const handleSummarize = async (activityId: string) => {
  await summarizeActivity.mutateAsync(activityId)
}

// In JSX, for each activity:
{activity.notes && activity.notes.length > 200 && !activity.aiSummary && (
  <button
    onClick={() => handleSummarize(activity.id)}
    disabled={summarizeActivity.isPending}
    className="text-sm text-blue-600 hover:underline"
  >
    {summarizeActivity.isPending ? 'Summarizing...' : 'AI Summarize'}
  </button>
)}

{activity.aiSummary && (
  <div className="mt-2 p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
    <p className="text-sm font-semibold text-blue-900 mb-1">AI Summary:</p>
    <p className="text-sm text-blue-800">{activity.aiSummary}</p>
  </div>
)}
```

**Step 3: Commit AI UI**

```bash
git add frontend/src/services/aiHooks.ts frontend/src/components/ActivityList.tsx
git commit -m "feat: add AI summary button to activities

- Summarize button appears for notes >200 chars
- Shows AI-generated summary in highlighted box
- Loading state while generating
- Summary cached in database for future views"
```

---

## Final Steps

### Task 18: Update Navigation and Documentation

**Files:**
- Modify: `frontend/src/components/Navigation.tsx`
- Modify: `docs/CLAUDE.md`
- Create: `docs/CHANGELOG.md` (if not exists)

**Step 1: Add new navigation links**

Edit navigation component to include:
- Planner
- Archive
- Import

**Step 2: Update CLAUDE.md**

Add to development guidelines:
- New stages (NURTURE_30_DAY, NURTURE_90_DAY)
- Next action fields
- Template system
- File upload configuration
- AI integration setup

**Step 3: Create changelog entry**

Document all new features in CHANGELOG.md:
- Lead lifecycle management
- Action buttons (Won/Lost/Nurture)
- Next action tracking
- Communication templates
- Proposal file attachments
- Planner view
- CSV import
- Archive system
- AI-powered activity summarization

**Step 4: Commit documentation**

```bash
git add frontend/src/components/Navigation.tsx docs/CLAUDE.md docs/CHANGELOG.md
git commit -m "docs: update navigation and documentation

- Add Planner, Archive, Import to navigation
- Document new features in CLAUDE.md
- Create changelog entry for Phase 8 features"
```

### Task 19: Create Sample Data Script

**Files:**
- Create: `backend/scripts/create-sample-data.ts`

**Step 1: Create sample data script**

Create script that generates:
- 20 sample leads across all stages
- Activities with various types
- Some with next actions set
- Some overdue, some upcoming
- Sample proposals with various statuses

**Step 2: Commit sample data script**

```bash
git add backend/scripts/create-sample-data.ts
git commit -m "feat: add sample data generation script

- Creates 20 diverse sample leads
- Activities across all types
- Next actions with various due dates
- Proposals in different stages
- Useful for testing and demos"
```

### Task 20: Final Testing and Commit

**Step 1: Run full test suite**

```bash
# Backend
cd backend
pnpm test

# Frontend
cd frontend
pnpm test
```

**Step 2: Manual testing checklist**

Test all new features:
- [ ] Close lead as Won from card and detail page
- [ ] Close lead as Lost with competitor and reason
- [ ] Move lead to Nurture (30 and 90 day)
- [ ] Archive and restore leads
- [ ] Planner view shows correct sections
- [ ] CSV import with sample file
- [ ] Load template in activity form
- [ ] Upload PDF proposal and Excel price sheet
- [ ] AI summarize activity notes

**Step 3: Create final commit**

```bash
git add .
git commit -m "feat: complete Phase 8 - Lead Lifecycle Management

All features implemented and tested:
✅ Action buttons (Won/Lost/Nurture)
✅ Next action tracking
✅ Communication templates
✅ Proposal file attachments
✅ Planner view
✅ CSV import
✅ Archive system
✅ AI summarization

Ready for production deployment."
```

**Step 4: Push to remote**

```bash
git push origin HEAD:main
```

---

## Implementation Notes

**Testing Strategy:**
- Manual testing for UI interactions (modals, file uploads)
- API endpoint testing with curl
- Database migration verification
- File upload/download verification
- AI integration testing (requires OPENROUTER_API_KEY)

**Deployment Considerations:**
- Ensure Docker volume for /uploads directory
- Set OPENROUTER_API_KEY in production environment
- Test CSV import with real data
- Verify file size limits work as expected
- Check AI rate limiting for production usage

**Future Enhancements:**
- S3/cloud storage for files
- Advanced template features (stage-specific, analytics)
- More AI features (scoring, recommendations)
- Email/Slack notifications for overdue actions
- Calendar sync for planner view
