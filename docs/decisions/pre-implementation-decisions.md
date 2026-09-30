# Theme Park Backpack — Pre-Implementation Decisions

These decisions resolve inconsistencies found in Implementation Specification v1.0. Where this note conflicts with that specification, **this note takes precedence**.

## 1. Canonical Naming

Use **Theme Park Backpack** as the canonical game name.

Use:

```text
Game title:        Theme Park Backpack
Route:             /games/theme-park-backpack
Source folder:     games/theme-park-backpack/
Persistence key:   ai-learning-games.theme-park-backpack.v1
```

Within the fictional scenario, use:

```text
Adventure Park
```

Do **not** use `Context Park` before the AI reveal.

Reason: introducing the word "Context" in the game branding gives away the concept before the player has experienced it, which conflicts with the game's core learning principle.

Remove/replace:

```text
/games/context-park
ai-arcade.context-park.v1
Context Park
```

from the V1 implementation.

---

## 2. AI Reveal State

Do not implement separately named states such as:

```text
AI_REVEAL_1
AI_REVEAL_2
```

A level may optionally contain an `aiReveal`.

Use the generic game phases:

```ts
type GamePhase =
  | "packing"
  | "events"
  | "result"
  | "reveal"
  | "repacking"
  | "complete";
```

Typical Level 3/4 flow:

```text
packing
   ↓
events
   ↓
result
   ↓
reveal
   ↓
next level
```

The reveal is therefore one phase driven by the level's data, not a second implementation of the same content.

Level 3:

```text
Result → context-window reveal
```

Level 4:

```text
Result → compression/summarisation reveal
```

Level 5:

```text
Result → final task-dependent-context reveal → complete
```

---

## 3. Usefulness Must Be Phase-Aware

Static `item.usefulness` is sufficient for Levels 1–4 but is insufficient for Level 5 because the task changes.

Extend `GameItem`:

```ts
type Usefulness = 0 | 1 | 2 | 3;

type GameItem = {
  id: string;
  name: string;
  icon: string;
  size: number;

  usefulness: Usefulness;

  usefulnessByPhase?: Partial<
    Record<string, Usefulness>
  >;

  categories?: string[];
};
```

Resolution function:

```ts
function getItemUsefulness(
  item: GameItem,
  phaseId?: string
): Usefulness {
  if (phaseId && item.usefulnessByPhase?.[phaseId] !== undefined) {
    return item.usefulnessByPhase[phaseId];
  }

  return item.usefulness;
}
```

Level 5 should explicitly define:

```text
morning
evening
```

relevance.

For example:

| Item | Morning | Evening |
|---|---:|---:|
| Water | 3 | 3 |
| Power bank | 2 | 3 |
| Sunglasses | 3 | 0 |
| Poncho | 0/1 | 3 |
| Snack | 2 | 3 |
| Pocket map | 2 | 1 |
| Selfie stick | 1 | 1 |

Avoid relying on the base usefulness value to calculate the Level 5 evening score.

Any item whose usefulness is ambiguous after the plan changes should either receive an explicit phase score or be replaced with a less ambiguous item.

This is important because the scoring itself must demonstrate:

> Relevance changes when the task changes.

The scoring system must not contradict that lesson.

---

## 4. Scoring Is Per Phase

Replace the assumption that a level always produces one calculation.

Core scoring API:

```ts
type PhaseResult = {
  successfulEvents: number;
  totalEvents: number;

  dayReadiness: number;
  usefulCapacity: number;

  usedSpace: number;
  capacity: number;

  feedbackType:
    | "excellent"
    | "efficient"
    | "full-but-noisy"
    | "missing-context"
    | "balanced";
};

calculatePhaseResult({
  items,
  selectedItemIds,
  events,
  capacity,
  phaseId,
}): PhaseResult
```

Levels 1–4 call this once.

Example:

```ts
const result = calculatePhaseResult({
  items,
  selectedItemIds,
  events,
  capacity,
  phaseId: "main",
});
```

Level 5 calls it separately.

```ts
const morningResult = calculatePhaseResult({
  items,
  selectedItemIds: morningSelection,
  events: morningEvents,
  capacity,
  phaseId: "morning",
});

const eveningResult = calculatePhaseResult({
  items,
  selectedItemIds: eveningSelection,
  events: eveningEvents,
  capacity,
  phaseId: "evening",
});
```

The Level 5 aggregate state becomes:

```ts
type DynamicLevelResult = {
  morning: PhaseResult;
  evening: PhaseResult;
};
```

Do not recalculate the morning using the repacked evening backpack.

Preserve both selections:

```text
morningSelection
eveningSelection
```

This allows the final teaching UI to show the actual change:

```text
ORIGINAL PLAN             NEW PLAN

Sunglasses ✓              Sunglasses removed
Poncho optional           Poncho added
Power bank useful         Power bank important
```

That comparison is more valuable educationally than presenting one combined Level 5 score.

---

## 5. Level 5 Result Presentation

Level 5 should differ slightly from ordinary results.

Instead of presenting only:

```text
Day readiness
Useful capacity
Space used
```

show:

```text
BEFORE THE PLAN CHANGED

Morning readiness
Useful capacity
Pack contents

          ↓

AFTER THE PLAN CHANGED

Evening readiness
Useful capacity
Pack contents
```

Then reveal:

> The items did not change. The task did.

Follow with:

> **Relevance is task-dependent.**

This becomes the strongest transition into the final AI explanation.

---

## 6. Toolchain

No toolchain change is required.

Implementation may proceed using:

```text
Node: 22.23.2
pnpm: 11.22.0
```

Do not copy OpenDesign's pnpm constraint into this project.

React + TypeScript + Vite should be scaffolded and validated against the currently installed versions.

---

## Decision

These issues are considered resolved.

Implementation can now begin with:

```text
1. Vite + React + TypeScript scaffold
2. Core types
3. Level data model
4. Phase-aware scoring module
5. Shared visual shell
6. Level 1 vertical slice
```

Do not implement Levels 2–5 until the Level 1 vertical slice has validated the component and state boundaries.
