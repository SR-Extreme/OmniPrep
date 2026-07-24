# SESSION_HANDOFF.md

> **Last updated:** 2026-07-18
> **Current focus:** Phase 7 — Admin Panel, User Profile & Premium Subscription (file-by-file)
> Read `PROJECT_CONTEXT.md` for architecture and `ROADMAP.md` for phase history.

---

## 1. Executive Handoff

Phases 0–6 are implemented. Phase 6 remains code-complete with E2E sign-off deferred. **Phase 7 is the active build**, per the official product specification in `PROJECT_CONTEXT.md` §13 / `ROADMAP.md` Phase 7.

The application currently supports:

- Auth
- DSA + Judge0 + on-demand AI evaluation
- System Design + diagrams + follow-ups + AI evaluation
- Standalone Behavioral + resume-aware seven-phase interview + AI evaluation
- Full Mock Interview: DSA → System Design → Behavioral
- Completed-only report, frontend hiring band, and persisted 7-day AI study plan

**Not yet in the repo (Phase 7 work):** Stripe package/routes, premium fields, Subscription model, admin UI/APIs, profile pages, Recharts/Framer Motion/React Hook Form/Shadcn.

TypeScript:

- Backend `npx tsc --noEmit`: **passing 2026-07-18**
- Frontend `npx tsc --noEmit`: **passing 2026-07-18**

---

## 2. Phase 7 Scope (Official — only this)

Ignore any earlier “adaptive analytics / AIUsageLog / TopicPerformance” Phase 7 plans.

### 1) Admin Panel

- Landing: hero + 5 cards (3+2 grid): Create Questions, List Questions, Revenue Dashboard, Mock Analytics, User Management
- Create DSA / System Design questions (full required Prisma fields + Published toggle)
- List Published / Draft with specified card fields and actions
- Revenue dashboard (stats + line/pie/bar + textual summaries)
- Revenue vs Time line chart must support four ranges: Last 1 Month (`1M`), Six Months (`6M`), 1 Year (`1Y`), All (`ALL`); default `1M`; API query param filters the series
- Mock analytics (premium users who ever paid and took ≥1 mock; total mocks; avg score; hiring-band distribution)
- User management (premium then free, search, confirm delete)
- Admin profile page

### 2) User Profile

- Identity + premium status/duration + average interview score
- Profile picture via **Cloudinary** (upload → store URL on `User.image` → fetch/render URL)
- DSA / System Design / Behavioral stats
- Study plan history (newest first) with progress, checkboxes, Submit Progress, Completed badge
- Logout

### 3) Premium Subscription & Revenue

- Pricing page: ₹999 Monthly / ₹3999 6 Months / ₹5999 12 Months
- Stripe Checkout → webhook → Subscription row → update User premium → redirect home
- Mock Interviews Premium-only (server enforce + professional modal, no `alert`)
- Aggregate Prisma analytics only (no redundant analytics tables)

### Database

- Extend `User`: `image`, `phoneNo`, `isPremium`, `premiumFrom`, `premiumTill`, `averageInterviewScore`, `recentLogin`
- New `Subscription` model for payment history
- Plans: `MONTHLY` | `SIX_MONTHS` | `YEARLY`
- Extend study plan for completion progress (profile history)

---

## 3. Current Project Snapshot

| Area | State |
|---|---|
| Current phase | **Phase 7 In Progress** |
| Backend | Express API on `:4000`; Phase 0–6 routers mounted |
| Frontend | Next.js on `:3000`; mock interview + practice modules |
| Database | Neon/PostgreSQL, Prisma, 8 migrations, 18 models |
| Seed | 100 DSA, 3 SD, 3 Behavioral questions |
| Worker | One BullMQ `ai-eval-queue` worker |
| AI | Gemini `gemini-2.5-flash` |
| Stripe | **Not installed yet** |
| Automated tests | None |
| Deployment | Not configured |

---

## 4. Locked Decisions (Phase 6 + Phase 7)

### Phase 6 (preserve)

1. DSA → System Design → Behavioral; no going back.
2. One hour per section; REST + polling; no Socket.io.
3. Report/study plan only after `COMPLETED`.
4. Hiring recommendation is frontend band scale; completed page order: recommendation → report → study plan.

### Phase 7 (locked)

1. Current premium status on `User` only; history in `Subscription`.
2. Never trust frontend premium flags; enforce on server.
3. Mock Interviews are Premium-only.
4. Premium Required uses a modal + Upgrade Now (no browser alerts).
5. Analytics via aggregate queries only.
6. Do not redesign existing architecture; extend file-by-file.
7. Admin routes require `adminMiddleware`; billing webhook verifies Stripe signatures.
8. **Follow prior-phase module structure:** each feature uses Zod validation modules (`*.validation.ts`), thin controllers, services, and routes — same pattern as auth, mock-interview, system-design, etc. Use Zod wherever request/query/body params are accepted (billing, profile, admin). Shared constants/DTOs stay in `types/`; external integrations stay in `services/`. Middleware files do not need Zod unless they parse input.
9. **One active plan only:** a user cannot subscribe while already premium; at most one `Subscription` may be `ACTIVE` per user; webhook expires other ACTIVE rows. No stacking / mid-cycle plan switch in Phase 7.
10. **Profile pictures use Cloudinary:** Multer multipart upload → `CloudinaryService` → store `secure_url` on `User.image`; fetch via profile/admin APIs and render from URL. No binary storage in Postgres.

