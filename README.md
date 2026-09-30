# AI Learning Games

Short, free browser games that teach one AI concept each — by playing it, not by
explaining it.

No accounts, no backend, no API calls, no LLM calls. Every game is a static
bundle that runs from any free static host.

---

## Games

| Game | Concept it teaches | Status |
|---|---|---|
| [Theme Park Backpack](#theme-park-backpack) | Context windows and context engineering | Level 1 of 5 playable |

---

## Theme Park Backpack

You have one backpack, a fixed amount of space, and a whole day at Adventure
Park. You cannot fit everything, and filling every available space does not
necessarily produce the best backpack.

Across five levels the game maps that intuition onto real AI vocabulary —
tokens, context windows, relevant context, noise, summarisation, and
task-dependent context — but only *after* the player has lived the constraint:

```text
Experience → Make choices → Observe consequences → Understand the pattern
          → Reveal AI terminology → Connect to real AI systems
```

Design principle, in the game's own words: **play first, discover the
constraint, experience the consequence, then reveal the AI concept.** If a
change would make the player read more explanation before interacting, the
simpler interactive version wins.

Target play time: 5–8 minutes. No prior AI knowledge assumed.

### Play it

```bash
pnpm install
pnpm dev
```

Then open <http://localhost:5173/games/theme-park-backpack>.

### Levels

| # | Name | Teaches |
|---|---|---|
| 1 | Capacity | Finite space. No AI vocabulary yet. |
| 2 | Priorities | Choosing when capacity becomes scarce |
| 3 | Noise | Relevant context vs. noise — first AI reveal |
| 4 | Compression | Summarisation and information density |
| 5 | Changing Context | Relevance is task-dependent |

Only Level 1 is implemented. Levels 2–5 are specified but intentionally not
built until the Level 1 slice validated the component and state boundaries.

### Scoring

Three independent dimensions, deliberately **not** combined into one number —
a single score would imply one universally correct strategy, and the game is
about trade-offs.

| Dimension | Meaning |
|---|---|
| **Day readiness** | Did your pack handle the day's events? |
| **Useful capacity** | Of the space you used, how much carried something useful? |
| **Space used** | Raw `used / capacity`. A full bag is not automatically a good bag. |

A pack can score 100% readiness at 45/100 space, and that is a *better* result
than a full backpack of noise.

---

## Tech stack

| | |
|---|---|
| React 19 | UI |
| TypeScript 6 | Types, strict |
| Vite 8 | Build + dev server |
| Vitest 5 | Unit tests (node) and component tests (jsdom) |
| oxlint | Linting |

Node 22+, pnpm 11. No game engine, no animation library, no state-management
library, no routing dependency — all of that is deferred until something
actually needs it.

## Scripts

```bash
pnpm install       # install dependencies
pnpm dev           # dev server
pnpm build         # typecheck + production build to dist/
pnpm preview       # serve the production build locally
pnpm test          # run all tests
pnpm test:watch    # watch mode
pnpm typecheck     # tsc -b
pnpm lint          # oxlint
```

`dist/` is a plain static bundle — deploy it to Cloudflare Pages, Netlify,
GitHub Pages, or any static host. No secrets or environment variables are
required.

---

## Project layout

```text
src/
├── app/                        routing + app root
│   ├── App.tsx
│   └── routes.ts
├── components/                 cross-game shell pieces
│   ├── GameShell.tsx
│   ├── Button.tsx
│   └── Modal.tsx
├── games/
│   └── theme-park-backpack/
│       ├── ThemeParkGame.tsx   owns all game state
│       ├── game.config.ts      title, copy, level registry
│       ├── game.types.ts       shared data model
│       ├── scoring.ts          pure scoring + capacity rules
│       ├── levels/             one file per level
│       ├── components/         game-specific presentational UI
│       └── tests/              unit + component tests
├── hooks/
│   └── useGameProgress.ts      localStorage progress
└── styles/
    ├── globals.css             tokens, reset, a11y base
    └── components.css          component styles
```

### Architecture constraint

Theme Park Backpack is the reference implementation. Do **not** refactor it to
accommodate hypothetical requirements from games that do not exist yet.

Once it is complete, extract the genuinely reusable parts: `GameShell`,
progress, `ScorePanel`, `ConceptReveal`, and local progress persistence.

Keep game-specific mechanics — `Backpack`, `CapacityMeter`, packing rules —
inside the game folder. This is deliberate: it avoids inventing a generic game
framework before there is a second game to justify it.

State is plain React in the game component. No Redux or Zustand at this size.

---

## Accessibility

Built in, not bolted on:

- all gameplay is keyboard operable;
- items are real `<button>`s with `aria-pressed`;
- 44px minimum touch targets;
- no meaning carried by colour alone — every state has a text label;
- capacity rejections are announced via a live region;
- `prefers-reduced-motion` disables transitions and reveals;
- layout works at 320px with no horizontal scrolling;
- progress survives reload via `localStorage`, and the game still runs if
  `localStorage` is blocked.

## Testing

```bash
pnpm test
```

- **Unit** — scoring and capacity rules in node: capacity rejection, event
  success, both score formulas, feedback classification, phase-aware usefulness.
- **Component** — Level 1 under jsdom: select/deselect, rejection messaging,
  empty-state disabling, day playback, result rendering, persistence, and
  `localStorage` failure.

---

## Documentation

| Document | Purpose |
|---|---|
| [Theme Park Backpack spec v1.0](docs/specs/theme-park-backpack-v1.0.md) | Full game specification |
| [Pre-implementation decisions](docs/decisions/pre-implementation-decisions.md) | Resolved spec conflicts. **Takes precedence over the spec.** |

---

## License

To be decided.
