# PROJECT_CONTEXT.md

> **Last updated:** 2026-06-17  
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
| **Current Completion %** | **~58%** (Phases 0–1 complete; **Phase 2 complete**; Phase 3 not started) |

**Source of truth for full product spec:** `AI_Interview_Platform_Blueprint (1).pdf` (Desktop).  
**Rebuild stack:** Next.js 14 + TypeScript + Tailwind (frontend); Express + TypeScript + ESM (backend) — *not* original blueprint’s React/Redux/Vite stack.

---

## Product Vision

### Purpose

Build an adaptive AI ecosystem for interview prep: DSA with AI feedback, system design (multimodal), behavioral (STAR), full mock interviews (WebSockets), adaptive study plans, and admin tooling.

### Long-Term Vision

- Six core modules + admin dashboard operational end-to-end
- GPT-4o for structured evaluations (JSON scores)
- BullMQ workers for long-running AI jobs
- Real-time mock interviews with Redis session state
- Deployed on Vercel (frontend) + Railway (API/workers/Judge0) + Neon + Upstash + Cloudinary

### Key User Journeys

1. **Sign up / login** → JWT access + refresh tokens  
2. **DSA practice** → browse problems → Monaco editor → Run/Submit → Judge0 → *(Phase 3)* AI evaluation → topic performance update  
3. **System design** → text + optional diagram → multimodal GPT-4o → follow-ups  
4. **Behavioral** → STAR-style conversation with AI follow-ups  
5. **Mock interview** → ~90 min live session → 20-point report + hiring recommendation  
6. **Study plan** → generated async via BullMQ from weak topics (spaced repetition)  
7. **Admin** → CRUD questions, users, AI cost tracking, analytics  

---

## Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3, Zustand 5, `@monaco-editor/react` | **Active** — auth + DSA UI (light zinc/emerald design system) |
| **Backend** | Node.js, Express 4, TypeScript, ESM (`"type": "module"`) | **Active** — auth + problems + submissions + problem-runner |
| **Database** | PostgreSQL via **Neon** + **Prisma ORM** 6 | **Active** — User, RefreshToken, Problem, TestCase, Submission |
| **Cache / queues** | **Upstash Redis** + BullMQ (planned) | URL in `.env`; not wired in code (Phase 3) |
| **Authentication** | JWT + bcrypt + DB-stored refresh tokens | **Implemented** (Phase 1) |
| **Code execution** | **Judge0 CE** | **Implemented** — local Docker dev (`mrkushalsm/judge0` on Windows); Railway planned for prod |
| **AI** | OpenAI GPT-4o (planned) | Not started (Phase 3) |
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
│       └── [id]/page.tsx           # Solver — description + Monaco + Run/Submit + results
├── src/components/
│   └── MonacoEditor.tsx            # Dynamic import, SSR-safe
├── src/lib/api/
│   ├── client.ts                   # apiRequest, ApiError
│   ├── auth.ts
│   ├── problems.ts
│   └── submissions.ts
├── src/store/
│   └── authStore.ts
└── src/types/
    └── dsa.ts                      # Mirrors backend API shapes
