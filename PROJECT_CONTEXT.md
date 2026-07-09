# PROJECT_CONTEXT.md

> **Last updated:** 2026-07-09  
> **Project:** OmniPrep (interview-prep-platform)  
> **Maintainer note:** Update this file whenever architecture, features, or env vars change.

---

## Executive Summary

| Field | Value |
|-------|--------|
| **Project Name** | OmniPrep |
| **Package Name (root)** | `interview-prep-platform` |
| **Description** | Production-grade, AI-powered adaptive interview preparation platform — evaluates reasoning, system design, behavioral communication, and (planned) generates personalized study plans. |
| **Problem Being Solved** | Most platforms test syntax only. OmniPrep evaluates conceptual depth, trade-offs, scalability thinking, and communication — then adapts learning paths from performance data. |
| **Target Users** | **Candidates** preparing for technical interviews; **Admins** managing questions, users, and platform analytics (Phase 7). |
| **Current Completion %** | **~90% of Phases 0–5** (implementation complete); **~70% of full 8-phase MVP** (Phases 6–8 not started). Phase 5 behavioral **manual E2E verification pending**. |

**Source of truth for full product spec:** `AI_Interview_Platform_Blueprint (1).pdf` (Desktop).  
**Rebuild stack:** Next.js 14 + TypeScript + Tailwind (frontend); Express + TypeScript + ESM (backend) — *not* original blueprint's React/Redux/Vite stack.

---

## Product Vision

### Purpose

Build an adaptive AI ecosystem for interview prep: DSA with AI feedback, system design (multimodal), behavioral mock interviews (company/role-specific), full mock interviews (WebSockets), adaptive study plans, and admin tooling.

### Long-Term Vision

- Six core modules + admin dashboard operational end-to-end
- Structured AI evaluations (JSON scores) — **Google Gemini** (`gemini-2.5-flash`) via `@google/genai`
- BullMQ workers for long-running AI jobs
- Real-time mock interviews with Redis session state
- Deployed on Vercel (frontend) + Railway (API/workers/Judge0) + Neon + Upstash + Cloudinary

### Key User Journeys

1. **Sign up / login** → JWT access + refresh tokens ✅  
2. **DSA practice** → browse problems → Monaco editor → Run/Submit → Judge0 → **on-demand AI review** ✅  
3. **System design** → structured prompt → text and/or diagram → follow-up round → **on-demand final AI review** ✅  
4. **Behavioral** → company/role-specific 7-phase mock interview → resume upload → AI questions one-at-a-time → candidate Q&A → **on-demand AI review** ✅ *(code complete; manual browser E2E pending)*  
5. **Mock interview** → ~90 min live session → 20-point report *(Phase 6)*  
6. **Study plan** → generated async via BullMQ from weak topics *(Phase 7)*  
7. **Admin** → CRUD questions, users, AI cost tracking, analytics *(Phase 7)*  

---

## Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3, Zustand 5, `@monaco-editor/react` | **Active** — auth, DSA, system design, behavioral UI |
| **Backend** | Node.js, Express 4, TypeScript, ESM (`"type": "module"`) | **Active** — auth, DSA, system design, behavioral API + async pipeline |
| **Database** | PostgreSQL via **Neon** + **Prisma ORM** 6 | **Active** — **7 migrations**; DSA + SD + behavioral models |
| **Cache / queues** | **Upstash Redis** + **BullMQ** 5 + **ioredis** 5 | **Active** — DSA + SD + behavioral evaluation cache; shared `ai-eval-queue` |
| **Authentication** | JWT + bcrypt + DB-stored refresh tokens | **Implemented** (Phase 1) |
| **Code execution** | **Judge0 CE** | **Implemented** — local Docker (`mrkushalsm/judge0`) |
| **AI** | **Google Gemini** `gemini-2.5-flash` via `@google/genai` | **DSA + SD + behavioral** in `AIService.ts` |
| **File storage** | **Cloudinary** | **SD diagrams** + **behavioral resume PDFs** (`resource_type: 'raw'`) |
| **Resume parsing** | **pdf-parse** | **PDF only**, 5 MB max — `ResumeParserService.ts` |
| **Multipart uploads** | **multer** (memory storage, 5 MB) | SD `diagram`; behavioral `resume` |
| **Real-time** | Socket.io (planned) | Not started (Phase 6) |
| **Deployment** | Vercel, Railway, Neon, Upstash, Cloudinary | Not started (Phase 8) |
| **Monorepo** | npm workspaces (`apps/frontend`, `apps/backend`) | Active |

