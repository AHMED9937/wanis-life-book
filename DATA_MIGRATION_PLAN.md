# Data Migration Plan

## Goal
Migrate the `INITIAL_RESIDENTS` from our static `mockData.ts` directly into the live Neon PostgreSQL database. Once verified, permanently remove the old mock data structure to ensure a fully dynamic application.

## Scope
- Create a robust Prisma seed script (`prisma/seed.ts`).
- Execute the seed script against the live Neon database.
- Move essential TypeScript interfaces out of `mockData.ts` and into a dedicated `types` file.
- Delete `mockData.ts` completely.

## Proposed Implementation

### 1. Extract Shared Types
Currently, `App.tsx` and your UI components import the `Resident` and `Story` interfaces from `mockData.ts`. Before we delete the mock data, we must create `src/types/index.ts` and move these interfaces there.
- Update all imports across the frontend (`App.tsx`, `api.ts`, `components/*.tsx`) to point to `src/types/index.ts`.

### 2. Create the Prisma Seed Script
Create `prisma/seed.ts` using `tsx` (TypeScript executor).
The script will perform the following steps safely:
1. **Bootstrap Core Tenants**: Check for a default `CareHome` (e.g., "Unassigned") and a default `User` (to act as the `recordedBy` author for the legacy stories). Create them if they don't exist.
2. **Data Mapping**: Copy the `INITIAL_RESIDENTS` array into the script. Iterate over each resident.
3. **Database Insertion**: For each resident, perform a Prisma `create` operation that inserts the `Resident`, nested `LifeBook`, and nested `Stories` in a single transaction, mapping the mock fields (e.g., `coverColor: 'emerald'`) to the Prisma enums (e.g., `coverStyle: 'forest_green'`).

### 3. Update Package Settings
Add the seed configuration to `package.json`:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

### 4. Execute the Migration
Run the following command to populate the Neon database:
`npx prisma db seed`

### 5. Cleanup
Delete `src/data/mockData.ts`. Ensure the frontend still builds successfully without it.

## User Review Required
> [!IMPORTANT]
> The seed script needs a `recordedBy` user ID to attach the stories to. I will have the script automatically create a dummy "System Admin" user in the database to own these historical stories. This keeps our relational data perfectly intact. Does this approach work for you?

## Definition of Done
1. `prisma/seed.ts` is fully implemented and executed.
2. The Neon database contains the four classic Wanis residents.
3. `src/data/mockData.ts` is deleted.
4. The React application builds with zero TypeScript errors.
