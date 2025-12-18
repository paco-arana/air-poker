import type { Card } from "../card";
import type { Hand } from "../hand";
import type { HandScore } from "../handTypes/types";
import { pickRandomDistinctCards } from "../deck";
import { generatePatternsBySum } from "./patterns";
import { isPatternFeasible, materializePatternBest } from "./materialize";
import { scoreHand } from "../handTypes/scoreHand";
import { compareScores } from "../handTypes/compareHands";

const PATTERNS_BY_SUM = generatePatternsBySum();

export function npcSmartBest(params: {
  targetSum: number;
  remainingDeck: readonly Card[];
  rng?: () => number;
}): Hand {
  const { targetSum, remainingDeck } = params;
  const rng = params.rng ?? Math.random;

  const patterns = PATTERNS_BY_SUM.get(targetSum) ?? [];
  const feasible = patterns.filter((p) => isPatternFeasible(p, remainingDeck));

  if (feasible.length === 0) {
    return { cards: pickRandomDistinctCards(remainingDeck, 5, rng) };
  }

  let bestScore: HandScore | null = null;
  let bestHands: Hand[] = [];

  for (const p of feasible) {
    const cards = materializePatternBest(p, remainingDeck);
    if (!cards) continue;

    const hand: Hand = { cards };
    const s = scoreHand(hand);

    if (!bestScore) {
      bestScore = s;
      bestHands = [hand];
      continue;
    }

    const cmp = compareScores(s, bestScore);
    if (cmp === 1) {
      bestScore = s;
      bestHands = [hand];
    } else if (cmp === 0) {
      bestHands.push(hand); // optional variety among equals
    }
  }

  if (bestHands.length === 0) {
    return { cards: pickRandomDistinctCards(remainingDeck, 5, rng) };
  }

  return bestHands[Math.floor(rng() * bestHands.length)];
}
