# SESSION_HANDOFF.md

> **Last session date:** 2026-06-20  
> **Update this file at the end of every development session.**

---

# Last Session Summary

Completed **Phase 3 — AI Evaluation Pipeline** (core + manual E2E testing). Built on-demand DSA AI review: user clicks **Generate AI Review** after a full submit; BullMQ worker calls Gemini; Redis caches identical code; results stored in `DsaEvaluation` and shown in the solver UI.

### Completed work (Phase 3 — backend)

1. **`prisma/schema.prisma`** — `DsaEvaluation` model (`@@map("DSAEvaluation")`); migration `20260620173002_add_dsa_evaluation`
2. **`src/config/redis.ts`** — Upstash ioredis singleton (`getRedis()`)
3. **`src/services/CacheService.ts`** — evaluation cache by `problemId:language:sourceCode` SHA-256; 7-day TTL
4. **`src/services/QueueService.ts`** — BullMQ `ai-eval-queue`; idempotent job id `dsa-eval-{submissionId}`
5. **`src/services/AIService.ts`** — `evaluateDSA()` via **Google Gemini** `gemini-2.5-flash` (`@google/genai`); Zod validation; scores 0–100 + complexity + follow-ups
6. **`src/workers/AIEvaluationWorker.ts`** — DB check → cache → Gemini → persist
7. **`src/modules/evaluations/`** — validation, service, controller, routes
8. **`src/app.ts`** — mount `/api/evaluations` behind auth
9. **`src/server.ts`** — start/stop worker; graceful SIGINT/SIGTERM shutdown

### Completed work (Phase 3 — frontend)

1. **`src/lib/api/evaluations.ts`** — `requestDSAEvaluation`, `getDSAEvaluation` + types
2. **`src/app/problems/[id]/page.tsx`** — Generate AI Review button; report UI (overall /100, 4 metrics, complexity card, follow-ups, feedback, suggestions); polls while pending; hidden until button pressed; sample runs excluded

### Key design decisions (this phase)

- **On-demand only** — `POST /api/submissions` unchanged; no auto-AI after submit
- **Gemini** instead of blueprint GPT-4o for DSA (code uses `GEMINI_API_KEY`)
- **Instant return** if evaluation exists in DB or Redis cache
- Pipeline reusable for mock interviews (Phase 6)

### Documentation session (2026-06-20)

- Updated `PROJECT_CONTEXT.md`, `ROADMAP.md`, `SESSION_HANDOFF.md` to reflect Phase 3 completion

---

# Current Project State

| Area | State |
|------|--------|
| **Phase** | **Phase 3 — ~95%** (core done; `AIUsageLog` + env polish remaining) |
| **Overall** | **~66%** of full MVP roadmap |
| **Backend** | `:4000` — `/health`, `/api/auth/*`, `/api/me`, `/api/problems/*`, `/api/submissions/*`, **`/api/evaluations/*`** |
| **Worker** | `AIEvaluationWorker` on `ai-eval-queue` when `REDIS_URL` set |
| **Frontend** | `:3000` — `/`, `/login`, `/signup`, `/problems`, `/problems/[id]` (+ AI review UI) |
| **Database** | Neon — **4 migrations**; 100 problems, 1000 test cases, `DSAEvaluation` table |
| **Redis** | Upstash — evaluation cache + BullMQ |
| **AI** | Google Gemini `gemini-2.5-flash` for DSA evaluation |
| **Judge0** | Local Docker `:2358` |
| **Auth gap** | `authStore.refresh()` not wired on 401 |
| **Next phase** | **Phase 3 polish** (optional) → **Phase 4 System Design** |

---

# Files Created / Updated (Phase 3)

### Backend

| File |
|------|
| `apps/backend/prisma/schema.prisma` (`DsaEvaluation`) |
| `apps/backend/prisma/migrations/20260620173002_add_dsa_evaluation/` |
| `apps/backend/src/config/redis.ts` |
| `apps/backend/src/config/db.ts` (explicit `PrismaClient` type) |
| `apps/backend/src/services/CacheService.ts` |
| `apps/backend/src/services/QueueService.ts` |
| `apps/backend/src/services/AIService.ts` |
| `apps/backend/src/workers/AIEvaluationWorker.ts` |
| `apps/backend/src/modules/evaluations/evaluations.validation.ts` |
| `apps/backend/src/modules/evaluations/evaluations.service.ts` |
| `apps/backend/src/modules/evaluations/evaluations.controller.ts` |
| `apps/backend/src/modules/evaluations/evaluations.routes.ts` |
| `apps/backend/src/app.ts` |
| `apps/backend/src/server.ts` |
| `apps/backend/package.json` — `bullmq`, `ioredis`, `@google/genai` |

### Frontend

| File |
|------|
| `apps/frontend/src/lib/api/evaluations.ts` |
| `apps/frontend/src/app/problems/[id]/page.tsx` (AI review UI) |

### Root

