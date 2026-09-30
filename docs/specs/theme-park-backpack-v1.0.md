# Theme Park Backpack — Implementation Specification v1.0

**Project:** AI learning games
**Game:** Theme Park Backpack
**Status:** Ready for implementation
**Primary concept:** Context windows and context engineering
**Target duration:** 5–8 minutes
**Platform:** Responsive web
**Runtime cost target:** £0
**Backend:** None for V1

---

## 1. Product Goal

Teach a beginner the intuition behind an LLM context window without initially using AI terminology.

The player experiences a familiar problem:

> A backpack has limited space. Filling it with everything is impossible, and filling every available space does not necessarily produce the best backpack.

The game gradually maps this intuition to:

- tokens;
- context windows;
- relevant context;
- irrelevant context/noise;
- summarisation/compression;
- task-dependent context.

The intended final understanding is:

> Good context engineering is not about giving an AI the maximum amount of information. It is about giving it the most useful information for the current task.

---

## 2. Target Audience

Primary audience:

- teenagers and adults;
- people with little or no AI knowledge;
- professionals learning AI concepts;
- students;
- technically curious users.

No prior understanding of:

- LLMs;
- tokens;
- prompting;
- RAG;
- context engineering;

should be required.

---

## 3. Core Design Principle

The player encounters the problem **before** the AI terminology.

Required learning sequence:

```text
Experience
   ↓
Make choices
   ↓
Observe consequences
   ↓
Understand the pattern
   ↓
Reveal AI terminology
   ↓
Connect to real AI systems
```

Avoid:

```text
Definition
   ↓
Explanation
   ↓
Quiz
```

---

## 4. V1 Scope

V1 contains:

1. Landing/introduction.
2. Five playable levels.
3. Backpack packing interaction.
4. Capacity visualisation.
5. Consequence/event simulation.
6. Three scoring dimensions.
7. AI concept reveals.
8. Final concept summary.
9. Restart/replay.
10. Local progress persistence.

V1 does **not** require:

- user accounts;
- backend;
- database;
- API calls;
- LLM calls;
- multiplayer;
- global leaderboard;
- payments;
- social features;
- cloud saves;
- complex achievements.

---

## 5. Technical Baseline

Recommended stack:

```text
React
TypeScript
Vite
CSS / Tailwind-compatible styling
Static assets
localStorage
```

Deployment target:

```text
Git repository
      ↓
Static build
      ↓
Cloudflare Pages / equivalent free static host
```

The entire game must run after static deployment.

No secrets or environment variables should be required.

---

## 6. Application Structure

Recommended initial structure:

```text
src/
├── app/
│   ├── App.tsx
│   └── routes.ts
│
├── games/
│   └── theme-park-backpack/
│       ├── ThemeParkGame.tsx
│       ├── game.config.ts
│       ├── game.types.ts
│       ├── scoring.ts
│       ├── levels/
│       │   ├── level1.ts
│       │   ├── level2.ts
│       │   ├── level3.ts
│       │   ├── level4.ts
│       │   └── level5.ts
│       └── components/
│           ├── Backpack.tsx
│           ├── CapacityMeter.tsx
│           ├── ItemCard.tsx
│           ├── EventCard.tsx
│           ├── ScorePanel.tsx
│           ├── ConceptReveal.tsx
│           └── LevelProgress.tsx
│
├── components/
│   ├── GameShell.tsx
│   ├── Button.tsx
│   └── Modal.tsx
│
├── hooks/
│   └── useGameProgress.ts
│
└── styles/
    └── globals.css
```

Do not create a generic game engine prematurely.

Theme Park Backpack should become the reference implementation from which reusable game abstractions are later extracted.

---

## 7. Routes

Minimum routing:

```text
/                       AI learning games home
/games/context-park     Theme Park Backpack
```

Optional later route:

```text
/games/context-park/5
```

V1 may keep level state internally instead of putting every level in the URL.

---

## 8. Game Flow

Overall state progression:

```text
INTRO
  ↓
LEVEL_1_PACK
  ↓
LEVEL_1_RESULT
  ↓
LEVEL_2_PACK
  ↓
LEVEL_2_RESULT
  ↓
LEVEL_3_PACK
  ↓
LEVEL_3_RESULT
  ↓
AI_REVEAL_1
  ↓
LEVEL_4_PACK
  ↓
LEVEL_4_RESULT
  ↓
AI_REVEAL_2
  ↓
LEVEL_5_PACK
  ↓
LEVEL_5_CHANGE
  ↓
LEVEL_5_REPACK
  ↓
LEVEL_5_RESULT
  ↓
FINAL_AI_REVEAL
  ↓
COMPLETE
```

