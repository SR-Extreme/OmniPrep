# SESSION_HANDOFF.md

> **Last session date:** 2026-06-28  
> **Update this file at the end of every development session.**

---

# Last Session Summary

Continued **Phase 4 — System Design Module** (backend). Chose Phase 4 over optional Phase 3 `AIUsageLog` polish. Built database models, seed data, Cloudinary uploads, full REST module, and extended `AIService` for multimodal follow-ups and final evaluation. **Frontend not started.** Backend does **not** compile cleanly until SD cache/queue/worker are added.

### Completed this session (Phase 4 — backend)

1. **`prisma/schema.prisma`** — `SystemDesignQuestion`, `SystemDesignSubmission`, `SystemDesignEvaluation`; `scaleFactors`; migrations `20260626090305_add_system_design`, `20260628053657_add_system_design_scale_factors`
2. **`src/config/env.ts`** — `GEMINI_API_KEY`, `CLOUDINARY_*`, `isCloudinaryConfigured()`, `isGeminiConfigured()`
3. **`package.json`** — `cloudinary`, `multer`, `@types/multer`
4. **`src/services/CloudinaryService.ts`** — diagram upload to Cloudinary
5. **`src/types/system-design.types.ts`** — `EvaluationMetric[]`, parsers, `computeOverallScore()`
6. **`prisma/seed.ts`** — 3 system design questions with rubrics + scale factors
7. **`src/modules/system-design/`** — validation, service, follow-up service, evaluation service, controller, routes
8. **`src/app.ts`** — `/api/system-design` mounted
9. **`src/services/AIService.ts`** — `generateSystemDesignFollowUps()`, `evaluateSystemDesign()` (multimodal via `Part` + inline diagram data)

### Key design decisions (Phase 4)

- **Two-round flow:** initial answer (text and/or diagram) → **Get evaluation for follow up** (2 Gemini questions) → submit follow-up answers → **Generate AI Review**
- **Question shape:** `requirements` (functional/nonFunctional), `deliverables`, `constraints[]`, `scaleFactors[]`, rich `description`
- **`evaluationMetrics`:** array of `{ id, title, weight, criteria[] }` — weights sum to 100; aligns with deliverables
- **Scoring:** dynamic `metricScores` from Gemini; `overallScore` computed server-side with weighted rubric
- **Diagrams:** Cloudinary via `multer` field `diagram` on `POST /submissions`
- **On-demand final review** — same pattern as DSA (not auto after submit)

### Documentation session (2026-06-28)

- Full repo analysis; updated `PROJECT_CONTEXT.md`, `ROADMAP.md`, `SESSION_HANDOFF.md`

---

# Current Project State

| Area | State |
|------|--------|
| **Phase** | **Phase 4 — System Design (~35% of phase; backend ~70%)** |
| **Overall** | **~70%** of full MVP roadmap |
| **Backend** | `:4000` — `/health`, `/api/auth/*`, `/api/me`, `/api/problems/*`, `/api/submissions/*`, `/api/evaluations/*`, **`/api/system-design/*`** |
| **Worker** | `AIEvaluationWorker` — **DSA jobs only** (SD jobs not wired) |
| **Frontend** | `:3000` — `/`, `/login`, `/signup`, `/problems`, `/problems/[id]` — **no `/system-design`** |
| **Database** | Neon — **6 migrations**; 100 DSA problems + **3 SD questions** |
| **Redis** | Upstash — DSA cache + BullMQ (`ai-eval-queue`) |
| **AI** | Gemini `gemini-2.5-flash` — DSA eval, SD follow-ups, SD final eval (sync paths work; async SD pending) |
| **Cloudinary** | Integrated for SD diagrams (env required) |
| **Judge0** | Local Docker `:2358` |
| **Compile status** | **`tsc` fails** — missing SD exports in `CacheService.ts` + `QueueService.ts` |
| **Auth gap** | `authStore.refresh()` not wired on 401 |

