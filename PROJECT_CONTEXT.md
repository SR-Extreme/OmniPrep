# PROJECT_CONTEXT.md

> **Last updated:** 2026-06-20  
> **Project:** OmniPrep (interview-prep-platform)  
> **Maintainer note:** Update this file whenever architecture, features, or env vars change.

---

## Executive Summary

| Field | Value |
|-------|--------|
| **Project Name** | OmniPrep |
| **Package Name (root)** | `interview-prep-platform` |
| **Description** | Production-grade, AI-powered adaptive interview preparation platform — evaluates reasoning, system design, behavioral communication, and generates personalized study plans. |
| **Problem Being Solved** | Most platforms test syntax only. OmniPrep evaluates conceptual depth, trade-offs, scalability thinking, and communication — then adapts learning paths from performance data. |
| **Target Users** | **Candidates** preparing for technical interviews; **Admins** managing questions, users, and platform analytics. |
| **Current Completion %** | **~66%** (Phases 0–2 complete; **Phase 3 ~95%**; Phases 4–8 not started) |

**Source of truth for full product spec:** `AI_Interview_Platform_Blueprint (1).pdf` (Desktop).  
**Rebuild stack:** Next.js 14 + TypeScript + Tailwind (frontend); Express + TypeScript + ESM (backend) — *not* original blueprint’s React/Redux/Vite stack.

---

## Product Vision

### Purpose

Build an adaptive AI ecosystem for interview prep: DSA with AI feedback, system design (multimodal), behavioral (STAR), full mock interviews (WebSockets), adaptive study plans, and admin tooling.

### Long-Term Vision

- Six core modules + admin dashboard operational end-to-end
- Structured AI evaluations (JSON scores) — **DSA uses Google Gemini today**; blueprint target was GPT-4o multimodal for later modules
- BullMQ workers for long-running AI jobs
- Real-time mock interviews with Redis session state
- Deployed on Vercel (frontend) + Railway (API/workers/Judge0) + Neon + Upstash + Cloudinary

### Key User Journeys

1. **Sign up / login** → JWT access + refresh tokens  
2. **DSA practice** → browse problems → Monaco editor → Run/Submit → Judge0 → **on-demand AI review** (Generate AI Review button)  
3. **System design** → text + optional diagram → multimodal AI → follow-ups *(Phase 4)*  
4. **Behavioral** → STAR-style conversation with AI follow-ups *(Phase 5)*  
5. **Mock interview** → ~90 min live session → 20-point report + hiring recommendation *(Phase 6)*  
6. **Study plan** → generated async via BullMQ from weak topics *(Phase 7)*  
7. **Admin** → CRUD questions, users, AI cost tracking, analytics *(Phase 7)*  

---

## Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3, Zustand 5, `@monaco-editor/react` | **Active** — auth + DSA + AI review UI |
| **Backend** | Node.js, Express 4, TypeScript, ESM (`"type": "module"`) | **Active** — auth, problems, submissions, evaluations, workers |
| **Database** | PostgreSQL via **Neon** + **Prisma ORM** 6 | **Active** — 4 migrations; includes `DsaEvaluation` |
| **Cache / queues** | **Upstash Redis** + **BullMQ** 5 + **ioredis** 5 | **Active** — evaluation cache + `ai-eval-queue` |
| **Authentication** | JWT + bcrypt + DB-stored refresh tokens | **Implemented** (Phase 1) |
| **Code execution** | **Judge0 CE** | **Implemented** — local Docker (`mrkushalsm/judge0`); Railway planned Phase 8 |
| **AI (DSA)** | **Google Gemini** (`gemini-2.5-flash`) via `@google/genai` | **Implemented** — structured JSON evaluation |
| **File storage** | Cloudinary (planned) | Not started (Phase 4) |
| **Real-time** | Socket.io (planned) | Not started (Phase 6) |
| **Deployment** | Vercel, Railway, Neon, Upstash, Cloudinary (planned) | Not started (Phase 8) |
| **Monorepo** | npm workspaces (`apps/frontend`, `apps/backend`) | Active |
| **Local dev** | Neon + Upstash cloud; **Judge0 via Docker only** | Active |

### Frontend state management

