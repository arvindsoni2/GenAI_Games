import { describe, expect, it } from "vitest";
import { level1 } from "../levels/level1";
import type { GameEvent, GameItem } from "../game.types";
import {
  calculatePhaseResult,
  canFitItem,
  getItemUsefulness,
  usedSpaceFor,
  USEFUL_THRESHOLD,
} from "../scoring";

/** AC-01 / spec 33: "Given capacity = 70, selected = 60, add size 20 -> rejected." */
describe("canFitItem", () => {
  it("rejects an item that would exceed capacity", () => {
    expect(canFitItem({ used: 60, capacity: 70, size: 20 })).toBe(false);
  });

  it("allows an item that exactly fills capacity", () => {
    expect(canFitItem({ used: 50, capacity: 70, size: 20 })).toBe(true);
  });

  it("rejects an item larger than the whole capacity", () => {
    expect(canFitItem({ used: 0, capacity: 10, size: 35 })).toBe(false);
  });

  it("allows any item into an empty backpack that fits", () => {
    expect(canFitItem({ used: 0, capacity: 100, size: 35 })).toBe(true);
  });
});

describe("usedSpaceFor", () => {
  it("sums only the selected items", () => {
    expect(usedSpaceFor(level1.items, ["water", "park-map"])).toBe(25);
  });

  it("is zero for an empty selection", () => {
    expect(usedSpaceFor(level1.items, [])).toBe(0);
  });

  it("ignores ids that are not in the item list", () => {
    expect(usedSpaceFor(level1.items, ["water", "ghost-item"])).toBe(20);
  });
});

describe("getItemUsefulness", () => {
  const item: GameItem = {
    id: "sunglasses",
    name: "Sunglasses",
    icon: "🕶️",
    size: 10,
    usefulness: 3,
    usefulnessByPhase: { evening: 0 },
  };

  it("falls back to the static usefulness when no phase is given", () => {
    expect(getItemUsefulness(item)).toBe(3);
  });

  it("falls back to the static usefulness for an unknown phase", () => {
    expect(getItemUsefulness(item, "morning")).toBe(3);
  });

  it("uses the phase override when present", () => {
    expect(getItemUsefulness(item, "evening")).toBe(0);
  });

  it("treats an explicit zero override as meaningful, not missing", () => {
    expect(getItemUsefulness(item, "evening")).not.toBe(3);
  });
});

