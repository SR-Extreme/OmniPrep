# PROJECT_CONTEXT.md

> **Last updated:** 2026-07-25
> **Project:** OmniPrep (`interview-prep-platform`)
> **Purpose:** Permanent architecture and product source of truth. Update whenever behavior, integrations, schema, or major decisions change.

---

## 1. Product Summary

OmniPrep is a full-stack interview preparation platform for:

- DSA practice with Judge0 execution and on-demand Gemini feedback
- System design practice with text/diagram submissions, AI follow-ups, and rubric-based evaluation
- Company/role-specific behavioral interviews with resume-aware questions and STAR evaluation
- A full sequential mock interview combining DSA, System Design, and Behavioral sections
- A final score report, frontend-only hiring recommendation, and AI-generated 7-day study plan

Primary users are interview candidates. Admins manage content, users, and revenue. Premium subscribers unlock Mock Interviews and related premium features.

### Current state

- **Phases 0–7 are implemented in code.**
- Phase 6 has been partially exercised manually (application starts and section transition/timer behavior has been tested), but the full start-to-report E2E has not been signed off (deferred; does not block Phase 7).
- **Phase 7 is code-complete:** Admin Panel, User Profile, Premium Subscription & Revenue (Stripe Checkout + webhook). Manual Phase 7 E2E sign-off is the next gate.
- Phase 8 (deployment/polish) is not started.
- Backend and frontend `npx tsc --noEmit` both pass as of **2026-07-18** (re-verify after Phase 7 E2E if needed).
- There are no automated unit, integration, or E2E tests.
- Phase 7 deps are in use: `stripe` (backend); Recharts + Shadcn-style UI primitives (frontend). Framer Motion / React Hook Form were listed as optional supporting deps and are lightly used or unused where `useState` forms suffice.
- Stripe Checkout uses **`mode: 'payment'`** with **one-time** Price IDs (not recurring). Local webhook delivery requires `stripe listen --forward-to localhost:4000/api/billing/webhook` and matching `STRIPE_WEBHOOK_SECRET`.

Do not use the older Phase 6 description of a ~90-minute Socket.io interview. The implemented and user-approved design is REST/polling with three one-hour sections.

Do not use any earlier Phase 7 “adaptive analytics / AIUsageLog / TopicPerformance” plan. The official Phase 7 scope is Admin Panel + User Profile + Premium/Stripe only.

---

## 2. Technology Stack

| Layer | Implementation |
|---|---|
| Monorepo | npm workspaces: `apps/backend`, `apps/frontend` |
| Frontend | Next.js 14 App Router, React 18, TypeScript, Tailwind CSS 3, Zustand 5 |
| Backend | Node.js, Express 4, TypeScript, ESM/NodeNext |
| Database | PostgreSQL (Neon) via Prisma 6 |
| Authentication | bcrypt, JWT access/refresh tokens, DB-stored hashed refresh tokens |
| Code execution | Judge0 CE; local Docker compose stack on port 2358 |
| AI | Google Gemini `gemini-2.5-flash` via `@google/genai` |
| Async jobs | BullMQ 5 + Upstash Redis/ioredis |
| Uploads | Multer memory storage (5 MB), Cloudinary (diagrams, resumes, **profile avatars**) |
| Resume parsing | `pdf-parse`; PDF only |
| Editor | Monaco via `@monaco-editor/react` |
| Payments | Stripe Checkout + webhooks (Phase 7) |
| Charts / motion / forms (Phase 7) | Recharts, Framer Motion, React Hook Form, Shadcn/UI primitives |

There is no Socket.io dependency and no WebSocket server. Phase 6 uses authenticated REST calls plus frontend polling.

---

## 3. Repository Layout

