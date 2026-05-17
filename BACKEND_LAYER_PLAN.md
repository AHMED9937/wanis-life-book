# Backend Layer Plan (server/ + Prisma)

## Goal
Create a small Node API inside this repo (`server/`) so Prisma runs on the server side (not in React), with environment-driven database access via `DATABASE_URL`.

## Scope
- In scope:
  - Add backend app structure in `server/`
  - Add Prisma client singleton for backend usage
  - Configure environment loading for backend and Prisma CLI
  - Add health route and one sample DB-connected route
- Out of scope (next phase):
  - Full CRUD endpoints for residents/stories
  - Clerk token verification middleware
  - Frontend migration from `mockData` to API

## Proposed Stack
- Runtime: Node.js + TypeScript
- API framework: Express (simple, predictable, fast setup)
- ORM: Prisma (already configured in repo)
- Database: PostgreSQL (Neon)

## Target Structure
```text
server/
  src/
    app.ts
    index.ts
    config/
      env.ts
    lib/
      prisma.ts
    routes/
      health.ts
      residents.ts
```

## Implementation Plan

1. **Initialize server workspace**
   - Add `server/` with its own TS config and entrypoints.
   - Install backend dependencies (Express + types).
   - Keep backend isolated from Vite client build.

2. **Environment configuration**
   - Read env values from root `.env` (especially `DATABASE_URL`).
   - Add strict env validation in `server/src/config/env.ts`.
   - Fail fast if `DATABASE_URL` or required backend vars are missing.

3. **Prisma client singleton**
   - Create `server/src/lib/prisma.ts` exporting one shared Prisma client.
   - Use a global singleton pattern in dev to prevent extra connections on reload.
   - Ensure imports use this singleton everywhere (no `new PrismaClient()` in routes).

4. **Bootstrap API server**
   - Build `app.ts` with JSON middleware + basic error handling.
   - Build `index.ts` to start server and listen on configurable `PORT`.
   - Add `GET /api/health` returning status, uptime, and db-check result.

5. **Add one DB-backed sample route**
   - Add `GET /api/residents` (minimal read query) to validate end-to-end DB access.
   - Return normalized response shape and proper HTTP errors.

6. **Scripts and dev workflow**
   - Add root scripts:
     - `dev:server`
     - `build:server`
     - `start:server`
   - Keep Prisma scripts as-is and run migrations from root.

7. **Validation checklist**
   - `npx prisma validate` passes
   - `npx prisma migrate dev` succeeds against Neon
   - Server starts with no connection errors
   - `GET /api/health` returns OK
   - `GET /api/residents` returns data from Neon

## Environment Requirements
Root `.env` must include:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"
PORT=4000
```

## Design Decisions
- **Why server folder?** Separates backend runtime concerns from React client.
- **Why singleton Prisma client?** Avoids connection storms during hot reload.
- **Why Express now?** Lowest setup overhead; easy to swap later if needed.

## Risks & Mitigation
- **Risk:** Prisma import accidentally used in client code.
  - **Mitigation:** Keep all Prisma usage under `server/src/lib/prisma.ts`.
- **Risk:** Neon SSL/connectivity issues.
  - **Mitigation:** Use Neon URL with `sslmode=require`, verify via health route.
- **Risk:** Dual-process local dev complexity.
  - **Mitigation:** Add clear npm scripts and documented ports.

## Definition of Done
- `server/` exists and runs independently.
- Prisma only runs in backend code.
- Backend successfully reads from Neon using `DATABASE_URL`.
- Health and one DB-backed API route are live.
