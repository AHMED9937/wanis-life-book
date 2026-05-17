# Wanis (ونيس)  App Structure (Vite + React + TypeScript + Tailwind)

This document describes the current structure of the app based on the code in this repo.

> Note: you asked to put this at `...\Library.tsx`, but that path is a **TypeScript file**. To avoid overwriting your code, this `.md` file is created **next to it** in `src\components\APP_STRUCTURE.md`.

---

## 1) High-level overview

**What the app is:**
A single-page React app that simulates a “Life Book” system for a care home.
- Caregivers see a **library of residents**.
- Each resident has a **Life Book** (cover → index → record story → story detail pages).
- Data is stored in **localStorage** (no backend).
- There is a **print mode** for printing the whole book.

**Tech stack:**
- **Vite** build tool
- **React** + **React DOM**
- **TypeScript**
- **Tailwind CSS** (+ `@tailwindcss/vite`)
- `lucide-react` icons
- `vite-plugin-singlefile` (bundles into a single HTML output)

---

## 2) Entry points and bootstrapping

### `index.html`
- Contains `<div id="root"></div>`
- Loads the app via:
  - `src/main.tsx`

### `src/main.tsx`
- React entry:
  - imports global styles: `./index.css`
  - renders `<App />` into `#root` using `createRoot`

### `src/App.tsx`
This is the **application controller** (top-level state + view switching).

**Main state:**
- `residents: Resident[]`  loaded from localStorage via `getStoredResidents()`
- `view: 'library' | 'book' | 'print_entire'`
- `selectedResidentId: string | null`
- `page: number`  internal “book page” index when `view === 'book'`
- `isCreateModalOpen: boolean`
- `toastMessage: string | null`

**View logic (routing without react-router):**
- `view === 'library'` → shows `Library`
- `view === 'book'` and a resident is selected → shows one of the book pages:
  - `page === 0` → `BookCoverView`
  - `page === 1` → `BookIndexView`
  - `page === 2` → `RecordStoryView`
  - `page >= 3` → `StoryDetailView` (storyIndex = `page - 3`)
- `view === 'print_entire'` → `ContiguousPrintView`

**Write operations:**
- Create resident: `CreateResidentModal` → `handleSaveNewResident()`
- Create story: `RecordStoryView` → `handleSaveNewStory()`
- Reset demo data: `handleResetData()` resets to `INITIAL_RESIDENTS`

---

## 3) Data layer

### `src/data/mockData.ts`
Defines the core domain types:
- `Resident`
- `Story`

Provides:
- `INITIAL_RESIDENTS` demo dataset
- `getStoredResidents()`
  - reads `localStorage['wanis_residents_data']`
  - falls back to `INITIAL_RESIDENTS` if missing or parse fails
- `saveResidents(residents)`
  - writes to `localStorage['wanis_residents_data']`

**Important:** There is no server/API. All “AI” references in UI are **simulated**.

---

## 4) UI components (src/components)

### `CaregiverHeader.tsx`
Top header bar:
- Shows app title and “caregiver identity” (static text)
- Buttons:
  - go back to library
  - create new resident (opens modal)
  - reset data

### `Library.tsx`
The “home screen” that shows a searchable grid of residents.
- Props:
  - `residents`
  - `onSelectBook(residentId)`
  - `onCreateNew()`
- Local state: `searchTerm`
- Filters residents by `name`, `nickname`, `roomNumber`
- Clicking a book calls `onSelectBook(resident.id)`

### `BookCoverView.tsx`
Closed book cover for the selected resident.
- Props:
  - `resident`
  - `onOpenBook()` (go to index)
  - `onPrintEntireBook()`

### `BookIndexView.tsx`
Index page listing stories (table of contents).
- Props:
  - `resident`
  - `onSelectStory(index)`
  - `onGoToRecord()`
  - `onPrintEntireBook()`
  - `onCloseBook()`

### `RecordStoryView.tsx`
Simulated voice recording + AI transcription pipeline (UI-only demo).
- Uses a state machine:
  - `'idle' → 'recording' → 'processing' → 'done'`
- Generates a new `Story` object and calls `onSaveStory(newStory)`

### `StoryDetailView.tsx`
Single story reading page.
- Includes:
  - print single story via `window.print()`
  - simulated TTS playback (progress bar)
  - navigation to previous/next story pages via `onGoToPage(pageNumber)`

### `ContiguousPrintView.tsx`
A “print preview” mode for printing the entire book:
- cover-like first page
- then maps all stories, each with page-break styling
- calls `window.print()`

### `CreateResidentModal.tsx`
Modal form to create a new resident.
- Creates a `Resident` with:
  - id: `res-${Date.now()}`
  - default cover title: `كتاب حياة ${nickname}`
  - empty `stories: []`
- Calls `onSave(newResident)` and resets input state

---

## 5) Styling / UX system

### `src/index.css`
- `@import "tailwindcss";`
- Global CSS variables (paper/ink/gold/wood palette)
- Custom utility classes used across components:
  - `.wood-desk` background
  - `.book-perspective` for 3D effect container
  - `.book-page-wrapper` and flip helpers
  - `.story-body-text` (large accessible typography)
- Extensive `@media print` rules:
  - hides UI controls (`.no-print`, `header`, `button`, etc.)
  - removes 3D transforms
  - enforces page breaks (`.story-print-page`)

---

## 6) Utility helpers

### `src/utils/cn.ts`
A standard Tailwind helper:
- combines `clsx` + `tailwind-merge`
- Use it when you want conditional classNames without duplicates.

---

## 7) How navigation works (quick mental model)

There are two layers of navigation:
1) **Top-level view** (`view`): library / book / print_entire
2) **Book page number** (`page`) when view=book:
   - 0 cover
   - 1 index
   - 2 record
   - 3+ stories

This is why the story detail uses:
- `storyIndex = page - 3`

---

## 8) Running the app

From the project root (`c:\Users\57992\Downloads\bob`):

```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```

---

## 9) Suggested next docs (optional)
If you want, I can also generate:
- `DATA_MODEL.md` (Resident/Story schema and storage key)
- `USER_FLOW.md` (screens + actions)
- `PRINTING.md` (how print mode works and how to tweak page breaks)
