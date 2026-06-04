# PROJECT_CONTEXT.md

> **Last updated:** 2026-06-04  
> **Project:** OmniPrep (interview-prep-platform)  
> **Maintainer note:** Update this file whenever architecture, features, or env vars change.

---

## Executive Summary

| Field | Value |
|-------|--------|
| **Project Name** | OmniPrep |
| **Package Name (root)** | `interview-prep-platform` |
| **Description** | Production-grade, AI-powered adaptive interview preparation platform — evaluates reasoning, system design, behavioral communication, and generates personalized study plans. |
| **Problem Being Solved** | Most platforms test syntax only. OmniPrep evaluates conceptual depth, trade-offs, scalability thinking, and communication — then adapts learning paths from performance data. |
| **Target Users** | **Candidates** preparing for technical interviews; **Admins** managing questions, users, and platform analytics. |
| **Current Completion %** | **~22%** (Phase 0 complete; Phase 1 auth + Prisma on Neon ~95% complete) |

**Source of truth for full product spec:** `AI_Interview_Platform_Blueprint (1).pdf` (Desktop).  
**Rebuild stack:** Next.js 14 + TypeScript + Tailwind (frontend); Express + TypeScript + ESM (backend) — *not* original blueprint’s React/Redux/Vite stack.

---

## Product Vision

### Purpose

Build an adaptive AI ecosystem for interview prep: DSA with AI feedback, system design (multimodal), behavioral (STAR), full mock interviews (WebSockets), adaptive study plans, and admin tooling.

### Long-Term Vision

- Six core modules + admin dashboard operational end-to-end
- GPT-4o for structured evaluations (JSON scores)
- BullMQ workers for long-running AI jobs
- Real-time mock interviews with Redis session state
- Deployed on Vercel (frontend) + Railway (API/workers) + Neon + Upstash + Cloudinary

### Key User Journeys

1. **Sign up / login** → JWT access + refresh tokens  
2. **DSA practice** → Monaco editor → Judge0 → AI evaluation → topic performance update  
3. **System design** → text + optional diagram → multimodal GPT-4o → follow-ups  
4. **Behavioral** → STAR-style conversation with AI follow-ups  
5. **Mock interview** → ~90 min live session → 20-point report + hiring recommendation  
6. **Study plan** → generated async via BullMQ from weak topics (spaced repetition)  
7. **Admin** → CRUD questions, users, AI cost tracking, analytics  

---

## Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3, Zustand 5 | Active — auth UI + API client |
| **Backend** | Node.js, Express 4, TypeScript, ESM (`"type": "module"`) | Active — auth module + Prisma |
| **Database** | PostgreSQL via **Neon** + **Prisma ORM** 6 | Active — `User`, `RefreshToken` migrated |
| **Cache / queues** | **Upstash Redis** + BullMQ (planned) | URL in `.env`; not wired in code |
| **Authentication** | JWT + bcrypt + DB-stored refresh tokens | **Implemented** (Phase 1) |
| **AI** | OpenAI GPT-4o (planned) | Not started |
| **Code execution** | Judge0 API (planned) | Not started |
| **File storage** | Cloudinary (planned) | Not started |
| **Real-time** | Socket.io (planned) | Not started |
| **Deployment** | Vercel, Railway, Neon, Upstash, Cloudinary (planned) | Not started |
| **Monorepo** | npm workspaces (`apps/frontend`, `apps/backend`) | Active |
| **Local dev** | **No Docker** — cloud DB/Redis only (team decision 2026-06-01) | Active |

### Frontend state management

- **Zustand** (`authStore`) — auth session persisted to `localStorage` (`omniprep-auth`)  
- Server Components by default; `"use client"` for auth forms and home session UI  

---

## Architecture Overview

### Frontend Architecture

```
apps/frontend/
├── src/app/
│   ├── layout.tsx
│   ├── page.tsx              # Home — sign in / sign up / signed-in panel
│   ├── globals.css
│   └── (auth)/
│       ├── login/page.tsx
│       └── signup/page.tsx
├── src/lib/api/
│   ├── client.ts             # apiRequest, ApiError
│   └── auth.ts               # signup, login, refresh, logout, getMe
├── src/store/
│   └── authStore.ts          # Zustand + persist
├── src/components/           # (planned)
├── src/hooks/                # (planned)
└── src/types/                # (planned)
```

