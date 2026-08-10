---
name: mini-game-contract
description: Use this whenever building, editing, or reviewing any mini-game component in src/minigames/. Ensures every mini-game reports results in the shared shape the board logic expects, regardless of its internal mechanic (quiz, sorting, matching, reaction-time, etc.).
---

# Mini-Game Contract

Every mini-game, no matter how it works internally, must resolve to exactly
this shape and call the shared `onComplete` callback with it:

```ts
type MiniGameResult = { teamId: string; score: number }[]
```

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

```ts
interface MiniGameProps {
  teams: Team[];
  onComplete: (results: MiniGameResult) => void;
}
```