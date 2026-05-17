# Voice-to-Text (No AI) Implementation Plan

## 1) Goal
Replace the current mocked recording flow with **real speech-to-text** so the user can:
1. Start speaking from the recording page.
2. See transcribed text appear.
3. Save that transcript as a story in the existing backend.

**Scope now:** voice-to-text only.  
**Out of scope now:** AI rewriting/summarization, Whisper/GPT integration, audio file upload/storage.

---

## 2) Current State (What is Fake)
- `src/components/RecordStoryView.tsx` uses:
  - hardcoded `MOCK_PROMPTS`
  - random auto-filled title/content
  - fake processing delay (`setTimeout`)
  - AI-based copy in status text
- `src/components/BookIndexView.tsx` still advertises Whisper/GPT processing.
- Backend story creation already exists and can store transcript text (`rawTranscript`, `literaryContent`) and duration.

---

## 3) Technical Approach
Use browser-native **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`) in the frontend.

### Why this approach
- Fastest path to real voice-to-text.
- No new backend service required.
- Works with existing `createStory(...)` API contract.

### Compatibility strategy
- Primary support: Chrome/Edge.
- If unsupported browser: show clear Arabic message and disable start recording action.
- If mic permission denied/error: show explicit error and allow retry.

---

## 4) Implementation Phases

## Phase A  Speech Recognition Foundation
**Files:**
- `src/components/RecordStoryView.tsx`
- (optional) `src/types/speech.ts` or inline local types in component

**Work:**
1. Add browser speech recognition setup with typed guards:
   - detect `window.SpeechRecognition || window.webkitSpeechRecognition`
2. Configure recognition:
   - `lang = "ar-SA"` (or configurable constant)
   - `continuous = true`
   - `interimResults = true`
3. Handle recognition events:
   - `onstart`: enter recording state
   - `onresult`: update live transcript (interim + final)
   - `onerror`: capture/display user-friendly error
   - `onend`: transition to review-ready state

---

## Phase B  Replace Mock Flow in Record Screen
**File:**
- `src/components/RecordStoryView.tsx`

**Work:**
1. Remove `MOCK_PROMPTS`, random auto-fill logic, and fake processing timer.
2. Replace current states with real states (example):
   - `idle | recording | reviewing | error`
3. Keep timer logic for duration while actively recording.
4. Populate transcript textarea from recognized speech.
5. Auto-generate a draft title from first transcript words (fallback title if empty).
6. Keep text editable before save.
7. On save, build `Story` using captured transcript + measured duration and call existing `onSaveStory`.

---

## Phase C  Update UX Copy (Remove AI Claims)
**Files:**
- `src/components/BookIndexView.tsx`
- `src/components/RecordStoryView.tsx`

**Work:**
1. Replace text mentioning Whisper/GPT/AI with voice-to-text wording.
2. Update status messages to reflect:
   - listening
   - transcribing
   - ready to review
3. Keep existing visual style/theme unchanged.

---

## Phase D  Robustness + Edge Cases
**Files:**
- `src/components/RecordStoryView.tsx`

**Work:**
1. Handle empty transcript:
   - block save and show helpful message.
2. Handle quick start/stop race conditions cleanly.
3. Ensure recognition is stopped and handlers cleaned up on component unmount.
4. Ensure recording button is disabled during unsupported/error states appropriately.

---

## Phase E  Verification
**Commands:**
1. `npm run build`

**Manual checks:**
1. Open record page, start speaking, and see live text updates.
2. Stop recording and confirm final transcript remains editable.
3. Save story and confirm it appears in index/details.
4. Deny mic permission and verify friendly error path.
5. Unsupported-browser behavior is graceful and non-breaking.

---

## 5) Data Contract Impact
- **No backend schema change required.**
- Continue sending:
  - `title`
  - `rawTranscript` = transcript text
  - `literaryContent` = transcript text (temporary parity until AI stage)
  - `durationSeconds` from timer

---

## 6) Risks & Mitigations
1. **Browser support variance**  
   Mitigation: capability detection + fallback UX.
2. **Arabic recognition quality may vary**  
   Mitigation: editable transcript before save.
3. **Duplicate/interim result handling complexity**  
   Mitigation: maintain separate interim/final buffers and merge deterministically.

---

## 7) Definition of Done
1. Recording page uses real mic speech recognition (not mocked prompts).
2. User can speak and see transcript text.
3. User can edit and save transcript as a story through existing API.
4. All AI-specific wording removed from record/index pages.
5. `npm run build` succeeds with zero TypeScript errors.

