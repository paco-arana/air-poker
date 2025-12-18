// src/game/handTypes/detectHighCard.ts
import type { HandAnalysis } from "./analyze";

export function detectHighCard(a: HandAnalysis): number[] {
  return [...a.uniqueRanksDesc];
}
