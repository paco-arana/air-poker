import type { Rank } from "../card";

export function rankHi(r: Rank): number {
  return r === 1 ? 14 : r; // Ace high
}