### Frontend state management

- **Zustand** (`authStore`) — auth session persisted to `localStorage` (`omniprep-auth`)  
- Client components for auth, home, DSA, system design, and behavioral pages  
- Routes: `/`, `/login`, `/signup`, `/problems`, `/problems/[id]`, `/system-design`, `/system-design/[id]`, **`/behavioral`**, **`/behavioral/[id]`**  
- Shared UI primitives in `globals.css` (`btn-primary`, `card`, `badge-easy`, etc.)

---

## Architecture Overview

### Frontend Architecture

```
apps/frontend/
├── src/app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing — DSA + SD + Behavioral CTAs
│   ├── globals.css
│   ├── (auth)/login, signup
│   ├── problems/
│   │   ├── page.tsx                # DSA problem bank
│   │   └── [id]/page.tsx           # Monaco + Run/Submit + Generate AI Review
│   ├── system-design/
│   │   ├── page.tsx                # SD question bank (filters, pagination)
│   │   └── [id]/page.tsx           # Full SD flow + AI review report
│   └── behavioral/
│       ├── page.tsx                # Behavioral bank (company/role/difficulty filters)
│       └── [id]/page.tsx           # 7-phase interview + transcript + AI review + submissions
├── src/components/MonacoEditor.tsx
├── src/lib/api/                    # auth, problems, submissions, evaluations, system-design, behavioral
├── src/store/authStore.ts
└── src/types/dsa.ts, system-design.ts, behavioral.ts
```

### Backend Architecture (modular, not MVC)

```
apps/backend/
├── prisma/
│   ├── schema.prisma               # User, Problem, DsaEvaluation, SystemDesign*, Behavioral*
│   ├── seed.ts                     # 100 DSA + 3 SD + 3 behavioral questions
│   └── migrations/                 # 7 migrations
├── src/
│   ├── server.ts                   # API + AIEvaluationWorker (if REDIS_URL)
│   ├── app.ts                      # /health, auth, problems, submissions, evaluations, system-design, behavioral
│   ├── config/env.ts, db.ts, redis.ts
│   ├── middleware/auth.middleware.ts
│   ├── types/dsa.types.ts, system-design.types.ts, behavioral.types.ts
│   ├── services/
│   │   ├── Judge0Service.ts
│   │   ├── AIService.ts            # DSA, SD, behavioral AI methods
│   │   ├── CloudinaryService.ts    # SD diagrams + behavioral resumes
│   │   ├── ResumeParserService.ts  # PDF text extraction
│   │   ├── CacheService.ts         # DSA + SD + behavioral evaluation cache (7-day TTL)
│   │   ├── QueueService.ts         # DSA + SD + behavioral jobs on ai-eval-queue
│   │   └── problem-runner/
│   ├── modules/
│   │   ├── auth/, problems/, submissions/, evaluations/
│   │   ├── system-design/          # Full REST module
│   │   └── behavioral/             # Full REST module (see API section)
│   └── workers/AIEvaluationWorker.ts   # evaluate-dsa + evaluate-system-design + evaluate-behavioral
```

**Principle:** Controllers thin; business logic in services; workers decoupled from HTTP.

### DSA Code Execution Flow (Phase 2 — complete)

