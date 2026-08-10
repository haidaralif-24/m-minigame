#!/usr/bin/env bash
# apply-template-files.sh
# Run this from the ROOT of your m-minigame git clone.
# Creates/overwrites the AGENTS.md / THEME.md / tasks.md / content-pack files
# discussed in chat. Safe to re-run.
set -euo pipefail

if [ ! -f package.json ]; then
  echo "Error: run this from the repo root (package.json not found here)." >&2
  exit 1
fi

mkdir -p src/content/maulid-nabi

echo "Writing AGENTS.md"
cat > AGENTS.md << 'EOF_APPLY'
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
EOF_APPLY

echo "Writing THEME.md"
cat > THEME.md << 'EOF_APPLY'
# Visual Theme: Stickman Party

## Where the theme currently stands
Right now (`src/index.css`) the palette is dark slate + neon
cyan/orange glow — that's a sci-fi/cyberpunk look, not a party-game look.
The stickman token (`src/components/StickmanToken.jsx`) is a thin
line-icon, not a chunky cartoon figure. This file describes the direction
to actually move it in: a bright, chunky, "mobile party game" look
inspired by *Stickman Party* / *Mario Party*, not a dashboard/tech look.

## Reference feeling
Think: bold flat shapes, thick black outlines, primary-ish saturated
colors, rounded chunky UI, everything a little bouncy. Not glassmorphism,
not neon glow, not thin-line minimalism, not corporate SaaS. The board
should feel like a toy you could pick up, not a data visualization.

## Concrete direction

**Color** — replace the dark neon palette with a bright, high-saturation
palette. Keep a light or warm-neutral background (not `#0f172a` navy) so
flat-color shapes pop the way they do in mobile party games. Team colors
(`TOKEN_COLORS` in `src/data/constants.js`) can stay roughly as-is — they're
already primary-ish — but everything they sit on top of (board tiles, UI
chrome) should shift lighter/warmer to let them read as toy pieces, not
glowing sci-fi markers.

**Shape & line** — thick, consistent black (or near-black) outlines on
interactive elements: tiles, tokens, buttons, dice. Rounded corners
everywhere, generous radius. No thin 1px borders — go chunky (3-4px+).

**Typography** — a rounded, heavy display font for headings/scores
(something like a bold rounded sans, not the current geometric
`Space Grotesk`) paired with a plain readable body font. Numbers (scores,
dice faces) should be big and bouncy, not just bold.

**Motion** — framer-motion is already installed; use it. Overshoot/spring
easing (slight squash-and-stretch on token landing, a little bounce on
dice results, a pop-in on question reveals) reads as "party game" far more
than the current linear/ease-out CSS transitions in `index.css`. Motion
should feel toy-like and slightly exaggerated, not smooth/corporate.

**Stickman token** — the current SVG is a generic line-figure icon. It
should read as an actual character: rounder head, a bit of personality
(pose/expression), thick outline matching the rest of the UI, filled with
the team color rather than just stroked. It's the thing players look at
most on the board, so it's worth more visual weight than a 24x24 icon.

**Tiles/board** — bonus/penalty/start/finish tiles should be
color-and-icon coded clearly enough to read from across a room on a
projector (this is a `/board` route rendered for spectators), not just
color-coded subtly like the current bonus/penalty greens and reds.

## What not to change
- Keep the CSS-variable token architecture in `src/index.css` (`@theme`
  block) — swap the *values*, not the pattern. Content packs may want to
  override a subset of these via `theme.json` later (see
  `src/content/README.md`).
- Don't hardcode a new palette per-component — update the shared tokens
  once and let components inherit them.

---

## Prompt template for your coding agent

Paste this to your agent (Claude Code / opencode / etc.) once the engine
and a content pack are in reasonable shape, to do an actual theme pass:

> Read `THEME.md` and `AGENTS.md` in full before making any changes.
> Do a visual theme pass across `src/index.css`, `src/components/`, and
> `src/pages/` to move this from the current dark neon look to the bright
> chunky "Stickman Party" look `THEME.md` describes: update the `@theme`
> CSS variables in `src/index.css` first (palette, radius, font), then
> propagate through components. Redesign `StickmanToken.jsx` to look like
> an actual character rather than a thin line icon. Add framer-motion
> spring/bounce motion to dice rolls, token movement, and question
> reveals — check what's already wired up in `Dice.jsx` and `Board.jsx`
> before adding new animation logic. Do not hardcode any event-specific
> text (titles, taglines) — pull those from the active content pack's
> `meta.json` per `src/content/README.md`. Run `npm run build` when done
> and fix anything that doesn't compile.
EOF_APPLY

