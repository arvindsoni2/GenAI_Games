import type { Level } from "../game.types";

/**
 * Level 2 - Smaller Bag.
 *
 * Goal: introduce prioritisation. Capacity drops from 100 to 70, so the player
 * can no longer bring most of the list and has to choose.
 *
 * The hint is the last thing before the first AI term, so it stays vague on
 * purpose: it points at a machine constraint without naming tokens or context.
 */
export const level2: Level = {
  id: 2,
  title: "Smaller Bag",
  description:
    "The park gave you a smaller bag this time. Not everything fits, and every item you add makes room for one fewer.",

  capacity: 70,

  conditions: ["☀️ Warm and mostly sunny", "🎢 Full-day visit", "🎒 Smaller bag issued"],

  items: [
    { id: "water", name: "Water", icon: "💧", size: 20, usefulness: 3 },
    { id: "snacks", name: "Snacks", icon: "🥨", size: 15, usefulness: 3 },
    { id: "sunglasses", name: "Sunglasses", icon: "🕶️", size: 10, usefulness: 2 },
    { id: "power-bank", name: "Power bank", icon: "🔋", size: 20, usefulness: 3 },
    { id: "rain-jacket", name: "Rain jacket", icon: "🧥", size: 20, usefulness: 1 },
    { id: "camera", name: "Camera", icon: "📷", size: 30, usefulness: 1 },
    { id: "giant-hat", name: "Giant souvenir hat", icon: "🎩", size: 25, usefulness: 0 },
    { id: "shoes", name: "Spare shoes", icon: "👟", size: 30, usefulness: 0 },
    { id: "park-map", name: "Park map", icon: "🗺️", size: 5, usefulness: 2 },
  ],

  events: [
    {
      id: "l2-queue",
      title: "Long afternoon queue",
      icon: "☀️",
      satisfyingItemIds: ["water", "snacks"],
      successText: "Two hours in the sun, and you had something to drink the whole time.",
      failureText: "You queued for two hours in the sun with nothing to drink.",
    },
    {
      id: "l2-battery",
      title: "Phone battery gets low",
      icon: "📱",
      satisfyingItemIds: ["power-bank"],
      successText: "Battery low, plugged in, no interruption.",
      failureText: "Your phone died at midday. You spent the afternoon looking for a charger.",
    },
    {
      id: "l2-ride",
      title: "Finding another ride",
      icon: "🎢",
      satisfyingItemIds: ["park-map", "sunglasses"],
      successText: "Five minutes to the big wheel, and the sun never in your eyes.",
      failureText: "Twenty minutes of wandering, squinting the whole way.",
    },
  ],

  lesson:
    "When capacity becomes scarce, every choice competes with another choice.",

  // The first nudge toward AI, deliberately unnamed. Spec 15 forbids the
  // phrase "context window" until Level 3.
  hint: "Computers working with language face a similar constraint.",
};

export default level2;