```
Browser → POST /api/submissions → problem-runner wrap → Judge0 → Store Submission
```

No AI on submission.

### DSA AI Evaluation Flow (Phase 3 — complete)

```
Generate AI Review → POST /api/evaluations/:submissionId
  → DB hit | Redis cache | BullMQ → AIEvaluationWorker (evaluate-dsa) → evaluateDSA → DsaEvaluation
  → Frontend polls GET /api/evaluations/:submissionId
```

### System Design Flow (Phase 4 — complete)

```
1. GET /api/system-design/questions/:idOrSlug     → structured prompt
2. POST /api/system-design/submissions            → multipart: questionId, textAnswer?, diagram? (Cloudinary)
3. POST /api/system-design/submissions/:id/follow-ups/generate
   → generateSystemDesignFollowUps() (sync Gemini, multimodal if diagram) → 2 followUpQuestions
4. PATCH /api/system-design/submissions/:id/follow-ups → submit 2 followUpAnswers
5. Generate AI Review → POST /api/system-design/evaluations/:id
   → DB hit | Redis cache (omniprep:sd-evaluation:*) | BullMQ (evaluate-system-design)
   → AIEvaluationWorker → evaluateSystemDesign → SystemDesignEvaluation
   → Frontend polls GET /api/system-design/evaluations/:id
```

**User input rule:** At least **text or diagram** on initial submit (both allowed).  
**Final review rule:** Requires follow-up answers submitted first.  
**Scoring:** Gemini returns dynamic `metricScores` keyed by `evaluationMetrics[].id`; server computes weighted `overallScore` via `computeOverallScore()`.

### Behavioral Interview Flow (Phase 5 — code complete)

**Design (locked — not a simple STAR chatbot):** Each `BehavioralQuestion` is tied to **companyName + roleName + difficulty**. Seven seeded phases in `phases` JSON:

| # | Phase | AI questions | Notes |
|---|-------|--------------|-------|
| 1 | `INTRODUCTION` | 0 | Seeded `statement`; **resume PDF upload** required to start |
| 2 | `ICE_BREAKER` | 2 | One AI question at a time |
| 3 | `RESUME_DEEP_DIVE` | 3 | Resume-aware |
| 4 | `CORE_BEHAVIORAL` | 3 | Company/role-specific |
| 5 | `COMPANY_VALUES` | 2 | Company/role-specific |
| 6 | `CANDIDATE_QUESTIONS` | 0 | User asks **all questions at once**; AI replies as company interviewer |
| 7 | `WRAP_UP` | 0 | Seeded `statement` |

**Session rules:**
- `POST /sessions` with multipart `resume` → parses PDF, uploads to Cloudinary, sets `currentPhaseIndex: 1` (intro skipped after upload)
- **Next question:** `POST /sessions/:id/next-question` — sync Gemini, one question per call; follow-ups count toward phase `totalQuestions`
- **Answer:** `PATCH /sessions/:id/turns/:turnId` — must answer before next question
- **Candidate phase:** `POST /sessions/:id/candidate-questions` → AI reply → session `COMPLETED`, advances to `WRAP_UP`
- **AI review:** on-demand only after `COMPLETED`; **not** auto-triggered

```
Generate AI Review → POST /api/behavioral/evaluations/:id  (:id = sessionId)
  → DB hit | Redis cache (omniprep:behavioral-evaluation:*) | BullMQ (evaluate-behavioral)
  → AIEvaluationWorker → evaluateBehavioral → BehavioralEvaluation
  → Frontend polls GET /api/behavioral/evaluations/:id
```

**Evaluation lookup order:** **DB → Redis → Queue** (same pattern as DSA/SD).

**Queue job IDs:** `dsa-eval-{submissionId}` / `sd-eval-{submissionId}` / `behavioral-eval-{sessionId}` on shared queue `ai-eval-queue`.

### Judge0 Architecture