echo "Writing tasks.md"
cat > tasks.md << 'EOF_APPLY'
# Roadmap

The original bootstrap task (create `AGENTS.md` / `opencode.jsonc` /
`.opencode/skills/mini-game-contract/`) is already done — all three exist.
One note: `opencode.jsonc` already has more MCP servers configured
(`shadcn`, `react-bits`, `context7`) than the original bootstrap task
specified — that's fine, leave them, just don't remove them by accident.

This file now tracks what's actually left to build. Work top to bottom;
later phases depend on earlier ones.

## Phase 1 — Content pack wiring
The `src/content/` folder and format now exist (see
`src/content/README.md`), but nothing in the engine reads from it yet —
`Host.jsx` still hardcodes `"Maulid Board"` as a literal string.
- [ ] Add a single active-event config point (e.g. `ACTIVE_EVENT` in
      `src/data/constants.js`) that imports the active pack's `meta.json`.
- [ ] Replace hardcoded title/tagline strings in `Host.jsx`, `Play.jsx`,
      `Board.jsx`, `Lobby.jsx` with values from the active pack.
- [ ] Rename `src/content/maulid-nabi/questions.example.json` to
      `questions.json` once it's a real filled-out bank (see Phase 3).

## Phase 2 — Mini-games (not implemented yet)
`AGENTS.md` describes a mini-game phase that decides turn order/dice size,
but there is no `src/minigames/` folder and no mini-game UI yet — the
board currently starts with a random shuffle instead. Build 2-3 mini-games
using the contract in `.opencode/skills/mini-game-contract/SKILL.md`:
- [ ] A reaction-time tap game (simplest — good first implementation to
      validate the `MiniGameResult` contract end-to-end).
- [ ] A speed-quiz race (first correct answer per team, ranked by time).
- [ ] One more of your choice (matching game, sorting game, etc.).
- [ ] Wire host-side "start mini-game" control and result collection into
      `gameState` per the roles/data-model split in `AGENTS.md`.

## Phase 3 — Fill in real content
- [ ] Write a full question bank in
      `src/content/maulid-nabi/questions.json`, following the neutrality
      rules in that pack's `README.md`. Aim for comfortably more questions
      than the number of question tiles × rounds, since landings aren't even.

## Phase 4 — Theme pass
- [ ] Follow `THEME.md` — palette, typography, motion, and the
      `StickmanToken` redesign. Use the ready-made prompt at the bottom of
      `THEME.md` to kick this off with your coding agent.

## Phase 5 — Pre-event checks
- [ ] Confirm Firebase env vars are set (`src/services/firebase.js` reads
      `VITE_FIREBASE_*` — nothing is hardcoded, good, just don't forget to
      set them in Vercel).
- [ ] Run through the full loop once with 2 laptops + 1 projector before
      the event to catch any Firestore sync surprises on real wifi.
- [ ] `npm run build` clean, per `AGENTS.md`.

## When picking up any phase
Re-read `AGENTS.md` first — it has the engine/content-pack split, roles,
and data model that every phase above depends on.
EOF_APPLY

echo "Writing src/content/README.md"
cat > src/content/README.md << 'EOF_APPLY'
# Content Packs

This folder is what makes the engine reusable for events other than the
original Maulid Nabi one. Everything event-specific — title, colors override,
trivia questions, content rules — lives in one folder per event here.
**Nothing in here should be imported by name from engine code.** The engine
reads whichever pack is active through a single config point (see
"Wiring it up" below), so swapping events means adding a folder, not editing
components.

## Folder shape

```
src/content/<event-id>/
  meta.json         # event identity — required
  questions.json     # trivia bank for question tiles — required
  README.md          # this pack's own content rules — required
  theme.json          # optional palette/logo overrides on top of THEME.md defaults
```

`<event-id>` should be a short kebab-case slug, e.g. `maulid-nabi`,
`independence-day`, `sports-fest-2027`.

### `meta.json`

```json
{
  "id": "maulid-nabi",
  "title": "Maulid Board",
  "tagline": "Race the board, answer the questions, win the party.",
  "teamCount": 6
}
```

