// src/game/handTypes/detectFourKind.ts
import type { HandAnalysis } from "./analyze";

export function detectFourKind(a: HandAnalysis): number[] | null {
  // groupsDesc like [{count:4, rank:X}, {count:1, rank:Y}]
  if (a.groupsDesc[0]?.count === 4) {
    const quad = a.groupsDesc[0].rank;
    const kicker = a.groupsDesc[1].rank;
    return [quad, kicker];
  }
  return null;
}