The user must always be able to:

- remove an item;
- reset the current level;
- replay a completed level;
- continue after results.

---

## 9. Common Level UI

Desktop:

```text
┌────────────────────────────────────────────┐
│ Context Park             Level 3 of 5      │
│                                            │
│ The Distraction Trap                      │
│ Scenario description                       │
│                                            │
│ Conditions             Backpack capacity   │
│ ☀️ 📱 🎢               ███████░ 55 / 70   │
├──────────────────────────┬─────────────────┤
│                          │                 │
│ Available Items          │ Your Backpack   │
│                          │                 │
│ [Water] [Power bank]     │ Water       20 │
│ [Teddy] [Laptop]         │ Map          5 │
│ [Snack] ...              │                 │
│                          │ Free: 45        │
│                          │                 │
│                          │ [Start Day]     │
└──────────────────────────┴─────────────────┘
```

Mobile:

```text
Scenario
Capacity meter

Available items

Backpack contents

Primary action
```

Do not maintain a forced two-column layout on narrow screens.

---

## 10. Shared Interaction Rules

### Selecting items

Tap/click an available item:

```text
unselected → selected
```

Tap/click a selected item:

```text
selected → unselected
```

Selected items must appear visually in the backpack.

No drag-and-drop is required for V1.

Drag-and-drop may be added later only as enhancement; tap/click must remain fully functional.

### Capacity rule

For an item:

```text
currentUsed + item.size <= level.capacity
```

Allow selection.

Otherwise:

```text
selection rejected
```

Display:

> "[Item] won't fit. Remove something first."

Do not silently replace another item.

---

## 11. Common Data Model

```ts
type GameItem = {
  id: string;
  name: string;
  icon: string;
  size: number;

  usefulness: 0 | 1 | 2 | 3;

  categories?: string[];
};

type GameEvent = {
  id: string;
  title: string;
  icon: string;

  satisfyingItemIds: string[];

  successText: string;
  failureText: string;
};

type Level = {
  id: number;
  title: string;
  description: string;

  capacity: number;

  conditions: string[];

  items: GameItem[];
  events: GameEvent[];

  lesson: string;

  aiReveal?: AIReveal;
};

type AIReveal = {
  title: string;
  description: string;
  mappings?: {
    metaphor: string;
    aiConcept: string;
  }[];
};
```

Level 5 additionally requires:

```ts
type DynamicLevel = Level & {
  initialConditions: string[];
  changedConditions: string[];

  morningEvents: GameEvent[];
  eveningEvents: GameEvent[];

  changeMessage: string;
};
```

---

## 12. Scoring

V1 displays three scores.

### 12.1 Day Readiness

Measures whether packed items satisfied game events.

```text
successful events
───────────────── × 100
total events
```

Example:

```text
2 successful events
─────────────────── × 100 = 67%
3 events
```

### 12.2 Useful Capacity

Measures how much occupied space was spent on useful items.

Items with:

```text
usefulness >= 2
```

count as useful.

Formula:

```text
space consumed by useful items
────────────────────────────── × 100
total occupied space
```

Example:

```text
45 useful space
─────────────── × 100 = 75%
60 used space
```

### 12.3 Space Used

Display:

```text
used / capacity
```

Example:

```text
55 / 70
```

This is deliberately **not** converted into a success score.

Using all capacity is not inherently desirable.

---

## 13. No Overall Score in V1

Do not calculate:

```text
Final Score: 83/100
```

The game is about trade-offs.

A single combined score risks implying one universally correct strategy.

Show dimensions independently:

```text
Day readiness       100%
Useful capacity      72%
Space used           55/70
```

---

## 14. Level 1 — Pack Your Day

### Goal

Introduce finite capacity.

No AI terminology.

### Capacity

```text
100
```

### Conditions

```text
☀️ Warm and mostly sunny
🎢 Full-day visit
📱 Tickets stored on phone
```

### Items

