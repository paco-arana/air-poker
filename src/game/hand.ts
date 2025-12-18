// src/game/hand.ts
import type { Card } from "./card";
import { rankToValue } from "./card";
import { cardKey } from "./deck";

export const HAND_SIZE = 5 as const;

export interface Hand {
  cards: Card[]; // should always be length 5 once validated
}

/**
 * Computes the Air Poker sum of a hand (A=1, ..., K=13).
 * Does not validate length; call validateHandBasics first if needed.
 */
export function handSum(hand: Hand): number {
  let total = 0;
  for (const c of hand.cards) total += rankToValue(c.rank);
  return total;
}

/**
 * Basic validation:
 * - must have exactly 5 cards
 * - must not contain duplicate exact cards (same rank+suit)
 *
 * Returns null if OK, otherwise an error string.
 */
export function validateHandBasics(hand: Hand): string | null {
  if (hand.cards.length !== HAND_SIZE) {
    return `Hand must contain exactly ${HAND_SIZE} cards.`;
  }

  const seen = new Set<string>();
  for (const c of hand.cards) {
    const k = cardKey(c);
    if (seen.has(k)) return `Duplicate card detected: ${k}`;
    seen.add(k);
  }

  return null;
}

/**
 * Convenience: validates basics + checks sum matches target.
 * Returns null if OK, otherwise an error string.
 */
export function validateHandForTargetSum(
  hand: Hand,
  targetSum: number
): string | null {
  const basicErr = validateHandBasics(hand);
  if (basicErr) return basicErr;

  const sum = handSum(hand);
  if (sum !== targetSum) {
    return `Your hand adds up to ${sum} but the target is ${targetSum}`;
  }

  return null;
}