```text
OmniPrep/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/                 # 8 migrations
│   │   │   ├── seed.ts
│   │   │   └── seeds/                      # DSA specs/data + behavioral seeds
│   │   └── src/
│   │       ├── app.ts                      # Express middleware and router mounts
│   │       ├── server.ts                   # HTTP server + AI worker startup
│   │       ├── config/                     # env, Prisma, Redis
│   │       ├── middleware/                 # auth/admin middleware
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   ├── problems/
│   │       │   ├── submissions/
│   │       │   ├── evaluations/
│   │       │   ├── system-design/
│   │       │   ├── behavioral/
│   │       │   └── mock-interview/
│   │       ├── services/                   # AI, Judge0, queue/cache, uploads, runner
│   │       ├── types/
│   │       └── workers/AIEvaluationWorker.ts
│   └── frontend/
│       └── src/
│           ├── app/                        # Next.js routes
│           ├── components/                 # Monaco + mock interview UI
│           ├── lib/api/                    # typed API clients
│           ├── store/authStore.ts
│           └── types/
├── infra/judge0/judge0.conf
├── docker-compose.judge0.yml
├── .env.example
├── PROJECT_CONTEXT.md
├── ROADMAP.md
└── SESSION_HANDOFF.md
```

Backend convention: thin controllers, business logic in services, **Zod validation modules (`*.validation.ts`) for all request/query/body input**, `.js` extensions in ESM imports. Phase 7 billing/profile/admin modules must follow the same layout as prior phases.

---

## 4. Frontend Routes and State

| Route | Purpose |
|---|---|
| `/` | Landing page and module navigation |
| `/login`, `/signup` | Authentication |
| `/problems` | DSA bank |
| `/problems/[id]` | Monaco solver, Run/Submit, results, on-demand AI report |
| `/system-design` | System design bank |
| `/system-design/[id]` | Answer/diagram, two follow-ups, on-demand AI report |
| `/behavioral` | Behavioral bank with company/role/difficulty/search filters |
| `/behavioral/[id]` | Standalone 7-phase behavioral interview and report |
| `/mock-interview` | Create/list/start/resume mock interviews (**Premium-only** in Phase 7) |
| `/mock-interview/[id]` | Timed interview shell, finalize screen, completed report |
| `/premium` | Pricing / Stripe Checkout entry (Phase 7) |
| `/profile` | Candidate profile, stats, study-plan history (Phase 7) |
| `/admin` | Admin landing (hero + 5 feature cards) (Phase 7) |
| `/admin/*` | Create/list questions, revenue, mock analytics, users, admin profile (Phase 7) |

`authStore` persists the user and tokens to local storage under `omniprep-auth`. The API client sends bearer tokens and credentials. On HTTP 401 for authenticated requests, it single-flights `POST /api/auth/refresh`, updates the store, and retries once; failed refresh clears the session.

Mock interview components:

- `MockInterviewSidebar.tsx`
- `SectionTimer.tsx`
- `DsaSectionWorkspace.tsx`
- `SystemDesignSectionWorkspace.tsx`
- `BehavioralSectionWorkspace.tsx`
- `HiringRecommendation.tsx`
- `MockInterviewReport.tsx`
- `StudyPlanPanel.tsx`

Completed report order is locked:

1. Hiring recommendation
2. Report
3. Study plan

The hiring recommendation is a frontend-only fixed score-band interpretation. It is not generated by AI and is not persisted by the backend.

---

## 5. Backend Runtime Architecture

`src/server.ts`:

1. Loads and validates environment variables.
2. Starts `AIEvaluationWorker` when `REDIS_URL` exists.
3. Starts Express on `PORT` (default 4000).
4. Gracefully closes the worker and server on SIGINT/SIGTERM.

`src/app.ts` mounts:

- `/api/auth`
- `/api/problems`
- `/api/submissions`
- `/api/evaluations`
- `/api/system-design`
- `/api/behavioral`
- `/api/mock-interview`
- `/api/me`
- `/api/admin` (Phase 7; `authMiddleware` + `adminMiddleware`)
- `/api/billing` / Stripe webhook (Phase 7; webhook uses raw body + signature verify)
- `/api/profile` (Phase 7; or expanded `/api/me`)
- `/health`

All feature routers except auth, health, and the Stripe webhook are protected by `authMiddleware`. Admin routes also require `adminMiddleware`. Premium routes require server-side premium checks (`isPremium` / `premiumTill`); never trust the client.

### Shared async evaluation pipeline

```text
Request evaluation
  → existing DB evaluation?
  → cached evaluation?
  → enqueue BullMQ job on ai-eval-queue
  → AIEvaluationWorker calls Gemini
  → persist evaluation
  → frontend polls GET evaluation endpoint
```