---

# Files Created / Updated (Phase 4)

### Backend — database & config

| File |
|------|
| `apps/backend/prisma/schema.prisma` |
| `apps/backend/prisma/migrations/20260626090305_add_system_design/` |
| `apps/backend/prisma/migrations/20260628053657_add_system_design_scale_factors/` |
| `apps/backend/prisma/seed.ts` |
| `apps/backend/src/config/env.ts` |
| `apps/backend/package.json` |

### Backend — services & types

| File |
|------|
| `apps/backend/src/types/system-design.types.ts` |
| `apps/backend/src/services/CloudinaryService.ts` |
| `apps/backend/src/services/AIService.ts` (extended) |

### Backend — system-design module

| File |
|------|
| `apps/backend/src/modules/system-design/system-design.validation.ts` |
| `apps/backend/src/modules/system-design/system-design.service.ts` |
| `apps/backend/src/modules/system-design/system-design-follow-up.service.ts` |
| `apps/backend/src/modules/system-design/system-design-evaluation.service.ts` |
| `apps/backend/src/modules/system-design/system-design.controller.ts` |
| `apps/backend/src/modules/system-design/system-design.routes.ts` |
| `apps/backend/src/app.ts` |

### Frontend

| File | Status |
|------|--------|
| *(none for Phase 4 yet)* | Not started |

---

# Features Completed (cumulative)

| Feature | Notes |
|---------|-------|
| Phases 0–3 | Auth, DSA, Judge0, on-demand DSA AI review — E2E tested |
| SD Prisma models + seed | 3 questions with full rubric structure |
| SD REST API (routes live) | Questions, submissions, follow-ups, evaluation request/poll |
| SD Cloudinary upload | Multipart diagram on create submission |
| SD Gemini follow-ups | Sync — 2 questions from initial answer (+ diagram) |
| SD Gemini final eval | Function exists; async pipeline incomplete |

---

# Features In Progress

| Feature | Progress | Notes |
|---------|----------|-------|
| SD cache + queue + worker | 0% | **Blocks `tsc`** — next critical path |
| SD backend E2E test | 0% | After pipeline complete |
| SD frontend | 0% | Bank + practice page + API client |
| Phase 3 `AIUsageLog` | 0% | Optional — deferred |
| README | 0% | |
| Auth refresh-on-401 | ~5% | Optional |

---

# Pending Tasks

**Phase 4 — next files (one at a time, in order):**

1. **`apps/backend/src/services/CacheService.ts`** — add `SystemDesignEvaluationCachePayload`, `buildSystemDesignEvaluationCacheKey()`, `getCachedSystemDesignEvaluation()`, `setCachedSystemDesignEvaluation()`
2. **`apps/backend/src/services/QueueService.ts`** — add `SystemDesignEvalJobData`, `enqueueSystemDesignEvaluation()`, `getSystemDesignEvalJobState()`
3. **`apps/backend/src/workers/AIEvaluationWorker.ts`** — handle `evaluate-system-design` jobs
4. **`apps/backend/src/modules/system-design/system-design-evaluation.service.ts`** — add existing DB check before cache (small fix)
5. Manual backend test: full SD flow via API client
6. **`apps/frontend/src/types/system-design.ts`**
7. **`apps/frontend/src/lib/api/system-design.ts`**
8. **`apps/frontend/src/app/system-design/page.tsx`**
9. **`apps/frontend/src/app/system-design/[id]/page.tsx`**
10. **`apps/frontend/src/app/page.tsx`** — nav link

**Housekeeping (later):**

- `README.md`
- `AIUsageLog` (optional Phase 3 remainder)
- `authStore.refresh()` on 401

---

# Current Blockers

| Blocker | Severity | Notes |
|---------|----------|-------|
| **Missing SD cache/queue exports** | **High** | `npx tsc --noEmit` fails; evaluation service cannot run async final review |
| SD worker not handling SD jobs | High | Even after queue added, worker must process jobs |
| No frontend for SD | Medium | API unusable from browser |

