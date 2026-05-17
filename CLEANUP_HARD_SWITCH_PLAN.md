# Cleanup + Hard Switch Plan (DB-Driven Only)

## Goal
Remove all mock/localStorage data paths and keep the app fully driven by backend API + database.

## Scope
- Remove reset-to-mock behavior.
- Remove `src/data/mockData.ts` imports/usages and related dead code.
- Ensure all reads/writes come from backend endpoints.

## Implementation Steps

1. **Inventory current mock dependencies**
   - Find all imports/usages of:
     - `getStoredResidents`
     - `saveResidents`
     - `INITIAL_RESIDENTS`
     - `Resident` / `Story` types from `mockData.ts`
   - Identify UI features still tied to localStorage fallback/reset flows.

2. **Replace state bootstrapping**
   - In `App.tsx` and related components, remove localStorage bootstrap.
   - Replace with API bootstrap (`GET /api/residents`) + loading/error states.

3. **Replace write operations**
   - Convert resident/story creation handlers to API calls:
     - `POST /api/residents`
     - `POST /api/stories`
   - Refresh local UI state from API responses only.

4. **Remove reset-to-mock behavior**
   - Delete `handleResetData` mock reset logic.
   - Remove reset action from header props/UI.
   - If reset is still needed, replace with a DB-safe admin endpoint (separate task).

5. **Create shared API types**
   - Introduce API DTO types (or shared type file) replacing `mockData.ts` exports.
   - Ensure UI consumes normalized server payloads.

6. **Delete mock artifacts**
   - Remove `src/data/mockData.ts` once all references are gone.
   - Remove dead imports/props/comments and any localStorage keys no longer used.

7. **Hard-switch safeguards**
   - No silent local fallback to mock data.
   - Explicit UI error messages if backend is unavailable.
   - Keep sign-in requirement and tenant-scoped data flow intact.

## Files Expected to Change
- `src/App.tsx`
- `src/components/CaregiverHeader.tsx` (if reset button removed)
- `src/components/*` (only where mock-derived props/types are still coupled)
- `src/lib/api.ts` (or equivalent API client module)
- `src/types/*` (new shared DTOs)
- `src/data/mockData.ts` (deleted)

## Validation Checklist
- App startup loads residents from backend only.
- Creating resident creates `Resident + LifeBook` and appears in UI.
- Creating story persists and appears under correct resident/book.
- No localStorage read/write paths remain.
- No import from `src/data/mockData.ts` remains.
- Build/type-check pass.

## Risks & Mitigation
- **Risk:** UI regressions due to payload shape differences.
  - **Mitigation:** Add explicit mapper functions between API DTOs and UI view models.
- **Risk:** Temporary blank UI if backend is down.
  - **Mitigation:** Add clear loading/error empty states (not mock fallback).
- **Risk:** Hidden old references to mock helpers.
  - **Mitigation:** grep-based sweep before deleting `mockData.ts`.

## Definition of Done
- Mock/localStorage data path is fully removed.
- UI reads/writes only through backend APIs.
- `mockData.ts` deleted and no references remain.