Queue jobs:

| Job | Job ID |
|---|---|
| `evaluate-dsa` | `dsa-eval-{submissionId}` |
| `evaluate-system-design` | `sd-eval-{submissionId}` |
| `evaluate-behavioral` | `behavioral-eval-{sessionId}` |

Cache prefixes:

- `omniprep:dsa-evaluation:`
- `omniprep:sd-evaluation:`
- `omniprep:behavioral-evaluation:`

---

## 6. Implemented Module Flows

### Authentication

- Signup, login, refresh, logout
- Access and refresh JWTs
- Refresh token hashes persisted in PostgreSQL
- Candidate/admin roles; admin middleware exists

### DSA

```text
Browse problem → edit solution in Monaco → Run sample or Submit full solution
→ backend wraps solution by language → Judge0 → store Submission
→ optional Generate AI Review → async evaluation → poll report
```

- Languages: C++, Java, Python
- Hidden test data and solution code are not exposed
- Sample runs are not eligible for AI evaluation
- Seed target: 100 published problems and approximately 1000 tests

### System Design

```text
Question → text and/or diagram submission
→ Gemini generates exactly 2 follow-up questions
→ candidate submits 2 follow-up answers
→ optional Generate AI Review
→ async rubric evaluation and polling
```

- Multipart field: `diagram`
- Cloudinary stores diagrams, behavioral resumes, and profile avatars
- Initial answer requires text, diagram, or both
- Evaluation requires completed follow-up answers
- `evaluationMetrics` are question-defined; backend computes weighted overall score

### Standalone Behavioral

The seeded flow has seven phases:

1. `INTRODUCTION`
2. `ICE_BREAKER` (2 AI questions)
3. `RESUME_DEEP_DIVE` (3)
4. `CORE_BEHAVIORAL` (3)
5. `COMPANY_VALUES` (2)
6. `CANDIDATE_QUESTIONS`
7. `WRAP_UP`

Resume upload and parsing create the session at phase index 1. Questions are generated one at a time and each unanswered turn blocks progression. Candidate questions are submitted in one batch; the AI replies as interviewer and the session completes. Evaluation is manually requested after completion.

Multipart field: `resume`.

### Full Mock Interview (Phase 6)

#### Locked product behavior

- Section order: **DSA → System Design → Behavioral**
- No returning to submitted sections
- Two random published **MEDIUM** DSA problems
- One random published system design question
- Behavioral question selected after the user chooses a role
- One-hour cap per section; nominal total is three hours
- Backend timestamps are authoritative; frontend only renders a local countdown between polls
- REST + polling; no Socket.io
- Section evaluations start asynchronously when the section is submitted
- Progression does not wait for evaluation completion
- Report aggregation is deterministic; no AI aggregation
- Report and study plan are available only after finalization changes status to `COMPLETED`
- Study plan is the only post-interview AI generation

#### State machine

```text
NOT_STARTED
  → start
IN_PROGRESS / DSA
  → submit or timeout
IN_PROGRESS / SYSTEM_DESIGN
  → submit or timeout
IN_PROGRESS / BEHAVIORAL
  → finalize section or timeout
AWAITING_FINAL_SUBMIT
  → finalize interview
COMPLETED
  → hiring recommendation + report + optional study plan
```

#### Timer behavior

`MockInterview` stores:

- `startTime`
- `dsaStartedAt`, `dsaSubmittedAt`
- `systemDesignStartedAt`, `systemDesignSubmittedAt`
- `behavioralStartedAt`, `behavioralSubmittedAt`
- `finalizedAt`

`GET /api/mock-interview/:id` calls timeout synchronization before returning the session. The frontend polls every 30 seconds and refreshes when its section timer reaches zero. DSA and System Design auto-submit at their deadline. Behavioral time starts when the role is selected; on timeout it finalizes with an evaluation only if the behavioral session already completed. Before role selection, `behavioralStartedAt` and the backend deadline are null: timeout sync does nothing while the UI repeatedly shows a fresh one-hour value, so this state can currently stall indefinitely.

#### Section details

