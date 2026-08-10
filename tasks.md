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
