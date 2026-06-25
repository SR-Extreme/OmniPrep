# ROADMAP.md

> **Last updated:** 2026-06-20  
> **Overall progress:** ~66% (Phases 0–2 complete; Phase 3 ~95%; Phases 4–8 not started)  
> Sync with `PROJECT_CONTEXT.md` and `SESSION_HANDOFF.md` after each session.

---

## Phase 0 — Monorepo & Scaffolding

**Goal:** Runnable monorepo with backend health check and frontend home page.

**Tasks:**

* [x] Root `package.json` + `.gitignore`
* [x] `apps/backend` — ESM Express, `app.ts`, `server.ts`, `/health`
* [x] `apps/frontend` — Next 14, Tailwind, `layout.tsx`, `page.tsx`
* [x] `next.config.mjs` (not `.ts`)
* [x] `.env.example` (Neon + Upstash + Gemini)
* [x] `apps/frontend/.env.local` with `NEXT_PUBLIC_API_URL`
* [x] `apps/backend/.env` with `PORT`, `DATABASE_URL`, `REDIS_URL`
* [x] Phase 0–3 work partially committed to git
* [ ] `README.md` run instructions (Judge0 Windows + AI review setup)

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
* [x] `docker-compose.judge0.yml` + `infra/judge0/judge0.conf` (Windows cgroup fix)
* [x] `modules/submissions/` — submit, sample run, list me, get by id
* [x] `services/problem-runner/` — LeetCode-style starters + runtime code wrapping
* [x] Seed: 100 problems via `specs/` + `problem-descriptions.ts`
* [x] Frontend: Monaco, problem bank, solver, Run/Submit, results panel
* [x] Light theme design system (`globals.css`)
* [x] `Judge0Error` → 502/504

**Deliverables:**

* [x] End-to-end: pick problem → edit Solution class → Run/Submit → see Judge0 pass/fail

**Status:** Completed  
**Progress:** 100%

---

## Phase 3 — AI Evaluation Pipeline

**Goal:** AI evaluates DSA submissions on demand; async worker + Redis cache; rich report UI.

**Tasks:**

* [x] `src/config/redis.ts` — Upstash ioredis client
* [x] `services/CacheService.ts` — SHA-256 cache key, 7-day TTL
* [x] `services/QueueService.ts` — BullMQ `ai-eval-queue`
* [x] `services/AIService.ts` — `evaluateDSA()` structured JSON (Gemini `gemini-2.5-flash`)
* [x] `workers/AIEvaluationWorker.ts` — async job processor
* [x] Prisma: `DsaEvaluation` model + migration (`@@map("DSAEvaluation")`)
* [x] `modules/evaluations/` — POST/GET `/api/evaluations/:submissionId`
* [x] `server.ts` — start worker when `REDIS_URL` set; graceful shutdown
* [x] **On-demand trigger** — Generate AI Review button (not auto after submit)
* [x] Frontend: `lib/api/evaluations.ts` + solver AI report UI
* [x] Report: overall + 4 metrics (0–100), complexity, follow-ups, feedback, suggestions
* [x] Manual E2E testing completed
* [ ] `AIUsageLog` model + basic token/cost logging
* [ ] `GEMINI_API_KEY` in `env.ts` Zod validation

**Status:** Nearly complete  
**Progress:** 95%

---

## Phase 4 — System Design Module

**Goal:** System design prompts, text (+ optional diagram) submission, AI evaluation.

**Status:** Not Started | **Progress:** 0%

**Planned first tasks:**

* [ ] Prisma: `SystemDesignQuestion`, `SystemDesignSubmission`, `SystemDesignEvaluation`
* [ ] Backend module + routes
* [ ] Extend `AIService` for system design evaluation
* [ ] Frontend practice UI
* [ ] Cloudinary for diagram uploads (optional in first slice)

---

## Phase 5 — Behavioral Module

**Status:** Not Started | **Progress:** 0%

---

## Phase 6 — Full Mock Interview

**Goal:** Live ~90 min session; auto AI report when interview ends (reuse evaluation engine).

**Status:** Not Started | **Progress:** 0%

---

## Phase 7 — Admin & Adaptive Engine

**Goal:** Admin dashboard, study plans, analytics; replace seed-only problem edits with CRUD UI.

**Status:** Not Started | **Progress:** 0%

---

## Phase 8 — Polish, Security & Deploy

**Goal:** Production deploy including Railway-hosted Judge0 CE.

**Status:** Not Started | **Progress:** 0%

---

## Milestones

| Milestone | Target Phase | Status |
|-----------|--------------|--------|
| M0 — Repo runs locally | Phase 0 | **Done** |
| M1 — Auth + DB live | Phase 1 | **Done** |
| M1.5 — DSA API + Judge0 + 100 problems | Phase 2 | **Done** |
| M2.5 — DSA E2E in browser | Phase 2 | **Done** |
| **M2 — First AI feedback on code** | **Phase 3** | **Done** |
| M3 — Mock interview E2E | Phase 6 | Pending |
| M4 — Production deploy | Phase 8 | Pending |

---

## Release Plan

| Version | Scope | Phase |
|---------|--------|-------|
| **v0.1** | Monorepo scaffold | Phase 0 ✅ |
| **v0.2** | Auth + Prisma on Neon | Phase 1 ✅ |
| **v0.3** | DSA + Judge0 + browser UI | Phase 2 ✅ |
| **v0.4** | AI DSA evaluation (on-demand) | Phase 3 ✅ |
| **v0.5** | System design + behavioral | Phase 4–5 |
| **v0.6** | Mock interview | Phase 6 |
| **v0.7** | Admin + adaptive plans | Phase 7 |
| **v1.0** | Deployed MVP | Phase 8 |

---

## Feature Priority Matrix

### Critical (done)

* Authentication  
* DSA module + Judge0 + browser UI  
* AI evaluation pipeline (on-demand DSA)  
* Prisma + Neon  

### High Priority (next)

* System design module (Phase 4)  
* Behavioral + mock interview  
* `AIUsageLog` + admin analytics (Phase 7)  
* README + deployment  

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `prisma generate` EPERM on Windows | Stop dev server before generate |
| BullMQ/ioredis type conflict | Use connection options object (fixed) |
| Gemini API key only in runtime env | Add to `env.ts` (pending) |
| Judge0 on Windows Docker | mrkushalsm/judge0 + cgroup host + LF config |

| Dependency | Phase | Status |
|------------|-------|--------|
| Neon | 1 | ✅ |
| Judge0 CE (Docker local) | 2 | ✅ |
| Upstash Redis | 3 | ✅ |
| Google Gemini API | 3 | ✅ |
| Cloudinary | 4 | Pending |
| Socket.io | 6 | Pending |

---

*End of ROADMAP.md*
