// src/game/handTypes/scoreHand.ts
import type { Hand } from "../hand";
import { analyze } from "./analyze";
import type { HandCategory, HandScore } from "./types";
import { CATEGORY_RANK } from "./types";

import { detectStraightFlush } from "./detectStraightFlush";
import { detectFourKind } from "./detectFourKind";
import { detectFullHouse } from "./detectFullHouse";
import { detectFlush } from "./detectFlush";
import { detectStraight } from "./detectStraight";
import { detectTrips } from "./detectTrips";
import { detectTwoPair } from "./detectTwoPair";
import { detectPair } from "./detectPair";
import { detectHighCard } from "./detectHighCard";

export function scoreHand(hand: Hand): HandScore {
  const a = analyze(hand.cards);

  const checks: Array<
    [HandCategory, (a: ReturnType<typeof analyze>) => number[] | null]
  > = [
    ["straight-flush", detectStraightFlush],
    ["four-of-a-kind", detectFourKind],
    ["full-house", detectFullHouse],
    ["flush", detectFlush],
    ["straight", detectStraight],
    ["three-of-a-kind", detectTrips],
    ["two-pair", detectTwoPair],
    ["one-pair", detectPair],
  ];

  for (const [category, fn] of checks) {
    const tiebreak = fn(a);
    if (tiebreak) {
      return { category, categoryRank: CATEGORY_RANK[category], tiebreak };
    }
  }

  // always exists
  return {
    category: "high-card",
    categoryRank: CATEGORY_RANK["high-card"],
    tiebreak: detectHighCard(a),
  };
}
