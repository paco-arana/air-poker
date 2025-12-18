// src/game/handTypes/detectTwoPair.ts
import type { HandAnalysis } from "./analyze";

export function detectTwoPair(a: HandAnalysis): number[] | null {
  // counts: 2,2,1
  if (
    a.groupsDesc.length === 3 &&
    a.groupsDesc[0].count === 2 &&
    a.groupsDesc[1].count === 2
  ) {
    const pairHigh = Math.max(a.groupsDesc[0].rank, a.groupsDesc[1].rank);
    const pairLow = Math.min(a.groupsDesc[0].rank, a.groupsDesc[1].rank);
    const kicker = a.groupsDesc[2].rank;
    return [pairHigh, pairLow, kicker];
  }
  return null;
}