- **Tailwind** via `globals.css` + PostCSS + `tailwind.config.ts`  
- **Config:** `next.config.mjs` (Next 14.2 does **not** support `next.config.ts`)  

### Backend Architecture (modular, not MVC)

```
apps/backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/           # init + require_user_name
├── src/
│   ├── server.ts             # dotenv + env validation + listen
│   ├── app.ts                # CORS, JSON, /health, /api/*
│   ├── config/
│   │   ├── env.ts            # Zod-validated env
│   │   └── db.ts             # Prisma singleton
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.validation.ts
│   │       ├── auth.service.ts
│   │       ├── auth.controller.ts
│   │       └── auth.routes.ts
│   ├── services/             # (planned) AIService, Judge0, Cache, Queue
│   ├── workers/              # (planned) BullMQ workers
│   └── socket/               # (planned)
```

**Principle:** Controllers thin; business logic in services; workers decoupled from HTTP.

### Database Architecture (Prisma on Neon)

**Implemented models:** `User`, `RefreshToken`, enum `Role` (`ADMIN`, `CANDIDATE`).  
**Planned (blueprint):** ~14 additional models — see [Database Documentation](#database-documentation).

**Migrations applied:**

| Migration | Purpose |
|-----------|---------|
| `20260602154035_init` | `User`, `RefreshToken` tables |
| `20260604160104_require_user_name` | `User.name` required (NOT NULL) |

### API Flow (current vs target)

**Current:**

```
Browser → Next.js (Zustand auth)
       → fetch NEXT_PUBLIC_API_URL
       → Express /health, /api/auth/*, /api/me
       → Prisma → Neon PostgreSQL
```

**Target (later phases):**

```
Browser → Next.js → REST /api/* → Express modules → Prisma (Neon)
                              → Socket.io /interview (mock)
                              → BullMQ workers → OpenAI, Judge0
                              → Redis (Upstash) cache + sessions
```

### Authentication Flow (implemented)

1. `POST /api/auth/signup` → bcrypt hash → `User` in DB (role `CANDIDATE`, name required)  
2. `POST /api/auth/login` → access JWT (`JWT_ACCESS_EXPIRY`) + refresh token (hashed in DB)  
3. `POST /api/auth/refresh` → rotate refresh token, issue new pair  
4. `POST /api/auth/logout` → delete refresh token row (body: `{ refreshToken }`)  
5. `authMiddleware` on protected routes — `Authorization: Bearer <accessToken>`  
6. `adminMiddleware` — checks `role === 'ADMIN'` (ready; no admin routes yet)  

**Frontend gap:** `refresh()` exists in `auth.ts` but `authStore` does not expose refresh / auto-refresh on 401 yet.

### Deployment Flow (planned)

| Component | Platform |
|-----------|----------|
| Frontend | Vercel |
| API + workers | Railway |
| PostgreSQL | Neon |
| Redis | Upstash |
| Images | Cloudinary |

---

## Folder Structure

### Repository root

| Path | Responsibility |
|------|----------------|
| `package.json` | npm workspaces, `dev:frontend`, `dev:backend`, `build` |
| `package-lock.json` | Locked dependencies |
| `.gitignore` | Ignore `node_modules`, `.env*`, `.next`, `dist` |
| `.env.example` | Documented env template (Neon + Upstash) |
| `PROJECT_CONTEXT.md` | This file — full project state |
| `ROADMAP.md` | Phased implementation plan |
| `SESSION_HANDOFF.md` | Per-session continuity for AI/humans |

### `apps/backend/`

| Path | Responsibility |
|------|----------------|
| `package.json` | ESM, Express, Prisma, bcrypt, jsonwebtoken, zod |
| `tsconfig.json` | `NodeNext` module resolution |
| `.env` | **Gitignored** — `PORT`, `DATABASE_URL`, `REDIS_URL`, JWT, `FRONTEND_URL` |
| `prisma/schema.prisma` | `User`, `RefreshToken`, `Role` |
| `prisma/migrations/` | **Commit** — Neon migration history |
| `src/server.ts` | `dotenv`, `env`, `app.listen(env.PORT)` |
| `src/app.ts` | CORS, `/health`, `/api/auth`, `/api/me` |
| `src/config/env.ts` | Zod env validation |
| `src/config/db.ts` | Prisma client singleton |
| `src/middleware/auth.middleware.ts` | JWT + admin guards |
| `src/modules/auth/*` | Auth feature module |
| `dist/` | **Gitignored** — `tsc` output |

### `apps/frontend/`

| Path | Responsibility |
|------|----------------|
| `package.json` | Next.js 14, Zustand 5 |
| `tsconfig.json` | Next + `@/*` → `./src/*` |
| `next.config.mjs` | Next config (`reactStrictMode`) |
| `postcss.config.mjs` | Tailwind + Autoprefixer |
| `tailwind.config.ts` | Content paths for class scanning |
| `next-env.d.ts` | Next TypeScript refs — **commit** |
| `.env.local` | **Gitignored** — `NEXT_PUBLIC_API_URL` |
| `src/app/page.tsx` | Home — auth-aware |
| `src/app/(auth)/login/page.tsx` | Login form |
| `src/app/(auth)/signup/page.tsx` | Signup form (name required) |
| `src/lib/api/client.ts` | HTTP client wrapper |
| `src/lib/api/auth.ts` | Auth API helpers |
| `src/store/authStore.ts` | Zustand auth state |
| `.next/` | **Gitignored** — Next build cache |

---

## Database Documentation

**Status:** Phase 1 schema **implemented and migrated** on Neon. Remaining blueprint models not added.

### Implemented models (Prisma / PostgreSQL)

| Model | Purpose |
|-------|---------|
| `User` | Auth, profile, role (`ADMIN` \| `CANDIDATE`) |
| `RefreshToken` | Hashed refresh token, expiry, cascade delete with user |

### Planned models (not yet in schema)

| Model | Purpose |
|-------|---------|
| `Problem` | DSA question bank |
| `TestCase` | Visible/hidden test cases per problem |
| `Submission` | User code submissions + Judge0 results |
| `DSAEvaluation` | GPT-4o scores per submission |
| `SystemDesignQuestion` | SD prompts + rubric |
| `SystemDesignSubmission` | User SD answers + diagram URL |
| `SystemDesignEvaluation` | SD scores |
| `BehavioralQuestion` | Behavioral prompts |
| `BehavioralSession` | Multi-turn behavioral flow |
| `MockInterview` | Live interview session state |
| `MockInterviewReport` | 20-point final report |
| `TopicPerformance` | Per-topic weakness tracking |
| `StudyPlan` | AI-generated weekly plans |
| `AIUsageLog` | Token/cost tracking |

### User (implemented fields)

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | PK |
| `email` | String | unique |
| `passwordHash` | String | bcrypt |
| `role` | Enum | `ADMIN`, `CANDIDATE` (default `CANDIDATE`) |
| `name` | String | **required** |
| `createdAt` | DateTime | |

**Relationships:** `refreshTokens RefreshToken[]`

*Full field lists for future models: see blueprint PDF §04.*

---

## API Documentation

### Implemented

| Method | Route | Auth | Purpose | Response |
|--------|-------|------|---------|----------|
| `GET` | `/health` | Public | Health check | `{ "status": "ok", "message": "OmniPrep API is running" }` |
| `POST` | `/api/auth/signup` | Public | Create account | `201` `{ user, tokens }` |
| `POST` | `/api/auth/login` | Public | Login | `200` `{ user, tokens }` |
| `POST` | `/api/auth/refresh` | Public | Rotate refresh token | `200` `{ user, tokens }` |
| `POST` | `/api/auth/logout` | Public* | Revoke refresh token | `204` empty |
| `GET` | `/api/me` | Bearer access JWT | Current user payload | `200` `{ user }` or `401` |

\*Logout validates `{ refreshToken }` in body (not Bearer).

### Planned (blueprint — prefix `/api`)

**Problems & submissions**

| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/problems` | Auth |
| GET | `/api/problems/:id` | Auth |
| POST | `/api/submissions` | Auth |
| GET | `/api/submissions/:id` | Auth |
| GET | `/api/submissions/me` | Auth |

**System design & behavioral**

| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/sd/questions` | Auth |
| POST | `/api/sd/submit` | Auth |
| POST | `/api/sd/followup` | Auth |
| GET | `/api/behavioral/questions` | Auth |
| POST | `/api/behavioral/submit` | Auth |
| POST | `/api/behavioral/followup` | Auth |

**Mock interview & analytics**

| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/mock/start` | Auth |
| GET | `/api/mock/:id` | Auth |
| GET | `/api/mock/:id/report` | Auth |
| GET | `/api/analytics/me` | Auth |
| GET | `/api/analytics/heatmap` | Auth |
| GET | `/api/plans/current` | Auth |
| POST | `/api/plans/generate` | Auth |

**Admin** — all require `ADMIN` role.

*WebSocket events: namespace `/interview` — see blueprint §13.*

---

## Features Tracker

| Feature | Status | Progress % | Notes |
|---------|--------|------------|-------|
| Monorepo setup | Completed | 100% | npm workspaces |
| Backend Express scaffold | Completed | 100% | ESM, `/health` |
| Frontend Next.js scaffold | Completed | 100% | Tailwind, App Router |
| Neon PostgreSQL + Prisma | Completed | 100% | Migrated; 2 migrations |
| Authentication (JWT) | Completed | 95% | Backend complete; frontend refresh UX pending |
| Auth UI (login/signup/home) | Completed | 100% | Zustand persist |
| Upstash Redis | In Progress | 20% | URL in `.env`; client Phase 3 |
| DSA module | Not Started | 0% | Phase 2 |
| AI evaluation pipeline | Not Started | 0% | Phase 3 |
| System design module | Not Started | 0% | Phase 4 |
| Behavioral module | Not Started | 0% | Phase 5 |
| Full mock interview | Not Started | 0% | Phase 6 |
| Adaptive learning engine | Not Started | 0% | Phase 7 |
| Admin dashboard | Not Started | 0% | Phase 7–8 |
| Deployment CI/CD | Not Started | 0% | Phase 8 |

---

## External Services

| Service | Purpose | Status |
|---------|---------|--------|
| **Neon** | PostgreSQL hosting | **Connected** — migrations applied |
| **Upstash** | Redis (cache, BullMQ, sessions) | Account + `REDIS_URL` in `.env`; not used in code |
| **OpenAI GPT-4o** | DSA/SD/behavioral eval, study plans | Not integrated |
| **Judge0** | Sandboxed code execution | Not integrated |
| **Cloudinary** | Diagram/image uploads | Not integrated |
| **Socket.io** | Mock interview real-time | Not integrated |

---

## Environment Variables

### `apps/backend/.env` (gitignored — real values)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | API port (default `4000`) |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `REDIS_URL` | Phase 3+ | Upstash Redis TLS URL (`rediss://`) |
| `JWT_ACCESS_SECRET` | Yes | Access token signing (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing (min 32 chars) |
| `JWT_ACCESS_EXPIRY` | Yes | e.g. `15m` |
| `JWT_REFRESH_EXPIRY` | Yes | e.g. `7d` |
| `FRONTEND_URL` | Yes | CORS origin (e.g. `http://localhost:3000`) |
| `OPENAI_API_KEY` | Phase 3+ | GPT-4o |
| `JUDGE0_API_KEY` | Phase 2+ | Code execution |
| `JUDGE0_BASE_URL` | Phase 2+ | Judge0 endpoint |
| `CLOUDINARY_*` | Phase 4+ | Image uploads |

### `apps/frontend/.env.local` (gitignored)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend base URL (`http://localhost:4000`) |

### Root `.env.example`

Committed template — no real secrets. Copy to app-specific env files.

---

## Decision Log

| Date | Context | Decision | Reason | Alternatives |
|------|---------|----------|--------|--------------|
| 2026-06-01 | Stack rebuild | Next.js + TS + Tailwind instead of React + JS | User learning goals, modern SSR/routing | CRA, Vite |
| 2026-06-01 | Workspace names | `frontend` / `backend` folders | User preference | `web` / `api` |
| 2026-06-01 | Backend modules | ESM (`type: module`, `NodeNext`) | User preference over CommonJS | CommonJS |
| 2026-06-01 | Next config | `next.config.mjs` not `.ts` | Next 14.2 error on `.ts` | Upgrade Next 15+ later |
| 2026-06-01 | Infrastructure | Neon + Upstash only, **no Docker** | User preference, matches production | docker-compose local |
| 2026-06-01 | State management | Zustand vs Redux | Simpler with Next.js App Router | Redux Toolkit |
| 2026-06-01 | Dev process | One file at a time, user types code | Learning-focused mentoring | Agent writes all |
| 2026-06-01 | API health route | `/health` not `/api/health` | Phase 0 simplicity | Move under `/api` later |
| 2026-06-04 | Auth UX naming | **`signup`** not `register` | User preference | `/register` route |
| 2026-06-04 | User profile | **`name` required** on signup | User preference | Optional name |

---

## Bug Tracker

| Bug | Severity | Status | Fix Plan |
|-----|----------|--------|----------|
| `next.config.ts` unsupported on Next 14.2 | Medium | **Fixed** | Use `next.config.mjs` |
| Port 3000 in use → Next uses 3001 | Low | Open | Set `FRONTEND_URL` to match actual port |
| `npm run dev` with `&` fails on Windows PowerShell | Low | Open | Use two terminals or add `concurrently` |
| CORS wide open `cors()` | Low | **Fixed** | `FRONTEND_URL` in `app.ts` |
| `tsx` missing `@esbuild/win32-x64` on Windows | Medium | **Fixed** | `npm install @esbuild/win32-x64 -w backend` |
| `EADDRINUSE` port 4000 | Low | Open | Stop duplicate `npm run dev` processes |

---

## Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| Wire `authStore.refresh()` + optional 401 retry | Medium | Phase 1 polish |
| Remove unused `PORT` in `server.ts` | Low | Uses `env.PORT` for listen |
| Root `lint` script | Low | Cross-workspace lint |
| Rename root package to `omniprep` | Low | Cosmetic |
| Upgrade Next.js 15+ for `next.config.ts` | Low | Optional |
| Add README with run instructions | Medium | Onboarding |
| Git commit Phase 0 + Phase 1 | Medium | Include `prisma/migrations/` |
| API client env guard (`NEXT_PUBLIC_API_URL`) | Low | Fail fast if missing |

---

## Testing Status

| Type | Status | Notes |
|------|--------|-------|
| Unit tests | Not Started | Jest for services (planned) |
| API integration | Not Started | Supertest (planned) |
| E2E | Not Started | Playwright (planned) |
| Manual | In progress | Signup/login/logout UI; `npm run build` passes both workspaces |

---

## Deployment Status

| Environment | Status |
|-------------|--------|
| Development | Local monorepo — backend `:4000`, frontend `:3000` or `:3001` |
| Staging | Not configured |
| Production | Not configured |

---

## AI Development Rules

### Naming

- Workspaces: `"frontend"`, `"backend"` (must match folder `package.json` `name`)
- Backend files: `feature.routes.ts`, `feature.controller.ts`, `feature.service.ts`
- Frontend routes: `src/app/<route>/page.tsx`
- Auth route: **`/api/auth/signup`** (not `register`)

### Folders

- Backend: **feature modules** under `src/modules/`, shared logic in `src/services/`
- Frontend: App Router under `src/app/`, UI in `src/components/`

### Code style

- TypeScript **strict** mode both apps
- Backend: **ESM** only — local imports use `.js` extension in import paths
- Frontend: Server Components default; client only when needed
- Thin controllers; fat services

### Design patterns

- Prisma singleton in `config/db.ts`
- Redis only via `CacheService` (when built)
- BullMQ queues centralized in `jobs/queues.ts`
- Never block HTTP for long AI jobs — use workers

### Architectural constraints

- Do not penalize non-native English, missing diagrams, or accent in AI prompts (blueprint)
- `NEXT_PUBLIC_*` only for non-secret client config
- Never commit `.env` or `.env.local`
- Follow one-file-at-a-time mentoring unless user asks agent to edit
- Run Prisma CLI from `apps/backend` (not repo root)

---

*End of PROJECT_CONTEXT.md*