- **DSA:** submitting the section resolves the latest full submission for each assigned problem created after `dsaStartedAt`. Missing submissions are allowed and score zero in the report.
- **System Design:** manual section submit requires a linked submission with follow-up answers. Timeout may close it without a submission.
- **Behavioral:** reuses `BehavioralSession` and existing turn endpoints, but mock-linked sessions skip `CANDIDATE_QUESTIONS` and complete at wrap-up. Manual section finalize requires the session to be `COMPLETED`.

#### Evaluation/report behavior

- DSA triggers one evaluation per available problem submission.
- System Design triggers evaluation for the linked submission.
- Behavioral triggers evaluation for the linked session.
- Trigger failures are intentionally non-blocking; report polling exposes pending/failed state.
- DSA section score is the average of two problem scores, including zero for no submission.
- Overall score is the average of the three section scores.
- Section and total time are derived from timestamps and capped at one hour per section.
- The report can contain `PENDING`, `FAILED`, or `NO_SUBMISSION` details and can change after refresh while evaluation jobs finish.

#### Study plan

- Available only for a `COMPLETED` interview.
- Gemini receives timing, section scores, evaluation status, DSA metric/complexity feedback, system design feedback, and behavioral metrics/answer highlights.
- Output is Zod-validated as exactly seven ordered days plus a summary.
- One plan is persisted per interview (`mockInterviewId` unique); subsequent generate calls return the existing plan.

---

## 7. API Reference

All routes below require bearer authentication unless noted.

### Auth (`/api/auth`, public)

| Method | Route |
|---|---|
| POST | `/signup` |
| POST | `/login` |
| POST | `/refresh` |
| POST | `/logout` |

### Problems / submissions / DSA evaluations

| Method | Route |
|---|---|
| GET | `/api/problems` |
| GET | `/api/problems/:idOrSlug` |
| POST | `/api/submissions` |
| GET | `/api/submissions/me` |
| GET | `/api/submissions/:id` |
| POST | `/api/evaluations/:submissionId` |
| GET | `/api/evaluations/:submissionId` |

### System Design (`/api/system-design`)

| Method | Route |
|---|---|
| GET | `/questions` |
| GET | `/questions/:idOrSlug` |
| POST | `/submissions` |
| GET | `/submissions/me` |
| GET | `/submissions/:id` |
| POST | `/submissions/:id/follow-ups/generate` |
| PATCH | `/submissions/:id/follow-ups` |
| POST | `/evaluations/:id` |
| GET | `/evaluations/:id` |

### Behavioral (`/api/behavioral`)

| Method | Route |
|---|---|
| GET | `/questions` |
| GET | `/questions/:idOrSlug` |
| POST | `/sessions` |
| GET | `/sessions/me` |
| GET | `/sessions/:id` |
| POST | `/sessions/:id/next-question` |
| PATCH | `/sessions/:id/turns/:turnId` |
| POST | `/sessions/:id/candidate-questions` |
| POST | `/evaluations/:id` |
| GET | `/evaluations/:id` |

### Mock Interview (`/api/mock-interview`)

| Method | Route | Purpose |
|---|---|---|
| POST | `/` | Create assignments |
| GET | `/me` | Paginated history |
| GET | `/behavioral/roles` | Published role options |
| GET | `/:id` | Get session and synchronize timeout |
| POST | `/:id/start` | Start DSA and timers |
| POST | `/:id/dsa/slots/:slotIndex/submission` | Link full DSA submission |
| POST | `/:id/system-design/submission` | Link SD submission |
| POST | `/:id/sections/:section/submit` | Submit DSA or SD |
| POST | `/:id/behavioral/start` | Select role/question and start timer |
| POST | `/:id/behavioral/session` | Multipart resume; create behavioral session |
| POST | `/:id/behavioral/finalize` | Close behavioral section and trigger eval |
| POST | `/:id/finalize` | `AWAITING_FINAL_SUBMIT` → `COMPLETED` |
| GET | `/:id/report` | Completed interview report only |
| GET | `/:id/study-plan` | Existing plan or null |
| POST | `/:id/study-plan` | Generate/return plan |

### Phase 7 APIs (implemented)

