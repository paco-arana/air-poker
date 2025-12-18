// src/game/handTypes/detectPair.ts
import type { HandAnalysis } from "./analyze";

export function detectPair(a: HandAnalysis): number[] | null {
  // counts: 2,1,1,1
  if (a.groupsDesc.length === 4 && a.groupsDesc[0]?.count === 2) {
    const pair = a.groupsDesc[0].rank;
    const kickers = a.groupsDesc
      .slice(1)
      .map((g) => g.rank)
      .sort((x, y) => y - x);
    return [pair, ...kickers];
  }
  return null;
}
