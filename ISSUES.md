# LeadOff CRM - Issues Tracker

**Version**: 0.1.0 (Phase 6 Complete)
**Last Modified**: 2025-11-15
**Status**: All Issues Resolved

---

## Critical Issues

### ISSUE-001: Lead Card Click Navigation Broken
**Severity**: 🔴 **CRITICAL**
**Status**: ✅ RESOLVED
**Discovered**: 2025-11-15 during Playwright demo testing
**Resolved**: 2025-11-15
**Impact**: Users cannot view lead details via normal click workflow

**Description**:
Clicking on lead cards in multiple locations does not navigate to the lead detail page.

**Affected Components**:
1. Dashboard lead cards (`frontend/src/components/LeadCard.tsx`)
2. Pipeline Kanban cards (`frontend/src/components/DraggableLeadCard.tsx`)
3. Focus View cards (`frontend/src/components/FocusView.tsx`)

**Expected Behavior**:
- User clicks on any lead card
- Browser navigates to `/leads/{leadId}`
- Lead detail page loads with tabbed interface

**Actual Behavior**:
- Click event does not trigger navigation
- User is stuck on current page
- Manual URL construction required (unacceptable workaround)

**Root Cause**:
Lead card components missing React Router navigation handlers

**Fix Applied**:
- Added `useNavigate` hook to Dashboard component
- Added `onClick={() => navigate(`/leads/${lead.id}`)}` to Dashboard lead cards
- Added `onLeadClick={(leadId) => navigate(`/leads/${leadId}`)}` to FocusView
- Pipeline already had proper onClick handlers via PipelineBoard

**Testing**:
- [x] Test Dashboard lead card clicks - ✅ VERIFIED
- [x] Test Pipeline Kanban card clicks - ✅ VERIFIED
- [x] Test Focus View card clicks - ✅ VERIFIED
- [x] Verify with Playwright MCP automated test - ✅ VERIFIED

---

## High Priority Issues

### ISSUE-002: Environment Variable Hot-Reload Not Working
**Severity**: 🟠 **HIGH**
**Status**: ✅ RESOLVED
**Discovered**: 2025-11-15 during server configuration
**Resolved**: 2025-11-15
**Impact**: Developers must manually restart servers when changing .env files

**Description**:
Changes to `.env` files (e.g., `FRONTEND_ORIGIN`) do not trigger server restart with `tsx watch`.

**Affected Files**:
- `backend/.env`
- `backend/src/server.ts`

**Expected Behavior**:
- Developer changes `FRONTEND_ORIGIN` in `.env`
- `tsx watch` detects change and restarts server
- New environment variable value takes effect

**Actual Behavior**:
- `.env` change is ignored by `tsx watch`
- Server continues with old cached value
- Manual kill and restart required

**Fix Applied**:
1. Installed `nodemon` as dev dependency
2. Created `nodemon.json` configuration watching `src` and `.env` files
3. Updated backend `package.json` dev script to use `nodemon` instead of `tsx watch`
4. Backend now watches: `src/**/*` and `.env` with extensions `ts,js,json,env`

**Testing**:
- [x] Nodemon installed and configured
- [x] Dev script updated to use nodemon
- [x] Server starts with nodemon watching .env files

---

## Medium Priority Issues

### ISSUE-003: Multiple Backend Server Process Conflicts
**Severity**: 🟡 **MEDIUM**
**Status**: ✅ RESOLVED
**Discovered**: 2025-11-15 during demo startup
**Resolved**: 2025-11-15
**Impact**: Developers encounter "port already in use" errors frequently

**Description**:
Multiple `pnpm dev` invocations create orphaned backend processes on port 3000.

**Error Message**:
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

**Root Cause**:
No cleanup script to kill existing processes before starting new ones

**Fix Applied**:
1. Added `cleanup` script: `"lsof -ti:3000,5174 2>/dev/null | xargs kill -9 2>/dev/null || true"`
2. Updated `dev` script to run cleanup first: `"pnpm cleanup && concurrently ..."`
3. Graceful shutdown handlers already exist in server.ts (SIGINT, SIGTERM)

**Testing**:
- [x] Cleanup script added to package.json
- [x] Dev script updated to run cleanup automatically
- [x] Server starts successfully with cleanup

---

### ISSUE-004: CORS Configuration Port Mismatch
**Severity**: 🟡 **MEDIUM**
**Status**: ✅ RESOLVED
**Discovered**: 2025-11-15 during demo startup
**Resolved**: 2025-11-15
**Impact**: Frontend cannot connect to backend API

**Description**:
Backend CORS configured for port 5173 but frontend running on 5174 due to port conflict.

**Root Cause**:
1. Port 5173 occupied by another application (hAIwkTUI)
2. Hardcoded default in `backend/src/server.ts`
3. Frontend vite.config.ts port changed but backend not updated

**Fix Applied**:
1. Fixed `.env` variable name from `FRONTEND_URL` to `FRONTEND_ORIGIN` to match server.ts
2. Created `.env.example` file documenting all environment variables
3. Made frontend port configurable via `PORT` environment variable in vite.config.ts
4. Made backend API URL configurable via `VITE_API_URL` in vite.config.ts
5. Updated default FRONTEND_ORIGIN to http://localhost:5174

**Testing**:
- [x] Backend .env updated with correct variable name
- [x] .env.example created for documentation
- [x] Frontend port now configurable
- [x] CORS working correctly between frontend and backend

---

## Issue Summary

**Total Issues**: 4
**Resolved**: 4 ✅
**Open**: 0

**By Severity**:
- Critical: 1 ✅ RESOLVED
- High: 1 ✅ RESOLVED
- Medium: 2 ✅ RESOLVED
- Low: 0

---

## Resolution Checklist

Phase 6 Completion Verified:
- [x] Fix ISSUE-001 (Lead card navigation) ✅
- [x] Verify fix with Playwright MCP tests ✅
- [x] Fix ISSUE-002 (Environment hot-reload) ✅
- [x] Fix ISSUE-003 (Process cleanup) ✅
- [x] Fix ISSUE-004 (CORS configuration) ✅
- [x] Run Playwright navigation tests ✅
- [x] Update ISSUES.md with resolution notes ✅

---

## Notes

- Issues discovered during manual Playwright MCP testing session
- Demonstrates importance of testing actual user workflows, not just API functionality
- Confirms CLAUDE.md principle: "Never claim success when critical issues exist"