| Area | Purpose |
|---|---|
| Profile `/api/profile` | Get/update profile; avatar upload (Cloudinary); DSA/SD/behavioral stats; study-plan history + progress submit |
| Admin `/api/admin` | Questions CRUD (DSA/SD/Behavioral); users list/search/delete; admin profile; revenue + mock analytics |
| Billing `/api/billing` | Plan catalog; premium status; create Checkout Session; Stripe webhook (`POST /api/billing/webhook`, raw body + signature) |

---

## 8. Database

Prisma currently defines **19 models** (Phase 7 added `Subscription`):

- Auth: `User`, `RefreshToken`, `Subscription`
- DSA: `Problem`, `TestCase`, `Submission`, `DsaEvaluation`
- System Design: `SystemDesignQuestion`, `SystemDesignSubmission`, `SystemDesignEvaluation`
- Behavioral: `BehavioralQuestion`, `BehavioralSession`, `BehavioralTurn`, `BehavioralEvaluation`
- Mock Interview: `MockInterview`, `MockInterviewDsaProblem`, `MockInterviewSystemDesign`, `MockInterviewBehavioral`, `MockInterviewStudyPlan`

Eleven migrations:

| Migration | Scope |
|---|---|
| `20260602154035_init` | User and refresh token |
| `20260604160104_require_user_name` | Required user name |
| `20260604205409_add_dsa_models` | DSA core |
| `20260620173002_add_dsa_evaluation` | DSA evaluation |
| `20260626090305_add_system_design` | System design |
| `20260628053657_add_system_design_scale_factors` | SD scale factors |
| `20260705113944_add_behavioral_module` | Behavioral |
| `20260710160452_add_mock_interview` | Full mock interview and study plan |
| `20260718123705_add_phase7_premium_admin` | User premium/profile fields, `Subscription`, study-plan progress |
| `20260725131755_add_otp_challenges` | OTP challenges |
| `20260725180000_add_behavioral_published_at` | Behavioral `publishedAt` for admin publish parity |

### Phase 7 schema extensions (official)

**User** (add):

| Field | Purpose |
|---|---|
| `image` | Profile picture URL (Cloudinary `secure_url`; never store binary in Postgres) |
| `phoneNo` | Phone number |
| `isPremium` | Current premium flag |
| `premiumFrom` | Current period start |
| `premiumTill` | Current period end |
| `averageInterviewScore` | Rolling average of completed mock overall scores |
| `recentLogin` | Last successful login |

**Subscription** (new; payment history — not denormalized onto User beyond current status):

| Field | Purpose |
|---|---|
| `userId` / `user` | Owner |
| `plan` | `MONTHLY` \| `SIX_MONTHS` \| `YEARLY` |
| `amount` | Charged amount |
| `currency` | e.g. `INR` |
| `status` | `PENDING` \| `ACTIVE` \| `EXPIRED` \| `FAILED` \| `REFUNDED` |
| `stripeSessionId` | Checkout session id (unique) |
| `stripePaymentIntentId` | Payment intent id |
| `startsAt` / `expiresAt` | Entitlement window |
| `createdAt` / `updatedAt` | Timestamps |

**MockInterviewStudyPlan** (extend for profile history progress):

| Field | Purpose |
|---|---|
| `completedTaskKeys` | JSON list of checked task keys |
| `completionPercent` | 0–100 |
| `completedAt` | Set when 100% |

Keep only **current** premium status on `User`. All historical payments live in `Subscription`.

**One active enrollment rule (locked):** at any time a user may have at most **one** active premium enrollment among `MONTHLY` / `SIX_MONTHS` / `YEARLY`.

- `User.isPremium` + `premiumTill` represent that single current entitlement.
- Creating a Checkout session is rejected if the user already has active premium (`premiumTill` in the future).
- On successful webhook activation, any other `ACTIVE` `Subscription` rows for that user are marked `EXPIRED` before the new one becomes `ACTIVE`.
- Historical rows remain for revenue analytics; only one may be `ACTIVE` at a time.
- Stacking, concurrent plans, or mid-cycle plan switching is out of scope for Phase 7 (user waits until expiry, then can subscribe again).

Analytics (revenue, premium %, hiring bands, averages, submission counts) are **computed with aggregate Prisma queries** — do not store redundant analytics tables.

