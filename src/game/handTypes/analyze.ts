// src/game/handTypes/analyze.ts
import type { Card, Rank, Suit } from "../card";
import { rankStrength } from "./types";

export interface HandAnalysis {
  cards: readonly Card[];

  // ranks and suits
  ranks: Rank[];
  suits: Suit[];

  // counts
  rankCounts: Map<Rank, number>;
  suitCounts: Map<Suit, number>;

  // derived
  uniqueRanksDesc: number[];
  groupsDesc: Array<{ count: number; rank: number }>;
  isFlush: boolean;
  isStraight: boolean;
  straightHigh: number | null; // A2345 => 5, TJQKA => 14
}

export function analyze(cards: readonly Card[]): HandAnalysis {
  const ranks = cards.map((c) => c.rank);
  const suits = cards.map((c) => c.suit);

  const rankCounts = new Map<Rank, number>();
  for (const r of ranks) rankCounts.set(r, (rankCounts.get(r) ?? 0) + 1);

  const suitCounts = new Map<Suit, number>();
  for (const s of suits) suitCounts.set(s, (suitCounts.get(s) ?? 0) + 1);

  const isFlush = Array.from(suitCounts.values()).some((v) => v === 5);

  const uniqueRanks = Array.from(rankCounts.keys()); // RAW ranks (1..13)
  const uniqueStrengths = uniqueRanks.map((r) => rankStrength(r)); // Ace => 14

  uniqueStrengths.sort((a, b) => b - a);
  const uniqueRanksDesc = uniqueStrengths;

  const groupsDesc = Array.from(rankCounts.entries())
    .map(([r, count]) => ({ count, rank: rankStrength(r) })) // Ace => 14
    .sort((a, b) => b.count - a.count || b.rank - a.rank);

  // ✅ IMPORTANT: compute straight using raw ranks, not strengths
  const { isStraight, straightHigh } = computeStraight(uniqueRanks);

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

function computeStraight(uniqueRanks: Rank[]): {
  isStraight: boolean;
  straightHigh: number | null;
} {
  if (uniqueRanks.length !== 5)
    return { isStraight: false, straightHigh: null };

  const asc = [...uniqueRanks].sort((a, b) => a - b); // RAW ranks: Ace=1

  // A2345
  const wheel =
    asc[0] === 1 &&
    asc[1] === 2 &&
    asc[2] === 3 &&
    asc[3] === 4 &&
    asc[4] === 5;
  if (wheel) return { isStraight: true, straightHigh: 5 };

  // TJQKA (10,11,12,13,1) => high is Ace(14)
  const broadway =
    asc[0] === 1 &&
    asc[1] === 10 &&
    asc[2] === 11 &&
    asc[3] === 12 &&
    asc[4] === 13;
  if (broadway) return { isStraight: true, straightHigh: 14 };

  // Normal consecutive (no Ace involved)
  for (let i = 1; i < asc.length; i++) {
    if (asc[i] !== asc[i - 1] + 1) {
      return { isStraight: false, straightHigh: null };
    }
  }

  return { isStraight: true, straightHigh: asc[4] }; // 6-high straight => 6, K-high => 13
}
