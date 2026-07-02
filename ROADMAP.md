# ROADMAP.md

> **Last updated:** 2026-06-28  
> **Overall progress:** ~70% (Phases 0–3 complete; Phase 4 backend ~70%; Phase 4 frontend 0%; Phases 5–8 not started)  
> Sync with `PROJECT_CONTEXT.md` and `SESSION_HANDOFF.md` after each session.

---

## Phase 0 — Monorepo & Scaffolding

**Goal:** Runnable monorepo with backend health check and frontend home page.

**Tasks:**

* [x] Root `package.json` + `.gitignore`
* [x] `apps/backend` — ESM Express, `app.ts`, `server.ts`, `/health`
* [x] `apps/frontend` — Next 14, Tailwind, `layout.tsx`, `page.tsx`
* [x] `next.config.mjs` (not `.ts`)
* [x] `.env.example` (Neon + Upstash + Gemini + Cloudinary)
* [x] `apps/frontend/.env.local` with `NEXT_PUBLIC_API_URL`
* [x] `apps/backend/.env` with core vars
* [x] Phase 0–3 work committed to git
* [ ] `README.md` run instructions

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
* [x] `modules/problems/`, `modules/submissions/`
* [x] `services/Judge0Service.ts` + `problem-runner/`
* [x] `docker-compose.judge0.yml` + Windows cgroup fix
* [x] Seed: 100 problems
* [x] Frontend: Monaco, problem bank, solver, Run/Submit, results
* [x] Light theme design system
* [x] `Judge0Error` → 502/504

**Status:** Completed  
**Progress:** 100%

---

## Phase 3 — AI Evaluation Pipeline (DSA)

**Goal:** AI evaluates DSA submissions on demand; async worker + Redis cache; rich report UI.

**Tasks:**

* [x] Redis, CacheService, QueueService, AIService (`evaluateDSA`)
* [x] `AIEvaluationWorker`, `DsaEvaluation` model
* [x] `modules/evaluations/` API + frontend AI review UI
* [x] On-demand Generate AI Review (not auto after submit)
* [x] Manual E2E testing
* [x] `GEMINI_API_KEY` in `env.ts` Zod validation
* [ ] `AIUsageLog` model + token/cost logging *(optional — deferred)*

**Status:** Completed (optional `AIUsageLog` deferred)  
**Progress:** 95%

---

## Phase 4 — System Design Module

**Goal:** Structured system design prompts; text and/or diagram submission; two-round follow-up flow; multimodal Gemini final evaluation with dynamic rubric scores.

**Status:** In Progress | **Progress:** ~35% overall (~70% backend, 0% frontend)

### Completed (backend)

* [x] Prisma: `SystemDesignQuestion`, `SystemDesignSubmission`, `SystemDesignEvaluation`
* [x] Migrations: `add_system_design`, `add_system_design_scale_factors`
* [x] Question fields: `requirements`, `deliverables`, `constraints`, `scaleFactors`, `evaluationMetrics[]`
* [x] Seed: 3 questions (URL shortener, Instagram feed, rate limiter)
* [x] `src/types/system-design.types.ts` — Zod parsers, `computeOverallScore()`
* [x] `CloudinaryService.ts` + `multer` + env helpers
* [x] `modules/system-design/` — validation, service, follow-up service, evaluation service, controller, routes
* [x] `app.ts` — mount `/api/system-design`
* [x] `AIService.ts` — `generateSystemDesignFollowUps()`, `evaluateSystemDesign()` (multimodal)

### In progress / remaining

* [ ] `CacheService.ts` — system design evaluation cache keys + payload type
* [ ] `QueueService.ts` — `enqueueSystemDesignEvaluation()`, `getSystemDesignEvalJobState()`
* [ ] `AIEvaluationWorker.ts` — process system design final evaluation jobs
* [ ] Fix `requestSystemDesignEvaluation` — DB short-circuit before cache (parity with DSA)
* [ ] Manual backend E2E test (Postman/curl): full SD flow
* [ ] Frontend: `src/types/system-design.ts`, `lib/api/system-design.ts`
* [ ] Frontend: `/system-design` bank + `/system-design/[id]` practice UI (full flow)
* [ ] Frontend: nav link from home page
* [ ] `.env.example` sync if needed

---

## Phase 5 — Behavioral Module

**Status:** Not Started | **Progress:** 0%

---

## Phase 6 — Full Mock Interview

**Goal:** Live ~90 min session; auto AI report when interview ends (reuse evaluation engine).

**Status:** Not Started | **Progress:** 0%

---

## Phase 7 — Admin & Adaptive Engine

**Goal:** Admin dashboard, study plans, analytics; CRUD UI for questions.

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
| M2 — First AI feedback on code | Phase 3 | **Done** |
| **M2.5 — System design backend API** | **Phase 4** | **In progress** |
| M3 — System design E2E in browser | Phase 4 | Pending |
| M4 — Mock interview E2E | Phase 6 | Pending |
| M5 — Production deploy | Phase 8 | Pending |

---

## Release Plan

| Version | Scope | Phase |
|---------|--------|-------|
| **v0.1** | Monorepo scaffold | Phase 0 ✅ |
| **v0.2** | Auth + Prisma on Neon | Phase 1 ✅ |
| **v0.3** | DSA + Judge0 + browser UI | Phase 2 ✅ |
| **v0.4** | AI DSA evaluation (on-demand) | Phase 3 ✅ |
| **v0.5** | System design + behavioral | Phase 4–5 *(SD backend partial)* |
| **v0.6** | Mock interview | Phase 6 |
| **v0.7** | Admin + adaptive plans | Phase 7 |
| **v1.0** | Deployed MVP | Phase 8 |

---

## Feature Priority Matrix

### Critical (done)

* Authentication  
* DSA module + Judge0 + browser UI  
* DSA AI evaluation pipeline (on-demand)  
* Prisma + Neon  

### High Priority (now)

* **System design cache + queue + worker** (unblocks compile + async final review)  
* **System design frontend** (practice UI)  
* Manual SD backend E2E  
* README + deployment  

### Medium Priority

* `AIUsageLog` + admin analytics (Phase 7)  
* Behavioral module (Phase 5)  
* Auth refresh-on-401 UX  

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| SD evaluation service imports missing exports | Implement CacheService + QueueService SD slice next |
| `prisma generate` EPERM on Windows | Stop dev server before generate |
| Gemini multimodal diagram fetch fails | Cloudinary public URLs; error handling in AIService |
| Judge0 on Windows Docker | mrkushalsm/judge0 + LF config |

| Dependency | Phase | Status |
|------------|-------|--------|
| Neon | 1 | ✅ |
| Judge0 CE (Docker) | 2 | ✅ |
| Upstash Redis | 3 | ✅ |
| Google Gemini | 3–4 | ✅ |
| Cloudinary | 4 | ✅ (code integrated; env required) |
| Socket.io | 6 | Pending |

---

*End of ROADMAP.md*
