# Project Plan — “Who Pays?” Single-Screen PWA (TypeScript + Preact + Canvas)

## 0) Goal & Non-Goals

### Goal

Build a **single-round**, **single-device**, **multi-touch** Progressive Web App where:

- Host sets player count (colors only; no names)
- Players place/hold fingers on their color circle
- App runs a suspense animation (ring jumps around)
- One winner is selected fairly and shown clearly

### Non-Goals (for v1)

- Multi-device lobbies / QR join networking
- Persistent accounts or leaderboards
- Real money / payment integrations

---

## 1) Product Requirements

### Must Have

- **TypeScript**
- **Preact** UI shell (screens + settings)
- **Canvas** rendering for circles + ring animation
- Host chooses number of players:
  - Manual number input
  - Optional: pick contacts to “count” players (no names displayed)
- Game renders **N finger-sized circles** (distinct colors)
- Multi-touch “hold” interaction: one finger per circle
- Suspense animation: ring rapidly jumps across circles then lands on winner
- Winner screen with “Play again”

### Nice to Have

- Haptics (`navigator.vibrate`) on ring jumps
- Sound effect toggle
- “Reduced motion” option (also respects `prefers-reduced-motion`)

---

## 2) Tech Stack (Chosen)

### Build / App

- **Vite + Preact + TypeScript**
- **Tailwind CSS** for UI around the canvas
  - Add: `clsx` + `tailwind-merge` for clean conditional class composition
- **vite-pwa** for installability + offline app shell

### Testing

- **Jest**
- `@testing-library/preact`
- `@testing-library/jest-dom`

### Quality / DX (Recommended)

- **ESLint + Prettier**
- **Husky + lint-staged** (run lint + tests pre-commit)
- **Zod** (runtime validation of setup/settings; later reusable for any networking payloads)

### Note on D3

- Not planned for v1 (likely overkill with Canvas). Consider only if switching to SVG or using force-layout-style physics.

---

## 3) Hosting Target

### GitHub Pages (Supported)

This project can be hosted as a static site on **GitHub Pages**. Because GitHub Pages typically serves from a subpath:

- `https://<user>.github.io/<repo>/`

We must configure Vite + PWA paths to match.

**Required configuration for GitHub Pages:**

- `vite.config.ts`: `base: '/<repo>/'`
- PWA manifest:
  - `start_url: '/<repo>/'`
  - `scope: '/<repo>/'`
- Prefer a “prompt to refresh” SW update flow (don’t auto-reload mid-round)

---

## 4) Key Tech Decisions

### Rendering: Canvas

- Use a single `<canvas>` for:
  - Circles (filled)
  - Per-circle “held / locked” indicators
  - Highlight ring animation
- Use `requestAnimationFrame` loop
- Handle high DPI via `devicePixelRatio` scaling

### UI Shell: Preact

- Preact handles:
  - Screens (Home / Setup / Ready / Result)
  - Settings (reduced motion, etc.)
  - Buttons / text / layout
- Canvas loop uses refs to avoid re-rendering every frame

### Input: Pointer Events (Multi-touch)

- Track active pointers by `pointerId`
- Lock pointer→circle mapping on first touch inside a circle
- Apply `touch-action: none` on the canvas container to prevent scroll/zoom conflicts

### Randomness / Fairness

- Choose the winner **once** after all players are locked in:
  - `crypto.getRandomValues()`
- Run a **scripted suspense animation** that _appears_ random but is guaranteed to end on the pre-chosen winner

### Contact Picker API (Progressive Enhancement)

- If available, allow host to select contacts and compute count
- Do not store or display names; use only the count
- Fallback: manual input if unsupported / denied

---

## 5) Multi-Touch Limit Handling (Detection + UX)

### Reality Check

Browsers don’t provide a reliable “touch limit” number up-front. We infer it from observed behavior.

### Strategy

1. **Soft capability probe**
   - Track `maxSimultaneousTouchesObserved` (max active pointers seen in a session)
2. **Optional calibration step (recommended)**
   - “Device Check” screen:
     - “Place as many fingers as you can at once”
     - Record max active pointers reached
     - Save to `localStorage` as `deviceTouchCap`
3. **At setup time**
   - If requested players > `deviceTouchCap` (or a conservative default like 5 until measured):
     - Show warning: “This device may not support that many simultaneous touches.”
     - Offer: reduce player count or run “Device Check”
4. **At runtime**
   - If the game never reaches “all locked” because extra touches don’t register:
     - After timeout: show prompt suggesting touch cap, reduce players, or run Device Check

---

## 6) UX Flow & Screens

### A) Home

- Start Game
- Device Check (optional)
- Settings:
  - Reduced motion
  - Sound / haptics toggles

### B) Setup

- Choose player count:
  - Manual stepper: 2–12 (cap may be adjusted by device check)
  - “Pick contacts to count” button (only shown if API supported)
- Confirm → continue

### C) Ready / Lock-in