`title` and `tagline` are what pages should render instead of a hardcoded
string — see `src/data/constants.js` for where team count/names/colors
already live generically.

### `questions.json`

```json
[
  {
    "id": "q001",
    "prompt": "In which city was the Prophet born?",
    "choices": ["Mecca", "Medina", "Jerusalem", "Damascus"],
    "answerIndex": 0,
    "sourceRef": "Ibn Ishaq, Sirah — standard biography"
  }
]
```

Rules for the engine (apply to every pack, regardless of topic):
- `sourceRef` is required per question, even if it's just a short reference
  name — it's what lets a host defend an answer on the spot if challenged.
- `answerIndex` must be resolved server-side against `expiresAt`, never
  trust client-reported timing or self-reported correctness (see
  `AGENTS.md` → Roles).
- Keep prompts short enough to read on a projector in ~5 seconds.

See `src/content/maulid-nabi/questions.example.json` for a filled-out
example, and that pack's own `README.md` for *topic-specific* rules (e.g.
neutrality/accuracy standards) — those rules belong to the pack, not here.

### `theme.json` (optional)

Only needed if a pack wants to override the default palette from
`THEME.md` / `src/index.css` — e.g. a sports event might want team colors
instead of the default six, or a different accent hue. Omit this file
entirely to just inherit engine defaults.

## Wiring it up

There should be exactly one place in the engine that decides which pack is
active — e.g. an `ACTIVE_EVENT` constant or env var read once and used to
import `meta.json`/`questions.json` for that id. If you're implementing
this for the first time, add it near `src/data/constants.js` and reference
it from there — don't scatter `import ... from '../content/maulid-nabi/...'`
across multiple components.

## Making a new pack

1. Copy `src/content/maulid-nabi/` to `src/content/<new-event-id>/`.
2. Rewrite `meta.json`, `questions.json`, and `README.md` for the new topic.
3. Point the engine's active-event config at the new id.
4. Run `npm run build` to confirm nothing broke.
EOF_APPLY

echo "Writing src/content/maulid-nabi/README.md"
cat > src/content/maulid-nabi/README.md << 'EOF_APPLY'
# Content pack: `maulid-nabi`

School Islamic club's Maulid Nabi event. 6 teams, laptop-based.

## Content rules for questions
- All questions must be factual and neutral — avoid sectarian-specific
  claims or disputed theological points. When unsure, phrase questions
  around widely agreed historical facts (dates, places, names, well-known
  events) rather than doctrinal interpretation.
- Every question needs a `sourceRef` (see `src/content/README.md` for the
  schema) — for this pack, prefer well-known biographical sources (e.g.
  Ibn Ishaq's Sirah, Al-Bukhari/Muslim for hadith-based facts) over
  unsourced trivia-site claims.
- If a fact is disputed between traditions, drop the question rather than
  picking a side.

## Status
`questions.json` is not filled in yet — only `questions.example.json`
exists as a schema reference. Before the event, replace it with a real
bank (aim for at least `rounds × 1` questions plus a buffer, since not
every question tile will get landed on evenly).
EOF_APPLY

echo "Writing src/content/maulid-nabi/meta.json"
cat > src/content/maulid-nabi/meta.json << 'EOF_APPLY'
{
  "id": "maulid-nabi",
  "title": "Maulid Board",
  "tagline": "Race the board, answer the questions, win the party.",
  "teamCount": 6
}
EOF_APPLY

echo "Writing src/content/maulid-nabi/questions.example.json"
cat > src/content/maulid-nabi/questions.example.json << 'EOF_APPLY'
[
  {
    "id": "q001",
    "prompt": "In which city was the Prophet Muhammad born?",
    "choices": ["Mecca", "Medina", "Jerusalem", "Damascus"],
    "answerIndex": 0,
    "sourceRef": "Ibn Ishaq, Sirah — standard biography"
  },
  {
    "id": "q002",
    "prompt": "What was the occupation of the Prophet Muhammad before prophethood?",
    "choices": ["Farmer", "Merchant/trader", "Blacksmith", "Fisherman"],
    "answerIndex": 1,
    "sourceRef": "Ibn Ishaq, Sirah — standard biography"
  }
]
EOF_APPLY

echo "Done. Review with: git status && git diff"