- **Zustand** (`authStore`) — auth session persisted to `localStorage` (`omniprep-auth`)  
- Client components (`"use client"`) for auth forms, home, and all DSA pages  
- Shared UI primitives in `globals.css` (`btn-primary`, `card`, `badge-easy`, etc.)

---

## Architecture Overview

### Frontend Architecture

```
apps/frontend/
├── src/app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing — features + signed-in CTA to /problems
│   ├── globals.css                 # Tailwind layers + design system classes
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── problems/
│       ├── page.tsx                # Problem bank — filters, cards, pagination
│       └── [id]/page.tsx           # Solver — Monaco + Run/Submit + results + AI review
├── src/components/
│   └── MonacoEditor.tsx            # Dynamic import, SSR-safe
├── src/lib/api/
│   ├── client.ts                   # apiRequest, ApiError
│   ├── auth.ts
│   ├── problems.ts
│   ├── submissions.ts
│   └── evaluations.ts              # On-demand AI review API client
├── src/store/
│   └── authStore.ts
└── src/types/
    └── dsa.ts                      # Mirrors backend DSA API shapes
```

- **Design:** Light theme (zinc-50/900, emerald accent); LeetCode-like workflow, custom OmniPrep visual identity  
- **AI review UX:** Report shown **only** after user clicks **Generate AI Review** (not after Run/Submit)

### Backend Architecture (modular, not MVC)

```
apps/backend/
├── prisma/
│   ├── schema.prisma               # User, Problem, Submission, DsaEvaluation, …
│   ├── seed.ts
│   ├── migrations/                 # 4 migrations (see Database section)
│   └── seeds/                      # 100-problem spec pipeline
├── assets/json.hpp                 # C++ Judge0 bundle
├── src/
│   ├── server.ts                   # Starts API + AIEvaluationWorker (if REDIS_URL set)
│   ├── app.ts                      # /health, /api/auth, problems, submissions, evaluations
│   ├── config/
│   │   ├── env.ts
│   │   ├── db.ts
│   │   └── redis.ts                # ioredis singleton (lazy)
│   ├── middleware/auth.middleware.ts
│   ├── types/dsa.types.ts
│   ├── services/
│   │   ├── Judge0Service.ts
│   │   ├── AIService.ts            # evaluateDSA() — Gemini JSON evaluation
│   │   ├── CacheService.ts         # SHA-256 keyed Redis cache (7-day TTL)
│   │   ├── QueueService.ts         # BullMQ ai-eval-queue
│   │   └── problem-runner/         # LeetCode-style code wrapping
│   ├── modules/
│   │   ├── auth/
│   │   ├── problems/
│   │   ├── submissions/
│   │   └── evaluations/            # On-demand DSA AI review API
│   └── workers/
│       └── AIEvaluationWorker.ts   # BullMQ consumer → Gemini → DB + cache
```

**Principle:** Controllers thin; business logic in services; workers decoupled from HTTP.

### DSA Code Execution Flow (Phase 2)

```
Browser (Monaco — user edits Solution class method body only)
  → POST /api/submissions { problemId, language, sourceCode, isSampleRun? }
  → submissions.service: problem-runner wrap → Judge0 loop
  → Store Submission + testResults; update acceptanceRate on full submit
```

**No AI is triggered by submission.** Evaluation is separate (Phase 3).

### DSA AI Evaluation Flow (Phase 3 — on-demand)

```
Browser: user clicks "Generate AI Review" (full submit only)
  → POST /api/evaluations/:submissionId
  → evaluations.service:
       1. If DsaEvaluation row exists → return { status: completed, evaluation }
       2. If Redis cache hit (same problemId+language+sourceCode) → persist + return completed
       3. Else enqueue BullMQ job → return { status: pending } (HTTP 202)
  → AIEvaluationWorker (async):
       load submission → cache lookup → evaluateDSA (Gemini) → Redis cache → DsaEvaluation upsert
  → Frontend polls GET /api/evaluations/:submissionId until status === completed
```

**Reusable design:** `evaluateDSA()` in `AIService.ts` is callable from future mock-interview pipeline (Phase 6).

### Judge0 Architecture (Phase 2)

```
Development: Express → JUDGE0_BASE_URL=http://localhost:2358 → docker-compose.judge0.yml
Production (Phase 8): Railway-hosted Judge0 CE
```

### Database Architecture (Prisma on Neon)

