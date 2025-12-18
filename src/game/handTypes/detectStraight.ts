// src/game/handTypes/detectStraight.ts
import type { HandAnalysis } from "./analyze";

export function detectStraight(a: HandAnalysis): number[] | null {
  if (a.isStraight && a.straightHigh != null) {
    return [a.straightHigh];
  }
  return null;
}