```
Development: JUDGE0_BASE_URL=http://localhost:2358 → docker-compose.judge0.yml
Production (Phase 8): Railway-hosted Judge0 CE
```

---

## Database Architecture (Prisma on Neon)

**Implemented models:** `User`, `RefreshToken`, `Problem`, `TestCase`, `Submission`, `DsaEvaluation`, `SystemDesignQuestion`, `SystemDesignSubmission`, `SystemDesignEvaluation`, **`BehavioralQuestion`**, **`BehavioralSession`**, **`BehavioralTurn`**, **`BehavioralEvaluation`** (+ enums).

**Migrations:**

| Migration | Purpose |
|-----------|---------|
| `20260602154035_init` | `User`, `RefreshToken` |
| `20260604160104_require_user_name` | `User.name` NOT NULL |
| `20260604205409_add_dsa_models` | `Problem`, `TestCase`, `Submission` |
| `20260620173002_add_dsa_evaluation` | `DsaEvaluation` (`@@map("DSAEvaluation")`) |
| `20260626090305_add_system_design` | System design question/submission/evaluation tables |
| `20260628053657_add_system_design_scale_factors` | `scaleFactors` on `SystemDesignQuestion` |
| `20260705113944_add_behavioral_module` | Behavioral question/session/turn/evaluation + enums |

**Seed data:**

- **100** published DSA problems, **1000** test cases  
- **3** system design questions: `design-url-shortener`, `design-instagram-feed`, `design-rate-limiter`
- **3** behavioral questions: `google-software-engineer-behavioral`, `amazon-sde-behavioral`, `microsoft-software-engineer-behavioral`

### `BehavioralQuestion` (key fields)

| Field | Type | Notes |
|-------|------|-------|
| `companyName`, `roleName` | String | Drive AI question specificity |
| `phases` | Json | 7 phases — Zod-validated in `behavioral.types.ts` |
| `difficulty` | `Difficulty` enum | EASY / MEDIUM / HARD |

### `BehavioralSession`

| Field | Notes |
|-------|-------|
| `resumeUrl`, `resumeFileName`, `resumeMimeType`, `resumeText` | PDF upload + parsed text |
| `currentPhaseIndex` | Starts at **1** after session create (ice-breaker) |
| `status` | `IN_PROGRESS` \| `COMPLETED` |

### `BehavioralTurn`

| Field | Notes |
|-------|-------|
| `phaseType` | `BehavioralPhaseType` enum |
| `questionText`, `candidateAnswerText?`, `interviewerReplyText?` | Transcript |
| `isFollowUp` | Follow-ups count toward phase quota |

### `BehavioralEvaluation`

| Field | Notes |
|-------|-------|
| `evaluationMetrics` | Json — see metrics below |
| `strongestAnswer`, `weakestAnswer` | Json `AnswerHighlight` |
| `strengths`, `weaknesses`, `suggestions` | string arrays |
| `summary` | Narrative |
| `model`, `tokensUsed` | Gemini metadata |

**`evaluationMetrics` scores (0–100 except STAR components 0–25 each, summing to `starStructure.overall`):**  
`overallScore`, `communication`, `starStructure` (overall + situation/task/action/result), `ownership`, `leadership`, `problemSolving`, `technicalDepth`, `impact`, `authenticity`, `confidence`

### Planned models (not in schema)

`AIUsageLog`, `MockInterview`, `MockInterviewReport`, `TopicPerformance`, `StudyPlan`

---

## API Documentation

### Behavioral — `/api/behavioral` (Bearer required)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/questions` | Paginated bank; filters: `company`, `role`, `difficulty`, `search`; returns `filterOptions` |
| `GET` | `/questions/:idOrSlug` | Full question detail with `phases` |
| `POST` | `/sessions` | Multipart: `questionId`, `resume` (PDF) → creates session |
| `GET` | `/sessions/me` | User session history (`?questionId`) |
| `GET` | `/sessions/:id` | Session + turns |
| `POST` | `/sessions/:id/next-question` | Generate next AI question (sync Gemini) |
| `PATCH` | `/sessions/:id/turns/:turnId` | Body: `{ answer }` |
| `POST` | `/sessions/:id/candidate-questions` | Body: `{ questions }` — AI interviewer reply |
| `POST` | `/evaluations/:id` | Request AI review — `200` completed or `202` pending (`:id` = **sessionId**) |
| `GET` | `/evaluations/:id` | Poll/fetch evaluation report |