---

## 5. Exact Next Task

**Phase 7 file-by-file implementation.**

Process:

1. Identify current phase/task.
2. Produce **exactly one** next file.
3. Wait for user `done` (or pasted review).
4. Review → next file.

### First file / current next

`apps/backend/src/services/CloudinaryService.ts` — add `uploadProfileAvatar` (profile module complete through mount; admin.validation already created; insert Cloudinary avatar before admin services).

Do **not** generate other files until the user confirms.

---

## 6. Ordered File List (Phase 7)

Implement strictly in this order. Do not skip or batch.

### A. Foundation / schema / config

1. `apps/backend/prisma/schema.prisma`
2. `apps/backend/prisma/migrations/<timestamp>_add_phase7_premium_admin/migration.sql` (via `prisma migrate` after schema approval)
3. `.env.example` (Stripe + related vars)
4. `apps/backend/src/config/env.ts` (Stripe env validation)
5. `apps/backend/package.json` (add `stripe` dependency — then `npm install` in backend)
6. `apps/frontend/package.json` (add recharts, framer-motion, react-hook-form, and shadcn-supporting deps as needed)

### B. Shared backend types & middleware

7. `apps/backend/src/types/billing.types.ts` (plans, amounts INR, durations)
8. `apps/backend/src/types/admin.types.ts` (analytics DTOs, hiring-band thresholds shared with analytics)
9. `apps/backend/src/middleware/premium.middleware.ts`
10. `apps/backend/src/services/StripeService.ts`

### C. Billing module

11. `apps/backend/src/modules/billing/billing.validation.ts`
12. `apps/backend/src/modules/billing/billing.service.ts`
13. `apps/backend/src/modules/billing/billing.controller.ts`
14. `apps/backend/src/modules/billing/billing.routes.ts`
15. `apps/backend/src/app.ts` (mount billing + raw-body webhook; mount later admin/profile routers when added)

### D. Profile module

16. `apps/backend/src/modules/profile/profile.validation.ts`
17. `apps/backend/src/modules/profile/profile.service.ts`
18. `apps/backend/src/modules/profile/profile.controller.ts`
19. `apps/backend/src/modules/profile/profile.routes.ts`
20. Update `apps/backend/src/app.ts` (mount `/api/profile`)

### D2. Profile avatar (Cloudinary) — immediately after profile mount, before admin

21. Update `apps/backend/src/services/CloudinaryService.ts` (`uploadProfileAvatar`)
22. Update `apps/backend/src/modules/profile/profile.service.ts` (`uploadAvatar` → Cloudinary + save `User.image`)
23. Update `apps/backend/src/modules/profile/profile.controller.ts` (avatar upload handler)
24. Update `apps/backend/src/modules/profile/profile.routes.ts` (`POST /avatar` + multer)

### E. Admin module

25. `apps/backend/src/modules/admin/admin.validation.ts`
26. `apps/backend/src/modules/admin/admin-questions.service.ts`
27. `apps/backend/src/modules/admin/admin-users.service.ts`
28. `apps/backend/src/modules/admin/admin-analytics.service.ts`
29. `apps/backend/src/modules/admin/admin.controller.ts`
30. `apps/backend/src/modules/admin/admin.routes.ts`
31. Update `apps/backend/src/app.ts` (mount `/api/admin`)

### F. Wire premium + login side effects into existing modules

32. `apps/backend/src/modules/auth/auth.service.ts` (set `recentLogin` on login; return premium fields)
33. `apps/backend/src/modules/mock-interview/mock-interview.service.ts` (premium check on create/start)
34. `apps/backend/src/modules/mock-interview/mock-interview-report.service.ts` or finalize path (update `averageInterviewScore` when completed / report available)
35. `apps/backend/src/modules/mock-interview/mock-interview-study-plan.service.ts` (progress submit helpers if owned here vs profile)

### G. Frontend types + API clients

36. `apps/frontend/src/types/billing.ts`
37. `apps/frontend/src/types/profile.ts`
38. `apps/frontend/src/types/admin.ts`
39. `apps/frontend/src/lib/api/billing.ts`
40. `apps/frontend/src/lib/api/profile.ts`
41. `apps/frontend/src/lib/api/admin.ts`
42. `apps/frontend/src/store/authStore.ts` (premium fields on user)

### H. Shared UI primitives / components

