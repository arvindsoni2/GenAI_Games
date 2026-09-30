import type { DynamicLevel } from "../game.types";

/**
 * Level 5 - When the Plan Changes.
 *
 * Goal: teach that relevance is task-dependent.
 *
 * The critical part is `usefulnessByPhase`. Sunglasses are the most useful item
 * in the morning and pure noise in the evening; the poncho is the reverse. The
 * evening score MUST read these overrides, or the scoring system would
 * contradict the lesson the level is trying to teach (decisions note 3).
 *
 * The morning and evening packs are scored separately and both selections are
 * kept, so the result screen can show what actually changed.
 */
export const level5: DynamicLevel = {
  id: 5,
  title: "When the Plan Changes",
  description:
    "One last day. Pack for the morning, and the park will tell you what the evening looks like once you are already there.",

  capacity: 60,

  // `conditions` is required by the Level type. The level renders
  // `initialConditions` before the change and `changedConditions` after, so
  // this mirrors the morning state.
  conditions: ["☀️ Sunny morning", "🕔 Leaving at 5 PM", "📱 Tickets on phone"],

  initialConditions: ["☀️ Sunny morning", "🕔 Leaving at 5 PM", "📱 Tickets on phone"],

  changedConditions: ["🌧️ Heavy rain expected after 6 PM", "🎆 Friends want to stay for 9 PM fireworks"],

  changeMessage: "🌧️ Heavy rain expected after 6 PM. 🎆 Your friends want to stay until the 9 PM fireworks.",

  items: [
    {
      id: "water",
      name: "Water",
      icon: "💧",
      size: 20,
      usefulness: 3,
      usefulnessByPhase: { morning: 3, evening: 3 },
    },
    {
      id: "power-bank",
      name: "Power bank",
      icon: "🔋",
      size: 20,
      usefulness: 2,
      // The spec's own table rates it 2 in the morning and 3 in the evening:
      // a longer day out means more phone survival to do.
      usefulnessByPhase: { morning: 2, evening: 3 },
    },
    {
      id: "sunglasses",
      name: "Sunglasses",
      icon: "🕶️",
      size: 10,
      usefulness: 3,
      // The star of the lesson: ideal at noon, worthless once the rain arrives.
      usefulnessByPhase: { morning: 3, evening: 0 },
    },
    {
      id: "poncho",
      name: "Foldable poncho",
      icon: "🌧️",
      size: 8,
      usefulness: 1,
      // The reverse case: near-useless until the plan changes, then essential.
      usefulnessByPhase: { morning: 0, evening: 3 },
    },
    {
      id: "snack",
      name: "Snack",
      icon: "🥨",
      size: 10,
      usefulness: 2,
      usefulnessByPhase: { morning: 2, evening: 3 },
    },
    {
      id: "map",
      name: "Pocket map",
      icon: "🗺️",
      size: 5,
      usefulness: 2,
      usefulnessByPhase: { morning: 2, evening: 1 },
    },
    {
      id: "selfie",
      name: "Selfie stick",
      icon: "🤳",
      size: 20,
      usefulness: 1,
      usefulnessByPhase: { morning: 1, evening: 1 },
    },
    {
      // The spec's table omitted the hoodie. Rather than let it fall back to
      // its static usefulness, which would be ambiguous after rain, it is
      // scored explicitly: useless in the sun, mildly useful in the cold and
      // wet evening (decisions note 3).
      id: "hoodie",
      name: "Warm hoodie",
      icon: "🧥",
      size: 20,
      usefulness: 1,
      usefulnessByPhase: { morning: 1, evening: 2 },
    },
  ],

  /** One light morning event, to be interrupted by the plan change. */
  morningEvents: [
    {
      id: "l5-morning",
      title: "Morning in the sun",
      icon: "☀️",
      satisfyingItemIds: ["water", "snack", "sunglasses"],
      successText: "The morning was hot and slow. You had water, a snack, and sunglasses that actually worked.",
      failureText: "The morning was hot and you were not ready for it. You spent the first hour finding water.",
    },
  ],

  eveningEvents: [
    {
      id: "l5-rain",
      title: "Heavy rain",
      icon: "🌧️",
      satisfyingItemIds: ["poncho"],
      successText: "The rain came down hard and you stayed dry through all of it.",
      failureText: "The rain soaked you within ten minutes. The fireworks were watched shivering.",
    },
    {
      id: "l5-battery",
      title: "Phone survival until 9 PM",
      icon: "📱",
      satisfyingItemIds: ["power-bank"],
      successText: "Your phone made it to the end. You got the photos and the group found you.",
      failureText: "Your phone died around seven. You got none of the photos and lost the group in the crowd.",
    },
    {
      id: "l5-extended",
      title: "Extended day",
      icon: "🎆",
      satisfyingItemIds: ["water", "snack"],
      successText: "You stayed to the fireworks, hydrated and fed. A long day that worked.",
      failureText: "You lasted about two hours past your usual time before you had to sit down. The fireworks were a blur.",
    },
  ],

  // `events` mirrors the morning set so the shared scoring path works
  // unchanged; Level 5 scores each phase explicitly instead.
  events: [
    {
      id: "l5-morning",
      title: "Morning in the sun",
      icon: "☀️",
      satisfyingItemIds: ["water", "snack", "sunglasses"],
      successText: "The morning was hot and slow. You had water, a snack, and sunglasses that actually worked.",
      failureText: "The morning was hot and you were not ready for it. You spent the first hour finding water.",
    },
  ],

  lesson:
    "The usefulness of an item changed when your goal changed. The items did not move, get bigger, or get smaller. The task did.",

  aiReveal: {
    title: "You weren't really learning how to pack a backpack.",
    description:
      "Information works the same way. Context that is useful for one question may be unhelpful for another. The sunglasses were not useless information — they were useful information for a task that no longer existed.\n\nRelevance is task-dependent.",
    mappings: [
      { metaphor: "🎒 Backpack", aiConcept: "Context window" },
      { metaphor: "📏 Available space", aiConcept: "Token capacity" },
      { metaphor: "📦 Items", aiConcept: "Context" },
      { metaphor: "✅ Useful items", aiConcept: "Relevant information" },
      { metaphor: "🧸 Unneeded items", aiConcept: "Noise" },
      { metaphor: "🗺️ Compact alternatives", aiConcept: "Summarised / compressed context" },
      { metaphor: "🎯 Choosing what to pack", aiConcept: "Context engineering" },
      { metaphor: "🌧️ Changing plans", aiConcept: "Task-dependent context" },
    ],
  },
};

export default level5;