describe("calculatePhaseResult", () => {
  const byId = (id: string) => {
    const found = level1.items.find((i) => i.id === id);
    if (!found) throw new Error(`fixture missing item ${id}`);
    return found;
  };

  it("scores 100% readiness when every event is satisfied (AC-03)", () => {
    const result = calculatePhaseResult({
      items: level1.items,
      selectedItemIds: ["water", "power-bank", "park-map"],
      events: level1.events,
      capacity: level1.capacity,
      phaseId: "main",
    });

    expect(result.successfulEvents).toBe(3);
    expect(result.totalEvents).toBe(3);
    expect(result.dayReadiness).toBe(100);
  });

  it("treats an event as satisfied by any one of its items", () => {
    const snacksInsteadOfWater = calculatePhaseResult({
      items: level1.items,
      selectedItemIds: ["snacks", "power-bank", "sunglasses"],
      events: level1.events,
      capacity: level1.capacity,
      phaseId: "main",
    });

    expect(snacksInsteadOfWater.dayReadiness).toBe(100);
  });

  it("fails an event only when none of its items are present", () => {
    const result = calculatePhaseResult({
      items: level1.items,
      selectedItemIds: ["water", "sunglasses"],
      events: level1.events,
      capacity: level1.capacity,
      phaseId: "main",
    });

    // water -> l1-queue yes; sunglasses -> l1-ride yes; power-bank -> no.
    expect(result.successfulEvents).toBe(2);
    expect(result.totalEvents).toBe(3);
    expect(result.dayReadiness).toBe(67);
  });

  it("computes useful capacity from space, not item count", () => {
    // water 20 (useful) + park-map 5 (useful) + laptop 35 (noise) = 60 used, 25 useful.
    const result = calculatePhaseResult({
      items: level1.items,
      selectedItemIds: ["water", "park-map", "laptop"],
      events: level1.events,
      capacity: level1.capacity,
      phaseId: "main",
    });

    expect(result.usedSpace).toBe(60);
    expect(result.usefulCapacity).toBe(42); // 25/60 = 41.66 -> 42
  });

  it("does not reward filling the backpack (AC-02)", () => {
    // A completely full pack made of low-value items.
    const fullOfNoise = calculatePhaseResult({
      items: level1.items,
      selectedItemIds: ["laptop", "shirt", "rain-jacket", "snacks"],
      events: level1.events,
      capacity: level1.capacity,
      phaseId: "main",
    });

    expect(fullOfNoise.usedSpace).toBe(85);
    expect(fullOfNoise.usefulCapacity).toBeLessThan(30);
    expect(fullOfNoise.feedbackType).not.toBe("excellent");
  });

  it("treats usefulness >= 2 as useful (spec 12.2)", () => {
    expect(USEFUL_THRESHOLD).toBe(2);
    expect(getItemUsefulness(byId("sunglasses"))).toBeGreaterThanOrEqual(USEFUL_THRESHOLD);
    expect(getItemUsefulness(byId("rain-jacket"))).toBeLessThan(USEFUL_THRESHOLD);
  });

  it("returns zero readiness for an empty pack rather than dividing by zero", () => {
    const result = calculatePhaseResult({
      items: level1.items,
      selectedItemIds: [],
      events: level1.events,
      capacity: level1.capacity,
      phaseId: "main",
    });

    expect(result.dayReadiness).toBe(0);
    expect(result.usefulCapacity).toBe(0);
    expect(result.usedSpace).toBe(0);
  });

  it("handles a level with no events without dividing by zero", () => {
    const result = calculatePhaseResult({
      items: level1.items,
      selectedItemIds: ["water"],
      events: [] as GameEvent[],
      capacity: level1.capacity,
      phaseId: "main",
    });

    expect(result.totalEvents).toBe(0);
    expect(result.dayReadiness).toBe(100); // nothing to satisfy: nothing failed
  });

  it("classifies a clean, efficient, relevant pack as excellent", () => {
    const result = calculatePhaseResult({
      items: level1.items,
      selectedItemIds: ["water", "power-bank", "park-map"],
      events: level1.events,
      capacity: level1.capacity,
      phaseId: "main",
    });

    expect(result.feedbackType).toBe("excellent");
  });

  it("classifies a full pack of noise as full-but-noisy", () => {
    const result = calculatePhaseResult({
      items: level1.items,
      selectedItemIds: ["laptop", "shirt", "rain-jacket"],
      events: level1.events,
      capacity: level1.capacity,
      phaseId: "main",
    });

    expect(result.feedbackType).toBe("full-but-noisy");
  });

  it("classifies leaving useful things behind as missing-context", () => {
    const result = calculatePhaseResult({
      items: level1.items,
      selectedItemIds: ["laptop", "shirt", "sunglasses"],
      events: level1.events,
      capacity: level1.capacity,
      phaseId: "main",
    });

    // Reaches full capacity, but not enough useful mass to have helped the day.
    expect(result.usedSpace).toBe(60);
    expect(result.feedbackType).toBe("missing-context");
  });

  it("keeps the two Level 5 selections independent", () => {
    // The morning pack holds sunglasses; in the evening they are noise.
    const evening = calculatePhaseResult({
      items: [
        { id: "sunglasses", name: "Sunglasses", icon: "🕶️", size: 10, usefulness: 3, usefulnessByPhase: { evening: 0 } },
        { id: "poncho", name: "Poncho", icon: "🌧️", size: 8, usefulness: 1, usefulnessByPhase: { evening: 3 } },
      ],
      selectedItemIds: ["sunglasses", "poncho"],
      events: [],
      capacity: 60,
      phaseId: "evening",
    });

    // 8 useful / 18 used = 44%. Sunglasses must not count as useful here.
    expect(evening.usefulCapacity).toBe(44);
  });
});
