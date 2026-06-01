# PROJECT_CONTEXT.md

> **Last updated:** 2026-06-01  
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
| **Current Completion %** | **~10%** (Phase 0 monorepo scaffold complete; no auth, DB, or feature modules yet) |

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

1. **Register / login** → JWT access + refresh tokens  
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
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3 | Scaffolded |
| **Backend** | Node.js, Express 4, TypeScript, ESM (`"type": "module"`) | Scaffolded |
| **Database** | PostgreSQL via **Neon** + **Prisma ORM** | URLs in `.env`; Prisma **not installed** |
| **Cache / queues** | **Upstash Redis** + BullMQ (planned) | URL in `.env`; not wired in code |
| **Authentication** | JWT + bcrypt + refresh tokens (planned) | Not started |
| **AI** | OpenAI GPT-4o (planned) | Not started |
| **Code execution** | Judge0 API (planned) | Not started |
| **File storage** | Cloudinary (planned) | Not started |
| **Real-time** | Socket.io (planned) | Not started |
| **Deployment** | Vercel, Railway, Neon, Upstash, Cloudinary (planned) | Not started |
| **Monorepo** | npm workspaces (`apps/frontend`, `apps/backend`) | Active |
| **Local dev** | **No Docker** — cloud DB/Redis only (team decision 2026-06-01) | Active |

### Frontend state management (planned)

- **Zustand** for client global state (auth, interview session, UI) — replaces blueprint’s Redux Toolkit  
- Server Components + fetch for page-level data where appropriate  

---

## Architecture Overview

### Frontend Architecture

```
apps/frontend/
├── src/app/              # App Router (file-based routes)
│   ├── layout.tsx        # Root layout, metadata, globals.css
│   ├── page.tsx          # Home /
│   └── (future routes)
├── src/components/       # (planned)
├── src/lib/api/          # (planned) API client
├── src/hooks/            # (planned)
├── src/store/            # (planned) Zustand
└── src/types/            # (planned)
```

- **Server Components** by default; `"use client"` for Monaco, sockets, forms  
- **Tailwind** via `globals.css` + PostCSS + `tailwind.config.ts`  
- **Config:** `next.config.mjs` (Next 14.2 does **not** support `next.config.ts`)  

### Backend Architecture (target — modular, not MVC)

```
apps/backend/src/
├── server.ts             # HTTP listen + dotenv
├── app.ts                # Express app, middleware
├── config/               # (planned) env, db, redis
├── modules/              # (planned) feature folders
│   ├── auth/
│   ├── problems/
│   ├── submissions/
│   ├── systemDesign/
│   ├── behavioral/
│   ├── mockInterview/
│   ├── analytics/
│   ├── plans/
│   └── admin/
├── services/             # (planned) AIService, Judge0, Cache, Queue
├── workers/              # (planned) BullMQ workers
├── middleware/           # (planned)
└── socket/               # (planned)
```

**Principle:** Controllers thin; business logic in services; workers decoupled from HTTP.

### Database Architecture (planned — Prisma on Neon)

