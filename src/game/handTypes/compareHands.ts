// src/game/handTypes/compareHands.ts
import type { Hand } from "../hand";
import type { HandScore } from "./types";
import { scoreHand } from "./scoreHand";

/**
 * Returns:
 *  1 if a wins
 *  0 if tie
 * -1 if b wins
 */
export function compareHands(a: Hand, b: Hand): -1 | 0 | 1 {
  const sa = scoreHand(a);
  const sb = scoreHand(b);
  return compareScores(sa, sb);
}

export function compareScores(sa: HandScore, sb: HandScore): -1 | 0 | 1 {
  if (sa.categoryRank !== sb.categoryRank) {
    return sa.categoryRank > sb.categoryRank ? 1 : -1;
  }

  const n = Math.max(sa.tiebreak.length, sb.tiebreak.length);
  for (let i = 0; i < n; i++) {
    const av = sa.tiebreak[i] ?? 0;
    const bv = sb.tiebreak[i] ?? 0;
    if (av !== bv) return av > bv ? 1 : -1;
  }

  return 0;
}
