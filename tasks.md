# Task: Bootstrap project configuration

Before doing any feature work, set up this project's agent configuration.

**IMPORTANT: check before writing anything.** For each file/folder below,
if it already exists in this repo, do NOT overwrite it. Instead, merge —
keep every existing section/key the file already has, and only add
sections/keys that are missing. If a section already exists but conflicts
with what's below, keep the existing project content and just note the
conflict in your final summary rather than silently changing it.

---

## 1. `AGENTS.md` (project root)

If missing, create it with the content below. If it exists, merge in any
of the following sections that aren't already covered — don't duplicate
sections that already exist under different headings.

```md
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
- `vercel --prod` — deploy (assumes Vercel CLI is linked to the project)

## Before finishing any task
Run `npm run build` to confirm it compiles cleanly before considering a
feature done — this app has no backend to catch runtime errors for you.
```

---

## 2. `opencode.json` (project root)

If missing, create it with the content below. If it exists, merge field by
field:
- If `instructions` already exists, add `"AGENTS.md"` to the array only if
  it's not already listed — don't replace the array.
- If `permission` already exists, add any missing keys shown below without
  removing or loosening rules already there.
- If `mcp` already exists, add the `playwright` entry only if no
  MCP server with that purpose is already configured.
- Never add a `model` key — leave model selection to whatever's already
  configured (CLI flag, env var, or existing config).

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md"],
  "autoupdate": true,
  "share": "auto",
  "permission": {
    "edit": "allow",
    "bash": {
      "*": "allow",
      "rm -rf *": "deny",
      "sudo *": "deny",
      "vercel --prod": "ask"
    }
  },
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp@latest"],
      "enabled": true
    }
  }
}
```

---

## 3. Skill: `.opencode/skills/mini-game-contract/SKILL.md`

If this file doesn't already exist, create the folder and file with the
content below. If a skill covering the same mini-game result contract
already exists under a different name, leave it as-is and just note that
in your summary rather than creating a duplicate.

```md
---
name: mini-game-contract
description: Use this whenever building, editing, or reviewing any mini-game component in src/minigames/. Ensures every mini-game reports results in the shared shape the board logic expects, regardless of its internal mechanic (quiz, sorting, matching, reaction-time, etc.).
---

# Mini-Game Contract

Every mini-game, no matter how it works internally, must resolve to exactly
this shape and call the shared `onComplete` callback with it:

\`\`\`ts
type MiniGameResult = { teamId: string; score: number }[]
\`\`\`

Rules:
- `score` is used only for *ranking* within that mini-game (1st through 6th).
  It does not need to match final leaderboard points — the board phase
  applies its own scoring on top of the ranking.
- Ties are broken by whichever the mini-game defines as fair (e.g. earlier
  correct answer wins a tie) — resolve ties inside the mini-game, never
  pass duplicate ranks out.
- All 6 teams must appear in the result array exactly once, even if a team
  didn't finish, was disconnected, or scored zero. Missing teams break the
  dice-order logic downstream.
- Mini-games must not directly mutate `gameState.turnOrder` or board
  position — they only ever return `MiniGameResult`. The board logic (not
  the mini-game) is responsible for turning a ranking into dice order/size.
- Scoring must be resolved authoritatively against server timestamps
  (`expiresAt` from Firestore), never trust a client's self-reported
  answer time.

When adding a new mini-game folder under `src/minigames/`, use this as the
component interface:

\`\`\`ts
interface MiniGameProps {
  teams: Team[];
  onComplete: (results: MiniGameResult) => void;
}
\`\`\`
```

---

## 4. When done

Print a short summary of:
- Which files were created fresh
- Which files already existed and were merged (list what was added vs.
  what was left untouched)
- Any conflicts you skipped rather than resolved automatically
