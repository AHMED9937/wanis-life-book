# Core Endpoints Implementation Plan

## Goal
Implement the core business logic REST API endpoints for managing `Residents` and their associated `Stories`. All endpoints must be securely scoped to the authenticated user's `careHomeId` to ensure strict multi-tenant data isolation.

## Scope
- Extract routing into dedicated Express routers (`server/src/routes/residents.ts`, `server/src/routes/stories.ts`) to keep `app.ts` clean.
- Implement CRUD operations for Residents.
- Implement creation of Stories tied to a specific resident's Life Book.
- *Out of Scope*: Share-link endpoints (to be implemented in a future phase).

## Proposed Architecture

### 1. Router Setup
Create dedicated router files:
- `server/src/routes/residents.ts`
- `server/src/routes/stories.ts`
Mount them in `server/src/app.ts` under the `/api` prefix (after the auth middleware).

### 2. Endpoints Detail

#### Residents API (`/api/residents`)

**`GET /api/residents`**
- **Purpose**: Fetch all residents for the current user's care home.
- **Prisma Query**: 
  - `where: { careHomeId: req.user!.careHomeId }`
  - `include: { lifeBook: { include: { stories: true } } }`
- **Response**: Array of residents with their life book and story count/data.

**`GET /api/residents/:id`**
- **Purpose**: Fetch a single resident by ID.
- **Prisma Query**: 
  - `where: { id: req.params.id, careHomeId: req.user!.careHomeId }`
  - `include: { lifeBook: { include: { stories: true } } }`
- **Response**: Single resident object. Returns `404 Not Found` if the resident doesn't exist or belongs to another care home.

**`POST /api/residents`**
- **Purpose**: Create a new resident AND automatically initialize their 1:1 `LifeBook`.
- **Payload**: `{ firstName, lastName, gender, dateOfBirth?, roomNumber? }`
- **Prisma Logic**: Use a Prisma transaction (`prisma.$transaction`) or nested create to ensure both the `Resident` and the `LifeBook` are created simultaneously safely.
- **Tenant Scoping**: Force `careHomeId: req.user!.careHomeId` in the creation payload.

**`PUT /api/residents/:id`** *(Future-proofing)*
- **Purpose**: Update a resident's details (e.g., room number changes).
- **Security Check**: Enforce `careHomeId: req.user!.careHomeId`.

**`DELETE /api/residents/:id`** *(Future-proofing)*
- **Purpose**: Remove a resident and all cascading data (LifeBook, Stories).
- **Security Check**: Enforce `careHomeId: req.user!.careHomeId`.

#### Stories API (`/api/stories`)

**`POST /api/stories`**
- **Purpose**: Record/add a new story to a resident's Life Book.
- **Payload**: `{ lifeBookId, title, audioFileUrl, rawTranscript, literaryContent, durationSeconds, aiTags? }`
- **Security Check**: Before creating the story, query the `LifeBook` to verify that its associated `Resident` belongs to `req.user!.careHomeId`. If not, return `403 Forbidden`.
- **Creation Logic**: Set `recordedById: req.user!.id` to track which caregiver recorded the story.

**`PUT /api/stories/:id`** *(Future-proofing)*
- **Purpose**: Edit the generated transcript, literary content, or tags of a story.
- **Security Check**: Verify the story's `LifeBook` -> `Resident` belongs to `careHomeId: req.user!.careHomeId`.

**`DELETE /api/stories/:id`** *(Future-proofing)*
- **Purpose**: Delete a specific story from the Life Book.
- **Security Check**: Verify the story's `LifeBook` -> `Resident` belongs to `careHomeId: req.user!.careHomeId`.

## Definition of Done
1. Dedicated router files are created and mounted.
2. All endpoints correctly filter/enforce `careHomeId` to prevent cross-tenant data leaks.
3. Creating a Resident automatically creates an empty `LifeBook` with a default cover style.
4. TypeScript compiles without errors.