**Implemented models:** `User`, `RefreshToken`, `Problem`, `TestCase`, `Submission`, `DsaEvaluation` (+ enums).

**Migrations applied:**

| Migration | Purpose |
|-----------|---------|
| `20260602154035_init` | `User`, `RefreshToken` |
| `20260604160104_require_user_name` | `User.name` NOT NULL |
| `20260604205409_add_dsa_models` | `Problem`, `TestCase`, `Submission` |
| `20260620173002_add_dsa_evaluation` | `DSAEvaluation` table (`DsaEvaluation` in Prisma) |

**Seed data:** 100 published problems, 1000 test cases (10 per problem: 2 visible, 8 hidden).

### API Flow (current)

```
Browser → Next.js (Zustand auth)
       → fetch NEXT_PUBLIC_API_URL
       → Express /health, /api/auth/*, /api/me, /api/problems/*, /api/submissions/*, /api/evaluations/*
       → Prisma → Neon PostgreSQL
       → problem-runner wrap → Judge0 CE (submissions)
       → BullMQ ai-eval-queue → AIEvaluationWorker → Gemini + Redis cache (evaluations)
```

### Authentication Flow (implemented)

1. `POST /api/auth/signup` → bcrypt → `User` (role `CANDIDATE`, name required)  
2. `POST /api/auth/login` → access JWT + refresh token (hashed in DB)  
3. `POST /api/auth/refresh` → rotate refresh token  
4. `POST /api/auth/logout` → revoke refresh token  
5. `authMiddleware` on protected routes  
6. `adminMiddleware` ready — no admin routes yet  

**Frontend gap:** `refresh()` exists in `auth.ts` but `authStore` does not auto-refresh on 401.

---

## Folder Structure

### Repository root

| Path | Responsibility |
|------|----------------|
| `package.json` | npm workspaces, `dev:frontend`, `dev:backend`, `build` |
| `docker-compose.judge0.yml` | Local Judge0 CE (`mrkushalsm/judge0`, cgroup host mode) |
| `infra/judge0/judge0.conf` | Judge0 config (**LF line endings required on Windows**) |
| `.gitattributes` | LF enforcement for `judge0.conf` |
| `.env.example` | Documented env template (includes `GEMINI_API_KEY`, `REDIS_URL`) |
| `PROJECT_CONTEXT.md`, `ROADMAP.md`, `SESSION_HANDOFF.md` | Project memory docs |

### `apps/backend/` — key paths

| Path | Responsibility |
|------|----------------|
| `src/modules/evaluations/` | On-demand AI review routes, controller, service, validation |
| `src/workers/AIEvaluationWorker.ts` | BullMQ worker for DSA evaluation jobs |
| `src/services/AIService.ts` | `evaluateDSA()` — Gemini structured JSON |
| `src/services/CacheService.ts` | Redis evaluation cache by code hash |
| `src/services/QueueService.ts` | `ai-eval-queue`, `enqueueAIEvaluation()` |
| `src/config/redis.ts` | Upstash ioredis client |
| `prisma/schema.prisma` | `DsaEvaluation` model (`@@map("DSAEvaluation")`) |

### `apps/frontend/` — key paths

| Path | Responsibility |
|------|----------------|
| `src/lib/api/evaluations.ts` | `requestDSAEvaluation`, `getDSAEvaluation` + types |
| `src/app/problems/[id]/page.tsx` | Solver + results + Generate AI Review + report UI |

---

## Database Documentation

### `DsaEvaluation` (table: `DSAEvaluation`)

One evaluation per submission (1:1 via unique `submissionId`).

| Field | Type | Notes |
|-------|------|-------|
| `overallScore` | Int | Holistic verdict **0–100** |
| `correctnessScore` | Int | 0–100 |
| `efficiencyScore` | Int | 0–100 |
| `codeQualityScore` | Int | 0–100 |
| `explanationScore` | Int | 0–100 |
| `complexityAnalysis` | Json | `{ detected, optimal, isOptimal, notes? }` |
| `followUpQuestions` | Json | `string[]` — interviewer-style questions |
| `feedback` | Text | Narrative summary |
| `suggestions` | Json | `string[]` — actionable improvements |
| `model` | String | e.g. `gemini-2.5-flash` |
| `tokensUsed` | Int | From Gemini `usageMetadata` |