### System Design — `/api/system-design` (Bearer required)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/questions` | Paginated question bank (filter: difficulty, topic, search) |
| `GET` | `/questions/:idOrSlug` | Full question detail |
| `POST` | `/submissions` | Multipart: `questionId`, optional `textAnswer`, optional `diagram` file → Cloudinary |
| `GET` | `/submissions/me` | User submission history |
| `GET` | `/submissions/:id` | Single submission + follow-up state |
| `POST` | `/submissions/:id/follow-ups/generate` | Gemini generates 2 follow-up questions (sync) |
| `PATCH` | `/submissions/:id/follow-ups` | Body: `{ answers: [string, string] }` |
| `POST` | `/evaluations/:id` | Request final AI review — `200` completed or `202` pending (`:id` = submissionId) |
| `GET` | `/evaluations/:id` | Poll/fetch final report |

### DSA Evaluations — `/api/evaluations` (Bearer required)

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/:submissionId` | Request DSA AI review |
| `GET` | `/:submissionId` | Poll/fetch DSA evaluation |

### DSA Submissions, Problems, Auth, Health

Mount points in `app.ts`: `/api/auth`, `/api/problems`, `/api/submissions`, `/api/evaluations`, `/api/system-design`, **`/api/behavioral`**, `/api/me`, `/health`.

---

## Features Tracker

| Feature | Status | Progress % | Notes |
|---------|--------|------------|-------|
| Monorepo + scaffold | Completed | 100% | |
| Authentication | Completed | 95% | Optional refresh-on-401 UX |
| DSA module + Judge0 + UI | Completed | 100% | |
| AI evaluation pipeline (DSA) | Completed | 95% | E2E tested; `AIUsageLog` optional |
| System design — backend API | Completed | 100% | Full REST + cache/queue/worker |
| System design — frontend | Completed | 95% | Bank + practice + AI report UI; minor display bug |
| **Behavioral — backend API** | **Completed** | **100%** | Full REST + resume parse + cache/queue/worker |
| **Behavioral — frontend** | **Completed** | **95%** | Bank + 7-phase interview + AI report; E2E pending |
| Mock interview | Not Started | 0% | Phase 6 |
| Admin + adaptive engine | Not Started | 0% | Phase 7 |
| Deployment | Not Started | 0% | Phase 8 |
| README | Not Started | 0% | `.env.example` exists at repo root |

---

## External Services

| Service | Purpose | Status |
|---------|---------|--------|
| **Neon** | PostgreSQL | Connected — 7 migrations |
| **Upstash Redis** | Cache + BullMQ | Connected — DSA + SD + behavioral evaluations |
| **Google Gemini** | DSA + SD + behavioral AI | Integrated (`gemini-2.5-flash`) |
| **Judge0 CE** | Code execution | Local Docker `:2358` |
| **Cloudinary** | SD diagrams + behavioral resumes | Integrated — requires env vars |
| **Socket.io** | Mock interviews | Not integrated |

---

## Environment Variables

### `apps/backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Default `4000` |
| `DATABASE_URL` | Yes | Neon PostgreSQL |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Yes | min 32 chars |
| `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY` | Yes | e.g. `15m`, `7d` |
| `FRONTEND_URL` | Yes | CORS origin |
| `JUDGE0_BASE_URL` | Yes | Dev: `http://localhost:2358` |
| `JUDGE0_API_KEY` | Optional | Empty for local CE |
| `REDIS_URL` | For AI async | Upstash `rediss://…` — worker off if unset |
| `GEMINI_API_KEY` | For AI features | Required for behavioral questions + all evaluations |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | For uploads | SD diagrams + behavioral resume PDFs |

