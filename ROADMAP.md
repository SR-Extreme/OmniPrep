# ROADMAP.md

> **Last updated:** 2026-06-04  
> **Overall progress:** ~22% (Phase 0 complete; Phase 1 ~95% complete)  
> Sync with `PROJECT_CONTEXT.md` and `SESSION_HANDOFF.md` after each session.

---

## Phase 0 — Monorepo & Scaffolding

**Goal:** Runnable monorepo with backend health check and frontend home page.

**Description:** npm workspaces, Express + Next.js + Tailwind, env templates, Neon/Upstash documented (no Docker).

**Tasks:**

* [x] Root `package.json` + `.gitignore`
* [x] `apps/backend` — ESM Express, `app.ts`, `server.ts`, `/health`
* [x] `apps/frontend` — Next 14, Tailwind, `layout.tsx`, `page.tsx`
* [x] `next.config.mjs` (not `.ts`)
* [x] `.env.example` (Neon + Upstash)
* [x] `apps/frontend/.env.local` with `NEXT_PUBLIC_API_URL`
* [x] `apps/backend/.env` with `PORT`, `DATABASE_URL`, `REDIS_URL`
* [ ] Commit Phase 0 + Phase 1 to git
* [ ] Optional: `README.md` run instructions

**Deliverables:**

* `GET /health` on port 4000
* Home page on port 3000/3001
* `npm run build` passes for both workspaces

**Status:** Completed  
**Progress:** 100%

---

## Phase 1 — Foundation & Authentication

**Goal:** Database connected to Neon; users can sign up, login, refresh, logout.

**Description:** Prisma schema (User, RefreshToken), auth module, protected routes, login/signup UI, env validation.

**Tasks:**

* [x] Add Prisma + `@prisma/client` to backend
* [x] Create `prisma/schema.prisma` (User, RefreshToken, enums)
* [x] Run `prisma migrate dev` against Neon
* [x] `src/config/env.ts` — Zod validate `DATABASE_URL`, `PORT`, JWT vars
* [x] `src/config/db.ts` — Prisma singleton
* [x] `src/modules/auth/` — routes, controller, service, validation
* [x] bcrypt password hashing, JWT access + refresh (DB-stored refresh)
* [x] `authMiddleware`, mount routes under `/api`
* [x] CORS restricted to `FRONTEND_URL`
* [x] Frontend: `src/lib/api/client.ts`, auth API helpers
* [x] Frontend: `app/(auth)/login`, `signup` pages
* [x] Zustand `authStore` (signup, login, logout + persist)
* [x] Home page auth-aware UI
* [x] `User.name` required (migration `require_user_name`)
* [x] Verify Neon connection; defer Upstash wiring to Phase 3
* [ ] Optional: `authStore.refresh()` + auto-refresh on 401

**Deliverables:**

* [x] Working signup/login from UI
* [x] Protected test route returns 401 without token (`GET /api/me`)

**Status:** Completed (optional refresh UX remaining)  
**Progress:** 95%

---

## Phase 2 — DSA Module Core

**Goal:** Browse problems, solve in Monaco, run against Judge0, store submissions.

**Tasks:**

* [ ] Prisma: Problem, TestCase, Submission models + migrate
* [ ] `modules/problems/` — list, filter, get by id
* [ ] `modules/submissions/` — submit code, Judge0 integration
* [ ] `services/Judge0Service.ts`
* [ ] Admin seed script or admin CRUD for problems
* [ ] Frontend: `app/problems`, `app/problems/[id]`
* [ ] Monaco editor component (`"use client"`)
* [ ] Submission UI + pass rate display

**Deliverables:**

* End-to-end: pick problem → submit code → see Judge0 pass/fail

**Status:** Not Started  
**Progress:** 0%

---

## Phase 3 — AI Evaluation Pipeline

**Goal:** GPT-4o evaluates DSA submissions; async worker + Redis cache.

**Tasks:**

* [ ] `src/config/redis.ts` — Upstash client
* [ ] `services/CacheService.ts`, `services/QueueService.ts`
* [ ] `services/AIService.ts` — `evaluateDSA` structured JSON
* [ ] BullMQ `ai-eval-queue` + `AIEvaluationWorker`
* [ ] Prisma: DSAEvaluation model
* [ ] Redis cache keys: Judge0 + AI eval (per blueprint TTLs)
* [ ] Frontend: feedback UI (scores, suggestions)
* [ ] `AIUsageLog` model + basic logging

**Deliverables:**

* Submit code → tests + AI scores + feedback JSON

**Status:** Not Started  
**Progress:** 0%

---

## Phase 4 — System Design Module

**Goal:** SD questions, text + optional diagram, multimodal GPT-4o, follow-ups.

**Tasks:**

* [ ] Prisma SD models
* [ ] Cloudinary signed upload
* [ ] `modules/systemDesign/`
* [ ] Multimodal prompts + follow-up generation
* [ ] Frontend SD page + upload + conversation UI

**Deliverables:**

* Complete SD practice flow with scores

**Status:** Not Started  
**Progress:** 0%

---

## Phase 5 — Behavioral Module