```ts
[
  { id: "water",       name: "Water bottle",  icon: "💧", size: 20, usefulness: 3 },
  { id: "snacks",      name: "Snacks",        icon: "🥨", size: 15, usefulness: 3 },
  { id: "sunglasses",  name: "Sunglasses",    icon: "🕶️", size: 10, usefulness: 2 },
  { id: "power-bank",  name: "Power bank",    icon: "🔋", size: 20, usefulness: 3 },
  { id: "rain-jacket", name: "Rain jacket",   icon: "🧥", size: 20, usefulness: 1 },
  { id: "park-map",    name: "Park map",      icon: "🗺️", size: 5, usefulness: 2 },
  { id: "shirt",       name: "Spare T-shirt", icon: "👕", size: 15, usefulness: 1 },
  { id: "laptop",      name: "Laptop",        icon: "💻", size: 35, usefulness: 0 }
]
```

### Events

#### Event 1

```text
☀️ Long afternoon queue
```

Success:

```text
water OR snacks
```

#### Event 2

```text
📱 Phone battery gets low
```

Success:

```text
power-bank
```

#### Event 3

```text
🎢 Finding another ride
```

Success:

```text
park-map OR sunglasses
```

### Learning text

> Your backpack has limited capacity. Once it is full, adding something means removing something else.

Do not mention AI yet.

---

## 15. Level 2 — Smaller Bag

### Goal

Introduce prioritisation.

### Capacity

```text
70
```

### Items

```ts
[
  { id: "water",       name: "Water",               icon: "💧", size: 20, usefulness: 3 },
  { id: "snacks",      name: "Snacks",              icon: "🥨", size: 15, usefulness: 3 },
  { id: "sunglasses",  name: "Sunglasses",          icon: "🕶️", size: 10, usefulness: 2 },
  { id: "power-bank",  name: "Power bank",          icon: "🔋", size: 20, usefulness: 3 },
  { id: "rain-jacket", name: "Rain jacket",         icon: "🧥", size: 20, usefulness: 1 },
  { id: "camera",      name: "Camera",               icon: "📷", size: 30, usefulness: 1 },
  { id: "giant-hat",   name: "Giant souvenir hat",  icon: "🎩", size: 25, usefulness: 0 },
  { id: "shoes",       name: "Spare shoes",          icon: "👟", size: 30, usefulness: 0 },
  { id: "park-map",    name: "Park map",             icon: "🗺️", size: 5,  usefulness: 2 }
]
```

### Learning text

> When capacity becomes scarce, every choice competes with another choice.

Small hint:

> Computers working with language face a similar constraint.

Do not yet introduce the term **context window**.

---

## 16. Level 3 — The Distraction Trap

### Goal

Teach relevance versus noise.

### Capacity

```text
70
```

### Items

```ts
[
  { id: "water",       name: "Water",                icon: "💧", size: 20, usefulness: 3 },
  { id: "power-bank",  name: "Power bank",           icon: "🔋", size: 20, usefulness: 3 },
  { id: "sunglasses",  name: "Sunglasses",           icon: "🕶️", size: 10, usefulness: 2 },
  { id: "rain-jacket", name: "Rain jacket",          icon: "🧥", size: 20, usefulness: 1 },
  { id: "teddy",       name: "Giant teddy bear",     icon: "🧸", size: 40, usefulness: 0 },
  { id: "console",     name: "Gaming console",       icon: "🎮", size: 25, usefulness: 0 },
  { id: "laptop",      name: "Laptop",               icon: "💻", size: 35, usefulness: 0 },
  { id: "shirts",      name: "Three spare T-shirts", icon: "👕", size: 30, usefulness: 0 },
  { id: "snack",       name: "Small snack",          icon: "🥨", size: 10, usefulness: 3 },
  { id: "park-map",    name: "Park map",             icon: "🗺️", size: 5,  usefulness: 2 }
]
```

### Required reveal

After results, provide a button:

> So what does this have to do with AI?

On click:

```text
🎒 Backpack capacity → Context window

📦 Things you packed → Context / tokens

✅ Useful items → Relevant context

🧸 Unhelpful items → Noise
```

Then:

> A full context window is not necessarily a useful context window.

This is the first explicit AI terminology.

---

## 17. Level 4 — Pack Smarter

### Goal

Teach summarisation and information density.

### Capacity

```text
60
```

### Items

