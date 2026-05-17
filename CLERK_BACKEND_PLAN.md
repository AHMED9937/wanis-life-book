# Clerk Backend Integration Plan

## Goal
Secure the Node/Express backend using Clerk authentication, ensuring that only authenticated users can access the API. Additionally, we must sync authenticated users to the database (`User` table) and scope their access based on their assigned `careHomeId`.

## Scope
- Verify Clerk JWTs in API middleware.
- Upsert (Create/Update) the user in the Prisma database based on their `clerkId`.
- Resolve and inject the user's `careHomeId` into the Express request context for tenant scoping.

## Proposed Implementation

### 1. Dependencies & Environment
- **Packages**: Install `@clerk/express` (the official Clerk SDK for Express).
- **Environment**: Add `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` to `.env` and validate them in `server/src/config/env.ts`.

### 2. Express Types Extension
Create `server/src/types/express.d.ts` to extend the Express `Request` object. This ensures TypeScript knows about our custom `user` property:
```typescript
import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

### 3. Authentication & Tenant Middleware
Create `server/src/middleware/auth.ts`:

1. **`clerkMiddleware()`**: Parses the incoming JWT and attaches the authentication state to the request (e.g., `req.auth.userId`).
2. **`requireAuth`**: Rejects requests that are completely unauthenticated.
3. **`resolveTenant` (Custom Middleware)**:
   - Takes the `clerkId` (`req.auth.userId`).
   - Queries the database: `prisma.user.findUnique({ where: { clerkId } })`.
   - **Upsert Logic**: If the user doesn't exist, we fetch their details from Clerk's API using `clerkClient.users.getUser(clerkId)`.
   - **Important Open Question**: When creating a brand new user, the schema requires a `careHomeId`. We need to define how this is assigned initially. We can either:
     - Read it from Clerk's `publicMetadata` if assigned during signup.
     - Assign them to a default "Unassigned" CareHome.
   - Finally, attaches the database `User` object to `req.user`.

### 4. Route Integration
Update `server/src/app.ts`:
- Apply the authentication middleware to protected routes.
- Update `/api/residents` to scope the database query to the current user's care home:
  ```typescript
  const residents = await prisma.resident.findMany({
    where: { careHomeId: req.user.careHomeId }
  });
  ```

## Definition of Done
- All API routes (except `/api/health`) require a valid Clerk token.
- Unauthenticated requests return `401 Unauthorized`.
- The database is automatically populated with new users when they make their first authenticated API request.
- Data queries are strictly scoped to the user's `careHomeId`.