Eleven migrations including Phase 7 premium/admin and Behavioral admin publish parity (`20260725180000_add_behavioral_published_at`).

Seed data:

- 100 DSA problems loaded from JSON seed files
- 3 system design questions
- 3 behavioral questions (Google, Amazon, Microsoft)
- Mock interview assignments are created dynamically, not seeded

---

## 9. Environment and Local Development

### Required backend variables

| Variable | Requirement |
|---|---|
| `PORT` | Optional; defaults to 4000 |
| `DATABASE_URL` | Required |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Required; minimum 32 chars |
| `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY` | Defaults: `15m`, `7d` |
| `FRONTEND_URL` | Required valid URL |
| `JUDGE0_BASE_URL` | Required valid URL |
| `JUDGE0_API_KEY` | Optional for local CE |
| `REDIS_URL` | Required for queue-backed evaluations |
| `GEMINI_API_KEY` | Required for AI features |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Required for diagrams/resumes |
| `STRIPE_SECRET_KEY` | Phase 7; Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Phase 7; webhook signature |
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_SIX_MONTHS` / `STRIPE_PRICE_YEARLY` | Phase 7; Price IDs (or amount-based Checkout) |

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
# Optional Phase 7 publishable key if client Stripe.js is used
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### One-time setup

```bash
npm install
cd apps/backend
npx prisma migrate deploy
npx prisma generate
npm run seed:generate   # required: prisma/seeds/problems/*.json is gitignored
npm run seed
```

### Local runtime (three terminals)

```bash
# Terminal 1 — Judge0
docker compose -f docker-compose.judge0.yml up -d

# Terminal 2 — backend + worker
cd apps/backend
npm run dev

# Terminal 3 — frontend
cd apps/frontend
npm run dev
```

Open `http://localhost:3000`; health check is `http://localhost:4000/health`.

For Stripe webhooks locally, use Stripe CLI to forward to the backend webhook path.

On Windows, stop processes using Prisma Client before `prisma generate` if an `EPERM` rename error occurs.

---

## 10. Decision Log

| Date | Decision |
|---|---|
| 2026-06-01 | Rebuild with Next.js/TypeScript/Tailwind + Express/TypeScript ESM |
| 2026-06-04 | Use `/signup`, not `/register`; JSON stdin/stdout for multi-language Judge0 |
| 2026-06-17 | LeetCode-style solution classes; backend wraps code before Judge0 |
| 2026-06-20 | Gemini `gemini-2.5-flash`; DSA evaluation only on explicit request |
| 2026-06-25 | System design accepts text and/or diagram; exactly two follow-ups before evaluation |
| 2026-07-05 | Behavioral is a seven-phase company/role flow, not a single STAR chatbot |
| 2026-07-05 | Behavioral resume is PDF, max 5 MB; candidate questions are one bulk closing round |
| 2026-07-10 | Phase 6 is DSA → SD → Behavioral, one hour each, backend timestamp timers |
| 2026-07-10 | Phase 6 uses REST polling; no Socket.io/Redis session-state layer |
| 2026-07-10 | Random question assignment uses Fisher–Yates, not AI |
| 2026-07-10 | Section submit triggers async evaluation but never blocks progression |
| 2026-07-10 | Mock behavioral reuses the full behavioral engine but skips candidate questions |
| 2026-07-15 | Report is visible only after finalization (`COMPLETED`) |
| 2026-07-15 | Hiring bands are frontend-only; final screen order is recommendation → report → study plan |
| 2026-07-18 | Phase 7 official scope: Admin Panel + User Profile + Premium/Stripe only; supersedes prior adaptive-analytics Phase 7 plan |
| 2026-07-18 | Current premium status lives on `User`; payment history lives in `Subscription` |
| 2026-07-18 | Mock Interviews are Premium-only; enforce on server; UI uses modal (no `alert`) |
| 2026-07-18 | Premium plans: MONTHLY ₹999, SIX_MONTHS ₹3999, YEARLY ₹5999 (INR) |
| 2026-07-18 | Analytics via aggregate Prisma queries only — no redundant analytics tables |
| 2026-07-19 | Revenue vs Time chart supports four ranges: `1M`, `6M`, `1Y`, `ALL` (default `1M`) |
| 2026-07-20 | Phase 7 modules follow existing pattern: Zod `*.validation.ts` + service + controller + routes; Zod on all API inputs where applicable |
| 2026-07-20 | A user may hold only one active premium plan at a time; Checkout blocked while premium; webhook expires other ACTIVE rows |
| 2026-07-23 | Profile pictures upload via Multer + Cloudinary (same pattern as SD diagrams); `User.image` stores the Cloudinary `secure_url`; fetch via profile APIs and render from that URL |
| 2026-07-18 | Phase 6 full E2E remains open debt; Phase 7 proceeds by product direction |