```ts
[
  { id: "picnic",   name: "Full picnic box",          icon: "🧺", size: 30, usefulness: 3 },
  { id: "bar",      name: "Energy bar",                icon: "🍫", size: 8,  usefulness: 2 },

  { id: "guide",    name: "Printed park guide",        icon: "📖", size: 18, usefulness: 3 },
  { id: "map",      name: "Pocket map",                icon: "🗺️", size: 5,  usefulness: 2 },

  { id: "coat",     name: "Heavy waterproof coat",     icon: "🧥", size: 30, usefulness: 3 },
  { id: "poncho",   name: "Foldable poncho",           icon: "🌧️", size: 8,  usefulness: 2 },

  { id: "power",    name: "Power bank",                icon: "🔋", size: 20, usefulness: 3 },
  { id: "camera",   name: "Large camera",              icon: "📷", size: 28, usefulness: 1 }
]
```

### Events

```text
Afternoon hunger
Hidden ride navigation
Sudden shower
```

Compact alternatives satisfy the same general need as large alternatives.

### AI reveal

Show:

```text
Bulky option

60-page document
≈ 12,000 tokens
```

versus:

```text
Compact option

Useful summary
≈ 1,500 tokens
```

Then:

> Sometimes a smaller representation preserves most of the useful information while consuming far less context.

Avoid suggesting that summarisation is always better.

---

## 18. Level 5 — When the Plan Changes

### Goal

Teach that relevance is task-dependent.

### Capacity

```text
60
```

### Initial conditions

```text
☀️ Sunny morning
🕔 Leaving at 5 PM
📱 Tickets on phone
```

### Items

```ts
[
  { id: "water",      name: "Water",          icon: "💧", size: 20, usefulness: 3 },
  { id: "power-bank", name: "Power bank",     icon: "🔋", size: 20, usefulness: 2 },
  { id: "sunglasses", name: "Sunglasses",     icon: "🕶️", size: 10, usefulness: 3 },
  { id: "poncho",     name: "Foldable poncho",icon: "🌧️", size: 8,  usefulness: 1 },
  { id: "snack",      name: "Snack",          icon: "🥨", size: 10, usefulness: 2 },
  { id: "map",        name: "Pocket map",      icon: "🗺️", size: 5,  usefulness: 2 },
  { id: "selfie",     name: "Selfie stick",   icon: "🤳", size: 20, usefulness: 1 },
  { id: "hoodie",     name: "Warm hoodie",    icon: "🧥", size: 20, usefulness: 1 }
]
```

### Phase 1

Player packs for the original day.

Player clicks:

> Start the morning

Run one light event.

Then interrupt gameplay.

---

## 19. Level 5 Change Event

Display prominently:

> ⚠️ PLAN UPDATED

Then:

```text
🌧️ Heavy rain expected after 6 PM

🎆 Your friends want to stay until the 9 PM fireworks.
```

Player is allowed to repack.

Primary action becomes:

> Continue to evening →

Evening events:

### Rain

Success:

```text
poncho
```

### Phone survival

Success:

```text
power-bank
```

### Extended day

Success:

```text
water OR snack
```

### Final lesson

> The usefulness of an item changed when your goal changed.

Then:

> Information works the same way. Context that is useful for one question may be unhelpful for another.

---

## 20. Final AI Reveal

After Level 5:

### Heading

> You weren't really learning how to pack a backpack.

Then display:

| Theme park | AI |
|---|---|
| Backpack | Context window |
| Available space | Token capacity |
| Items | Context |
| Useful items | Relevant information |
| Unneeded items | Noise |
| Compact alternatives | Summarised/compressed context |
| Choosing what to pack | Context engineering |
| Changing plans | Task-dependent context |

Final statement:

> **Good context engineering is not about giving AI the most information. It is about giving it the right information for the task.**

---

## 21. Progress Design

Header displays:

```text
Level 3 of 5
```

Visual progress:

```text
● ─ ● ─ ● ─ ○ ─ ○
```

Completed levels must be distinguishable from:

- current;
- locked/not-yet-played.

Recommended labels:

```text
1 Capacity
2 Priorities
3 Noise
4 Compression
5 Changing Context
```

On mobile, labels may collapse while preserving the five progress indicators.

---

## 22. Result Feedback Rules

Feedback should explain consequences rather than declare:

```text
RIGHT
WRONG
```

Examples:

### Strong pack

> You handled the day without filling the whole backpack. Useful choices mattered more than maximum utilisation.