43. Shadcn-style UI primitives as needed under `apps/frontend/src/components/ui/` (button, dialog, input, card, etc. — one file at a time)
44. `apps/frontend/src/components/PremiumRequiredModal.tsx`
45. `apps/frontend/src/components/PricingCards.tsx`
46. `apps/frontend/src/components/admin/AdminFeatureCard.tsx`
47. `apps/frontend/src/components/admin/QuestionListCard.tsx`
48. `apps/frontend/src/components/admin/RevenueCharts.tsx`
49. `apps/frontend/src/components/admin/MockAnalyticsCharts.tsx`
50. `apps/frontend/src/components/admin/UserManagementCard.tsx`
51. `apps/frontend/src/components/profile/ProfileHeader.tsx`
52. `apps/frontend/src/components/profile/ProfileStats.tsx`
53. `apps/frontend/src/components/profile/StudyPlanHistory.tsx`
54. `apps/frontend/src/components/profile/StudyPlanDetail.tsx`

### I. Frontend pages

55. `apps/frontend/src/app/premium/page.tsx`
56. `apps/frontend/src/app/profile/page.tsx`
57. `apps/frontend/src/app/admin/page.tsx`
58. `apps/frontend/src/app/admin/create/page.tsx` (or DSA/SD subroutes)
59. `apps/frontend/src/app/admin/create/dsa/page.tsx`
60. `apps/frontend/src/app/admin/create/system-design/page.tsx`
61. `apps/frontend/src/app/admin/questions/page.tsx`
62. `apps/frontend/src/app/admin/questions/dsa/page.tsx`
63. `apps/frontend/src/app/admin/questions/system-design/page.tsx`
64. `apps/frontend/src/app/admin/revenue/page.tsx`
65. `apps/frontend/src/app/admin/mock-analytics/page.tsx`
66. `apps/frontend/src/app/admin/users/page.tsx`
67. `apps/frontend/src/app/admin/profile/page.tsx`
68. Update `apps/frontend/src/app/page.tsx` (Upgrade to Premium CTA + admin/profile nav links)
69. Update `apps/frontend/src/app/mock-interview/page.tsx` (Premium Required modal gate)

### J. Docs / close-out

70. Update `PROJECT_CONTEXT.md` / `ROADMAP.md` / `SESSION_HANDOFF.md` when Phase 7 code-complete
71. Manual Phase 7 E2E checklist sign-off

> Note: If a listed file is better split/merged to match existing conventions discovered during implementation, adjust **one step at a time** and document the change in handoff — never batch-generate.

---

## 7. Important Existing Files (do not redesign)

| File | Role |
|---|---|
| `apps/backend/src/services/CloudinaryService.ts` | **Next edit target** — add profile avatar upload |
| `apps/backend/src/middleware/auth.middleware.ts` | `authMiddleware` + `adminMiddleware` already exist |
| `apps/backend/src/app.ts` | Router mounts (billing webhook, profile, billing) |
| `apps/backend/src/modules/admin/admin.validation.ts` | Created; admin services resume after avatar upload |
| `apps/backend/src/modules/mock-interview/*` | Premium gate + score/plan hooks |
| `apps/frontend/src/components/HiringRecommendation.tsx` | Band thresholds for analytics parity |
| `apps/frontend/src/app/page.tsx` | Home CTA for Upgrade |

---

## 8. Deferred (not Phase 7)

- Full Phase 6 mock E2E sign-off
- Study-plan generation gating on completed evaluations
- System Design `?$${qs}` typo and follow-up answer display
- Auth refresh-on-401
- Automated tests / CI / deployment (Phase 8)

---

## 9. Local Run Commands

```bash
cd apps/backend
npx prisma migrate deploy
npx prisma generate
npm run seed:generate
npm run seed

# Terminal 1
docker compose -f docker-compose.judge0.yml up -d

# Terminal 2
cd apps/backend
npm run dev

# Terminal 3
cd apps/frontend
npm run dev
```

Stripe local webhook (when billing is wired):

```bash
stripe listen --forward-to localhost:4000/api/billing/webhook
```

---

## 10. Quick Resume Prompt

```text
Read PROJECT_CONTEXT.md, ROADMAP.md, and SESSION_HANDOFF.md. Phases 0–6 are implemented. Current work is Phase 7 (Admin + Profile + Premium/Stripe) file-by-file. Do not redesign architecture. Do not batch files. Next file is listed in SESSION_HANDOFF §5. Preserve Phase 6 REST/polling mock design. Enforce premium on the server.
```

---

## 11. Maintenance Checklist

- [x] Rewrite Phase 7 official scope across all three memory files
- [x] Align current phase to Phase 7
- [x] Ordered Phase 7 file list
- [ ] Schema + migration
- [ ] Billing / premium middleware
- [ ] Admin APIs + UI
- [ ] Profile + study-plan progress
- [ ] Premium gate on mock interview
- [ ] Phase 7 E2E sign-off

---

*End of SESSION_HANDOFF.md*
