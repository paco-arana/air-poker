// src/game/deck.ts
import type { Card, Rank, Suit } from "./card";

export const SUITS: readonly Suit[] = ["♠", "♥", "♦", "♣"] as const;
export const RANKS: readonly Rank[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
] as const;

/**
 * Creates a fresh 52-card deck (not shuffled).
 */
export function createFullDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

/**
 * Stable string key for a card. Useful for Sets/Maps.
 * Example: "1♠" for Ace of spades (Ace is rank 1).
 */
export function cardKey(card: Card): string {
  return `${card.rank}${card.suit}`;
}

/**
 * Fisher–Yates shuffle (returns a NEW array; does not mutate input).
 */
export function shuffleDeck(
  deck: readonly Card[],
  rng: () => number = Math.random
): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Removes specific cards from the deck (returns a NEW array).
 * If any requested card isn't present, returns null (useful for "burnt card" checks).
 */
export function removeCards(
  deck: readonly Card[],
  toRemove: readonly Card[]
): Card[] | null {
  // multiset using keys
  const counts = new Map<string, number>();
  for (const c of deck) {
    const k = cardKey(c);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  for (const c of toRemove) {
    const k = cardKey(c);
    const n = counts.get(k) ?? 0;
    if (n <= 0) return null; // missing card => burnt/invalid
    counts.set(k, n - 1);
  }

  // rebuild deck from counts (preserves original order by scanning original deck)
  const next: Card[] = [];
  for (const c of deck) {
    const k = cardKey(c);
    const n = counts.get(k) ?? 0;
    if (n > 0) {
      next.push(c);
      counts.set(k, n - 1);
    }
  }
  return next;
}

/**
 * True if all cards exist in the deck (i.e., not burnt yet).
 */
export function hasAllCards(
  deck: readonly Card[],
  needed: readonly Card[]
): boolean {
  return removeCards(deck, needed) !== null;
}

/**
 * Removes as many of the requested cards as possible (best-effort).
 * - If a card isn't present (already burnt), it is skipped.
 * - Returns a NEW deck array (never null).
 *
 * Useful when a player submits an invalid hand that includes burnt cards:
 * we still burn any cards that were actually available.
 */
export function removeCardsBestEffort(
  deck: readonly Card[],
  toRemove: readonly Card[]
): Card[] {
  const counts = new Map<string, number>();
  for (const c of deck) {
    const k = cardKey(c);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  // decrement only when available
  for (const c of toRemove) {
    const k = cardKey(c);
    const n = counts.get(k) ?? 0;
    if (n > 0) counts.set(k, n - 1);
  }

  // rebuild deck (preserve order)
  const next: Card[] = [];
  for (const c of deck) {
    const k = cardKey(c);
    const n = counts.get(k) ?? 0;
    if (n > 0) {
      next.push(c);
      counts.set(k, n - 1);
    }
  }
  return next;
}

export function pickRandomDistinctCards(
  deck: readonly Card[],
  count: number,
  rng: () => number = Math.random
): Card[] {
  if (count >= deck.length) return [...deck];

  // partial Fisher–Yates
  const arr = [...deck];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

/**
 * DEBUG: returns how many cards remain in the deck.
 */
export function countRemaining(deck: readonly Card[]): number {
  return deck.length;
}

/**
 * DEBUG: returns a map of cardKey -> count.
 * Useful for sanity-checking duplicates or unexpected burns.
 */
export function deckHistogram(deck: readonly Card[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of deck) {
    const k = cardKey(c);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}
