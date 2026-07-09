# SESSION_HANDOFF.md

> **Last session date:** 2026-07-09  
> **Update this file at the end of every development session.**

---

# Last Session Summary

Completed **Phase 5 — Behavioral Module** (full backend + frontend). Built company/role-specific 7-phase interview flow with resume PDF upload, one-at-a-time AI questions, candidate Q&A round, async evaluation pipeline (DB → Redis → Queue), and single-column frontend (bank + interview + AI report + submissions history). Updated home page with Behavioral navigation. Documentation refresh pending until after manual E2E.

### Completed this session (Phase 5 — database & seed)

1. **`apps/backend/prisma/schema.prisma`** — `BehavioralQuestion`, `BehavioralSession`, `BehavioralTurn`, `BehavioralEvaluation`; enums `BehavioralPhaseType`, `BehavioralSessionStatus`
2. **`apps/backend/prisma/migrations/20260705113944_add_behavioral_module/`**
3. **`apps/backend/prisma/seeds/behavioral-questions.ts`** — 3 seeded questions (Google, Amazon, Microsoft); `buildStandardPhases()`
4. **`apps/backend/prisma/seed.ts`** — behavioral upsert loop

### Completed this session (Phase 5 — backend services & types)

5. **`apps/backend/src/types/behavioral.types.ts`** — phase Zod schema, evaluation metrics, `isAiQuestionPhase()`, `getPhaseAtIndex()`
6. **`apps/backend/src/services/ResumeParserService.ts`** — PDF only, 5 MB
7. **`apps/backend/src/services/CloudinaryService.ts`** — `uploadBehavioralResume()` (`resource_type: 'raw'`)
8. **`apps/backend/src/services/AIService.ts`** — `generateBehavioralQuestion()`, `answerCandidateQuestions()`, `evaluateBehavioral()`
9. **`apps/backend/src/services/CacheService.ts`** — `omniprep:behavioral-evaluation:{sha256}`
10. **`apps/backend/src/services/QueueService.ts`** — `evaluate-behavioral` job; ID `behavioral-eval-{sessionId}`
11. **`apps/backend/src/workers/AIEvaluationWorker.ts`** — `processBehavioralEvalJob()`

### Completed this session (Phase 5 — backend module)

12. **`apps/backend/src/modules/behavioral/behavioral.validation.ts`**
13. **`apps/backend/src/modules/behavioral/behavioral.service.ts`** — list with `filterOptions`, session CRUD
14. **`apps/backend/src/modules/behavioral/behavioral-turn.service.ts`** — next question, submit answer, candidate questions
15. **`apps/backend/src/modules/behavioral/behavioral-evaluation.service.ts`** — `requestBehavioralEvaluation()`, `getBehavioralEvaluation()`; DB → Redis → Queue
16. **`apps/backend/src/modules/behavioral/behavioral.controller.ts`**
17. **`apps/backend/src/modules/behavioral/behavioral.routes.ts`**
18. **`apps/backend/src/app.ts`** — mount `/api/behavioral`

### Completed this session (Phase 5 — frontend)

19. **`apps/frontend/src/types/behavioral.ts`**
20. **`apps/frontend/src/lib/api/behavioral.ts`** — 10 API functions; multipart field `resume`
21. **`apps/frontend/src/app/behavioral/page.tsx`** — bank with company/role/difficulty/search filters
22. **`apps/frontend/src/app/behavioral/[id]/page.tsx`** — full interview UI + AI report + submissions
23. **`apps/frontend/src/app/page.tsx`** — Behavioral nav + CTAs

### Documentation session (2026-07-09)

- Full repo analysis; updated `PROJECT_CONTEXT.md`, `ROADMAP.md`, `SESSION_HANDOFF.md`

---

# Current Project State

| Area | State |
|------|--------|
| **Phase** | **Phase 5 — Behavioral (~95%; manual E2E verification pending)** |
| **Overall** | **~90% of Phases 0–5**; **~70% of full 8-phase MVP** |
| **Backend** | `:4000` — `/health`, `/api/auth/*`, `/api/me`, `/api/problems/*`, `/api/submissions/*`, `/api/evaluations/*`, `/api/system-design/*`, **`/api/behavioral/*`** |
| **Worker** | `AIEvaluationWorker` — **DSA + SD + behavioral jobs** on `ai-eval-queue` |
| **Frontend** | `:3000` — `/`, `/login`, `/signup`, `/problems`, `/problems/[id]`, `/system-design`, `/system-design/[id]`, **`/behavioral`**, **`/behavioral/[id]`** |
| **Database** | Neon — **7 migrations**; 100 DSA + 3 SD + **3 behavioral questions** |
| **Redis** | Upstash — DSA + SD + behavioral cache + BullMQ (`ai-eval-queue`) |
| **AI** | Gemini `gemini-2.5-flash` — DSA eval, SD follow-ups + eval, behavioral questions + candidate replies + eval |
| **Cloudinary** | SD diagrams + behavioral resume PDFs |
| **Judge0** | Local Docker `:2358` |
| **Compile status** | Backend **`npx tsc --noEmit` passes** (2026-07-09) |
| **Auth gap** | `authStore.refresh()` not wired on 401 |

