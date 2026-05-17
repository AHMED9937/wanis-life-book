# Plan: Fix library search (مكتبة حكايات الدار)

## Investigation summary

**Your guess:** Search uses mock data, not the database.

**What the code actually does:**

| Step | What happens |
|------|----------------|
| 1 | `App.tsx` calls `fetchResidents(token)` on login |
| 2 | `GET /api/residents` → Prisma → **PostgreSQL** |
| 3 | Results stored in React state: `residents` |
| 4 | `Library.tsx` filters that array **in the browser only** |

There is **no mock resident list** in `src/`. The demo names (صالح العبدالله, نورة السالم, …) come from **`prisma/seed.ts`** written into the database  they look like mock data but are real DB rows.

So the problem is **not** “mock vs database.” The problems are:

1. Search never hits the database again (client-side filter only).
2. Search fields don’t match what users type.
3. Some seed fields (e.g. كنية) are **never saved** to the DB.

---

## Root causes (why search fails)

### 1. Client-side-only search

```14:18:src/components/Library.tsx
  const filteredResidents = residents.filter(res => 
    res.name.includes(searchTerm) || 
    res.nickname.includes(searchTerm) ||
    res.roomNumber.includes(searchTerm)
  );
```

- Only searches residents **already loaded once** at page open.
- No `?q=` API call when the user types.
- If the server failed or returned `[]`, search has nothing to filter.

### 2. `nickname` is fake  not from database

Schema has **no** `nickname` column:

```90:107:prisma/schema.prisma
model Resident {
  firstName       String
  lastName        String
  roomNumber      String?
  // no nickname field
}
```

Mapper invents nickname:

```56:56:src/lib/api.ts
    nickname: `النزيل ${dbRes.firstName}`, // Basic fallback
```

Seed has `nickname: 'أبو محمد'` but it is **discarded** when seeding. Searching **أبو محمد** will not find صالح العبدالله.

### 3. Missing search fields

Users may search by:

- Book title (`coverTitle` / `lifeBook.bookTitle`)  **not searched**
- First name only  works only inside full `name`
- Room with Western digits `104`  DB may have `١٠٤`  **no match**

### 4. Weak matching

- `includes()` is **case-sensitive**
- No Arabic normalization (أ إ آ, diacritics)
- No digit normalization (٠١٢ vs 012)

### 5. Multi-tenant / auth (less common)

`GET /api/residents` filters by `careHomeId` of the logged-in user. New residents appear only after `loadResidents()` runs again (e.g. after create). Search still works on whatever is in memory.

---

## Solution plan (recommended order)

### Phase A  Quick fix (1–2 hours)  better client search

**Goal:** Make search work correctly on DB-loaded data without schema changes.

| Task | File | Change |
|------|------|--------|
| A1 | `src/lib/search.ts` (new) | `normalizeArabicSearch(text)`  lowercase, strip diacritics, map Arabic digits → Western |
| A2 | `Library.tsx` | Search: `name`, `coverTitle`, `roomNumber`, `nickname`, first/last word split |
| A3 | `Library.tsx` | Use normalized compare: `normalize(haystack).includes(normalize(needle))` |
| A4 | `api.ts` `mapResident` | Set `nickname` from `lifeBook.bookTitle` or first name only if no DB field  **or** drop nickname from search until Phase B |
| A5 | `App.tsx` | After `createResident`, `loadResidents()` already runs  verify list refreshes |

**Acceptance:**

- Search `صالح` → finds صالح العبدالله
- Search `كتاب حياة` → finds by cover title
- Search `104` or `١٠٤` → finds room 104
- Empty search → shows all loaded residents

---

### Phase B  Database + API search (half day)

**Goal:** Search the database (scalable, correct for large lists).

| Task | File | Change |
|------|------|--------|
| B1 | `prisma/schema.prisma` | Optional: add `nickname String?` on `Resident` |
| B2 | Migration | `npx prisma migrate dev` |
| B3 | `seed.ts` | Persist `resData.nickname` when seeding |
| B4 | `server/src/routes/residents.ts` | `GET /?q=`  Prisma `where` with `OR` on `firstName`, `lastName`, `roomNumber`, `lifeBook.bookTitle`, `nickname` (case-insensitive `contains` / `mode: 'insensitive'`) |
| B5 | `src/lib/api.ts` | `fetchResidents(token, query?: string)` |
| B6 | `Library.tsx` | Debounce 300ms → call API with `q`, show loading spinner in search box |
| B7 | `App.tsx` | Pass search handler or lift `searchTerm` + refetch |

**Example API:**

```
GET /api/residents?q=صالح
```

**Prisma (sketch):**

```ts
where: {
  careHomeId: req.user.careHomeId,
  OR: [
    { firstName: { contains: q, mode: 'insensitive' } },
    { lastName: { contains: q, mode: 'insensitive' } },
    { roomNumber: { contains: q, mode: 'insensitive' } },
    { nickname: { contains: q, mode: 'insensitive' } },
    { lifeBook: { bookTitle: { contains: q, mode: 'insensitive' } } },
  ],
}
```

**Acceptance:**

- New resident created in UI appears in search without full page reload (after debounced API call)
- Search works with 100+ residents (not limited to first fetch)

---

### Phase C  Polish

- Show result count: `٣ نتائج`
- Highlight matched text on cards (optional)
- Clear button inside search input
- Empty state: distinguish “no residents in DB” vs “no match for query”

---

## Files to touch

| File | Phase |
|------|--------|
| `src/components/Library.tsx` | A, B6 |
| `src/lib/search.ts` | A (new) |
| `src/lib/api.ts` | A4, B5 |
| `server/src/routes/residents.ts` | B4 |
| `prisma/schema.prisma` | B1 |
| `prisma/seed.ts` | B3 |
| `src/App.tsx` | B7 (if needed) |

---

## What is NOT required

- Removing mock data from frontend (there is none)
- Replacing PostgreSQL
- Changing Clerk auth (unless residents list is empty due to 401  then fix server/login first)

---

## How to verify data is from DB (not mock)

1. Run backend: `npm run dev:server`
2. Open DB tool or: `npx prisma studio`
3. Check table `residents`  rows should match library cards
4. Create a new resident in UI → new row in DB → appears after refresh / reload residents
5. Network tab: `GET /api/residents` returns JSON `{ data: [...] }`

---

## Recommended implementation order

1. **Phase A**  fixes most user-visible search bugs today  
2. **Phase B**  when you have many residents or need nickname in DB  
3. **Phase C**  UX polish  

---

## Status

| Item | Status |
|------|--------|
| Investigation | Done |
| Phase A | **Done** (`src/lib/search.ts`, `Library.tsx` client filter) |
| Phase B | **Done** (`GET /api/residents?q=`, `nickname` column, debounced search) |
| Phase C | Partial (result count, clear button  done; highlight optional) |

### After deploy  run migration

```bash
npx prisma migrate deploy
# or for dev:
npx prisma migrate dev
```

To backfill nicknames for seeded residents (optional):

```bash
npx prisma db seed
```

*Last updated: plan created from codebase review.*
