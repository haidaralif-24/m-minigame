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