---

# Files Created / Updated (Phase 5 — cumulative)

### Backend — database & config

| File |
|------|
| `apps/backend/prisma/schema.prisma` |
| `apps/backend/prisma/migrations/20260705113944_add_behavioral_module/` |
| `apps/backend/prisma/seeds/behavioral-questions.ts` |
| `apps/backend/prisma/seed.ts` |
| `apps/backend/package.json` (+ `pdf-parse`, `@types/pdf-parse`) |

### Backend — services, types, worker

| File |
|------|
| `apps/backend/src/types/behavioral.types.ts` |
| `apps/backend/src/services/ResumeParserService.ts` |
| `apps/backend/src/services/CloudinaryService.ts` (extended) |
| `apps/backend/src/services/AIService.ts` (extended) |
| `apps/backend/src/services/CacheService.ts` (behavioral slice) |
| `apps/backend/src/services/QueueService.ts` (behavioral slice) |
| `apps/backend/src/workers/AIEvaluationWorker.ts` (behavioral jobs) |

### Backend — behavioral module

| File |
|------|
| `apps/backend/src/modules/behavioral/behavioral.validation.ts` |
| `apps/backend/src/modules/behavioral/behavioral.service.ts` |
| `apps/backend/src/modules/behavioral/behavioral-turn.service.ts` |
| `apps/backend/src/modules/behavioral/behavioral-evaluation.service.ts` |
| `apps/backend/src/modules/behavioral/behavioral.controller.ts` |
| `apps/backend/src/modules/behavioral/behavioral.routes.ts` |
| `apps/backend/src/app.ts` |

### Frontend

| File |
|------|
| `apps/frontend/src/types/behavioral.ts` |
| `apps/frontend/src/lib/api/behavioral.ts` |
| `apps/frontend/src/app/behavioral/page.tsx` |
| `apps/frontend/src/app/behavioral/[id]/page.tsx` |
| `apps/frontend/src/app/page.tsx` (nav + CTAs) |

---

# Features Completed (cumulative)

| Feature | Notes |
|---------|-------|
| Phases 0–4 | Auth, DSA, Judge0, on-demand DSA AI review, system design full flow — E2E tested |
| Behavioral Prisma models + seed | 3 company/role questions with 7-phase JSON |
| Behavioral REST API | Questions, sessions, turns, candidate Q&A, evaluation request/poll |
| Behavioral resume pipeline | PDF parse + Cloudinary upload; multipart field `resume` |
| Behavioral AI questions | Sync — one question per `next-question` call; follow-ups count toward phase total |
| Behavioral candidate phase | User questions bulk submit; AI interviewer reply |
| Behavioral async eval | DB → Redis → Queue → worker → DB; on-demand after `COMPLETED` |
| Behavioral frontend | Bank (company/role filters), interview page, AI report, submissions history |
| Home page behavioral entry | Nav + CTAs for logged-in users |

---

# Features In Progress

| Feature | Progress | Notes |
|---------|----------|-------|
| Phase 5 manual browser E2E | 0% | Code complete; full 7-phase flow not yet verified in browser |
| Phase 3 `AIUsageLog` | 0% | Optional — deferred |
| README | 0% | `.env.example` exists at repo root |
| Auth refresh-on-401 | ~5% | Optional |

---

# Pending Tasks

**Phase 5 — close out (before Phase 6):**

1. **Manual browser E2E** — sign in → `/behavioral` → filters → open Google question → upload resume → complete 10 AI Q&A → candidate questions → wrap-up → Generate AI Review → confirm report → submissions history → re-request eval (DB short-circuit)
2. Run `npx tsc --noEmit` in `apps/frontend` and fix any errors
3. Optional polish: rename `behavioralPage` → `BehavioralPage`; add Behavioral nav to `/problems` and `/system-design` headers

**Phase 6 — next major work (after Phase 5 sign-off):**

- Full mock interview module (Socket.io, Redis session state, `MockInterview` models) — not started

**Housekeeping (later):**

- `README.md`
- Fix SD follow-up answer display bug (`system-design/[id]/page.tsx`)
- `AIUsageLog` (optional Phase 3 remainder)
- `authStore.refresh()` on 401

---

# Current Blockers

| Blocker | Severity | Notes |
|---------|----------|-------|
| None critical | — | Behavioral pipeline compiles and is wired; awaiting manual verification |

**Watch items:**

