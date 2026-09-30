import { describe, expect, it } from "vitest";
import { level5 } from "../levels/level5";
import { isDynamicLevel } from "../game.config";
import { calculatePhaseResult, getItemUsefulness } from "../scoring";

/**
 * The load-bearing lesson of Level 5: relevance changes when the task changes
 * (AC-07, decisions note 3).
 */
describe("Level 5 phase-aware usefulness", () => {
  it("is a dynamic level", () => {
    expect(isDynamicLevel(level5)).toBe(true);
  });

  it("rates sunglasses from essential in the morning to noise in the evening", () => {
    const sunglasses = level5.items.find((i) => i.id === "sunglasses")!;
    expect(getItemUsefulness(sunglasses, "morning")).toBe(3);
    expect(getItemUsefulness(sunglasses, "evening")).toBe(0);
  });

  it("rates the poncho the other way round", () => {
    const poncho = level5.items.find((i) => i.id === "poncho")!;
    expect(getItemUsefulness(poncho, "morning")).toBe(0);
    expect(getItemUsefulness(poncho, "evening")).toBe(3);
  });

  it("gives every Level 5 item an explicit score in both phases", () => {
    // Decisions note 3: no item may fall back to its static usefulness in
    // Level 5, because the static value cannot express a change of task.
    for (const item of level5.items) {
      expect(item.usefulnessByPhase?.morning, item.id).toBeDefined();
      expect(item.usefulnessByPhase?.evening, item.id).toBeDefined();
    }
  });
});

describe("Level 5 morning scoring", () => {
  it("scores a good morning pack on morning usefulness, not evening", () => {
    const result = calculatePhaseResult({
      items: level5.items,
      selectedItemIds: ["water", "snack", "sunglasses"],
      events: level5.morningEvents,
      capacity: level5.capacity,
      phaseId: "morning",
    });

    // All three are morning-useful: 40 of 40 space.
    expect(result.dayReadiness).toBe(100);
    expect(result.usefulCapacity).toBe(100);
  });
});

describe("Level 5 evening scoring", () => {
  it("discounts sunglasses that were essential that morning", () => {
    const result = calculatePhaseResult({
      items: level5.items,
      selectedItemIds: ["sunglasses", "poncho"],
      events: [],
      capacity: level5.capacity,
      phaseId: "evening",
    });

    // Only the 8-space poncho counts as useful now: 8/18 = 44%.
    expect(result.usefulCapacity).toBe(44);
  });

  it("rates the compact evening pack as almost entirely useful", () => {
    const result = calculatePhaseResult({
      items: level5.items,
      selectedItemIds: ["poncho", "power-bank", "snack", "water"],
      events: level5.eveningEvents,
      capacity: level5.capacity,
      phaseId: "evening",
    });

    expect(result.dayReadiness).toBe(100);
    expect(result.usefulCapacity).toBe(100);
    expect(result.usedSpace).toBe(58);
  });

  it("keeps the morning score unchanged when the evening pack is different", () => {
    const morningSelection = ["water", "snack", "sunglasses"];
    const eveningSelection = ["poncho", "power-bank"];

    const morning = calculatePhaseResult({
      items: level5.items,
      selectedItemIds: morningSelection,
      events: level5.morningEvents,
      capacity: level5.capacity,
      phaseId: "morning",
    });

    const evening = calculatePhaseResult({
      items: level5.items,
      selectedItemIds: eveningSelection,
      events: level5.eveningEvents,
      capacity: level5.capacity,
      phaseId: "evening",
    });

    // The morning score is not recomputed from the repacked bag: 40/40 stays 100.
    expect(morning.usedSpace).toBe(40);
    expect(morning.usefulCapacity).toBe(100);
    // The evening pack is different: 28 space, and the rain event is satisfied.
    expect(evening.usedSpace).toBe(28);
    expect(evening.successfulEvents).toBe(2);
  });

  it("fails the rain event when the poncho was left in the morning pack", () => {
    const result = calculatePhaseResult({
      items: level5.items,
      // Everything the player sensibly packed for a sunny morning.
      selectedItemIds: ["water", "snack", "sunglasses", "power-bank"],
      events: level5.eveningEvents,
      capacity: level5.capacity,
      phaseId: "evening",
    });

    expect(result.successfulEvents).toBe(2);
    expect(result.totalEvents).toBe(3);
  });
});