### `apps/frontend/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | e.g. `http://localhost:4000` |

Template: root `.env.example`

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
| 2026-06-17 | Editor UX | LeetCode-style `Solution` class | Familiar pattern |
| 2026-06-17 | Code execution | `problem-runner` wraps at submit | Clean Monaco starters |
| 2026-06-17 | Judge0 Windows | `mrkushalsm/judge0` + cgroup host + LF config | Docker Desktop cgroup v2 |
| 2026-06-17 | Frontend design | Light zinc/emerald theme | User preference |
| 2026-06-20 | AI trigger (DSA) | **On-demand only** — Generate AI Review button | Saves cost |
| 2026-06-20 | AI provider | **Google Gemini** `gemini-2.5-flash` | Implemented (not blueprint GPT-4o) |
| 2026-06-20 | DSA scores | All metrics 0–100 + complexity + follow-ups | User spec |
| 2026-06-20 | Prisma DSA eval | `DsaEvaluation` + `@@map("DSAEvaluation")` | Prisma accessor ergonomics |
| 2026-06-20 | BullMQ Redis | Connection **options** object | Avoid ioredis type conflict |
| 2026-06-25 | Phase 4 priority | Skip Phase 3 `AIUsageLog` polish; start Phase 4 | User choice |
| 2026-06-25 | SD input | Text **and/or** diagram (multimodal from day one) | User spec |
| 2026-06-25 | SD flow | Initial submit → **2 follow-up Q&A** → then Generate AI Review | Two-round interview simulation |
| 2026-06-25 | SD question shape | `requirements`, `deliverables`, `constraints`, `scaleFactors`, rich `description` | Structured prompts |
| 2026-06-25 | SD scoring | `evaluationMetrics[]` with `{ id, title, weight, criteria }`; dynamic `metricScores`; server-side weighted `overallScore` | Rubric aligned to deliverables |
| 2026-06-25 | SD diagrams | Cloudinary upload via `multer` field `diagram` | Centralized storage for Gemini fetch |
| 2026-07-03 | SD async pipeline | Shared `ai-eval-queue`; job names `evaluate-dsa` / `evaluate-system-design` | Reuse BullMQ infra from Phase 3 |
| 2026-07-03 | SD cache keys | `omniprep:sd-evaluation:{sha256}` | Parity with DSA cache pattern |
| 2026-07-05 | Behavioral flow | **7-phase** company+role interview (not simple STAR chat) | User-locked design |
| 2026-07-05 | Behavioral questions | **One AI question at a time**; follow-ups count toward phase total | Realistic interview pacing |
| 2026-07-05 | Behavioral intro | Resume PDF upload gates progression; `currentPhaseIndex: 1` on create | Intro is seeded, not a turn |
| 2026-07-05 | Candidate phase | User submits all questions at once; AI answers as company interviewer | Mirrors real closing round |
| 2026-07-05 | Behavioral eval | On-demand only after `COMPLETED`; DB → Redis → Queue lookup | DSA/SD parity |
| 2026-07-05 | Behavioral resume | PDF only, 5 MB; `pdf-parse`; Cloudinary `resource_type: 'raw'` | `ResumeParserService` |
| 2026-07-05 | Behavioral multipart | Field name **`resume`** | Distinct from SD `diagram` |
| 2026-07-05 | Behavioral cache | `omniprep:behavioral-evaluation:{sha256}`; job `evaluate-behavioral` | Shared worker queue |

---

## Bug Tracker

