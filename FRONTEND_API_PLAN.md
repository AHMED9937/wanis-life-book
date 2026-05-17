# Frontend API Integration Plan

## Goal
Replace the local `mockData.ts` storage mechanism with real HTTP calls to our newly created Node/Express backend. Ensure that all requests are authenticated using the Clerk JWT.

## Scope
- Create a dedicated API client file (`src/lib/api.ts`).
- Remove `localStorage` reliance (`getStoredResidents` / `saveResidents`) from `App.tsx`.
- Update the data fetching and saving lifecycle in `App.tsx`.
- **Handle Data Shape Differences**: The old mock data (`Resident` interface) differs slightly from the real Prisma database models. We will write mapper functions in `api.ts` to bridge the gap without breaking existing UI components.

## Proposed Implementation

### 1. The API Client (`src/lib/api.ts`)
Create a set of functions that accept the Clerk JWT token and perform `fetch` requests:

```typescript
const BASE_URL = '/api'; // Assuming Vite proxies this to the backend

// Fetch all residents
export const fetchResidents = async (token: string) => { ... }

// Create a resident
export const createResident = async (token: string, payload: any) => { ... }

// Create a story
export const createStory = async (token: string, payload: any) => { ... }
```

**Crucial Step - Data Mapping**:
The backend returns `Resident` with a nested `LifeBook` containing `Stories`. The frontend expects a flat `Resident` object containing `stories` array and `coverTitle`/`coverColor`. The `api.ts` file will transform the backend payload into the `Resident` interface the UI expects so we don't have to rewrite all the React components right now.

### 2. Updating `App.tsx`
- **Authentication**: Import `useAuth` from `@clerk/clerk-react`. Extract the `getToken` function to securely retrieve the JWT before making requests.
- **Initial Load**:
  Replace `useEffect` calling `getStoredResidents()` with a new `useEffect` that calls `getToken()` and then `fetchResidents(token)`.
- **Saving Residents (`handleSaveNewResident`)**:
  Refactor to call `createResident(token, ...)`. Once successful, append the returned (and mapped) resident to the state.
- **Saving Stories (`handleSaveNewStory`)**:
  Refactor to call `createStory(token, ...)`. Pass the `lifeBookId` (which we will map to `id` or store in the frontend state).

## User Review Required
> [!IMPORTANT]
> Because your frontend components expect `name` and `age`, but the database uses `firstName`, `lastName`, and `dateOfBirth`, I will create a data mapper in `api.ts`. For example, `name` will become `${firstName} ${lastName}`. Does this approach work for you, or would you prefer I rewrite the React components to use the exact database fields?

## Definition of Done
1. `src/lib/api.ts` is fully implemented.
2. `App.tsx` successfully reads from and writes to the Neon database.
3. The UI components function exactly as before, but with persistent, cloud-based data.
4. No console errors or TypeScript compilation errors.
