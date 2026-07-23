# ROADMAP.md

> **Last updated:** 2026-07-18
> **Current phase:** Phase 7 — Admin Panel, User Profile & Premium Subscription (In Progress)
> **Overall:** Phases 0–6 code complete; Phase 7 in progress; Phase 8 not started
> Keep synchronized with `PROJECT_CONTEXT.md` and `SESSION_HANDOFF.md`.

---

## Status Legend

- **Completed:** implementation and required verification complete
- **Code Complete:** implementation exists and type-checks; final E2E/polish remains
- **In Progress:** active implementation
- **Not Started:** no substantive implementation

---

## Phase 0 — Monorepo and Scaffolding

**Goal:** Runnable npm-workspace monorepo with Express health check and Next.js frontend.

- [x] Root npm workspaces
- [x] Express/TypeScript/ESM backend
- [x] Next.js 14/React/Tailwind frontend
- [x] Shared environment template
- [x] Local Judge0 Docker compose configuration

**Status:** Completed
**Implementation:** 100%

---

## Phase 1 — Foundation and Authentication

**Goal:** Neon/Prisma persistence and JWT authentication.

- [x] `User`, `RefreshToken`, `Role`
- [x] Signup, login, refresh, logout
- [x] bcrypt password hashing
- [x] Access/refresh JWTs and hashed refresh-token persistence
- [x] Auth/admin middleware
- [x] Login/signup UI and persisted Zustand session
- [ ] Wire automatic frontend refresh/retry on HTTP 401

**Status:** Completed (optional auth UX debt)
**Implementation:** 95%

---

## Phase 2 — DSA Core

**Goal:** Curated problem bank, Monaco solving experience, Judge0 execution, stored results.

- [x] DSA schema and migration
- [x] 100-problem seed pipeline
- [x] Problems and submissions APIs
- [x] C++/Java/Python code wrappers and Judge0 integration
- [x] Sample Run and full Submit
- [x] Problem bank, Monaco editor, result rendering
- [x] Windows/Docker cgroup workaround
- [x] Judge0 error mapping

**Status:** Completed
**Implementation:** 100%

---

## Phase 3 — DSA AI Evaluation

**Goal:** Explicit, asynchronous AI review of full DSA submissions.

- [x] `DsaEvaluation`
- [x] Gemini structured DSA evaluation
- [x] Redis cache and BullMQ queue
- [x] Shared AI worker
- [x] Evaluation request/poll API
- [x] Frontend Generate AI Review flow
- [x] Prior project docs record manual E2E verification (no automated artifact)

**Status:** Completed
**Implementation:** 100%

---

## Phase 4 — System Design

**Goal:** Structured design prompts, multimodal submission, follow-up round, rubric evaluation.

- [x] Question/submission/evaluation schema and migrations
- [x] 3 seeded questions
- [x] Text and/or diagram submission
- [x] Cloudinary diagram upload
- [x] Exactly 2 Gemini follow-up questions
- [x] Follow-up answer submission
- [x] Dynamic rubric metrics and backend weighted overall score
- [x] Async evaluation/cache/worker integration
- [x] Question bank, practice UI, report UI
- [ ] Fix filtered list URL typo in `src/lib/api/system-design.ts` (`?$${qs}`)
- [ ] Render submitted follow-up answer text instead of only “Submitted”

**Status:** Completed with known frontend defects
**Implementation:** 95%

---

## Phase 5 — Behavioral

**Goal:** Company/role-specific, resume-aware, seven-phase behavioral interviews with STAR evaluation.

### Implemented

- [x] Behavioral question/session/turn/evaluation schema and migration
- [x] 3 seeded company/role questions
- [x] Seven-phase validated JSON configuration
- [x] PDF-only resume parsing and Cloudinary upload
- [x] One-at-a-time Gemini questions
- [x] Follow-up questions count toward phase quota
- [x] Candidate-questions closing round
- [x] Async behavioral evaluation via DB/cache/queue/worker
- [x] Question bank, filters, interview transcript, history, report UI
- [x] Mock-linked behavioral mode skips candidate questions and completes at wrap-up

### Verification/debt

- [ ] Record a complete standalone behavioral browser E2E result
- [ ] Add automated behavioral tests

**Status:** Code Complete
**Implementation:** 100% code; manual sign-off not recorded

---