| Bug | Severity | Status | Notes |
|-----|----------|--------|-------|
| Judge0 cgroup v2 / CRLF on Windows | High | **Fixed** | |
| Judge0 failure → generic 500 | Medium | **Fixed** | `Judge0Error` → 502/504 |
| BullMQ + ioredis type mismatch | Medium | **Fixed** | |
| SD follow-up answers show "Submitted" not text | Low | **Open** | `system-design/[id]/page.tsx` — should render `{answer}` |
| `authStore.refresh()` not wired on 401 | Low | Open | Phase 1 polish; `refresh()` exists in `lib/api/auth.ts` only |
| `prisma generate` EPERM on Windows | Medium | Open | Stop Node before generate |
| `FRONTEND_URL` vs Next port | Low | Open | 3000 vs 3001 |
| DSA/SD pages missing Behavioral nav | Low | Open | Home + behavioral pages have it; `/problems` and `/system-design` headers lack Behavioral link |
| Behavioral bank export name `behavioralPage` | Low | Open | Should be `BehavioralPage` (React convention) |

---

## Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| **Manual E2E test behavioral (browser)** | **High** | Full 7-phase flow + AI review not yet verified end-to-end |
| Fix SD follow-up answer display | Medium | One-line UI fix in practice page |
| `AIUsageLog` model + logging | Medium | Phase 3 optional remainder |
| Wire `authStore.refresh()` on 401 | Medium | |
| README with local dev instructions | Medium | `.env.example` at root only |
| Nav consistency (Behavioral on all module pages) | Low | |
| SD worker cache read before Gemini | Low | DSA worker checks Redis first; SD worker always calls Gemini then caches |

---

## Testing Status

| Type | Status | Notes |
|------|--------|-------|
| Unit tests | Not Started | |
| API integration | Not Started | |
| E2E (automated) | Not Started | |
| Manual DSA + AI review | **Done** | Phase 3 |
| Manual system design (browser) | **Done** | Phase 4 |
| Manual behavioral (browser) | **Pending** | Phase 5 code complete; awaiting full-flow verification |
| Backend `tsc --noEmit` | **Passing** | Verified 2026-07-09 |
| Frontend `tsc --noEmit` | Not verified | Run before Phase 5 sign-off |

---

## Deployment Status

| Environment | Status |
|-------------|--------|
| Development | Local monorepo + Neon + Upstash + Judge0 Docker + Cloudinary |
| Staging | Not configured |
| Production | Not configured |

---

## AI Development Rules

- Workspaces: `"frontend"`, `"backend"`  
- Backend modules: `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.validation.ts`  
- Auth route: `/api/auth/signup` (not `register`)  
- ESM imports use `.js` extension  
- Never expose `solutionCode` or hidden test I/O  
- **Do not auto-trigger AI on submission** — on-demand evaluation endpoints only  
- System design multipart field name: **`diagram`**  
- Behavioral multipart field name: **`resume`**  
- Run Prisma CLI from `apps/backend`  
- Dev process: one file at a time (learning-focused)

### Local dev (three terminals)

```bash
# Terminal 1 — Judge0 (DSA only)
docker compose -f docker-compose.judge0.yml up -d

# Terminal 2 — Backend (REDIS_URL + GEMINI_API_KEY + CLOUDINARY_* for full SD + behavioral flow)
cd apps/backend && npm run dev

# Terminal 3 — Frontend
cd apps/frontend && npm run dev
```

### Behavioral E2E checklist (manual)

1. `npx prisma migrate deploy && npm run seed` — confirm 3 behavioral questions  
2. Sign in → `/behavioral` — filters (company, role, difficulty, search)  
3. Open `google-software-engineer-behavioral` → upload PDF resume → begin  
4. Complete 10 AI questions (2+3+3+2) via Next question → answer loop  
5. Submit candidate questions → wrap-up → session `COMPLETED`  
6. Generate AI review → poll → report with STAR + metric scores  
7. Submissions history → reload past session + evaluation  
8. Re-request evaluation → instant DB short-circuit  

---

*End of PROJECT_CONTEXT.md*