~16 models per blueprint. **Not migrated yet.** See [Database Documentation](#database-documentation).

### API Flow (current vs target)

**Current:**

```
Browser → GET http://localhost:4000/health → JSON { status, message }
```

**Target:**

```
Browser → Next.js → REST /api/* → Express modules → Prisma (Neon)
                              → Socket.io /interview (mock)
                              → BullMQ workers → OpenAI, Judge0
                              → Redis (Upstash) cache + sessions
```

### Authentication Flow (planned)

1. `POST /api/auth/register` → bcrypt hash → User in DB  
2. `POST /api/auth/login` → access JWT (15m) + refresh token (7d, DB)  
3. Axios/fetch interceptor refreshes on 401  
4. `authMiddleware` attaches `req.user`  
5. `adminMiddleware` checks `role === 'ADMIN'`  

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
| `package.json` | `name: backend`, ESM, Express deps |
| `tsconfig.json` | `NodeNext` module resolution |
| `.env` | **Gitignored** — `PORT`, `DATABASE_URL`, `REDIS_URL` |
| `src/app.ts` | Express app, CORS, JSON, `/health` |
| `src/server.ts` | `dotenv`, `app.listen(PORT)` |
| `dist/` | **Gitignored** — `tsc` output |

### `apps/frontend/`

| Path | Responsibility |
|------|----------------|
| `package.json` | `name: frontend`, Next.js 14 |
| `tsconfig.json` | Next + `@/*` → `./src/*` |
| `next.config.mjs` | Next config (`reactStrictMode`) |
| `postcss.config.mjs` | Tailwind + Autoprefixer |
| `tailwind.config.ts` | Content paths for class scanning |
| `next-env.d.ts` | Next TypeScript refs — **commit** |
| `.env.local` | **Gitignored** — `NEXT_PUBLIC_API_URL` |
| `src/app/globals.css` | `@tailwind` directives |
| `src/app/layout.tsx` | Root layout |
| `src/app/page.tsx` | Home page |
| `.next/` | **Gitignored** — Next build cache |

---

## Database Documentation

**Status:** Schema designed in blueprint; **not implemented in repo.**

### Planned models (Prisma / PostgreSQL)

| Model | Purpose |
|-------|---------|
| `User` | Auth, profile, role (`ADMIN` \| `CANDIDATE`) |
| `RefreshToken` | Refresh token rotation / revocation |
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

### User (planned fields)

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | PK |
| `email` | String | unique |
| `passwordHash` | String | bcrypt |
| `role` | Enum | `ADMIN`, `CANDIDATE` |
| `name` | String? | optional |
| `createdAt` | DateTime | |

**Relationships:** submissions, mockInterviews, topicPerformance, studyPlans

*Full field lists for all models: see blueprint PDF §04.*

---

## API Documentation

### Implemented

| Method | Route | Auth | Purpose | Response |
|--------|-------|------|---------|----------|
| `GET` | `/health` | Public | Health check | `{ "status": "ok", "message": "OmniPrep API is running" }` |

### Planned (blueprint — prefix `/api`)

**Auth**

| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public |
| POST | `/api/auth/logout` | Auth |

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
| Frontend Next.js scaffold | Completed | 100% | Tailwind, home page |
| Neon PostgreSQL | In Progress | 30% | URL in `.env`; Prisma not added |
| Upstash Redis | In Progress | 20% | URL in `.env`; not used in code |
| Authentication (JWT) | Not Started | 0% | Phase 1 |
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
| **Neon** | PostgreSQL hosting | Account + `DATABASE_URL` expected |
| **Upstash** | Redis (cache, BullMQ, sessions) | Account + `REDIS_URL` expected |
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
| `DATABASE_URL` | Yes (Phase 1+) | Neon PostgreSQL connection string |
| `REDIS_URL` | Yes (Phase 3+) | Upstash Redis TLS URL (`rediss://`) |
| `JWT_ACCESS_SECRET` | Phase 1+ | Access token signing |
| `JWT_REFRESH_SECRET` | Phase 1+ | Refresh token signing |
| `JWT_ACCESS_EXPIRY` | Phase 1+ | e.g. `15m` |
| `JWT_REFRESH_EXPIRY` | Phase 1+ | e.g. `7d` |
| `OPENAI_API_KEY` | Phase 3+ | GPT-4o |
| `JUDGE0_API_KEY` | Phase 2+ | Code execution |
| `JUDGE0_BASE_URL` | Phase 2+ | Judge0 endpoint |
| `CLOUDINARY_*` | Phase 4+ | Image uploads |
| `FRONTEND_URL` | Phase 1+ | CORS origin (e.g. `http://localhost:3000`) |

### `apps/frontend/.env.local` (gitignored)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes (Phase 1+) | Backend base URL (`http://localhost:4000`) |

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
| 2026-06-01 | State management | Zustand (planned) vs Redux | Simpler with Next.js App Router | Redux Toolkit |
| 2026-06-01 | Dev process | One file at a time, user types code | Learning-focused mentoring | Agent writes all |
| 2026-06-01 | API health route | `/health` not `/api/health` | Phase 0 simplicity | Mount all under `/api` in Phase 1 |

---

## Bug Tracker

| Bug | Severity | Status | Fix Plan |
|-----|----------|--------|----------|
| `next.config.ts` unsupported on Next 14.2 | Medium | **Fixed** | Use `next.config.mjs` |
| Port 3000 in use → Next uses 3001 | Low | Open | Document in README; set `FRONTEND_URL` accordingly |
| `npm run dev` with `&` fails on Windows PowerShell | Low | Open | Use two terminals or add `concurrently` |
| CORS wide open `cors()` | Low | Open | Restrict to `FRONTEND_URL` in Phase 1 |

---

## Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| Mount Express routes under `/api` | Medium | Align with blueprint |
| Add `src/config/env.ts` (Zod) | High | Phase 1 |
| Root `lint` script | Low | Cross-workspace lint |
| Rename root package to `omniprep` | Low | Cosmetic |
| Upgrade Next.js 15+ for `next.config.ts` | Low | Optional |
| Add README with run instructions | Medium | Onboarding |
| Commit Phase 0 to git | Medium | Currently untracked |

---

## Testing Status

| Type | Status | Notes |
|------|--------|-------|
| Unit tests | Not Started | Jest for services (planned) |
| API integration | Not Started | Supertest (planned) |
| E2E | Not Started | Playwright (planned) |
| Manual | Ad hoc | `npm run build` passes both workspaces |

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

---

*End of PROJECT_CONTEXT.md*
