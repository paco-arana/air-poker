// src/game/validate.ts
import type { Card } from "./card";
import type { Hand } from "./hand";
import { hasAllCards } from "./deck";
import { validateHandBasics, validateHandForTargetSum } from "./hand";

export type HandInvalidReason =
  | "hand-size"
  | "duplicate-card"
  | "sum-mismatch"
  | "burnt-card";

export interface HandValidationResult {
  ok: boolean;
  reason?: HandInvalidReason;
  message?: string;
}

/**
 * Validates a hand for Air Poker rules:
 * 1) exactly 5 cards + no duplicate exact cards
 * 2) sum must match target
 * 3) all cards must still exist in the remaining deck (not burnt)
 */
export function validateHandSubmission(params: {
  hand: Hand;
  targetSum: number;
  remainingDeck: readonly Card[];
}): HandValidationResult {
  const { hand, targetSum, remainingDeck } = params;

  // Step 1 & 2: basics + sum
  const err = validateHandForTargetSum(hand, targetSum);
  if (err) {
    // classify the error into a stable reason code
    if (err.includes("exactly")) {
      return { ok: false, reason: "hand-size", message: err };
    }
    if (err.includes("Duplicate")) {
      return { ok: false, reason: "duplicate-card", message: err };
    }
    if (err.includes("Sum mismatch")) {
      return { ok: false, reason: "sum-mismatch", message: err };
    }
    return { ok: false, message: err };
  }

  // Step 3: burnt card check
  if (!hasAllCards(remainingDeck, hand.cards)) {
    return {
      ok: false,
      reason: "burnt-card",
      message: "Your hand contains a burnt card",
    };
  }

  return { ok: true };
}

/**
 * If you ever need to validate ONLY against the deck (not sum),
 * this helper is useful.
 */
export function validateHandAgainstDeck(params: {
  hand: Hand;
  remainingDeck: readonly Card[];
}): HandValidationResult {
  const { hand, remainingDeck } = params;

  const basicErr = validateHandBasics(hand);
  if (basicErr) {
    if (basicErr.includes("exactly")) {
      return { ok: false, reason: "hand-size", message: basicErr };
    }
    if (basicErr.includes("Duplicate")) {
      return { ok: false, reason: "duplicate-card", message: basicErr };
    }
    return { ok: false, message: basicErr };
  }

  if (!hasAllCards(remainingDeck, hand.cards)) {
    return {
      ok: false,
      reason: "burnt-card",
      message: "Your hand contains a burnt card",
    };
  }

  return { ok: true };
}
