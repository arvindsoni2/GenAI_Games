import type { Level } from "../game.types";

/**
 * Level 4 - Pack Smarter.
 *
 * Goal: teach summarisation and information density.
 *
 * Every event here has a bulky option and a compact option that satisfy the
 * same need. The compact one is always smaller AND still useful, which is what
 * makes the token comparison land.
 */
export const level4: Level = {
  id: 4,
  title: "Pack Smarter",
  description:
    "Same park, tighter bag. For each thing you need, there are two ways to bring it. One takes most of your space. The other takes a fraction of it.",

  capacity: 60,

  conditions: ["☀️ Warm and mostly sunny", "🎢 Full-day visit", "📦 Bulk and compact options available"],

  items: [
    { id: "picnic", name: "Full picnic box", icon: "🧺", size: 30, usefulness: 3 },
    { id: "bar", name: "Energy bar", icon: "🍫", size: 8, usefulness: 2 },

    { id: "guide", name: "Printed park guide", icon: "📖", size: 18, usefulness: 3 },
    { id: "map", name: "Pocket map", icon: "🗺️", size: 5, usefulness: 2 },

    { id: "coat", name: "Heavy waterproof coat", icon: "🧥", size: 30, usefulness: 3 },
    { id: "poncho", name: "Foldable poncho", icon: "🌧️", size: 8, usefulness: 2 },

    { id: "power", name: "Power bank", icon: "🔋", size: 20, usefulness: 3 },
    { id: "camera", name: "Large camera", icon: "📷", size: 28, usefulness: 1 },
  ],

  events: [
    {
      id: "l4-hunger",
      title: "Afternoon hunger",
      icon: "🥨",
      satisfyingItemIds: ["picnic", "bar"],
      successText: "You ate properly at four in the afternoon and kept going until closing.",
      failureText: "You found a chip stall at seven, by which point you were too tired to enjoy the fireworks.",
    },
    {
      id: "l4-navigation",
      title: "Hidden ride navigation",
      icon: "🎢",
      satisfyingItemIds: ["guide", "map"],
      successText: "The pocket map was enough. You found the hidden ride in two minutes.",
      failureText: "The hidden ride is genuinely hidden. Without directions you walked right past it four times.",
    },
    {
      id: "l4-shower",
      title: "Sudden shower",
      icon: "🌧️",
      satisfyingItemIds: ["coat", "poncho"],
      successText: "Rain for twenty minutes, dry the whole time.",
      failureText: "You got soaked through in a twenty-minute shower and then spent an hour shivering.",
    },
  ],

  lesson:
    "Two items can do the same job while using very different amounts of space. The smaller one is not a worse version of the bigger one.",

  aiReveal: {
    title: "Bulky, or compact?",
    description:
      "Sometimes a smaller representation preserves most of the useful information while consuming far less context. A 60-page document is roughly 12,000 tokens. A good summary of that document is roughly 1,500 tokens — and answers most questions about it.\n\nThis is not always a win. Summarising throws detail away, so when you genuinely need every detail, the compact version is the wrong choice.",
    mappings: [
      { metaphor: "📖 60-page printed guide", aiConcept: "Full document ≈ 12,000 tokens" },
      { metaphor: "🗺️ Pocket map", aiConcept: "Summary ≈ 1,500 tokens" },
      { metaphor: "🧺 Full picnic box", aiConcept: "Raw, unfiltered context" },
      { metaphor: "🍫 Energy bar", aiConcept: "Summarised context" },
    ],
  },
};

export default level4;
