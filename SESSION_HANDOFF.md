# SESSION_HANDOFF.md

> **Last session date:** 2026-06-04  
> **Update this file at the end of every development session.**

---

# Last Session Summary

Completed **Phase 1 — Foundation & Authentication** (~95%) using a **one-file-at-a-time** workflow, with selective batch edits for signup rename and required `name`.

### Completed work

1. **Prisma on Neon** — `@prisma/client`, `prisma`, schema (`User`, `RefreshToken`, `Role`), migrations `init` + `require_user_name`.
2. **Backend config** — `config/env.ts` (Zod), `config/db.ts` (singleton), `server.ts` loads validated env.
3. **Auth module** — validation, service (bcrypt, JWT, refresh rotation), controller, routes (`/api/auth/signup|login|refresh|logout`).
4. **Middleware** — `authMiddleware`, `adminMiddleware`; `GET /api/me` protected.
5. **Express app** — CORS → `FRONTEND_URL`, `/api/auth` mounted; `/health` unchanged at root.
6. **Frontend API** — `lib/api/client.ts`, `lib/api/auth.ts`.
7. **Frontend auth UI** — Zustand `authStore` (persist), `/login`, `/signup`, home page with sign out.
8. **Naming** — `register` → **`signup`** across API, routes, and UI.
9. **User model** — `name` **required** (DB + validation + signup form).
10. **Dev fixes** — `@esbuild/win32-x64` for `tsx` on Windows; documented `EADDRINUSE` / CORS / Prisma cwd notes.
11. **Documentation** — updated `PROJECT_CONTEXT.md`, `ROADMAP.md`, `SESSION_HANDOFF.md` (this file).

### Mentoring model

- User prefers workspace names **`frontend`** / **`backend`**.
- User prefers backend **ESM** (`import`/`export`), not `require`.
- One file per iteration unless user asks agent to edit directly.

---

# Current Project State

| Area | State |
|------|--------|
| **Phase** | Phase 1 **~95% complete** → ready for **Phase 2 (DSA)** |
| **Backend** | `npm run dev` in `apps/backend` → `:4000` — `/health`, `/api/auth/*`, `/api/me` |
| **Frontend** | `npm run dev` in `apps/frontend` → `:3000` or `:3001` — `/`, `/login`, `/signup` |
| **Database** | Neon connected; Prisma migrations applied (`User`, `RefreshToken`) |
| **Redis** | Upstash `REDIS_URL` in `.env` — **not used in code** (Phase 3) |
| **Auth** | Signup/login/logout UI + JWT; backend refresh API works; **no frontend refresh in store yet** |
| **Git** | Commit recommended (include `prisma/migrations/`) |

---

# Files Modified This Session

### Backend — created / updated

| File |
|------|
| `apps/backend/package.json` (prisma, bcrypt, jsonwebtoken, zod, @esbuild/win32-x64) |
| `apps/backend/prisma/schema.prisma` |
| `apps/backend/prisma/migrations/20260602154035_init/` |
| `apps/backend/prisma/migrations/20260604160104_require_user_name/` |
| `apps/backend/src/config/env.ts` |
| `apps/backend/src/config/db.ts` |
| `apps/backend/src/modules/auth/auth.validation.ts` |
| `apps/backend/src/modules/auth/auth.service.ts` |
| `apps/backend/src/modules/auth/auth.controller.ts` |
| `apps/backend/src/modules/auth/auth.routes.ts` |
| `apps/backend/src/middleware/auth.middleware.ts` |
| `apps/backend/src/app.ts` |
| `apps/backend/src/server.ts` |

### Frontend — created / updated

| File |
|------|
| `apps/frontend/package.json` (zustand) |
| `apps/frontend/src/lib/api/client.ts` |
| `apps/frontend/src/lib/api/auth.ts` |
| `apps/frontend/src/store/authStore.ts` |
| `apps/frontend/src/app/(auth)/login/page.tsx` |
| `apps/frontend/src/app/(auth)/signup/page.tsx` |
| `apps/frontend/src/app/page.tsx` |

### Deleted

| File | Reason |
|------|--------|
| `apps/frontend/src/app/(auth)/register/page.tsx` | Renamed to `signup` |

### Documentation — updated

| File |
|------|
| `PROJECT_CONTEXT.md` |
| `ROADMAP.md` |
| `SESSION_HANDOFF.md` |

---

# Features Completed