```

- **Design:** Light theme (zinc-50/900, emerald accent); LeetCode-like workflow, custom OmniPrep visual identity  
- **Tailwind** via `globals.css` + `tailwind.config.ts` (custom `shadow-soft`, `shadow-card`)  
- **Config:** `next.config.mjs` (Next 14.2 does **not** support `next.config.ts`)

### Backend Architecture (modular, not MVC)

```
apps/backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   ├── migrations/                 # init, require_user_name, add_dsa_models
│   └── seeds/
│       ├── specs/                  # 100 ProblemSpec definitions (batch-01…04) — seed source of truth
│       ├── problem-descriptions.ts # Long-form problem statements
│       ├── generate-json-files.ts  # specs → JSON + regenerates multi-lang batch files
│       ├── multi-lang-solutions/   # Generated reference solutions (java/cpp per slug)
│       └── problems/               # Generated JSON (gitignored)
├── assets/
│   └── json.hpp                    # Bundled for C++ Judge0 submissions (zip at runtime)
├── src/
│   ├── server.ts
│   ├── app.ts                      # /health, /api/auth, /api/problems, /api/submissions, /api/me
│   ├── config/
│   │   ├── env.ts
│   │   └── db.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── types/
│   │   └── dsa.types.ts
│   ├── services/
│   │   ├── Judge0Service.ts        # Submit, poll, base64 mode, additional_files for C++
│   │   └── problem-runner/         # LeetCode-style code wrapping at submission time
│   │       ├── parseSignature.ts   # Parse inputFormat/outputFormat → ProblemSignature
│   │       ├── starter-code.ts     # Generate Solution-class starters per language
│   │       ├── codeWrapper.ts      # Wrap user code + MiniJson (Java) + json.hpp zip (C++)
│   │       ├── exampleFormat.ts    # Human-readable example display strings
│   │       ├── methodNames.ts
│   │       └── harness/MiniJson.java
│   ├── modules/
│   │   ├── auth/
│   │   ├── problems/
│   │   └── submissions/            # Wraps code → Judge0 loop → stores results
│   ├── workers/                    # (planned) BullMQ workers
│   └── socket/                     # (planned)
```

**Principle:** Controllers thin; business logic in services; workers decoupled from HTTP.

### DSA Code Execution Flow (Phase 2)

```
Browser (Monaco — user edits Solution class method body only)
  → POST /api/submissions { problemId, language, sourceCode, isSampleRun? }
  → submissions.service:
       buildProblemSignature(slug, inputFormat, outputFormat)
       wrapSubmissionCode(sourceCode, language, signature)
  → Judge0Service.executeCode(wrapped source + optional json.hpp zip for C++)
  → Per test case: JSON stdin → compare stdout to expected JSON
  → Store Submission + testResults; update acceptanceRate on full submit
```

**Editor UX:** Candidates write **LeetCode-style** `Solution` class methods. The backend injects I/O harness (Python `main`, Java `Main` + `MiniJson`, C++ `main` + nlohmann/json) before Judge0 execution.

### Judge0 Architecture (Phase 2)

```
Development (Windows Docker Desktop / WSL2):
  Express API → JUDGE0_BASE_URL=http://localhost:2358
             → docker-compose.judge0.yml
             → image: mrkushalsm/judge0:latest  (cgroup v2 compatible)
             → cgroup: host + /sys/fs/cgroup mount
             → infra/judge0/judge0.conf (LF line endings — required on Windows)

Production (Phase 8):
  Railway API → JUDGE0_BASE_URL=https://<judge0-service>.railway.app
             → Railway-hosted Judge0 CE