### Full but inefficient

> Your backpack was completely full, but some of that space never helped you.

### Missing useful context

> Useful things were left behind while less relevant items consumed your limited space.

### Balanced result

> Your choices worked, but there may be a more space-efficient combination.

---

## 23. Visual Direction

Desired personality:

- playful;
- modern;
- friendly;
- polished;
- accessible;
- not childish.

Theme-park cues can include:

```text
🎢 rides
🎡 wheel
🎒 backpack
🎟️ tickets
☀️ weather
🎆 fireworks
```

Avoid excessive cartoon decoration.

The educational UI must remain visually dominant.

---

## 24. Motion

Use animation to communicate state.

Recommended:

- item selection feedback;
- item appearing in backpack;
- capacity bar filling;
- result cards revealing sequentially;
- AI reveal transition.

Do not require animation to understand gameplay.

Respect:

```css
prefers-reduced-motion
```

No continuous background animations in V1.

---

## 25. Responsive Behaviour

Supported minimum width:

```text
320px
```

Desktop:

```text
items | backpack
```

Mobile:

```text
scenario
capacity
items
backpack
action
```

Requirements:

- no page-level horizontal scrolling;
- touch targets ≈44px minimum;
- text inputs unnecessary;
- primary actions full width on narrow screens;
- item cards usable with thumb interaction.

---

## 26. Accessibility

Required:

- all gameplay usable with keyboard;
- item cards implemented as `<button>`;
- `aria-pressed` for selected items;
- visible focus indicators;
- no information communicated by colour alone;
- sufficient contrast;
- screen-reader announcement when capacity prevents selection;
- scoring values accompanied by text labels;
- reduced-motion support.

Icons must not be the sole source of meaning.

Example:

```text
💧 Water
```

not:

```text
💧
```

alone.

---

## 27. Persistence

Use localStorage only.

Suggested key:

```text
ai-arcade.context-park.v1
```

Store:

```ts
{
  highestCompletedLevel: number;
  gameCompleted: boolean;
}
```

Do not persist partially packed backpacks.

A page refresh during a level may restart that level.

This keeps state handling simple.

---

## 28. No Analytics Requirement for V1

No analytics platform is required.

If analytics is added later, track only product events such as:

```text
game_started
level_completed
game_completed
level_replayed
```

Do not block implementation on analytics.

---

## 29. Error and Edge Cases

### Empty backpack

Disable primary action.

### Item does not fit

Reject selection.

Show:

> "[Item] won't fit. Remove something first."

### Exactly full

Allowed.

Display:

> Backpack full.

### Replaying level

Clear:

- selected items;
- result state;
- transient messages.

Keep overall progress.

### localStorage unavailable

Game must still work.

Progress simply does not persist.

---

## 30. Component Responsibilities

### GameShell

Owns:

- page layout;
- game-level navigation;
- overall progress.

Must not contain scoring logic.

### LevelHeader

Displays:

- level number;
- title;
- description;
- conditions.

### CapacityMeter

Inputs:

```ts
capacity
used
```

Displays:

```text
55 / 70
```

and visual meter.

### ItemCard

Inputs:

```ts
item
selected
disabled?
```

Emits:

```ts
onToggle(item.id)
```

Does not know about overall capacity.

### Backpack

Inputs:

```ts
selectedItems
capacity
```

Emits:

```ts
onRemove(item.id)
```

### EventCard

Inputs:

```ts
event
success
```

Shows consequence text.

### ScorePanel

Inputs:

```ts
dayReadiness
usefulCapacity
used
capacity
```

Contains no scoring calculation.

### ConceptReveal

Displays metaphor → AI mapping.

Reusable later across other games.

---

## 31. State Ownership

`ThemeParkGame` owns:

```ts
currentLevel
selectedItemIds
phase
result
```

Level components remain mostly presentational.

Recommended state:

```ts
type GamePhase =
  | "packing"
  | "events"
  | "reveal"
  | "repacking"
  | "complete";
```

Do not introduce Redux/Zustand for V1.

React state is sufficient.

---

## 32. Scoring Module

Keep calculation outside UI components.

Example API:

```ts
calculateLevelResult({
  level,
  selectedItemIds,
}): LevelResult
```

Returns:

```ts
type LevelResult = {
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
```

This allows scoring tests without rendering React.

---

## 33. Testing Strategy

