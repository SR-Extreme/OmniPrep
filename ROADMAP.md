# ROADMAP.md

> **Last updated:** 2026-06-04  
> **Overall progress:** ~48% (Phases 0–1 complete; Phase 2 backend complete; Phase 2 frontend pending)  
> Sync with `PROJECT_CONTEXT.md` and `SESSION_HANDOFF.md` after each session.

---

## Phase 0 — Monorepo & Scaffolding

**Goal:** Runnable monorepo with backend health check and frontend home page.

**Tasks:**

* [x] Root `package.json` + `.gitignore`
* [x] `apps/backend` — ESM Express, `app.ts`, `server.ts`, `/health`
* [x] `apps/frontend` — Next 14, Tailwind, `layout.tsx`, `page.tsx`
* [x] `next.config.mjs` (not `.ts`)
* [x] `.env.example` (Neon + Upstash)
* [x] `apps/frontend/.env.local` with `NEXT_PUBLIC_API_URL`
* [x] `apps/backend/.env` with `PORT`, `DATABASE_URL`, `REDIS_URL`
* [ ] Commit Phase 0–2 backend to git
* [ ] Optional: `README.md` run instructions

**Status:** Completed  
**Progress:** 100%

---

## Phase 1 — Foundation & Authentication

**Goal:** Database connected to Neon; users can sign up, login, refresh, logout.

**Tasks:**

* [x] Prisma + schema (`User`, `RefreshToken`, `Role`)
* [x] Migrations on Neon
* [x] `config/env.ts`, `config/db.ts`
* [x] `modules/auth/` — full JWT auth module
* [x] `authMiddleware`, `adminMiddleware`
* [x] Frontend auth UI + Zustand persist
* [x] `User.name` required
* [ ] Optional: `authStore.refresh()` + auto-refresh on 401

**Status:** Completed (optional refresh UX remaining)  
**Progress:** 95%

---

## Phase 2 — DSA Module Core

**Goal:** Browse problems, solve in Monaco, run against Judge0, store submissions.

**Tasks:**

* [x] Prisma: `Problem`, `TestCase`, `Submission` + migrate
* [x] `src/types/dsa.types.ts`
* [x] `modules/problems/` — list, filter, get by id/slug
* [x] `services/Judge0Service.ts`
* [x] `config/env.ts` — `JUDGE0_BASE_URL`, optional `JUDGE0_API_KEY`
* [x] `docker-compose.judge0.yml` + `infra/judge0/judge0.conf` (local dev)
* [x] `modules/submissions/` — submit, sample run, list me, get by id
* [x] Mount `/api/problems`, `/api/submissions` in `app.ts`
* [x] Seed: 100 problems, 10 test cases each (2 visible / 8 hidden), Python + Java + C++ solutions
* [x] Seed pipeline: `problem-definitions.ts` → `seed:generate` → `seed`
* [ ] Frontend: `@monaco-editor/react` in `package.json`
* [ ] Frontend: `src/types/dsa.ts`, `lib/api/problems.ts`, `lib/api/submissions.ts`
* [ ] Frontend: `MonacoEditor.tsx`
* [ ] Frontend: `app/problems`, `app/problems/[id]`
* [ ] Submission UI + pass rate display
* [ ] Home page link to `/problems`

**Deliverables:**

* [ ] End-to-end: pick problem → submit code → see Judge0 pass/fail *(backend ready; frontend pending)*

**Status:** In Progress  
**Progress:** 50% (backend 100%, frontend 0%)

---

## Phase 3 — AI Evaluation Pipeline

**Goal:** GPT-4o evaluates DSA submissions; async worker + Redis cache.

**Tasks:**

* [ ] `src/config/redis.ts` — Upstash client
* [ ] `services/CacheService.ts`, `services/QueueService.ts`
* [ ] `services/AIService.ts` — `evaluateDSA` structured JSON
* [ ] BullMQ `ai-eval-queue` + `AIEvaluationWorker`
* [ ] Prisma: `DSAEvaluation` model
* [ ] Frontend: feedback UI (scores, suggestions)
* [ ] `AIUsageLog` model + basic logging

**Status:** Not Started  
**Progress:** 0%

---

## Phase 4 — System Design Module

**Status:** Not Started | **Progress:** 0%

---

## Phase 5 — Behavioral Module

**Status:** Not Started | **Progress:** 0%

---

## Phase 6 — Full Mock Interview

**Status:** Not Started | **Progress:** 0%

---

## Phase 7 — Admin & Adaptive Engine

**Goal:** Admin dashboard, study plans, analytics; **replace seed-only problem edits with CRUD UI**.

**Status:** Not Started | **Progress:** 0%

---

## Phase 8 — Polish, Security & Deploy

**Goal:** Production deploy including **Railway-hosted Judge0 CE**.

**Tasks include:**

* [ ] Deploy Judge0 CE on Railway; set production `JUDGE0_BASE_URL`
* [ ] Vercel frontend + Railway API
* [ ] Rate limiting, Helmet, CI/CD, E2E

**Status:** Not Started  
**Progress:** 0%

---

## Milestones

| Milestone | Target Phase | Status |
|-----------|--------------|--------|
| M0 — Repo runs locally | Phase 0 | **Done** |
| M1 — Auth + DB live | Phase 1 | **Done** |
| M1.5 — DSA API + Judge0 + 100 problems seeded | Phase 2 backend | **Done** |
| M2 — First AI feedback on code | Phase 3 | Pending |
| M2.5 — DSA E2E in browser | Phase 2 frontend | Pending |
| M3 — Mock interview E2E | Phase 6 | Pending |
| M4 — Production deploy | Phase 8 | Pending |

---

## Release Plan

| Version | Scope | Phase |
|---------|--------|-------|
| **v0.1** | Monorepo scaffold | Phase 0 ✅ |
| **v0.2** | Auth + Prisma on Neon | Phase 1 ✅ |
| **v0.3** | DSA + Judge0 | Phase 2 — **backend ✅, frontend pending** |
| **v0.4** | AI DSA evaluation | Phase 3 |
| **v0.5** | System design + behavioral | Phase 4–5 |
| **v0.6** | Mock interview | Phase 6 |
| **v0.7** | Admin + adaptive plans | Phase 7 |
| **v1.0** | Deployed MVP | Phase 8 |

---

## Feature Priority Matrix

### Critical

* Authentication — **done**
* DSA module + Judge0 — **backend done; frontend pending**
* AI evaluation pipeline — Phase 3
* Prisma + Neon — **done** (auth + DSA models)

### High Priority

* System design, behavioral, mock interview
* Upstash Redis + BullMQ (Phase 3)
* Admin CRUD (Phase 7; seed until then)

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Judge0 `prisma generate` EPERM on Windows | Stop dev server before generate |
| 10 Judge0 calls per submission (latency) | Accept for dev; Redis cache Phase 3 |
| Java/C++ Judge0 libs (Gson/nlohmann) | Python primary for MVP submissions |
| `.gitignore` blocking doc files | **Fixed** — docs now tracked |

| Dependency | Phase | Status |
|------------|-------|--------|
| Neon | 1 | ✅ |
| Judge0 CE (Docker local) | 2 | ✅ |
| Judge0 CE (Railway) | 8 | Pending |
| Upstash | 3 | URL in `.env` |
| OpenAI | 3 | Pending |

---

*End of ROADMAP.md*
