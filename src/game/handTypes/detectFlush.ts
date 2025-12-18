// src/game/handTypes/detectFlush.ts
import type { HandAnalysis } from "./analyze";

export function detectFlush(a: HandAnalysis): number[] | null {
  if (!a.isFlush) return null;
  // high-card style tiebreak: ranks desc
  return [...a.uniqueRanksDesc];
}
