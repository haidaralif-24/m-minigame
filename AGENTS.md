# Party Board Game Engine — Agent Instructions

## What this project is
A browser-based, Mario Party / Stickman Party–style event game: teams play
simultaneous mini-games on their own devices, the results decide dice
order/size, then everyone races on a shared projected board.

The codebase is split into two layers on purpose:

1. **Engine** (`src/`, minus `src/content/`) — reusable across any event.
   Routing, Firestore sync, board/dice logic, mini-game contract, theming
   tokens. Nothing event-specific belongs here.
2. **Content pack** (`src/content/<event-id>/`) — everything specific to
   *one* event: title, questions, source references, any content-specific
   rules. This is what changes when the game is reused for a different
   event. See `src/content/README.md` for the pack format.

The currently shipped content pack is `maulid-nabi` (a school Islamic
club's Maulid Nabi event). Treat it as the reference example, not as
something to special-case in engine code — if you find yourself writing
`if (eventId === 'maulid-nabi')` anywhere outside `src/content/`, stop and
move that logic into the content pack instead.

Game loop (repeats per round):
1. All teams play a mini-game simultaneously on their own device.
2. Mini-game produces a ranking of teams (1st–Nth place).
3. Ranking determines dice order and/or dice size for the board phase
   (e.g. 1st place rolls a d8, last place rolls a d4; OR 1st place rolls first).
4. Teams roll and move on a shared board. Landing on a "question tile"
   triggers a quiz question pulled from the active content pack (correct =
   bonus move, wrong = move back / lose turn).
5. Repeat with a new mini-game next round.

## Tech stack (do not deviate without asking)
- **Frontend**: Vite + React (NOT Next.js — no SSR/routing needs, keep it simple)
- **Realtime sync**: Firebase Firestore (`onSnapshot` listeners)
- **Hosting**: Vercel (static build) — NOT localhost/local hosting, since
  events run on venue wifi across multiple devices and need a stable
  public HTTPS URL
- **Content**: hardcoded JSON per content pack in `src/content/<event-id>/`
  — no database for content. A pack is a folder of static files, not a CMS.
- **Styling**: Tailwind CSS + CSS variable theme tokens (see `THEME.md`)
- **Animation**: framer-motion, already installed — use it for the
  chunky/bouncy motion `THEME.md` describes rather than raw CSS transitions

## Roles
- **Host client** (`/host` route): controls game flow — starts mini-games,
  advances rounds, resolves dice rolls, reveals question answers. This is
  the only privileged writer to `gameState.phase` and `gameState.round`.
- **Team client** (`/play` route): team enters a name, joins, plays
  mini-games, submits answers. Never trust team-submitted correctness or
  timing directly — resolve scoring against `expiresAt` timestamps and the
  answer key, not client-reported elapsed time.
- **Spectator/projector view** (`/board` route): read-only, renders the
  shared board and leaderboard for the room.

## Data model (Firestore)
- `gameState` (single doc): `{ phase, round, currentMiniGame, currentQuestion,
  turnOrder: [teamId], activeTeamId, boardPositions: {teamId: tileIndex} }`
- `teams` (collection, one doc per team): `{ name, score, joinedAt }`
- Every mini-game must resolve to the SAME output shape regardless of its
  internal mechanic:
  ```ts
  type MiniGameResult = { teamId: string; score: number }[]
  ```
  This is the contract the board logic consumes — do not let board logic
  know or care how a mini-game computed its ranking. Full rules live in
  `.opencode/skills/mini-game-contract/SKILL.md`.

## Theming
Visual identity (colors, type, motion, token/tile design) is documented in
`THEME.md` at the repo root. Read it before touching any component in
`src/components/` or `src/pages/`. Team accent colors live in
`src/data/constants.js` (`TOKEN_COLORS`) — event-specific branding (event
title, logo text, tagline) lives in the active content pack's `meta.json`,
not hardcoded into page components. If you see a literal event name
(e.g. "Maulid Board") inside a `.jsx` file, that's a bug — it should be
read from the content pack.

## Content packs
See `src/content/README.md` for the full format. Short version: a pack is
`{ meta.json, questions.json, README.md }` under `src/content/<event-id>/`.
Question neutrality/accuracy rules are defined per-pack in that pack's own
`README.md` (see `src/content/maulid-nabi/README.md` for the reference
example), not in this file — the engine has no opinion on content, only on
the JSON shape it expects.

## Non-goals
- No auth system beyond a simple team name + optional host PIN.
- No question database / CMS — content packs are static JSON.
- No mobile app — this is a responsive web app, laptops/projector only.
- No SSR, no server-side API routes — Firestore is the only backend.
- No baking a single event's branding/content into engine code, ever.

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build
- User deploys manually via Vercel dashboard (`npm run build` creates `dist/` for verification)

## Before finishing any task
Run `npm run build` to confirm it compiles cleanly before considering a
feature done — this app has no backend to catch runtime errors for you.
