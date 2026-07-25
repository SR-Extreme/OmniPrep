# ROADMAP.md

> **Last updated:** 2026-07-25
> **Current phase:** Phase 7 — Admin Panel, User Profile & Premium Subscription (Code Complete; E2E Pending)
> **Overall:** Phases 0–7 code complete; Phase 7 E2E pending; Phase 8 not started
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

- [x] Extend `User`: `image`, `phoneNo`, `isPremium`, `premiumFrom`, `premiumTill`, `averageInterviewScore`, `recentLogin`
- [x] Add `Subscription` model for payment history (`plan`, `amount`, `currency`, `status`, Stripe IDs, `startsAt`, `expiresAt`, timestamps)
- [x] Plans: `MONTHLY` | `SIX_MONTHS` | `YEARLY`
- [x] Extend `MockInterviewStudyPlan` for task completion / progress percentage (profile history)
- [x] Stripe + premium env vars; `stripe` package; webhook verification
- [x] `premiumMiddleware`; never trust frontend premium flags
- [x] One active premium plan per user (block Checkout while premium; expire other ACTIVE rows on webhook)
- [x] Update `recentLogin` on login; recompute `averageInterviewScore` on completed mock interviews

### Module B — Admin Panel

- [x] Admin landing: hero + five feature cards in responsive 3+2 grid
  - Create Questions · List Questions · Revenue Dashboard · Mock Analytics · User Management
- [x] Create Questions → DSA or System Design forms (all required Prisma fields + Published toggle)
- [x] List Questions → DSA / System Design sidebars: Published vs Draft
  - Published: title, difficulty, topics, total submissions, published date, delete; sort by submissions desc
  - Draft: title, last edited, edit, publish, delete
- [x] Revenue Dashboard: top stats, line/pie/bar charts, textual summaries (aggregate Prisma only)
- [x] Revenue vs Time chart: range selector with `1M` / `6M` / `1Y` / `ALL` (default `1M`)
- [x] Mock Analytics: premium users (ever paid + ≥1 mock), total mocks, avg score; hiring-band distribution graph + counts
- [x] User Management: premium then free; search; card fields; confirm-before-delete
- [x] Admin Profile page

### Module C — User Profile & Study Plan History

- [x] Candidate profile: identity, premium status/duration, average interview score
- [x] Profile picture: Multer + Cloudinary upload; store `secure_url` on `User.image`; fetch via profile APIs
- [x] Stats: DSA / System Design / Behavioral aggregates
- [x] Study plan history (newest first): progress, completed/total tasks; open full schedule with checkboxes; Submit Progress; Completed badge
- [x] Logout button at bottom of profile

### Module D — Premium Subscription & Access Control

- [x] Homepage “Upgrade to Premium” → pricing page (₹999 / ₹3999 / ₹5999) with feature list + Subscribe
- [x] Stripe Checkout → webhook → `Subscription` row → update `User` premium → redirect home
- [x] Mock Interview premium gate (backend + professional frontend modal with Upgrade Now)
- [x] Revenue analytics derived from `Subscription` aggregates (no redundant analytics tables)

### Dependencies to add during Phase 7

| Area | Packages / tools |
|---|---|
| Backend | `stripe` |
| Frontend | Recharts, Framer Motion, React Hook Form; Shadcn/UI primitives as needed |

**Status:** Code Complete; E2E Sign-off Pending
**Implementation:** 100% (feature code); manual E2E not signed off

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
| M5 — Admin, profile, premium/Stripe | **Code complete; E2E pending (Phase 7)** |
| M6 — Production deployment | Not started |

---

## Current Priority Order

### Now — Phase 7 E2E

1. Manual E2E: admin CRUD, Stripe test Checkout + webhook (`stripe listen`), profile/avatar/study-plan progress, premium gate, `ALREADY_PREMIUM`.
2. Mark Phase 7 Completed in these docs after sign-off.

### Later — Phase 8 / deferred debt

1. Phase 6 full E2E sign-off and timer/study-plan gating fixes.
2. System Design frontend defects.
3. Auth refresh-on-401, tests, README, deployment.

---

## Risks and Dependencies

| Risk/dependency | Current mitigation/status |
|---|---|
| Local webhook delivery | `stripe listen --forward-to localhost:4000/api/billing/webhook`; `STRIPE_WEBHOOK_SECRET` from CLI |
| Checkout Price IDs must be one-time | Checkout uses `mode: payment`; recurring prices fail |
| Premium must be server-enforced | `assertPremiumAccess` / premium checks on mock create/start; DB `isPremium`/`premiumTill` |
| Webhook vs Checkout race | Idempotent upsert by `stripeSessionId`; homepage polls `/api/billing/status` after success |
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
| v0.8 | Admin + profile + premium | **Code complete; E2E pending (Phase 7)** |
| v1.0 | Tested, secured, deployed MVP | Not started |

---

*End of ROADMAP.md*
