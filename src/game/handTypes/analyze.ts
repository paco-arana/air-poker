// src/game/handTypes/analyze.ts
import type { Card, Rank, Suit } from "../card";
import { rankStrength } from "./types";

export interface HandAnalysis {
  cards: readonly Card[];

  // ranks and suits
  ranks: Rank[]; // length 5
  suits: Suit[]; // length 5

  // counts
  rankCounts: Map<Rank, number>;
  suitCounts: Map<Suit, number>;

  // derived
  uniqueRanksDesc: number[]; // unique rank strengths sorted high->low
  groupsDesc: Array<{ count: number; rank: number }>; // count desc, then rank desc
  isFlush: boolean;
  isStraight: boolean;
  straightHigh: number | null; // highest rank strength in the straight (A2345 => 5)
}

/**
 * Analyze the 5 cards once; all detectors share this.
 */
export function analyze(cards: readonly Card[]): HandAnalysis {
  const ranks = cards.map((c) => c.rank);
  const suits = cards.map((c) => c.suit);

  const rankCounts = new Map<Rank, number>();
  for (const r of ranks) rankCounts.set(r, (rankCounts.get(r) ?? 0) + 1);

  const suitCounts = new Map<Suit, number>();
  for (const s of suits) suitCounts.set(s, (suitCounts.get(s) ?? 0) + 1);

  const isFlush = Array.from(suitCounts.values()).some((v) => v === 5);

  const uniqueStrengths = Array.from(rankCounts.keys()).map((r) =>
    rankStrength(r)
  );
  uniqueStrengths.sort((a, b) => b - a);
  const uniqueRanksDesc = uniqueStrengths;

  // groups sorted by (count desc, rank desc)
  const groupsDesc = Array.from(rankCounts.entries())
    .map(([r, count]) => ({ count, rank: rankStrength(r) }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);

  const { isStraight, straightHigh } = computeStraight(uniqueStrengths);

  return {
    cards,
    ranks,
    suits,
    rankCounts,
    suitCounts,
    uniqueRanksDesc,
    groupsDesc,
    isFlush,
    isStraight,
    straightHigh,
  };
}

function computeStraight(uniqueStrengths: number[]): {
  isStraight: boolean;
  straightHigh: number | null;
} {
  if (uniqueStrengths.length !== 5)
    return { isStraight: false, straightHigh: null };

  const asc = [...uniqueStrengths].sort((a, b) => a - b);

  // A2345 special case: [1,2,3,4,5] => high=5
  const wheel =
    asc[0] === 1 &&
    asc[1] === 2 &&
    asc[2] === 3 &&
    asc[3] === 4 &&
    asc[4] === 5;
  if (wheel) return { isStraight: true, straightHigh: 5 };

  // Normal consecutive check helper
  const isConsecutive = (arr: number[]) => {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1] + 1) return false;
    }
    return true;
  };

  // Normal straight (no Ace-high remap)
  if (isConsecutive(asc)) {
    return { isStraight: true, straightHigh: asc[4] };
  }

  // Ace-high straight (10-J-Q-K-A): treat Ace(1) as 14 for straight detection
  if (asc[0] === 1) {
    const aceHighAsc = asc.map((v) => (v === 1 ? 14 : v)).sort((a, b) => a - b);

    if (isConsecutive(aceHighAsc)) {
      return { isStraight: true, straightHigh: 14 }; // Broadway is highest straight
    }
  }

  return { isStraight: false, straightHigh: null };
}