### Planned models (not in schema)

`AIUsageLog`, `SystemDesignQuestion`, `SystemDesignSubmission`, `SystemDesignEvaluation`, `BehavioralQuestion`, `BehavioralSession`, `MockInterview`, `MockInterviewReport`, `TopicPerformance`, `StudyPlan`

---

## API Documentation

### Implemented — Evaluations (Bearer required)

| Method | Route | Purpose | Response |
|--------|-------|---------|----------|
| `POST` | `/api/evaluations/:submissionId` | Request AI review (on-demand) | `200` completed or `202` pending — `{ status, evaluation? }` |
| `GET` | `/api/evaluations/:submissionId` | Poll/fetch evaluation | `200` `{ status, evaluation? }` |

**Rules:**

- Full submissions only (`isSampleRun: false`) — sample runs return `400`  
- Owner or admin only  
- Existing DB evaluation → immediate `completed` (no Gemini call)  
- Identical code cached in Redis → persisted without Gemini call  
- Otherwise BullMQ job enqueued; worker calls Gemini  

### Implemented — Submissions (unchanged by Phase 3)

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/submissions` | Run/submit code (Judge0 only — **no AI**) |
| `GET` | `/api/submissions/me` | User history |
| `GET` | `/api/submissions/:id` | Single submission |

### Implemented — Problems, Auth, Health

See prior sections; unchanged from Phase 2 except evaluations mount in `app.ts`.

---

## Features Tracker

| Feature | Status | Progress % | Notes |
|---------|--------|------------|-------|
| Monorepo + scaffold | Completed | 100% | |
| Authentication | Completed | 95% | Optional refresh-on-401 UX |
| DSA module + Judge0 + UI | Completed | 100% | 100-problem seed, problem-runner |
| **AI evaluation pipeline (DSA)** | **Completed** | **95%** | On-demand; Gemini; BullMQ; Redis cache; UI tested |
| `AIUsageLog` | Not Started | 0% | Phase 3 optional remainder |
| System design module | Not Started | 0% | Phase 4 |
| Behavioral module | Not Started | 0% | Phase 5 |
| Mock interview | Not Started | 0% | Phase 6 |
| Admin + adaptive engine | Not Started | 0% | Phase 7 |
| Deployment | Not Started | 0% | Phase 8 |
| README | Not Started | 0% | |

---

## External Services

| Service | Purpose | Status |
|---------|---------|--------|
| **Neon** | App PostgreSQL | Connected — 4 migrations |
| **Upstash Redis** | Cache + BullMQ | Connected — used by evaluations |
| **Google Gemini API** | DSA AI evaluation | Integrated (`gemini-2.5-flash`) |
| **Judge0 CE** | Code execution | Local Docker `:2358` |
| **Cloudinary** | Diagram uploads | Not integrated |
| **Socket.io** | Mock interviews | Not integrated |

---

## Environment Variables

### `apps/backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | API port (default `4000`) |
| `DATABASE_URL` | Yes | Neon PostgreSQL |
| `JWT_ACCESS_SECRET` | Yes | min 32 chars |
| `JWT_REFRESH_SECRET` | Yes | min 32 chars |
| `JWT_ACCESS_EXPIRY` | Yes | e.g. `15m` |
| `JWT_REFRESH_EXPIRY` | Yes | e.g. `7d` |
| `FRONTEND_URL` | Yes | CORS origin |
| `JUDGE0_BASE_URL` | Yes | Dev: `http://localhost:2358` |
| `JUDGE0_API_KEY` | Optional | Empty for local CE |
| `REDIS_URL` | **Required for AI review** | Upstash `rediss://…` — worker disabled if unset |
| `GEMINI_API_KEY` | **Required for AI review** | Read at runtime by `AIService` (not yet in `env.ts` Zod schema) |

### `apps/frontend/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | e.g. `http://localhost:4000` |

---

## Decision Log

