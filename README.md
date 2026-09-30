# AI Learning Games

Short, free browser games that teach one AI concept each — by playing it, not by
explaining it.

No accounts, no backend, no API calls, no LLM calls. Every game is a static
bundle that runs from any free static host.

---

## Games

| Game | Concept it teaches | Status |
|---|---|---|
| [Theme Park Backpack](#theme-park-backpack) | Context windows and context engineering | Playable, all 5 levels |

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

All five levels are implemented. Level 5 is the only two-phase level: the plan
changes halfway through, so the player repacks and the morning and evening
results are reported separately rather than merged.

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
| Playwright 1.63 | E2E smoke tests, desktop + mobile |
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
pnpm test          # unit + component tests
pnpm test:watch    # watch mode
pnpm test:e2e      # Playwright smoke tests (builds and previews automatically)
pnpm test:e2e:ui   # Playwright in watch/UI mode
pnpm typecheck     # tsc -b
pnpm lint          # oxlint
```

`dist/` is a plain static bundle — no secrets or environment variables
required.

## Deploying

**Cloudflare Pages**

```bash
pnpm build
npx wrangler pages deploy dist
```

`wrangler.toml` is already set up. For a Git-connected project, set the build
command to `pnpm build` and the output directory to `dist`.

**Netlify / any static host**

`public/_redirects` contains the SPA fallback rule. A deep link such as
`/games/theme-park-backpack` must serve `index.html`, or a hard refresh 404s.
There is a test that fails if this file is missing or wrong.

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

e2e/                            Playwright smoke tests
```

### Why scoring lives outside the components

`scoring.ts` imports no React and touches no DOM, so every rule in the
specification is testable without rendering anything:

```ts
calculatePhaseResult({ items, selectedItemIds, events, capacity, phaseId })
```

`phaseId` is what makes Level 5 work. `getItemUsefulness(item, "evening")` reads
that item's evening override, so the sunglasses you correctly packed for a
sunny morning count as noise once the rain arrives. The morning and evening
packs are scored with two separate calls and both selections are kept, so the
before/after comparison on the result screen is truthful rather than
recomputed.

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
pnpm test       # 57 unit + component tests
pnpm test:e2e   # 24 Playwright tests, desktop + mobile
```

**Unit** (`*.test.ts`, node) — capacity rejection, event success, both score
formulas, feedback classification, phase-aware usefulness, and level-data
integrity checks such as "every event references a real item".

**Component** (`*.test.tsx`, jsdom) — Level 1 basics, the Level 3 and Level 4
reveals, the full Level 5 change-and-repack flow, persistence, and
`localStorage` failure.

**End-to-end** (`e2e/`, Playwright) — the whole game from intro to final reveal,
capacity rejection, "full is not optimal", progress across a reload, keyboard
operation, 320px overflow, and static-host deep links. Runs on a desktop and a
mobile viewport.

First run needs browsers:

```bash
pnpm exec playwright install chromium
```

---

## Documentation

| Document | Purpose |
|---|---|
| [Theme Park Backpack spec v1.0](docs/specs/theme-park-backpack-v1.0.md) | Full game specification |
| [Pre-implementation decisions](docs/decisions/pre-implementation-decisions.md) | Resolved spec conflicts. **Takes precedence over the spec.** |

---

## License

MIT — see [LICENSE](LICENSE).