| Feature | Notes |
|---------|-------|
| Monorepo workspaces | `dev:frontend`, `dev:backend`, `build` |
| Backend health endpoint | `GET /health` |
| Prisma + Neon | `User`, `RefreshToken`; 2 migrations |
| JWT auth API | signup, login, refresh, logout |
| Protected route | `GET /api/me` → 401 without Bearer |
| Env validation | Zod in `config/env.ts` |
| CORS | Restricted to `FRONTEND_URL` |
| Frontend API client | `apiRequest`, `ApiError` |
| Auth UI | `/login`, `/signup`, home session panel |
| Zustand auth store | Persisted tokens + user |
| Signup naming | `/api/auth/signup`, `/signup` route |
| Required user name | Schema + validation + form |

---

# Features In Progress

| Feature | Progress | Notes |
|---------|----------|-------|
| Phase 1 polish | ~5% | Frontend `authStore.refresh()` not wired |
| Upstash Redis | ~20% | URL in `.env`; client pending Phase 3 |
| Git commit | ~0% | Phase 0 + Phase 1 files still largely uncommitted |

---

# Pending Tasks

**Priority order (Phase 2):**

1. **Optional Phase 1 polish** — `authStore.refresh()` + call on 401 (if desired before DSA)
2. **Git commit** — Phase 0 + Phase 1 + `prisma/migrations/` (exclude `.env`)
3. **Optional README** — run instructions, ports, Prisma cwd note
4. **Phase 2 — Prisma models** — `Problem`, `TestCase`, `Submission` + migrate
5. **Phase 2 — `modules/problems/`** — list, get by id
6. **Phase 2 — Judge0** — `services/Judge0Service.ts`, submissions module
7. **Phase 2 — Frontend** — `app/problems`, Monaco editor

---

# Current Blockers

| Blocker | Severity | Notes |
|---------|----------|-------|
| None critical | — | Phase 2 can start |

**Watch items:**

- `FRONTEND_URL` must match Next port (`3000` vs `3001`).
- Run Prisma commands from `apps/backend`, not repo root.
- Stop duplicate backend dev processes to avoid `EADDRINUSE` on port 4000.

---

# Known Bugs

| Bug | Status |
|-----|--------|
| `next.config.ts` unsupported | **Fixed** → `next.config.mjs` |
| CORS allows all origins | **Fixed** → `FRONTEND_URL` |
| `tsx` / esbuild win32 optional dep | **Fixed** → `@esbuild/win32-x64` |
| Windows `npm run dev` (`&`) unreliable | Open — use two terminals |
| Port 4000 already in use | Open — kill prior `npm run dev` |
| Unused `PORT` in `server.ts` | Open — cosmetic cleanup |

---

# Important Context

1. **Blueprint PDF** on Desktop defines full product; rebuild uses **Next.js** not React Router + Redux.
2. **Do not use Docker** — Neon + Upstash connection strings in `apps/backend/.env`.
3. **Backend ESM:** local imports use `.js` extension (e.g. `import app from './app.js'`).
4. **Auth route naming:** **`signup`** not `register` — `/api/auth/signup`, `/signup`.
5. **`User.name` is required** — min 1 char, max 100, trimmed.
6. **`/health` stays at root** — auth under `/api/auth/*`.
7. **Zustand** `omniprep-auth` key in `localStorage` for session persist.
8. **Logout** sends `{ refreshToken }` in body; clears local store even if API fails.

---

# Next Recommended Task

**Phase 2, File 1:** Extend `apps/backend/prisma/schema.prisma` with `Problem`, `TestCase`, and `Submission` models (per blueprint), then run `npx prisma migrate dev` from `apps/backend`.

---

# Suggested Development Order (Phase 2)

1. Add DSA models to `schema.prisma` + migrate
2. `modules/problems/` — routes, controller, service
3. `services/Judge0Service.ts` + env vars
4. `modules/submissions/` — submit + Judge0
5. Seed or admin CRUD for sample problems
6. Frontend `app/problems` + `app/problems/[id]`
7. Monaco editor component

---

# Quick Resume Prompt

```
Read PROJECT_CONTEXT.md, ROADMAP.md, and SESSION_HANDOFF.md. Continue development from the current state. Phase 1 is complete except optional refresh UX. Start Phase 2 (DSA module) with the Next Recommended Task. Do not redesign completed auth. Follow documented architecture decisions.
```

---

## Maintenance checklist (end of each session)

- [x] Update `PROJECT_CONTEXT.md` (features, %, API, decisions)
- [x] Update `ROADMAP.md` (task checkboxes, phase progress)
- [x] Update this file (session summary, files changed, next task)
- [x] Verify the three files agree on phase and next step

---

*End of SESSION_HANDOFF.md*