---

## 11. Known Bugs, Risks, and Technical Debt

### Confirmed code-visible defects

| Severity | Item |
|---|---|
| Medium | `apps/frontend/src/lib/api/system-design.ts` builds filtered question URLs as ``?$${qs}``, adding a stray `$` before the first query key. |
| Medium | Completed mock page loads report and study plan with `Promise.all`; either failure can leave the UI out of the completed report view. |
| Medium | `getHiringBand(null)` treats missing overall score as `0`, so a pending/null report can display **Strong Reject**. |
| Low | Standalone SD follow-up answers display **Submitted** instead of rendering the answer text. |
| Low | `MockInterviewReportResponse` is declared twice in `mock-interview-report.service.ts` (harmless declaration merge, but duplicate code). |
| Low | DSA section-level report status treats `NO_SUBMISSION` entries as complete; question rows still show `NO_SUBMISSION` and score zero. |

### Behavioral/product risks

| Priority | Item |
|---|---|
| High | Full Phase 6 E2E is not signed off: DSA → SD → behavioral → finalize → eval completion → report → study plan. |
| High | Study-plan generation is allowed while report evaluations are pending. Because one plan is persisted and reused, an early plan can permanently omit later evaluation details. |
| Medium | Timeout sync currently runs on session GET; mutation endpoints can continue past a deadline unless a GET sync happens first. |
| Medium | `TOTAL_DURATION_MS` is returned, but timeout synchronization enforces only the active section deadline. There is no separate hard three-hour cutoff; behavioral time begins only after role selection. |
| Medium | Evaluation trigger errors are intentionally swallowed so interviews advance; users must rely on report status/refresh to discover failed jobs. |
| Medium | Mock DSA/SD `submissionId` fields are plain strings with no Prisma/DB foreign keys. |
| Medium | Production `tsc` build does not copy Judge0 harness asset `MiniJson.java` into `dist`; local `tsx`/dev works from `src`. |
| Medium | Fresh clones must run `npm run seed:generate` before `npm run seed` because generated DSA JSON is gitignored. |
| Medium | Auth token refresh/retry on 401 is not wired into frontend state/API client. |
| Medium | No automated test suite or CI checks exist. |
| Medium | No `README.md`; local setup exists only in these memory documents and `.env.example`. |
| Medium | Local Stripe webhooks require `stripe listen` + matching `STRIPE_WEBHOOK_SECRET`; Checkout Price IDs must be **one-time** (`mode: payment`). |
| Medium | Phase 7 manual E2E (admin CRUD, Stripe test checkout, profile, premium gate) not yet signed off. |
| Low | Navigation is not fully consistent across all module pages. |
| Low | Root `npm run dev` uses shell `&`; separate terminals are more reliable on Windows. |
| Low | Mock DSA slot switches discard unsaved editor drafts. |

---

## 12. Testing and Deployment

| Check | Status |
|---|---|
| Backend TypeScript (`npx tsc --noEmit`) | Passing 2026-07-18 |
| Frontend TypeScript (`npx tsc --noEmit`) | Passing 2026-07-18 |
| Unit tests | None |
| API integration tests | None |
| Automated browser E2E | None |
| DSA manual flow | Prior project docs record verification; no automated artifact |
| System Design manual flow | Prior project docs record verification; no automated artifact |
| Standalone Behavioral full E2E | Not recorded as complete |
| Mock interview manual flow | Partial verification; full E2E pending |
| Phase 7 admin/premium E2E | **Pending** (code complete; manual sign-off next) |
| Staging | Not configured |
| Production | Not configured |

---

## 13. Phase 7 Product Spec (Official)

### Admin landing

