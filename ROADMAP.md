# ROADMAP.md

> **Last updated:** 2026-06-17  
> **Overall progress:** ~58% (Phases 0–2 complete; Phase 3 not started)  
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
* [ ] Commit Phase 0–2 to git
* [ ] Optional: `README.md` run instructions (include Judge0 Windows notes)

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
* [x] `services/Judge0Service.ts` (+ `additional_files`, base64, poll tuning)
* [x] `config/env.ts` — `JUDGE0_BASE_URL`, optional `JUDGE0_API_KEY`
* [x] `docker-compose.judge0.yml` + `infra/judge0/judge0.conf` (Windows cgroup fix)
* [x] `modules/submissions/` — submit, sample run, list me, get by id
* [x] Mount `/api/problems`, `/api/submissions` in `app.ts`
* [x] Seed: 100 problems via `specs/` + `problem-descriptions.ts` + `seed:generate`
* [x] `services/problem-runner/` — LeetCode-style starters + runtime code wrapping
* [x] Java `MiniJson` harness; C++ `json.hpp` zip for Judge0
* [x] Frontend: `@monaco-editor/react` in `package.json`
* [x] Frontend: `src/types/dsa.ts`, `lib/api/problems.ts`, `lib/api/submissions.ts`
* [x] Frontend: `MonacoEditor.tsx`
* [x] Frontend: `app/problems`, `app/problems/[id]`
* [x] Submission UI + Run/Submit + results panel
* [x] Home page link to `/problems` + light theme design system (`globals.css`)
* [x] `Judge0Error` → 502/504 (not generic 500)

**Deliverables:**

* [x] End-to-end: pick problem → edit Solution class → Run/Submit → see Judge0 pass/fail

**Status:** Completed  
**Progress:** 100%

---

## Phase 3 — AI Evaluation Pipeline

**Goal:** GPT-4o evaluates DSA submissions; async worker + Redis cache.

**Tasks:**

* [ ] `src/config/redis.ts` — Upstash client
* [ ] `services/CacheService.ts`, `services/QueueService.ts`
* [ ] `services/AIService.ts` — `evaluateDSA` structured JSON
* [ ] BullMQ `ai-eval-queue` + `AIEvaluationWorker`
* [ ] Prisma: `DSAEvaluation` model + migrate
* [ ] Hook evaluation job after successful full submit (or on demand)
* [ ] Frontend: feedback UI on problem solver (scores, suggestions)
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
| M2.5 — DSA E2E in browser | Phase 2 frontend | **Done** |
| M2 — First AI feedback on code | Phase 3 | Pending |
| M3 — Mock interview E2E | Phase 6 | Pending |
| M4 — Production deploy | Phase 8 | Pending |

---

## Release Plan

| Version | Scope | Phase |
|---------|--------|-------|
| **v0.1** | Monorepo scaffold | Phase 0 ✅ |
| **v0.2** | Auth + Prisma on Neon | Phase 1 ✅ |
| **v0.3** | DSA + Judge0 + browser UI | Phase 2 ✅ |
| **v0.4** | AI DSA evaluation | Phase 3 |
| **v0.5** | System design + behavioral | Phase 4–5 |
| **v0.6** | Mock interview | Phase 6 |
| **v0.7** | Admin + adaptive plans | Phase 7 |
| **v1.0** | Deployed MVP | Phase 8 |

---

## Feature Priority Matrix

### Critical

* Authentication — **done**
* DSA module + Judge0 + browser UI — **done**
* AI evaluation pipeline — **Phase 3 (next)**
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
| Judge0 on Windows Docker Desktop | **Fixed** — `mrkushalsm/judge0` + cgroup host + LF config |
| `judge0.conf` CRLF breaks Redis on Windows | **Fixed** — `.gitattributes` enforces LF |
| `.gitignore` blocking doc files | **Fixed** — docs tracked |

| Dependency | Phase | Status |
|------------|-------|--------|
| Neon | 1 | ✅ |
| Judge0 CE (Docker local) | 2 | ✅ (Windows-compatible config) |
| Judge0 CE (Railway) | 8 | Pending |
| Upstash | 3 | URL in `.env` |
| OpenAI | 3 | Pending |

---

*End of ROADMAP.md*
