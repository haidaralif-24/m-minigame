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