### Unit tests

Test:

- capacity calculation;
- item-selection eligibility;
- event success evaluation;
- day-readiness score;
- useful-capacity score;
- feedback classification.

Example:

```text
Given capacity = 70
And selected space = 60
When adding item size = 20
Then selection is rejected.
```

### Component tests

Cover:

- selecting an item;
- deselecting an item;
- full backpack;
- primary action disabled when empty;
- result rendering;
- AI reveal;
- Level 5 repacking.

### End-to-end smoke test

Critical path:

```text
Open game
→ Start Level 1
→ Pack items
→ Start day
→ View results
→ Advance
→ Complete Levels 2–3
→ Open first AI reveal
→ Complete Level 4
→ Complete Level 5 change/repack flow
→ View final concept reveal
```

Test at:

```text
desktop
mobile viewport
```

---

## 34. Performance Requirements

Because the game is fully client-side:

- initial JS should remain small;
- avoid heavy game libraries;
- no animation libraries required initially;
- use CSS transitions where practical;
- assets should be compressed;
- avoid unnecessary image downloads.

The game must remain usable on an ordinary mobile device.

---

## 35. Definition of Done

Game 1 is complete when:

- all five levels are playable;
- capacity constraints work correctly;
- consequences depend on selected items;
- scoring is deterministic;
- Level 3 introduces context-window terminology;
- Level 4 introduces compact context/summarisation;
- Level 5 demonstrates task-dependent relevance;
- final metaphor-to-AI mapping is shown;
- game works at 320px width;
- keyboard navigation works;
- reduced-motion preference is respected;
- progress survives page reload;
- no backend/API is required;
- static production build succeeds;
- deployed version is publicly accessible.

---

## 36. Acceptance Scenarios

### AC-01 — Capacity enforcement

Given the backpack has 10 free space
When the player selects an item requiring 20 space
Then the item is not added
And the player receives an explanatory message.

### AC-02 — Full is not optimal

Given the player fills the backpack entirely with low-value items
When the level completes
Then the game must not reward full utilisation merely because capacity reached 100%.

### AC-03 — Relevant pack

Given the player selects items satisfying all events
When results are shown
Then Day Readiness is 100%.

### AC-04 — Noise lesson

When Level 3 completes
Then the player can reveal the mapping:

```text
Backpack → context window
Items → context
Useful items → relevant context
Unhelpful items → noise
```

### AC-05 — Compression lesson

When Level 4 completes
Then compact alternatives are explicitly connected to compressed or summarised AI context.

### AC-06 — Context changes

Given Level 5 begins with the original plan
When the weather and schedule change
Then the player may modify the backpack before continuing.

### AC-07 — Task-dependent reveal

When Level 5 completes
Then the game explicitly teaches:

> Useful context depends on the current task.

---

## 37. Implementation Sequence

Recommended order:

```text
1. Project shell
2. Shared types
3. Level data files
4. Capacity + item-selection logic
5. ItemCard
6. Backpack
7. Level 1
8. Result/events system
9. Scoring module
10. Levels 2–3
11. ConceptReveal
12. Level 4
13. Level 5 state transition
14. Final reveal
15. Persistence
16. Accessibility pass
17. Responsive pass
18. Unit/component tests
19. E2E smoke test
20. Static deployment
```

---

## 38. Architecture Constraint for Future Games

Do not modify Theme Park Backpack to accommodate hypothetical requirements from games that do not yet exist.

Once this game is complete, identify genuinely reusable patterns.

Likely candidates:

```text
GameShell
Progress
ScorePanel
ConceptReveal
local progress persistence
```

Game-specific mechanics such as:

```text
Backpack
CapacityMeter
packing rules
```

should remain inside Theme Park Backpack.

This avoids creating an overly generic framework too early.

---

## 39. Future Extension Hooks

Not part of V1, but architecture should not prevent:

- sound effects;
- alternate theme-park scenarios;
- achievements;
- shareable completion cards;
- difficulty modes;
- classroom mode;
- real token-count experiments;
- optional local-model lab;
- comparison with actual LLM context windows.

None should delay V1.

---

## 40. Final Product Principle

Every implementation decision should preserve the core learning sequence:

> **Play first. Discover the constraint. Experience the consequence. Then reveal the AI concept.**

If an implementation change makes the player read more explanation before interacting, prefer the simpler interactive version.
