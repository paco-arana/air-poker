// src/game/handTypes/detectStraightFlush.ts
import type { HandAnalysis } from "./analyze";

export function detectStraightFlush(a: HandAnalysis): number[] | null {
  if (a.isFlush && a.isStraight && a.straightHigh != null) {
    return [a.straightHigh];
  }
  return null;
}
