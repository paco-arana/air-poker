// src/game/handTypes/detectFullHouse.ts
import type { HandAnalysis } from "./analyze";

export function detectFullHouse(a: HandAnalysis): number[] | null {
  if (
    a.groupsDesc.length === 2 &&
    a.groupsDesc[0].count === 3 &&
    a.groupsDesc[1].count === 2
  ) {
    return [a.groupsDesc[0].rank, a.groupsDesc[1].rank]; // trips rank, then pair rank
  }
  return null;
}
