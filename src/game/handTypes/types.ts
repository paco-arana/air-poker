// src/game/handTypes/types.ts
import type { Rank } from "../card";

export type HandCategory =
  | "high-card"
  | "one-pair"
  | "two-pair"
  | "three-of-a-kind"
  | "straight"
  | "flush"
  | "full-house"
  | "four-of-a-kind"
  | "straight-flush";

export interface HandScore {
  category: HandCategory;
  categoryRank: number; // higher is better
  tiebreak: number[]; // lexicographic compare (higher ranks first)
}

/**
 * Category ranks (strongest highest). Keep as numbers for fast compare.
 */
export const CATEGORY_RANK: Record<HandCategory, number> = {
  "high-card": 1,
  "one-pair": 2,
  "two-pair": 3,
  "three-of-a-kind": 4,
  straight: 5,
  flush: 6,
  "full-house": 7,
  "four-of-a-kind": 8,
  "straight-flush": 9,
};

/**
 * Ranks are 1..13 (A..K).
 * For hand comparison tie-breakers, Ace is HIGH (14).
 * (Straights are handled separately in analyze.ts to allow A2345.)
 */
export function rankStrength(r: Rank): number {
  return r === 1 ? 14 : r;
}
