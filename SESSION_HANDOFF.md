# SESSION_HANDOFF.md

> **Last session date:** 2026-07-03  
> **Update this file at the end of every development session.**

---

# Last Session Summary

Completed **Phase 4 — System Design Module** (backend async pipeline + full frontend). Wired SD evaluation cache, BullMQ queue, and worker; added DB short-circuit for repeat evaluation requests; built frontend types, API client, question bank, practice page with full two-round flow + AI review polling; updated home page with System Design navigation.

### Completed this session (Phase 4 — backend pipeline)

1. **`apps/backend/src/services/CacheService.ts`** — `SystemDesignEvaluationCachePayload`, `buildSystemDesignEvaluationCacheKey()`, `getCachedSystemDesignEvaluation()`, `setCachedSystemDesignEvaluation()`; prefix `omniprep:sd-evaluation:{sha256}`
2. **`apps/backend/src/services/QueueService.ts`** — `SystemDesignEvalJobData`, `enqueueSystemDesignEvaluation()`, `getSystemDesignEvalJobState()`; shared `ai-eval-queue`; job `evaluate-system-design`; job ID `sd-eval-{submissionId}`
3. **`apps/backend/src/workers/AIEvaluationWorker.ts`** — routes by `job.name`; `processSystemDesignEvalJob()` calls `evaluateSystemDesign()`, caches result, persists `SystemDesignEvaluation` with weighted `overallScore`
4. **`apps/backend/src/modules/system-design/system-design-evaluation.service.ts`** — `findExistingEvaluation()` short-circuit in `requestSystemDesignEvaluation()` (DSA parity)

### Completed this session (Phase 4 — frontend)

5. **`apps/frontend/src/types/system-design.ts`** — question, submission, evaluation types + API wrappers
6. **`apps/frontend/src/lib/api/system-design.ts`** — all 9 SD endpoints; multipart `FormData` for diagram field `diagram`
7. **`apps/frontend/src/app/system-design/page.tsx`** — authenticated question bank with filters + pagination
8. **`apps/frontend/src/app/system-design/[id]/page.tsx`** — full practice flow: submit → follow-ups → AI review report with dynamic rubric scores
9. **`apps/frontend/src/app/page.tsx`** — System Design nav links + logged-in CTAs

### Documentation session (2026-07-03)

- Full repo analysis; updated `PROJECT_CONTEXT.md`, `ROADMAP.md`, `SESSION_HANDOFF.md`

---

# Current Project State

| Area | State |
|------|--------|
| **Phase** | **Phase 4 — System Design (~95%; E2E verification pending)** |
| **Overall** | **~85%** of full MVP roadmap |
| **Backend** | `:4000` — `/health`, `/api/auth/*`, `/api/me`, `/api/problems/*`, `/api/submissions/*`, `/api/evaluations/*`, **`/api/system-design/*`** |
| **Worker** | `AIEvaluationWorker` — **DSA + SD jobs** on `ai-eval-queue` |
| **Frontend** | `:3000` — `/`, `/login`, `/signup`, `/problems`, `/problems/[id]`, **`/system-design`**, **`/system-design/[id]`** |
| **Database** | Neon — **6 migrations**; 100 DSA problems + **3 SD questions** |
| **Redis** | Upstash — DSA + SD cache + BullMQ (`ai-eval-queue`) |
| **AI** | Gemini `gemini-2.5-flash` — DSA eval, SD follow-ups (sync), SD final eval (async) |
| **Cloudinary** | Integrated for SD diagrams (env required) |
| **Judge0** | Local Docker `:2358` |
| **Compile status** | **`npx tsc --noEmit` passes** (backend verified 2026-07-03) |
| **Auth gap** | `authStore.refresh()` not wired on 401 |

---

# Files Created / Updated (Phase 4 — cumulative)

### Backend — database & config

| File |
|------|
| `apps/backend/prisma/schema.prisma` |
| `apps/backend/prisma/migrations/20260626090305_add_system_design/` |
| `apps/backend/prisma/migrations/20260628053657_add_system_design_scale_factors/` |
| `apps/backend/prisma/seed.ts` |
| `apps/backend/src/config/env.ts` |
| `apps/backend/package.json` |

### Backend — services, types, worker

| File |
|------|
| `apps/backend/src/types/system-design.types.ts` |
| `apps/backend/src/services/CloudinaryService.ts` |
| `apps/backend/src/services/AIService.ts` (extended) |
| `apps/backend/src/services/CacheService.ts` (DSA + SD cache) |
| `apps/backend/src/services/QueueService.ts` (DSA + SD queue) |
| `apps/backend/src/workers/AIEvaluationWorker.ts` (DSA + SD jobs) |

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

| File |
|------|
| `apps/frontend/src/types/system-design.ts` |
| `apps/frontend/src/lib/api/system-design.ts` |
| `apps/frontend/src/app/system-design/page.tsx` |
| `apps/frontend/src/app/system-design/[id]/page.tsx` |
| `apps/frontend/src/app/page.tsx` (nav + CTAs) |

---

# Features Completed (cumulative)

| Feature | Notes |
|---------|-------|
| Phases 0–3 | Auth, DSA, Judge0, on-demand DSA AI review — E2E tested |
| SD Prisma models + seed | 3 questions with full rubric structure |
| SD REST API | Questions, submissions, follow-ups, evaluation request/poll |
| SD Cloudinary upload | Multipart diagram on create submission |
| SD Gemini follow-ups | Sync — 2 questions from initial answer (+ diagram) |
| SD async final eval | Cache → queue → worker → DB; DB short-circuit on repeat request |
| SD frontend | Bank, practice page, AI report UI with dynamic metric scores |
| Home page SD entry | Nav + CTAs for logged-in users |