## Phase 6 — Full Mock Interview

**Goal:** A backend-timed, sequential DSA → System Design → Behavioral interview with asynchronous section evaluation, final report, hiring band, and study plan.

The implemented design supersedes the old ~90-minute Socket.io plan.

### Product behavior implemented

- [x] Three sequential sections with no return to submitted sections
- [x] One-hour cap per section; three-hour nominal total
- [x] Backend timestamp/deadline helpers
- [x] REST polling and timeout synchronization (no Socket.io)
- [x] Random assignment without AI
- [x] Session status machine (`NOT_STARTED` → `IN_PROGRESS` → `AWAITING_FINAL_SUBMIT` → `COMPLETED`)
- [x] Section evaluation trigger without blocking progression
- [x] Deterministic report aggregation
- [x] Finalize gate: report only after `COMPLETED`
- [x] Rich 7-day Gemini study-plan generation and persistence
- [x] Frontend interview shell, timer, workspaces, hiring recommendation, report, study plan

### Verification and hardening still required (deferred; not blocking Phase 7 start)

- [x] Backend/Frontend TypeScript passes (2026-07-18)
- [x] Local app starts; DSA → System Design transition/timer behavior manually exercised
- [ ] Complete full happy-path E2E through report and persisted study plan
- [ ] Timeout/no-submission path coverage
- [ ] Gate study-plan generation until all evaluations complete
- [ ] Other Phase 6 correctness debt (see `PROJECT_CONTEXT.md` §11)

**Status:** Code Complete; E2E Sign-off Pending (deferred)
**Implementation:** 100% planned code; verification/hardening incomplete

---

## Phase 7 — Admin Panel, User Profile & Premium Subscription

**Goal:** Extend OmniPrep with an admin SaaS dashboard, candidate/admin profiles, study-plan history with progress, and a Stripe-backed premium subscription system. Mock Interviews become Premium-only. Do not redesign existing modules.

> **Official Phase 7 specification:** the three modules below are the only Phase 7 scope. Prior “adaptive analytics / AIUsageLog / TopicPerformance” plans are superseded and out of scope.

### Module A — Database & foundation

- [ ] Extend `User`: `image`, `phoneNo`, `isPremium`, `premiumFrom`, `premiumTill`, `averageInterviewScore`, `recentLogin`
- [ ] Add `Subscription` model for payment history (`plan`, `amount`, `currency`, `status`, Stripe IDs, `startsAt`, `expiresAt`, timestamps)
- [ ] Plans: `MONTHLY` | `SIX_MONTHS` | `YEARLY`
- [ ] Extend `MockInterviewStudyPlan` for task completion / progress percentage (profile history)
- [ ] Stripe + premium env vars; `stripe` package; webhook verification
- [ ] `premiumMiddleware`; never trust frontend premium flags
- [ ] One active premium plan per user (block Checkout while premium; expire other ACTIVE rows on webhook)
- [ ] Update `recentLogin` on login; recompute `averageInterviewScore` on completed mock interviews

### Module B — Admin Panel

- [ ] Admin landing: hero + five feature cards in responsive 3+2 grid
  - Create Questions · List Questions · Revenue Dashboard · Mock Analytics · User Management
- [ ] Create Questions → DSA or System Design forms (all required Prisma fields + Published toggle)
- [ ] List Questions → DSA / System Design sidebars: Published vs Draft
  - Published: title, difficulty, topics, total submissions, published date, delete; sort by submissions desc
  - Draft: title, last edited, edit, publish, delete
- [ ] Revenue Dashboard: top stats, line/pie/bar charts, textual summaries (aggregate Prisma only)
- [ ] Revenue vs Time chart: range selector with `1M` / `6M` / `1Y` / `ALL` (default `1M`)
- [ ] Mock Analytics: premium users, total mocks, avg score; hiring-band distribution graph + counts
- [ ] User Management: premium then free; search; card fields; confirm-before-delete
- [ ] Admin Profile page

### Module C — User Profile & Study Plan History

- [ ] Candidate profile: identity, premium status/duration, average interview score
- [ ] Profile picture: Multer + Cloudinary upload; store `secure_url` on `User.image`; fetch via profile APIs
- [ ] Stats: DSA / System Design / Behavioral aggregates
- [ ] Study plan history (newest first): progress, completed/total tasks; open full schedule with checkboxes; Submit Progress; Completed badge
- [ ] Logout button at bottom of profile

