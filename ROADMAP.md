# ROADMAP.md

> **Last updated:** 2026-07-09  
> **Overall progress:** ~90% of Phases 0–5 (implementation complete); ~70% of full 8-phase MVP (Phases 6–8 not started)  
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
* [x] Phase 0–5 work committed to git
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

**Status:** Completed | **Progress:** 95%

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
* [x] `CacheService.ts` — SD evaluation cache (`omniprep:sd-evaluation:*`)
* [x] `QueueService.ts` — `enqueueSystemDesignEvaluation()`, `getSystemDesignEvalJobState()`
* [x] `AIEvaluationWorker.ts` — `evaluate-system-design` jobs
* [x] `requestSystemDesignEvaluation` — DB short-circuit before cache (DSA parity)
* [x] Backend `tsc --noEmit` passes
* [x] Manual browser E2E verified

### Completed (frontend)

* [x] `src/types/system-design.ts`
* [x] `src/lib/api/system-design.ts` (multipart diagram upload via FormData)
* [x] `/system-design` question bank page
* [x] `/system-design/[id]` practice page (submit → follow-ups → AI review + poll)
* [x] Home page nav + CTAs for System Design

### Remaining

* [ ] Fix follow-up submitted answers display (`{answer}` not "Submitted" label only)
* [ ] Optional: add Behavioral link to `/problems` and `/system-design` page headers

---

## Phase 5 — Behavioral Module

**Goal:** Company- and role-specific behavioral mock interviews with resume-aware AI questions, 7-phase flow, and on-demand STAR-based evaluation.

**Status:** Near Complete | **Progress:** ~95% (code done; manual browser E2E pending)

### Completed (backend)

* [x] Prisma: `BehavioralQuestion`, `BehavioralSession`, `BehavioralTurn`, `BehavioralEvaluation` + enums
* [x] Migration: `20260705113944_add_behavioral_module`
* [x] Seed: 3 questions (Google SWE, Amazon SDE, Microsoft SWE) via `behavioral-questions.ts`
* [x] `src/types/behavioral.types.ts` — phase Zod schema, evaluation metrics, helpers
* [x] `ResumeParserService.ts` — PDF only, 5 MB
* [x] `CloudinaryService.ts` — `uploadBehavioralResume()` (`resource_type: 'raw'`)
* [x] `AIService.ts` — `generateBehavioralQuestion()`, `answerCandidateQuestions()`, `evaluateBehavioral()`
* [x] `CacheService.ts` — behavioral cache (`omniprep:behavioral-evaluation:*`)
* [x] `QueueService.ts` — `enqueueBehavioralEvaluation()`, job `evaluate-behavioral`
* [x] `AIEvaluationWorker.ts` — `processBehavioralEvalJob()`
* [x] `modules/behavioral/` — validation, service, turn service, evaluation service, controller, routes
* [x] `app.ts` — mount `/api/behavioral`
* [x] Evaluation lookup: **DB → Redis → Queue**
* [x] Backend `tsc --noEmit` passes

### Completed (frontend)

* [x] `src/types/behavioral.ts`
* [x] `src/lib/api/behavioral.ts` — all 10 endpoints; multipart `resume`
* [x] `/behavioral` question bank (company/role/difficulty/search + `filterOptions`)
* [x] `/behavioral/[id]` — single-column flow: intro/resume → 7-phase interview → transcript → AI review → submissions history
* [x] Home page nav + CTAs for Behavioral

### Remaining

* [ ] **Manual browser E2E** — full 7-phase flow + AI review (see `PROJECT_CONTEXT.md` checklist)
* [ ] Optional: rename `behavioralPage` → `BehavioralPage` in bank page
* [ ] Optional: add Behavioral nav to `/problems` and `/system-design` headers

---

## Phase 6 — Full Mock Interview

**Goal:** Live ~90 min session; auto AI report when interview ends (reuse evaluation engine).

**Status:** Not Started | **Progress:** 0%

**Planned:** Socket.io, Redis session state, `MockInterview` + `MockInterviewReport` models.

---

## Phase 7 — Admin & Adaptive Engine

**Goal:** Admin dashboard, study plans, analytics; CRUD UI for questions.

**Status:** Not Started | **Progress:** 0%

**Planned:** `AIUsageLog`, `TopicPerformance`, `StudyPlan`, admin CRUD for all question types.

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
| M2 — DSA E2E in browser | Phase 2 | **Done** |
| M2.5 — First AI feedback on code | Phase 3 | **Done** |
| M3 — System design E2E in browser | Phase 4 | **Done** |
| **M3.5 — Behavioral E2E in browser** | **Phase 5** | **In progress** (code ready; verification pending) |
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
| **v0.5** | System design module | Phase 4 ✅ |
| **v0.6** | Behavioral module | Phase 5 *(code complete; E2E pending)* |
| **v0.7** | Mock interview | Phase 6 |
| **v0.8** | Admin + adaptive plans | Phase 7 |
| **v1.0** | Deployed MVP | Phase 8 |

---

## Feature Priority Matrix

### Critical (done)

* Authentication  
* DSA module + Judge0 + browser UI  
* DSA AI evaluation pipeline (on-demand)  
* Prisma + Neon  
* System design backend + frontend (full async pipeline)  
* Behavioral backend + frontend (full 7-phase flow + async eval)

### High Priority (now)

* **Manual behavioral browser E2E verification**  
* Fix SD follow-up answer display bug  
* README + deployment docs  

### Medium Priority

* `AIUsageLog` + admin analytics (Phase 7)  
* Auth refresh-on-401 UX  
* Nav consistency across all module pages  

### Low Priority

* Mock interview (Phase 6)  
* Production deployment (Phase 8)  

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Behavioral flow untested end-to-end in browser | Run manual E2E checklist in `PROJECT_CONTEXT.md` |
| `prisma generate` EPERM on Windows | Stop dev server before generate |
| Gemini multimodal diagram fetch fails | Cloudinary public URLs; error handling in AIService |
| Resume PDF parse returns empty text | Validate in `ResumeParserService`; user-facing error |
| Judge0 on Windows Docker | mrkushalsm/judge0 + LF config |
| Missing env vars block features | Document in README; `.env.example` at root |
| Upstash eviction policy warning | Set policy to `noeviction` for BullMQ reliability |

| Dependency | Phase | Status |
|------------|-------|--------|
| Neon | 1 | ✅ |
| Judge0 CE (Docker) | 2 | ✅ |
| Upstash Redis | 3–5 | ✅ |
| Google Gemini | 3–5 | ✅ |
| Cloudinary | 4–5 | ✅ (SD diagrams + behavioral resumes) |
| pdf-parse | 5 | ✅ |
| Socket.io | 6 | Pending |

---

*End of ROADMAP.md*
