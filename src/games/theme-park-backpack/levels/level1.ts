import type { Level } from "../game.types";

/**
 * Level 1 - Pack Your Day.
 *
 * Goal: introduce finite capacity. No AI terminology anywhere in this level.
 *
 * All three events are satisfied by an "any of" list, so there is more than
 * one defensible pack. That is deliberate: spec section 13 forbids a single
 * correct answer, and section 22 forbids RIGHT/WRONG verdicts.
 */
export const level1: Level = {
  id: 1,
  title: "Pack Your Day",
  description:
    "You are spending the whole day at Adventure Park. Your backpack has a fixed amount of space. Choose what to bring.",

  capacity: 100,

  conditions: ["☀️ Warm and mostly sunny", "🎢 Full-day visit", "📱 Tickets stored on phone"],

  items: [
    { id: "water", name: "Water bottle", icon: "💧", size: 20, usefulness: 3 },
    { id: "snacks", name: "Snacks", icon: "🥨", size: 15, usefulness: 3 },
    { id: "sunglasses", name: "Sunglasses", icon: "🕶️", size: 10, usefulness: 2 },
    { id: "power-bank", name: "Power bank", icon: "🔋", size: 20, usefulness: 3 },
    { id: "rain-jacket", name: "Rain jacket", icon: "🧥", size: 20, usefulness: 1 },
    { id: "park-map", name: "Park map", icon: "🗺️", size: 5, usefulness: 2 },
    { id: "shirt", name: "Spare T-shirt", icon: "👕", size: 15, usefulness: 1 },
    { id: "laptop", name: "Laptop", icon: "💻", size: 35, usefulness: 0 },
  ],

  events: [
    {
      id: "l1-queue",
      title: "Long afternoon queue",
      icon: "☀️",
      satisfyingItemIds: ["water", "snacks"],
      successText: "The queue took longer than expected, but you had water and a snack. You waited it out comfortably.",
      failureText: "You stood in the queue for two hours with nothing to drink. It was a long wait.",
    },
    {
      id: "l1-battery",
      title: "Phone battery gets low",
      icon: "📱",
      satisfyingItemIds: ["power-bank"],
      successText: "Your battery dropped to 12%. You plugged in and carried on without losing your place.",
      failureText: "Your phone died in the middle of the afternoon. No photos, no map, no way to find the group.",
    },
    {
      id: "l1-ride",
      title: "Finding another ride",
      icon: "🎢",
      satisfyingItemIds: ["park-map", "sunglasses"],
      successText: "You found the queue for the big wheel in under five minutes and enjoyed the view.",
      failureText: "You wandered for twenty minutes trying to find the big wheel, squinting into the sun the whole time.",
    },
  ],

  lesson:
    "Your backpack has limited capacity. Once it is full, adding something means removing something else.",
};

export default level1;