### Module D — Premium Subscription & Access Control

- [ ] Homepage “Upgrade to Premium” → pricing page (₹999 / ₹3999 / ₹5999) with feature list + Subscribe
- [ ] Stripe Checkout → webhook → `Subscription` row → update `User` premium → redirect home
- [ ] Mock Interview premium gate (backend + professional frontend modal with Upgrade Now)
- [ ] Revenue analytics derived from `Subscription` aggregates (no redundant analytics tables)

### Dependencies to add during Phase 7

| Area | Packages / tools |
|---|---|
| Backend | `stripe` |
| Frontend | Recharts, Framer Motion, React Hook Form; Shadcn/UI primitives as needed |

**Status:** In Progress
**Implementation:** 0%

---

## Phase 8 — Polish, Security, and Deployment

**Goal:** Production-ready application and operational documentation.

### Planned

- [ ] Root README and complete local setup
- [ ] Automated unit/integration/E2E suite
- [ ] CI type-check/build/test workflow
- [ ] Auth refresh-on-401
- [ ] Security review and rate limiting
- [ ] Accessibility and responsive UX pass
- [ ] Logging/monitoring/error tracking
- [ ] Vercel frontend deployment
- [ ] Railway API/worker deployment
- [ ] Production Judge0 deployment
- [ ] Production environment/runbooks
- [ ] Phase 6 full E2E sign-off and remaining correctness debt

**Status:** Not Started

---

## Milestones

| Milestone | Status |
|---|---|
| M0 — Monorepo runs | Done |
| M1 — Auth + Neon | Done |
| M2 — DSA + Judge0 | Done |
| M2.5 — DSA AI review | Done |
| M3 — System Design flow | Done |
| M3.5 — Behavioral implementation | Done |
| M3.6 — Behavioral full manual sign-off | Pending record |
| M4 — Mock interview implementation | Done |
| M4.1 — Mock interview full E2E sign-off | Deferred (Phase 8 / parallel) |
| M5 — Admin, profile, premium/Stripe | **Current (Phase 7)** |
| M6 — Production deployment | Not started |

---

## Current Priority Order

### Now — Phase 7

1. Schema: User premium fields + `Subscription` + study-plan progress fields + migration.
2. Backend: profile, admin, billing/Stripe webhook, premium middleware, analytics aggregates.
3. Frontend: admin dashboard, profiles, pricing, premium modal, study-plan history UI.
4. Protect mock-interview create/start on the server; gate UI with modal.
5. Manual E2E of admin CRUD, Stripe test checkout, profile stats, premium gate.

### Later — Phase 8 / deferred debt

1. Phase 6 full E2E sign-off and timer/study-plan gating fixes.
2. System Design frontend defects.
3. Auth refresh-on-401, tests, README, deployment.

---

## Risks and Dependencies

| Risk/dependency | Current mitigation/status |
|---|---|
| Stripe not yet in repo | Add `stripe` package + env + webhook signature verification in Phase 7 |
| Frontend lacks Recharts/RHF/Framer/Shadcn | Install as Phase 7 UI dependencies; keep existing Tailwind patterns |
| Premium must be server-enforced | `premiumMiddleware` + DB `isPremium`/`premiumTill`; ignore client flags |
| Webhook vs Checkout race | Idempotent upsert by `stripeSessionId` / payment intent |
| Hiring bands are frontend-only today | Mock analytics recomputes bands from completed interview scores via same band thresholds |
| No automated tests | Type-checks + manual E2E for Phase 7 |
| Phase 6 E2E still open | Documented debt; does not block Phase 7 per product direction |

---

## Release Plan

| Version | Scope | State |
|---|---|---|
| v0.1 | Scaffold | Complete |
| v0.2 | Auth + Prisma | Complete |
| v0.3 | DSA + Judge0 | Complete |
| v0.4 | DSA AI review | Complete |
| v0.5 | System Design | Complete |
| v0.6 | Behavioral | Code complete |
| v0.7 | Full Mock Interview | Code complete; E2E sign-off deferred |
| v0.8 | Admin + profile + premium | **In progress (Phase 7)** |
| v1.0 | Tested, secured, deployed MVP | Not started |

---

*End of ROADMAP.md*