| File |
|------|
| `.env.example` — `GEMINI_API_KEY`, `REDIS_URL` documented |

---

# Features Completed

| Feature | Notes |
|---------|-------|
| Phase 0–2 | Unchanged — see prior handoffs |
| On-demand AI review API | POST/GET `/api/evaluations/:submissionId` |
| BullMQ worker | `ai-eval-queue`; concurrency 2 |
| Redis evaluation cache | Skip Gemini for identical code |
| Gemini structured evaluation | 5 scores /100, complexity, follow-ups |
| Generate AI Review UI | Results tab; full submit only |
| M2 milestone | First AI feedback on code ✅ |
| Manual E2E | User confirmed testing done |

---

# Features In Progress

| Feature | Progress | Notes |
|---------|----------|-------|
| Phase 3 polish | ~5% | `AIUsageLog`, `GEMINI_API_KEY` in `env.ts` |
| Git hygiene | ~80% | Partial commits; `evaluations.ts` may be untracked |
| README | 0% | |
| Phase 1 refresh UX | ~5% | Optional |

---

# Pending Tasks

**Phase 3 remainder (optional, one file at a time):**

1. `AIUsageLog` Prisma model + log writes in `AIEvaluationWorker` / `AIService`
2. `apps/backend/src/config/env.ts` — add `GEMINI_API_KEY` to Zod schema
3. Commit any untracked Phase 3 files

**Next major phase — Phase 4 System Design (one file at a time):**

1. `prisma/schema.prisma` — `SystemDesignQuestion`, `SystemDesignSubmission`, `SystemDesignEvaluation`
2. Backend module + routes
3. Extend `AIService` for system design
4. Frontend system design UI

**Housekeeping:**

- `README.md` — Judge0 Windows + Redis + Gemini + three-terminal dev
- Optional: `authStore.refresh()` on 401

---

# Current Blockers

| Blocker | Severity | Notes |
|---------|----------|-------|
| None critical | — | Phase 4 can start after optional Phase 3 polish |

**Watch items:**

- `GEMINI_API_KEY` required for AI review (runtime check in `AIService`)
- `REDIS_URL` required for worker + cache
- Stop backend before `npx prisma generate` on Windows (EPERM)
- Restart backend after env changes
- Sample runs cannot request AI review (by design)

---

# Known Bugs

| Bug | Status |
|-----|--------|
| Judge0 Windows / CRLF / cgroup | **Fixed** |
| Judge0 failure → generic 500 | **Fixed** |
| BullMQ ioredis type mismatch | **Fixed** |
| `prisma generate` EPERM (Windows) | Open |
| `authStore.refresh()` on 401 | Open |
| `FRONTEND_URL` vs Next port | Open |

---

# Important Context

1. **Submission API unchanged** — Judge0 only; AI is separate evaluations API.
2. **AI report hidden until button click** — not shown after Run/Submit.
3. **Full submit only** for AI review (`isSampleRun: false`).
4. **Prisma accessor:** `prisma.dsaEvaluation` (model `DsaEvaluation`, table `DSAEvaluation`).
5. **AI model in production code:** `gemini-2.5-flash` (not GPT-4o).
6. **Evaluation report fields:** `overallScore`, four metric scores (each 0–100), `complexityAnalysis`, `followUpQuestions`, `feedback`, `suggestions`.
7. **Cache key prefix:** `omniprep:dsa-evaluation:{sha256}`.
8. **Worker started in `server.ts`** only when `REDIS_URL` is set.

---

# Next Recommended Task

**Option A — Phase 3 polish (recommended if finishing phase cleanly):**  
Add `AIUsageLog` model to `apps/backend/prisma/schema.prisma` and migrate.

**Option B — Start Phase 4:**  
Add `SystemDesignQuestion` (+ related models) to `prisma/schema.prisma`.

**Prerequisites for local testing (unchanged):**

```bash
# Terminal 1 — Judge0
docker compose -f docker-compose.judge0.yml up -d

# Terminal 2 — Backend (REDIS_URL + GEMINI_API_KEY in apps/backend/.env)
cd apps/backend && npm run dev

# Terminal 3 — Frontend
cd apps/frontend && npm run dev
```

**AI review test flow:** Login → problem → **Submit** (not Run) → Results → **Generate AI Review**.

---

# Quick Resume Prompt

```
Read PROJECT_CONTEXT.md, ROADMAP.md, and SESSION_HANDOFF.md. Phase 3 (on-demand DSA AI evaluation) is ~95% complete and E2E tested: Gemini + BullMQ + Redis cache + Generate AI Review UI. Submissions API unchanged. Next: AIUsageLog polish OR Phase 4 System Design. One file at a time.
```

---

## Maintenance checklist (end of session)

- [x] Update `PROJECT_CONTEXT.md`
- [x] Update `ROADMAP.md`
- [x] Update this file
- [x] Verify all three agree on phase and next step

---

*End of SESSION_HANDOFF.md*
