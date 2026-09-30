import type { Level } from "../game.types";

/**
 * Level 3 - The Distraction Trap.
 *
 * Goal: teach relevance versus noise, and carry the first explicit AI
 * terminology. Nothing in this level names a context window until the player
 * presses the reveal button.
 */
export const level3: Level = {
  id: 3,
  title: "The Distraction Trap",
  description:
    "Capacity 70 again, but the park shop has left a lot of tempting things outside your bag. Half of what you could pack is here to be packed.",

  capacity: 70,

  conditions: ["☀️ Warm and mostly sunny", "🎢 Full-day visit", "🛍️ Park shop outside the gate"],

  items: [
    { id: "water", name: "Water", icon: "💧", size: 20, usefulness: 3 },
    { id: "power-bank", name: "Power bank", icon: "🔋", size: 20, usefulness: 3 },
    { id: "sunglasses", name: "Sunglasses", icon: "🕶️", size: 10, usefulness: 2 },
    { id: "rain-jacket", name: "Rain jacket", icon: "🧥", size: 20, usefulness: 1 },
    { id: "teddy", name: "Giant teddy bear", icon: "🧸", size: 40, usefulness: 0 },
    { id: "console", name: "Gaming console", icon: "🎮", size: 25, usefulness: 0 },
    { id: "laptop", name: "Laptop", icon: "💻", size: 35, usefulness: 0 },
    { id: "shirts", name: "Three spare T-shirts", icon: "👕", size: 30, usefulness: 0 },
    { id: "snack", name: "Small snack", icon: "🥨", size: 10, usefulness: 3 },
    { id: "park-map", name: "Park map", icon: "🗺️", size: 5, usefulness: 2 },
  ],

  events: [
    {
      id: "l3-queue",
      title: "Long afternoon queue",
      icon: "☀️",
      satisfyingItemIds: ["water", "snack"],
      successText: "The queue dragged on, but you had a drink and something to eat.",
      failureText: "Two hours in the sun with nothing. The queue was longer than the map said.",
    },
    {
      id: "l3-battery",
      title: "Phone battery gets low",
      icon: "📱",
      satisfyingItemIds: ["power-bank"],
      successText: "Battery low, plugged in, back on schedule.",
      failureText: "Your phone died at midday and stayed dead. You lost the group for an hour.",
    },
    {
      id: "l3-ride",
      title: "Finding another ride",
      icon: "🎢",
      satisfyingItemIds: ["park-map", "sunglasses"],
      successText: "Straight to the big wheel, no wasted half hour.",
      failureText: "You spent most of the afternoon walking in circles looking for it.",
    },
  ],

  lesson:
    "Filling your backpack completely is not the same as filling it usefully. You can use every centimetre and still have nothing that helps.",

  // The first explicit AI terminology in the game. Reached only by pressing
  // the button on the result screen (spec 16).
  aiReveal: {
    title: "So what does this have to do with AI?",
    description:
      "A full context window is not necessarily a useful context window. An AI can have more information loaded than is useful for the question in front of it, and the extra information gets in the way rather than helping.",
    mappings: [
      { metaphor: "🎒 Backpack capacity", aiConcept: "Context window" },
      { metaphor: "📦 Things you packed", aiConcept: "Context / tokens" },
      { metaphor: "✅ Useful items", aiConcept: "Relevant context" },
      { metaphor: "🧸 Unhelpful items", aiConcept: "Noise" },
    ],
  },
};

export default level3;