```

Judge0’s internal Postgres/Redis are **separate** from Neon and Upstash.

### Database Architecture (Prisma on Neon)

**Implemented models:** `User`, `RefreshToken`, `Problem`, `TestCase`, `Submission`, enums `Role`, `Difficulty`, `ProgrammingLanguage`, `SubmissionStatus`.

**Planned (blueprint):** DSAEvaluation, SystemDesign*, Behavioral*, MockInterview*, TopicPerformance, StudyPlan, AIUsageLog — see [Database Documentation](#database-documentation).

**Migrations applied:**

| Migration | Purpose |
|-----------|---------|
| `20260602154035_init` | `User`, `RefreshToken` tables |
| `20260604160104_require_user_name` | `User.name` required (NOT NULL) |
| `20260604205409_add_dsa_models` | `Problem`, `TestCase`, `Submission` + enums |

**Seed data (Neon):** 100 published problems, 1000 test cases (10 per problem: 2 visible, 8 hidden).

### API Flow (current vs target)

**Current:**

```
Browser → Next.js (Zustand auth)
       → fetch NEXT_PUBLIC_API_URL
       → Express /health, /api/auth/*, /api/me, /api/problems/*, /api/submissions/*
       → Prisma → Neon PostgreSQL
       → problem-runner wrap → Judge0 CE (submissions only)
```

**Target (later phases):**

```
Browser → Next.js → REST /api/* → Express modules → Prisma (Neon)
                              → Socket.io /interview (mock)
                              → BullMQ workers → OpenAI, Judge0
                              → Redis (Upstash) cache + sessions
```

### Authentication Flow (implemented)

1. `POST /api/auth/signup` → bcrypt hash → `User` in DB (role `CANDIDATE`, name required)  
2. `POST /api/auth/login` → access JWT + refresh token (hashed in DB)  
3. `POST /api/auth/refresh` → rotate refresh token, issue new pair  
4. `POST /api/auth/logout` → delete refresh token row (body: `{ refreshToken }`)  
5. `authMiddleware` on protected routes — `Authorization: Bearer <accessToken>`  
6. `adminMiddleware` — checks `role === 'ADMIN'` (ready; no admin routes yet)  

**Frontend gap:** `refresh()` exists in `auth.ts` but `authStore` does not auto-refresh on 401 yet.

### DSA Problem I/O Protocol (seed + submissions)

All 100 seeded problems use **JSON stdin/stdout** at the Judge0 layer:

- **stdin:** one JSON object (e.g. `{"nums":[2,7,11,15],"target":9}`)  
- **stdout:** one JSON value (e.g. `[0,1]`)  

`ProgrammingLanguage` enum: `CPP`, `JAVA`, `PYTHON`. Judge0 language IDs in `dsa.types.ts` (54, 62, 71).

**Candidate-facing code:** LeetCode-style `Solution` class with typed method signature derived from `inputFormat` / `outputFormat` on each problem.

### Deployment Flow (planned)

| Component | Platform |
|-----------|----------|
| Frontend | Vercel |
| API + workers | Railway |
| Judge0 CE | Railway (prod); Docker locally |
| PostgreSQL (app) | Neon |
| Redis (app) | Upstash |
| Images | Cloudinary |

---

## Folder Structure

### Repository root

| Path | Responsibility |
|------|----------------|
| `package.json` | npm workspaces, `dev:frontend`, `dev:backend`, `build` |
| `docker-compose.judge0.yml` | Local Judge0 CE stack (`mrkushalsm/judge0`, cgroup host mode) |
| `infra/judge0/judge0.conf` | Judge0 CE config (dev passwords; **must use LF line endings**) |
| `.gitattributes` | Forces `infra/judge0/judge0.conf` to LF |
| `.gitignore` | Ignore `node_modules`, `.env*`, `.next`, generated seed JSON, `.vscode/` |
| `.env.example` | Documented env template |
| `PROJECT_CONTEXT.md` | This file |
| `ROADMAP.md` | Phased implementation plan |
| `SESSION_HANDOFF.md` | Per-session continuity |

### `apps/backend/`

| Path | Responsibility |
|------|----------------|
| `package.json` | ESM, Express, Prisma; scripts `seed`, `seed:generate`, `seed:validate` |
| `prisma/schema.prisma` | User, RefreshToken, Problem, TestCase, Submission |
| `prisma/seed.ts` | Upserts from `seeds/problems/*.json` |
| `prisma/seeds/specs/` | 100 `ProblemSpec` entries — primary seed source |
| `prisma/seeds/problem-descriptions.ts` | Long-form descriptions keyed by slug |
| `prisma/seeds/generate-json-files.ts` | Builds JSON + multi-lang batch files from specs |
| `assets/json.hpp` | nlohmann/json header for C++ Judge0 submissions |
| `src/services/problem-runner/` | Signature parsing, starter generation, submission wrapping |
| `src/services/Judge0Service.ts` | Judge0 client with `additional_files` support |
| `src/modules/problems/*` | List/filter + detail (strips `solutionCode`, hidden tests) |
| `src/modules/submissions/*` | Wrap code, Judge0 loop, acceptance rate, error handling |

### `apps/frontend/`

| Path | Responsibility |
|------|----------------|
| Auth pages + home | Implemented (light theme landing page) |
| `app/problems/` | List + solver pages — **implemented** |
| `components/MonacoEditor.tsx` | **Implemented** |
| `types/dsa.ts`, `lib/api/problems.ts`, `lib/api/submissions.ts` | **Implemented** |
| `globals.css` | Shared design system component classes |

---

## Database Documentation

### Implemented models (Prisma / PostgreSQL)

| Model | Purpose |
|-------|---------|
| `User` | Auth, profile, role (`ADMIN` \| `CANDIDATE`) |
| `RefreshToken` | Hashed refresh token, expiry, cascade delete |
| `Problem` | DSA bank — slug, difficulty, topics, JSON examples/starter/solution code, limits |
| `TestCase` | Per-problem I/O; `isHidden`, `order` |
| `Submission` | User code, Judge0 results, `testResults` JSON, `isSampleRun` |

### Problem JSON fields (in DB)

| Field | Type | Notes |
|-------|------|-------|
| `examples` | Json | `Example[]` — `{ input, output, explanation? }` (display strings) |
| `starterCode` | Json | `StarterCode` — `{ cpp, java, python }` — LeetCode-style `Solution` class |
| `solutionCode` | Json | `SolutionCode` — admin reference only; never returned to candidates |
| `inputFormat` | String | Used by `parseSignature` for method params |
| `outputFormat` | String | Used by `parseSignature` for return type |

### Submission JSON fields

| Field | Type | Notes |
|-------|------|-------|
| `testResults` | Json | `SubmissionTestResult[]` — hidden case I/O redacted on API response |

### Planned models (not yet in schema)

| Model | Purpose |
|-------|---------|
| `DSAEvaluation` | GPT-4o scores per submission (Phase 3) |
| `SystemDesignQuestion` / `SystemDesignSubmission` / `SystemDesignEvaluation` | Phase 4 |
| `BehavioralQuestion` / `BehavioralSession` | Phase 5 |
| `MockInterview` / `MockInterviewReport` | Phase 6 |
| `TopicPerformance` / `StudyPlan` / `AIUsageLog` | Phase 7 |

---

## API Documentation

### Implemented — Public

| Method | Route | Auth | Purpose | Response |
|--------|-------|------|---------|----------|
| `GET` | `/health` | Public | Health check | `{ status, message }` |

### Implemented — Auth

| Method | Route | Auth | Purpose | Response |
|--------|-------|------|---------|----------|
| `POST` | `/api/auth/signup` | Public | Create account | `201` `{ user, tokens }` |
| `POST` | `/api/auth/login` | Public | Login | `200` `{ user, tokens }` |
| `POST` | `/api/auth/refresh` | Public | Rotate refresh token | `200` `{ user, tokens }` |
| `POST` | `/api/auth/logout` | Public* | Revoke refresh token | `204` |
| `GET` | `/api/me` | Bearer | Current user | `200` `{ user }` |

### Implemented — Problems (Bearer required)

| Method | Route | Purpose | Query / params |
|--------|-------|---------|----------------|
| `GET` | `/api/problems` | List published (admin: all) | `?difficulty=&topic=&search=&page=&limit=` |
| `GET` | `/api/problems/:idOrSlug` | Problem detail | id or slug; visible test cases only for candidates |

**Never exposed to candidates:** `solutionCode`, hidden test case inputs/outputs.

### Implemented — Submissions (Bearer required)

| Method | Route | Purpose | Body / notes |
|--------|-------|---------|--------------|
| `POST` | `/api/submissions` | Run/submit code | `{ problemId, language, sourceCode, isSampleRun? }` → `201` `{ submission }` |
| `GET` | `/api/submissions/me` | User history | `?problemId=&page=&limit=` |
| `GET` | `/api/submissions/:id` | Single submission | Owner or admin; redacted hidden test I/O |

**Submission behavior:**

- User `sourceCode` is **wrapped** by `problem-runner` before Judge0  
- `isSampleRun: true` → visible test cases only  
- Full submit → all test cases via Judge0; updates `Problem.acceptanceRate` (0–100%)  
- Compile error → stops early; stores partial `testResults`  
- `Judge0Error` → HTTP **502/504** with message (not generic 500)

### Planned (blueprint)

System design, behavioral, mock interview, analytics, admin — see blueprint PDF §13.

---

## Features Tracker

| Feature | Status | Progress % | Notes |
|---------|--------|------------|-------|
| Monorepo setup | Completed | 100% | npm workspaces |
| Backend Express scaffold | Completed | 100% | ESM, `/health` |
| Frontend Next.js scaffold | Completed | 100% | Tailwind, App Router |
| Neon PostgreSQL + Prisma | Completed | 100% | 3 migrations |
| Authentication (JWT) | Completed | 95% | Frontend refresh UX optional |
| Auth UI | Completed | 100% | login, signup, home |
| DSA Prisma models | Completed | 100% | Problem, TestCase, Submission |
| Problems API | Completed | 100% | list + detail |
| Submissions API + Judge0 | Completed | 100% | Wrap + Judge0 + error handling |
| Problem-runner (LeetCode-style) | Completed | 100% | Starter gen, code wrap, MiniJson, json.hpp |
| Problem seed (100) | Completed | 100% | specs + descriptions + JSON pipeline |
| Judge0 local Docker | Completed | 100% | Windows/WSL2 cgroup fix applied |
| DSA frontend (Monaco, pages) | Completed | 100% | List, solver, Run/Submit, results |
| UI design system | Completed | 100% | Light zinc/emerald theme in `globals.css` |
| Upstash Redis | Not Started | 0% | Phase 3 |
| AI evaluation pipeline | Not Started | 0% | Phase 3 |
| System design module | Not Started | 0% | Phase 4 |
| Behavioral module | Not Started | 0% | Phase 5 |
| Full mock interview | Not Started | 0% | Phase 6 |
| Admin dashboard + CRUD | Not Started | 0% | Phase 7 (seed until then) |
| Deployment CI/CD | Not Started | 0% | Phase 8 |

---

## External Services

| Service | Purpose | Status |
|---------|---------|--------|
| **Neon** | App PostgreSQL | **Connected** — 3 migrations; 100 problems seeded |
| **Judge0 CE** | Code execution | **Local Docker** `:2358` (`mrkushalsm/judge0`); Railway planned Phase 8 |
| **Upstash** | Redis (cache, BullMQ, sessions) | URL in `.env`; not used in code |
| **OpenAI GPT-4o** | AI evaluations | Not integrated |
| **Cloudinary** | Diagram/image uploads | Not integrated |
| **Socket.io** | Mock interview real-time | Not integrated |

---

## Environment Variables

### `apps/backend/.env` (gitignored)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | API port (default `4000`) |
| `DATABASE_URL` | Yes | Neon PostgreSQL |
| `JWT_ACCESS_SECRET` | Yes | min 32 chars |
| `JWT_REFRESH_SECRET` | Yes | min 32 chars |
| `JWT_ACCESS_EXPIRY` | Yes | e.g. `15m` |
| `JWT_REFRESH_EXPIRY` | Yes | e.g. `7d` |
| `FRONTEND_URL` | Yes | CORS origin |
| `JUDGE0_BASE_URL` | Yes | Dev: `http://localhost:2358`; prod: Railway URL |
| `JUDGE0_API_KEY` | Optional | Empty for local CE; set if auth enabled on Railway |
| `REDIS_URL` | Phase 3+ | Upstash Redis |
| `OPENAI_API_KEY` | Phase 3+ | GPT-4o |

### `apps/frontend/.env.local` (gitignored)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | e.g. `http://localhost:4000` |

---

## Decision Log

| Date | Context | Decision | Reason | Alternatives |
|------|---------|----------|--------|--------------|
| 2026-06-01 | Stack rebuild | Next.js + TS + Tailwind | User learning goals | CRA, Vite |
| 2026-06-01 | Workspace names | `frontend` / `backend` | User preference | `web` / `api` |
| 2026-06-01 | Backend modules | ESM + `NodeNext` | User preference | CommonJS |
| 2026-06-01 | Next config | `next.config.mjs` | Next 14.2 rejects `.ts` | Upgrade Next 15+ |
| 2026-06-01 | App infra | Neon + Upstash, no Docker for app | User preference | docker-compose |
| 2026-06-01 | State management | Zustand | Simpler with App Router | Redux |
| 2026-06-01 | Dev process | One file at a time | Learning-focused | Agent writes all |
| 2026-06-01 | Health route | `/health` at root | Phase 0 simplicity | `/api/health` |
| 2026-06-04 | Auth UX | **`signup`** not `register` | User preference | `/register` |
| 2026-06-04 | User profile | **`name` required** | User preference | Optional name |
| 2026-06-04 | Judge0 hosting | **Docker locally**, **Railway in prod** | Dev/prod parity without RapidAPI | RapidAPI |
| 2026-06-04 | Problem content | **100-problem seed**; admin CRUD in Phase 7 | Solo dev scope | Admin CRUD now |
| 2026-06-04 | DSA I/O | **JSON stdin/stdout** for all problems | Consistent Judge0 + multi-lang | Per-problem text formats |
| 2026-06-04 | Seed git | **`seeds/problems/*.json` gitignored** | Regenerate via `seed:generate` | Commit 100 JSON files |
| 2026-06-04 | Solutions | **Python + Java + C++** in `solutionCode` | Admin reference | Python only |
| 2026-06-17 | Editor UX | **LeetCode-style `Solution` class** in Monaco | Familiar interview pattern | Raw stdin/stdout functions |
| 2026-06-17 | Code execution | **`problem-runner` wraps user code** at submit time | Keeps editor clean; centralizes I/O harness | Inline harness in starters |
| 2026-06-17 | Java on Judge0 | **`MiniJson.java` harness** (no Gson) | Judge0 CE lacks Gson | External Gson jar |
| 2026-06-17 | C++ on Judge0 | **Bundle `json.hpp` via `additional_files` zip** | Judge0 CE lacks nlohmann | System headers |
| 2026-06-17 | Seed source | **`specs/batch-*.ts` + `problem-descriptions.ts`** | Typed specs + separated prose | Monolithic `problem-definitions.ts` only |
| 2026-06-17 | Judge0 on Windows | **`mrkushalsm/judge0` + cgroup host + LF `judge0.conf`** | Docker Desktop/WSL2 cgroup v2 incompatibility | Linux VM only |
| 2026-06-17 | Frontend design | **Light zinc/emerald theme**; LeetCode-like flow, custom look | User preference; not a visual clone | Dark slate theme |

---

## Bug Tracker

| Bug | Severity | Status | Fix Plan |
|-----|----------|--------|----------|
| `next.config.ts` unsupported | Medium | **Fixed** | `next.config.mjs` |
| CORS wide open | Low | **Fixed** | `FRONTEND_URL` |
| `tsx` / esbuild win32 | Medium | **Fixed** | `@esbuild/win32-x64` |
| `prisma generate` EPERM on Windows | Medium | Open | Stop dev server before `prisma generate` |
| Port 3000/3001 vs `FRONTEND_URL` | Low | Open | Match CORS to actual Next port |
| `npm run dev` with `&` on PowerShell | Low | Open | Two terminals or `concurrently` |
| `EADDRINUSE` port 4000 | Low | Open | Kill duplicate backend processes |
| `.gitignore` excluded project docs | Medium | **Fixed** | Removed doc lines from `.gitignore` |
| Judge0 Redis CRLF in `judge0.conf` | High | **Fixed** | LF line endings + `.gitattributes` |
| Judge0 cgroup v2 on Windows Docker | High | **Fixed** | `mrkushalsm/judge0`, `cgroup: host`, cgroup mount |
| Run/Submit returned generic 500 on Judge0 failure | Medium | **Fixed** | `Judge0Error` → 502/504 in controller |
| Java/C++ starters use Gson/nlohmann | Medium | **Fixed** | `problem-runner` + MiniJson + json.hpp zip |
| `authStore.refresh()` not wired on 401 | Low | Open | Phase 1 polish |

---

## Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| Wire `authStore.refresh()` on 401 | Medium | Phase 1 polish |
| Git commit Phases 0–2 | Medium | Full stack now functional |
| README with run instructions | Medium | Judge0 Docker (Windows notes) + seed commands |
| `problem-definitions.ts` legacy file | Low | Superseded by `specs/`; still referenced by `apply-descriptions.ts` |
| Duplicate problem-runner filenames (kebab + camelCase) | Low | Consolidate on camelCase ESM imports |
| Upgrade Next.js 15+ | Low | Optional |
| Phase 3 AI pipeline | **High** | Next major feature |

---

## Testing Status

| Type | Status | Notes |
|------|--------|-------|
| Unit tests | Not Started | Planned Jest |
| API integration | Not Started | Planned Supertest |
| E2E | Not Started | Planned Playwright |
| Manual | **In progress** | Auth + DSA E2E (Run/Submit via browser); Python/Java/C++ on Judge0 |

---

## Deployment Status

| Environment | Status |
|-------------|--------|
| Development | Local monorepo + Neon + Judge0 Docker |
| Staging | Not configured |
| Production | Not configured |

---

## AI Development Rules

### Naming

- Workspaces: `"frontend"`, `"backend"`
- Backend: `feature.routes.ts`, `feature.controller.ts`, `feature.service.ts`
- Auth route: **`/api/auth/signup`** (not `register`)

### Folders

- Backend modules under `src/modules/`; shared logic in `src/services/`
- Frontend App Router under `src/app/`; UI in `src/components/`
- Problem seed specs under `prisma/seeds/specs/`

### Code style

- TypeScript strict; backend ESM with `.js` import paths
- Thin controllers; fat services
- Never expose `solutionCode` or hidden test I/O to candidates
- User submission code is wrapped by `problem-runner` — do not put I/O harness in Monaco starters

### Seed workflow

```bash
cd apps/backend
npm run seed:validate   # optional — validate specs
npm run seed:generate   # specs + descriptions → seeds/problems/*.json (+ multi-lang batches)
npm run seed            # JSON → Neon upsert
```

Run Prisma CLI from `apps/backend`, not repo root.

### Local dev (three terminals)

```bash
# Terminal 1 — Judge0
docker compose -f docker-compose.judge0.yml up -d

# Terminal 2 — Backend
cd apps/backend && npm run dev

# Terminal 3 — Frontend
cd apps/frontend && npm run dev
```

---

*End of PROJECT_CONTEXT.md*