- Render N colored circles
- Instruction: “Everyone place and hold one finger on your color”
- Circle states:
  - `idle` (not held)
  - `held` (finger down but not armed)
  - `locked` (after hold threshold, e.g. 400–600ms)
- Show readiness: “3 / 5 locked”

### D) Suspense

- Ring jumps among circles quickly, then slows, then lands on winner
- Optional: vibrate on each jump

### E) Result

- Winner highlight + message
- “Play again” (back to Setup)
- “Same players again” (skip to Ready)

---

## 7) Interaction Rules

### Circle Assignment

- Pointer is assigned to the first circle it touches.
- Once assigned, it cannot switch circles unless lifted.

### Lock Threshold

- Finger must remain within circle radius for `LOCK_MS` to become locked.
- If finger leaves before lock: reset to idle.

### Conflict Handling

- If a second pointer touches an already-assigned circle:
  - Ignore or reject with subtle feedback (v1: ignore for simplicity)

---

## 8) Canvas Layout & Rendering Plan

### Layout

- For small N: circles arranged in a ring around center
- For larger N: grid layout with padding
- Target size:
  - Diameter ~ 56–72 CSS pixels
  - Spacing ~ 12–20 CSS pixels

### Render Loop

- `update(dt)`:
  - pointer states → circle states
  - suspense animation state (current index, speed curve)
- `draw()`:
  - background
  - circles
  - held/locked overlays
  - highlight ring (Suspense/Result)

---

## 9) State Machine (Implementation Backbone)

States:

- `HOME`
- `SETUP`
- `READY`
- `SUSPENSE`
- `RESULT`

Transitions:

- HOME → SETUP (start)
- SETUP → READY (confirm player count)
- READY → SUSPENSE (all circles locked)
- SUSPENSE → RESULT (animation ends)
- RESULT → SETUP / READY (play again options)

---

## 10) Project Structure (Suggested)

src/
app/
App.tsx
stateMachine.ts
settings.ts
screens/
Home.tsx
Setup.tsx
Ready.tsx
Result.tsx
canvas/
GameCanvas.tsx // Preact wrapper around
renderer.ts // update/draw loop, DPR scaling
game/
types.ts
layout.ts // ring/grid positions
rng.ts // crypto random
suspense.ts // jump schedule -> lands on winner
pointerTracker.ts // pointerId maps, lock logic
contactPicker.ts // progressive enhancement
touchCap.ts // Device Check + heuristics
pwa/
registerSW.ts // vite-pwa registration + update prompt
styles/
index.css

---

## 11) Milestones & Tasks (2–3 short sprints)

### Milestone 1 — Core Game Skeleton

- [x] Scaffold Vite + Preact + TS
- [x] Tailwind setup + basic screen layout
- [x] Canvas renderer with DPR scaling
- [x] Layout algorithm for N circles
- [x] Pointer tracking with assignments + lock logic
- [x] READY screen that reaches “all locked”

**Exit:** 2–6 players can lock reliably with clear feedback.

### Milestone 2 — Suspense + Winner

- [x] Winner selection via `crypto.getRandomValues`
- [x] Suspense animation decelerates and lands on winner
- [x] Result screen + play again

**Exit:** winner selection feels fair + suspenseful, repeatable.

### Milestone 3 — PWA + Contacts + Touch Cap UX + GitHub Pages

- [x] Add vite-pwa + manifest icons
- [x] Add service worker update prompt (no auto-reload mid-round)

### Milestone 4 — PWA + Contacts + Touch Cap UX

- [x] Add Contact Picker count (progressive enhancement)
- [x] Add Device Check calibration + localStorage persistence for win history

---

## 12) Testing Plan (Jest-first)

### Unit tests (pure TS, highest value)

- [ ] Layout outputs are stable for N and viewport sizes
- [ ] Pointer assignment + lock rules (including leave/re-enter)
- [ ] Suspense schedule always lands on chosen winner
- [ ] Touch-cap heuristic logic (Device Check persistence, warnings)

### Component tests

- [ ] Setup screen validation + fallbacks
- [ ] “Update available” prompt shows correctly (if implemented)

--

## 13) Risks & Mitigations

- **Multi-touch limit varies by device**
  - Mitigation: Device Check + setup warnings + runtime timeout messaging
- **Contact Picker API not widely supported**
  - Mitigation: enhancement only; manual input always works
- **Service worker update confusion**
  - Mitigation: “prompt to refresh,” avoid auto-reloads mid-round
- **Canvas accessibility**
  - Mitigation: keep instructions/buttons outside canvas; offer reduced motion

---

## 14) Definition of Done (v1)

- [ ] Single-screen, single-round game works reliably for typical groups (2–5+ depending on device)
- [ ] Clear Setup → Ready → Suspense → Result loop
- [ ] GitHub Pages deploy works (subpath-safe assets + PWA scope)
- [ ] Offline/spotty network resilience via cached app shell
- [ ] Touch limit UX prevents “stuck waiting forever”
- [ ] Contact count option shown only when supported; fallback always available