- `GEMINI_API_KEY` required for behavioral questions, candidate replies, and evaluation
- `CLOUDINARY_*` required for resume uploads
- `REDIS_URL` required for async evaluation (questions work sync without worker for generation, but eval needs queue)
- Stop backend before `npx prisma generate` on Windows (EPERM)
- Multipart field names: SD **`diagram`**, behavioral **`resume`**
- Upstash eviction policy should be `noeviction` (warning logged if not)

---

# Known Bugs

| Bug | Status |
|-----|--------|
| Judge0 Windows / CRLF / cgroup | **Fixed** |
| Judge0 failure → generic 500 | **Fixed** |
| BullMQ ioredis type mismatch | **Fixed** |
| SD follow-up answers display "Submitted" not text | **Open** |
| `prisma generate` EPERM (Windows) | Open |
| `authStore.refresh()` on 401 | Open |
| `FRONTEND_URL` vs Next port | Open |
| `/problems` and `/system-design` pages missing Behavioral nav | Open (low) |
| Behavioral bank `behavioralPage` export name | Open (low) |

---

# Important Context

### Behavioral user flow (locked design)

1. Browse `/behavioral` — filter by company, role, difficulty, search
2. Open question → read intro statement → **upload PDF resume** → session created (`currentPhaseIndex: 1`)
3. **Ice-breaker (2)** → **Resume deep dive (3)** → **Core behavioral (3)** → **Company values (2)**  
   For each: click **Next question** → answer → submit (one question at a time)
4. **Candidate questions** — enter all questions at once → AI interviewer replies → session `COMPLETED`
5. **Wrap-up** statement displayed
6. Click **Generate AI review** (on-demand) → async report with STAR + metric scores
7. **Submissions** section — reload past attempts

### Behavioral API base path

All behavioral routes: **`/api/behavioral`** (auth required)

Evaluation routes use **session ID** as `:id` in `/evaluations/:id`.

### Evaluation lookup order (behavioral)

**DB → Redis → Queue** (not Redis → DB)

### Cache key prefixes

- DSA: `omniprep:dsa-evaluation:{sha256}`
- SD: `omniprep:sd-evaluation:{sha256}`
- Behavioral: `omniprep:behavioral-evaluation:{sha256}`

### Queue job names

- `evaluate-dsa` — job ID `dsa-eval-{submissionId}`
- `evaluate-system-design` — job ID `sd-eval-{submissionId}`
- `evaluate-behavioral` — job ID `behavioral-eval-{sessionId}`

### Behavioral evaluation metrics (0–100 unless noted)

`overallScore`, `communication`, `starStructure` (overall + situation/task/action/result at 0–25 each), `ownership`, `leadership`, `problemSolving`, `technicalDepth`, `impact`, `authenticity`, `confidence`

Plus narrative: `strongestAnswer`, `weakestAnswer`, `strengths`, `weaknesses`, `suggestions`, `summary`

### System design (unchanged)

- Two-round flow: submit → follow-ups → AI review
- Multipart field: **`diagram`**

### DSA (unchanged)

- AI report hidden until **Generate AI Review** clicked
- Full submit only for DSA AI review (`isSampleRun: false`)

---

# Next Recommended Task

**Task:** Manual browser E2E test of the full Behavioral flow (not a new file).

**Steps:**

1. Ensure migration + seed: `cd apps/backend && npx prisma migrate deploy && npm run seed` (confirm 3 behavioral questions)
2. Start backend (`REDIS_URL`, `GEMINI_API_KEY`, `CLOUDINARY_*` in `.env`)
3. Start frontend (`NEXT_PUBLIC_API_URL=http://localhost:4000`)
4. Sign in → Home → **Behavioral interviews** → open `google-software-engineer-behavioral`
5. Upload PDF resume → complete all 10 AI questions → submit candidate questions
6. **Generate AI review** → wait for report
7. Verify submissions history + instant re-request (DB short-circuit)

**If E2E passes:** Mark Phase 5 complete; begin **Phase 6 — Full Mock Interview** planning.

**Prerequisites for local testing:**

```bash
# Terminal 1 — Judge0 (DSA only; not needed for behavioral)
docker compose -f docker-compose.judge0.yml up -d

# Terminal 2 — Backend
cd apps/backend && npm run dev

# Terminal 3 — Frontend
cd apps/frontend && npm run dev
```

---

# Quick Resume Prompt

```
Read PROJECT_CONTEXT.md, ROADMAP.md, and SESSION_HANDOFF.md. Phases 0–4 complete and E2E verified. Phase 5 Behavioral code complete: 7-phase company/role interview, resume PDF upload, async eval (DB→Redis→Queue), full /api/behavioral, frontend bank + interview + AI report. Pending: manual browser E2E for behavioral. Next: E2E verify Phase 5, then Phase 6 Mock Interview. One file at a time.
```

---

## Maintenance checklist (end of session)

- [x] Update `PROJECT_CONTEXT.md`
- [x] Update `ROADMAP.md`
- [x] Update this file
- [x] Verify all three agree on phase and next step

---

*End of SESSION_HANDOFF.md*