---

# Features In Progress

| Feature | Progress | Notes |
|---------|----------|-------|
| Phase 4 manual browser E2E | 0% | Code complete; full flow not yet verified in browser |
| Phase 3 `AIUsageLog` | 0% | Optional — deferred |
| README | 0% | `.env.example` exists at repo root |
| Auth refresh-on-401 | ~5% | Optional |

---

# Pending Tasks

**Phase 4 — close out (before Phase 5):**

1. **Manual browser E2E** — sign in → `/system-design` → open question → submit text/diagram → generate follow-ups → submit answers → Generate AI Review → confirm report
2. **Fix UI bug** — `system-design/[id]/page.tsx`: submitted follow-up answers should display `{answer}` text, not only "Submitted"
3. Optional polish: System Design nav on `/problems` pages; align follow-up button label to "Get evaluation for follow up"

**Phase 5 — next major work (after Phase 4 sign-off):**

- Behavioral module (schema, API, frontend) — not started

**Housekeeping (later):**

- `README.md`
- `AIUsageLog` (optional Phase 3 remainder)
- `authStore.refresh()` on 401

---

# Current Blockers

| Blocker | Severity | Notes |
|---------|----------|-------|
| None critical | — | SD pipeline compiles and is wired; awaiting manual verification |

**Watch items:**

- `GEMINI_API_KEY` required for follow-ups and final review
- `CLOUDINARY_*` required for diagram uploads
- `REDIS_URL` required for async final evaluation (follow-ups work without worker)
- Stop backend before `npx prisma generate` on Windows (EPERM)
- Multipart field name: **`diagram`**

---

# Known Bugs

| Bug | Status |
|-----|--------|
| Judge0 Windows / CRLF / cgroup | **Fixed** |
| Judge0 failure → generic 500 | **Fixed** |
| BullMQ ioredis type mismatch | **Fixed** |
| Backend `tsc` — SD cache/queue imports | **Fixed** |
| SD eval service missing DB short-circuit | **Fixed** |
| SD follow-up answers display "Submitted" not text | **Open** |
| `prisma generate` EPERM (Windows) | Open |
| `authStore.refresh()` on 401 | Open |
| `FRONTEND_URL` vs Next port | Open |
| `/problems` pages missing System Design nav | Open (low) |

---

# Important Context

### System design user flow

1. Read question (description, requirements, deliverables, constraints, scaleFactors)
2. Submit **text and/or diagram**
3. Click **Generate Follow Ups** (UI) / **Get evaluation for follow up** (spec) → 2 Gemini questions stored on submission
4. Answer both follow-ups in text → PATCH submit
5. Click **Generate AI Review** → async final report with dynamic metric scores (frontend polls every 2s, max 60 attempts)

### API base path

All system design routes: **`/api/system-design`** (auth required)

Evaluation routes use **submission ID** as `:id` in `/evaluations/:id`.

### JSON shapes (enforced in `system-design.types.ts`)

- `requirements`: `{ functional: string[], nonFunctional: string[] }`
- `evaluationMetrics`: `{ id, title, weight, criteria[] }[]` — weights sum to 100
- `followUpQuestions` / `followUpAnswers`: exactly **2** strings each
- `metricScores`: `{ [metricId]: number }` each 0–100

### Cache key prefixes

- DSA: `omniprep:dsa-evaluation:{sha256}`
- SD: `omniprep:sd-evaluation:{sha256}`

### DSA (unchanged)

- AI report hidden until **Generate AI Review** clicked
- Full submit only for DSA AI review (`isSampleRun: false`)

---

# Next Recommended Task

**Task:** Manual browser E2E test of the full System Design flow (not a new file).

**Steps:**

1. Start backend (`REDIS_URL`, `GEMINI_API_KEY`, `CLOUDINARY_*` in `.env`)
2. Start frontend (`NEXT_PUBLIC_API_URL=http://localhost:4000`)
3. Sign in → Home → **System design** → open `design-url-shortener`
4. Submit text answer → **Generate Follow Ups** → answer both → **Submit follow-up answers**
5. **Generate AI Review** → wait for rubric report
6. Click **Generate AI Review** again → should return instantly (DB short-circuit)

**If E2E passes, next code task:** Fix follow-up answer display bug in `apps/frontend/src/app/system-design/[id]/page.tsx`, then begin **Phase 5 — Behavioral Module**.

**Prerequisites for local testing:**

```bash
# Terminal 1 — Judge0 (DSA only)
docker compose -f docker-compose.judge0.yml up -d

# Terminal 2 — Backend
cd apps/backend && npm run dev

# Terminal 3 — Frontend
cd apps/frontend && npm run dev
```

---

# Quick Resume Prompt

```
Read PROJECT_CONTEXT.md, ROADMAP.md, and SESSION_HANDOFF.md. Phases 0–3 complete. Phase 4 System Design code complete: backend async pipeline (cache/queue/worker), full /api/system-design, frontend bank + practice + AI review UI. Backend tsc passes. Pending: manual browser E2E, fix follow-up answer display bug. Next: E2E verify Phase 4, then Phase 5 Behavioral. One file at a time.
```

---

## Maintenance checklist (end of session)

- [x] Update `PROJECT_CONTEXT.md`
- [x] Update `ROADMAP.md`
- [x] Update this file
- [x] Verify all three agree on phase and next step

---

*End of SESSION_HANDOFF.md*