Hero + five cards in responsive **3+2** grid: Create Questions, List Questions, Revenue Dashboard, Mock Analytics, User Management.

### Create Questions

DSA, System Design, or Behavioral forms covering every required Prisma field for that model, plus a **Published** toggle (`isPublished`).

### List Questions

DSA / System Design / Behavioral → sidebar Published | Draft. Published cards: title, difficulty, topics (company · role for Behavioral), total submissions/sessions, published date, delete; sort by submissions/sessions desc. Draft cards: title, last edited, edit, publish, delete.

### Revenue Dashboard

Stats: Total Users, Total Revenue, Monthly / 6-Month / 12-Month subscription counts. Charts: Revenue vs Time (line), Premium vs Free (pie), Subscription Distribution (bar: Total Premium, Monthly, Six Months, Twelve Months). Summaries: total revenue, premium %, ARPU, highest-selling plan, monthly/six-month/annual sales.

**Revenue vs Time range selector (required):** the line chart must offer exactly four options and filter the series accordingly:

| Option | Range key | Behavior |
|---|---|---|
| Last 1 Month | `1M` | Revenue for the last ~30 days |
| Six Months | `6M` | Revenue for the last ~180 days |
| 1 Year | `1Y` | Revenue for the last ~365 days |
| All | `ALL` | Full payment history |

Default range: `1M`. Range is a query param on the revenue dashboard API; aggregation stays Prisma-only (no redundant analytics tables).

### Mock Analytics

Cards:
- **Premium Users** — count of users who have ever held a paid plan (`Subscription` status `ACTIVE` or `EXPIRED`, current or past) **and** have taken at least one mock interview
- Total Mock Interviews
- Average Interview Score

Hiring band distribution (Strong Hire → Strong Reject) as graph + textual counts. Bands match the frontend hiring scale.

### User Management

Sort premium then free. Cards: avatar, username, email, premium badge, average interview score, joined, latest login, remove (confirm dialog). Search by username/email.

### Profiles

Admin profile: picture, username, email, phone, joined, latest login. Candidate profile: same + premium status/duration + average interview score; DSA/SD/behavioral stats; study-plan history with checkboxes + Submit Progress + Completed badge; Logout.

**Profile picture (Cloudinary — locked):**

```text
Client selects image file
  → multipart upload to profile avatar endpoint (Multer, max 5 MB)
  → CloudinaryService uploads to folder e.g. omniprep/profiles/{userId}
  → backend saves returned secure_url on User.image
  → GET /api/profile (and admin user cards) return image URL
  → UI renders <img src={image} /> (or placeholder if null)
```

- Allowed types: JPEG / PNG / WebP (same family as diagram uploads).
- Do not store image bytes in Postgres; only the Cloudinary URL.
- Clearing the picture sets `User.image` to `null` (optional delete from Cloudinary is nice-to-have, not required for Phase 7).

### Premium

Homepage Upgrade → pricing (₹999 / ₹3999 / ₹5999) with feature checklist + Subscribe → Stripe Checkout → webhook creates `Subscription`, updates User premium → redirect home. Non-premium mock access shows professional **Premium Required** modal with Upgrade Now (no browser alerts).

### Stripe flow

```text
Subscribe → Checkout Session (mode: payment, one-time prices) → Stripe Checkout → success
  → webhook checkout.session.completed (verify signature via stripeWebhookHandler)
  → create/activate Subscription record
  → update User isPremium / premiumFrom / premiumTill
  → redirect homepage (UI polls /api/billing/status to refresh auth store)
```

Local: `stripe listen --forward-to localhost:4000/api/billing/webhook`.

---

## 14. Next Recommended Task

**Run Phase 7 manual E2E sign-off**, then update these memory docs when signed off.

Checklist: admin CRUD (create/edit/publish/delete DSA, SD & Behavioral), revenue ranges + mock analytics, user management, profile + avatar + study-plan progress, Stripe test Checkout → webhook → premium + Subscription row, mock premium gate modal, already-premium Checkout blocked (`ALREADY_PREMIUM`).

Then Phase 8 / deferred: Phase 6 full E2E, auth refresh-on-401, README, tests, deployment.

---

*End of PROJECT_CONTEXT.md*
