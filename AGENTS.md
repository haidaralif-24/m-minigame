# Maulid Nabi Mini-Games — Agent Instructions

## What this project is
A browser-based party game for a school Islamic club's Maulid Nabi event.
6 teams, each on their own laptop, connected over local/venue wifi.
Structure is inspired by Mario Party / Stickman Party: mini-games decide
turn order/dice, then a shared board game is where teams actually race.

Game loop (repeats per round):
1. All 6 teams play a mini-game simultaneously on their own device.
2. Mini-game produces a ranking of teams (1st–6th place).
3. Ranking determines dice order and/or dice size for the board phase
   (e.g. 1st place rolls a d8, last place rolls a d4; OR 1st place rolls first).
4. Teams roll and move on a shared board. Landing on a "question tile"
   triggers a quiz question (correct = bonus move, wrong = move back / lose turn).
5. Repeat with a new mini-game next round.

## Tech stack (do not deviate without asking)
- **Frontend**: Vite + React (NOT Next.js — no SSR/routing needs, keep it simple)
- **Realtime sync**: Firebase Firestore (`onSnapshot` listeners)
- **Hosting**: Vercel (static build) — NOT localhost/local Mac hosting, since
  the event runs on venue wifi across multiple devices and needs a stable
  public HTTPS URL
- **Questions/tiles data**: hardcoded JSON in `src/data/` — this is a one-off
  event, not a reusable product, so a database for content is unnecessary
  overhead. Do not add a questions database.
- **Styling**: Tailwind CSS (fast to theme, easy for an agent to iterate on)

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
  know or care how a mini-game computed its ranking.

## Content rules for questions
- All Maulid Nabi / Prophet's life questions must be factual and neutral —
  avoid sectarian-specific claims or disputed theological points. When
  unsure, phrase questions around widely agreed historical facts (dates,
  places, names, well-known events) rather than doctrinal interpretation.
- Keep a `sourceRef` field per question for accountability, even if just a
  short reference name.

## Non-goals
- No auth system beyond a simple team name + optional host PIN.
- No question database / CMS.
- No mobile app — this is a responsive web app, laptops only.
- No SSR, no server-side API routes — Firestore is the only backend.

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build
- User deploys manually via Vercel dashboard (`npm run build` creates `dist/` for verification)

## Before finishing any task
Run `npm run build` to confirm it compiles cleanly before considering a
feature done — this app has no backend to catch runtime errors for you.