**Watch items:**

- `GEMINI_API_KEY` required for follow-ups and final review
- `CLOUDINARY_*` required for diagram uploads
- `REDIS_URL` required for async final evaluation (sync follow-ups work without worker)
- Stop backend before `npx prisma generate` on Windows (EPERM)
- Multipart field name: **`diagram`**

---

# Known Bugs

| Bug | Status |
|-----|--------|
| Judge0 Windows / CRLF / cgroup | **Fixed** |
| Judge0 failure → generic 500 | **Fixed** |
| BullMQ ioredis type mismatch | **Fixed** |
| Backend `tsc` — SD cache/queue imports | **Open** |
| SD eval service missing DB short-circuit | Open (low) |
| `prisma generate` EPERM (Windows) | Open |
| `authStore.refresh()` on 401 | Open |
| `FRONTEND_URL` vs Next port | Open |

---

# Important Context

### System design user flow

1. Read question (description, requirements, deliverables, constraints, scaleFactors)
2. Submit **text and/or diagram**
3. Click **Get evaluation for follow up** → 2 Gemini questions stored on submission
4. Answer both follow-ups in text → PATCH submit
5. Click **Generate AI Review** → async final report with dynamic metric scores

### API base path

All system design routes: **`/api/system-design`** (auth required)

### JSON shapes (enforced in `system-design.types.ts`)

- `requirements`: `{ functional: string[], nonFunctional: string[] }`
- `evaluationMetrics`: `{ id, title, weight, criteria[] }[]` — weights sum to 100
- `followUpQuestions` / `followUpAnswers`: exactly **2** strings each
- `metricScores`: `{ [metricId]: number }` each 0–100

### DSA (unchanged)

- AI report hidden until **Generate AI Review** clicked
- Full submit only for DSA AI review (`isSampleRun: false`)
- Cache key prefix: `omniprep:dsa-evaluation:{sha256}`

---

# Next Recommended Task

**File:** `apps/backend/src/services/CacheService.ts`

Add system design evaluation caching alongside existing DSA cache:

- `SystemDesignEvaluationCachePayload` type (matches `SystemDesignEvaluationAIResult` from AIService)
- `buildSystemDesignEvaluationCacheKey({ questionId, textAnswer, diagramUrl, followUpQuestions, followUpAnswers })`
- `getCachedSystemDesignEvaluation()` / `setCachedSystemDesignEvaluation()`
- Cache key prefix: e.g. `omniprep:sd-evaluation:{sha256}`

This unblocks `system-design-evaluation.service.ts` imports and is prerequisite for step 17 (QueueService) and step 18 (worker).

**Prerequisites for local testing:**

```bash
# Terminal 1 — Judge0 (DSA only)
docker compose -f docker-compose.judge0.yml up -d

# Terminal 2 — Backend
cd apps/backend && npm run dev

# Terminal 3 — Frontend
cd apps/frontend && npm run dev
```

**Env required for full SD flow:** `DATABASE_URL`, `GEMINI_API_KEY`, `CLOUDINARY_*`, `REDIS_URL` (async final review)

---

# Quick Resume Prompt

```
Read PROJECT_CONTEXT.md, ROADMAP.md, and SESSION_HANDOFF.md. Phases 0–3 complete (DSA + on-demand AI review E2E tested). Phase 4 system design backend ~70%: schema, seed (3 questions), Cloudinary, full /api/system-design module, AIService multimodal follow-ups + final eval. Missing: CacheService + QueueService + worker SD slice (tsc fails). No frontend yet. Next file: CacheService.ts SD cache. One file at a time.
```

---

## Maintenance checklist (end of session)

- [x] Update `PROJECT_CONTEXT.md`
- [x] Update `ROADMAP.md`
- [x] Update this file
- [x] Verify all three agree on phase and next step

---

*End of SESSION_HANDOFF.md*
