// src/game/handTypes/detectTrips.ts
import type { HandAnalysis } from "./analyze";

export function detectTrips(a: HandAnalysis): number[] | null {
  if (a.groupsDesc[0]?.count === 3 && a.groupsDesc.length === 3) {
    const trips = a.groupsDesc[0].rank;
    const kickers = a.groupsDesc
      .slice(1)
      .map((g) => g.rank)
      .sort((x, y) => y - x);
    return [trips, ...kickers];
  }
  return null;
}