**Goal:** STAR evaluation, conversational follow-ups, session history.

**Tasks:**

* [ ] Prisma behavioral models
* [ ] `modules/behavioral/`
* [ ] TopicPerformance tracking begins
* [ ] Frontend behavioral flow (2 rounds)

**Deliverables:**

* Behavioral session with final assessment

**Status:** Not Started  
**Progress:** 0%

---

## Phase 6 — Full Mock Interview

**Goal:** 90-minute real-time interview via Socket.io + Redis session state.

**Tasks:**

* [ ] `socket/interviewSocket.ts`, namespace `/interview`
* [ ] `modules/mockInterview/` + `mockInterview.socket.ts`
* [ ] Redis session keys, server-side timers
* [ ] Rounds: intro → DSA → SD → behavioral → debrief
* [ ] `ReportWorker` + MockInterviewReport
* [ ] Frontend `app/mock-interview` + hooks (`useSocket`, `useTimer`)

**Deliverables:**

* Complete mock interview with final report

**Status:** Not Started  
**Progress:** 0%

---

## Phase 7 — Admin & Adaptive Engine

**Goal:** Admin dashboard, study plans, analytics heatmap.

**Tasks:**

* [ ] `modules/admin/`, `modules/analytics/`, `modules/plans/`
* [ ] `PlanWorker` — spaced repetition algorithm
* [ ] StudyPlan generation via AIService
* [ ] Frontend admin pages + analytics + study plan UI
* [ ] Bull Board (optional)

**Deliverables:**

* Admin can manage questions; user sees heatmap + weekly plan

**Status:** Not Started  
**Progress:** 0%

---

## Phase 8 — Polish, Security & Deploy

**Goal:** Production-ready deploy and hardening.

**Tasks:**

* [ ] Rate limiting (Redis store), Helmet, CORS tighten
* [ ] DB index review, query optimization
* [ ] Deploy: Vercel + Railway + Neon + Upstash
* [ ] GitHub Actions CI/CD
* [ ] E2E critical paths (Playwright)
* [ ] README + API docs

**Deliverables:**

* Publicly deployed MVP

**Status:** Not Started  
**Progress:** 0%

---

## Milestones

| Milestone | Target Phase | Status |
|-----------|--------------|--------|
| M0 — Repo runs locally | Phase 0 | **Done** |
| M1 — Auth + DB live | Phase 1 | **Done** (refresh UX optional) |
| M2 — First AI feedback on code | Phase 3 | Pending |
| M3 — Mock interview E2E | Phase 6 | Pending |
| M4 — Production deploy | Phase 8 | Pending |

---

## Release Plan

| Version | Scope | Phase |
|---------|--------|-------|
| **v0.1** | Monorepo scaffold, health + home | Phase 0 ✅ |
| **v0.2** | Auth + Prisma on Neon | Phase 1 ✅ (refresh UX optional) |
| **v0.3** | DSA + Judge0 | Phase 2 |
| **v0.4** | AI DSA evaluation | Phase 3 |
| **v0.5** | System design + behavioral | Phase 4–5 |
| **v0.6** | Mock interview | Phase 6 |
| **v0.7** | Admin + adaptive plans | Phase 7 |
| **v1.0** | Deployed + hardened MVP | Phase 8 |

---

## Feature Priority Matrix

### Critical

* Authentication (JWT + refresh) — **backend done**
* DSA module + Judge0
* AI evaluation pipeline
* Prisma + Neon integration — **Phase 1 models done**

### High Priority

* System design module
* Behavioral module
* Full mock interview
* Upstash Redis + BullMQ

### Medium Priority

* Adaptive study plans
* Analytics heatmap
* Admin dashboard
* AI usage/cost tracking

### Low Priority

* Email notifications
* PDF report export
* Interview timeline replay
* Weekly leaderboard

---

## Future Enhancements

* Next.js 15 upgrade (`next.config.ts` support)
* Shared `packages/shared-types` monorepo package
* `concurrently` for single-command `npm run dev` on Windows
* OAuth (Google/GitHub) login
* Mobile-responsive interview UI refinements
* i18n for UI strings

---

## Risks & Dependencies

### Technical Risks

| Risk | Mitigation |
|------|------------|
| OpenAI latency/cost | Redis cache, per-user budgets, BullMQ retries |
| Upstash + BullMQ TLS | Test connection early in Phase 3 |
| Mock interview state complexity | Redis canonical state, server-side timers |
| Next 14 vs 15 config differences | Stay on `next.config.mjs` until upgrade |

### Product Risks

| Risk | Mitigation |
|------|------------|
| Scope too large for solo dev | MVP cuts in blueprint (mock/admin optional) |
| AI evaluation inconsistency | Structured JSON prompts + few-shot examples |

### External Dependencies

| Dependency | Required from phase |
|------------|----------------------|
| Neon account | Phase 1 ✅ |
| Upstash account | Phase 3 (URLs already in `.env`) |
| OpenAI API key | Phase 3 |
| Judge0 API | Phase 2 |
| Cloudinary | Phase 4 |
| Vercel/Railway | Phase 8 |

---

*End of ROADMAP.md*
