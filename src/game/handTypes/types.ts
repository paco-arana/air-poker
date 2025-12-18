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
 * For this project ranks are 1..13 (A..K).
 * We compare ranks normally: higher number = stronger (K=13 strongest).
 */
export function rankStrength(r: Rank): number {
  return r;
}