| Date | Context | Decision | Reason |
|------|---------|----------|--------|
| 2026-06-01 | Stack rebuild | Next.js + TS + Tailwind | User learning goals |
| 2026-06-01 | Workspace names | `frontend` / `backend` | User preference |
| 2026-06-01 | Backend modules | ESM + `NodeNext` | User preference |
| 2026-06-01 | Dev process | One file at a time | Learning-focused |
| 2026-06-04 | Auth UX | `signup` not `register` | User preference |
| 2026-06-04 | DSA I/O | JSON stdin/stdout | Multi-lang Judge0 consistency |
| 2026-06-04 | Problem content | 100-problem seed; admin CRUD Phase 7 | Solo dev scope |
| 2026-06-17 | Editor UX | LeetCode-style `Solution` class | Familiar interview pattern |
| 2026-06-17 | Code execution | `problem-runner` wraps at submit | Clean Monaco starters |
| 2026-06-17 | Judge0 Windows | `mrkushalsm/judge0` + cgroup host + LF config | Docker Desktop cgroup v2 |
| 2026-06-17 | Frontend design | Light zinc/emerald theme | User preference |
| 2026-06-20 | AI trigger | **On-demand only** — Generate AI Review button | No auto-AI after submit; saves cost |
| 2026-06-20 | AI provider (DSA) | **Google Gemini** `gemini-2.5-flash` via `@google/genai` | Implemented in code (blueprint originally GPT-4o) |
| 2026-06-20 | Evaluation scores | All metrics **0–100** + complexity + follow-ups | User spec for report format |
| 2026-06-20 | Prisma model name | `DsaEvaluation` with `@@map("DSAEvaluation")` | Avoid awkward `prisma.dSAEvaluation` accessor |
| 2026-06-20 | BullMQ Redis | Pass connection **options** not ioredis instance | Avoid duplicate `ioredis` type conflict with BullMQ |

---

## Bug Tracker

| Bug | Severity | Status | Notes |
|-----|----------|--------|-------|
| Judge0 cgroup v2 / CRLF on Windows | High | **Fixed** | mrkushalsm/judge0 + LF config |
| Run/Submit generic 500 on Judge0 failure | Medium | **Fixed** | `Judge0Error` → 502/504 |
| `authStore.refresh()` not wired on 401 | Low | Open | Phase 1 polish |
| `prisma generate` EPERM on Windows | Medium | Open | Stop Node before generate |
| `FRONTEND_URL` vs Next port mismatch | Low | Open | 3000 vs 3001 |
| `npm run dev` with `&` on PowerShell | Low | Open | Use two terminals |
| BullMQ + ioredis type mismatch | Medium | **Fixed** | Connection options in QueueService/Worker |

---

## Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| Add `GEMINI_API_KEY` to `env.ts` Zod schema | Medium | Currently runtime-only in AIService |
| `AIUsageLog` model + logging | Medium | Phase 3 remainder |
| Wire `authStore.refresh()` on 401 | Medium | |
| README with local dev instructions | Medium | Judge0 + Redis + Gemini + AI review flow |
| Commit untracked `evaluations.ts` + doc sync | Medium | Partial Phase 3 commits exist |
| Align blueprint docs with Gemini (or abstract `AIService` provider) | Low | Future modules may use different models |

---

## Testing Status

| Type | Status | Notes |
|------|--------|-------|
| Unit tests | Not Started | |
| API integration | Not Started | |
| E2E | Not Started | |
| Manual | **Phase 3 tested** | Auth + DSA Run/Submit + Generate AI Review E2E |

---

## Deployment Status

| Environment | Status |
|-------------|--------|
| Development | Local monorepo + Neon + Upstash + Judge0 Docker |
| Staging | Not configured |
| Production | Not configured |

---

## AI Development Rules

- Workspaces: `"frontend"`, `"backend"`  
- Backend modules: `feature.routes.ts`, `feature.controller.ts`, `feature.service.ts`  
- Auth route: `/api/auth/signup` (not `register`)  
- ESM imports use `.js` extension  
- Never expose `solutionCode` or hidden test I/O  
- User submission code wrapped by `problem-runner` — no I/O harness in Monaco starters  
- **Do not auto-trigger AI on submission** — use evaluations API on demand  
- Run Prisma CLI from `apps/backend`  

### Local dev (three terminals)

```bash
# Terminal 1 — Judge0
docker compose -f docker-compose.judge0.yml up -d

# Terminal 2 — Backend (needs REDIS_URL + GEMINI_API_KEY for AI review)
cd apps/backend && npm run dev

# Terminal 3 — Frontend
cd apps/frontend && npm run dev
```

---

*End of PROJECT_CONTEXT.md*
