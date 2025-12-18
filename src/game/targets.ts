// src/game/targets.ts
import type { Card } from "./card";
import { rankToValue } from "./card";
import { createFullDeck, shuffleDeck } from "./deck";

export interface TargetCard {
  id: string; // stable identity (handles duplicate sums)
  sum: number; // the number shown on the metal card
}

export interface MangaDeal {
  // PLAY DECK (what the round uses)
  deck: Card[]; // 52 cards in play

  // TARGET / METAL GENERATION DECK (separate from play deck)
  targetUnused: Card[]; // 2 cards set aside from the target deck
  piles: Card[][]; // 10 piles of 5 cards used to generate metal sums (debug/optional)

  player: TargetCard[]; // 5 metal cards
  npc: TargetCard[]; // 5 metal cards
}

/**
 * Manga-style deal:
 * - create & shuffle a TARGET deck (52), set aside 2, partition remaining 50 into 10 piles of 5
 *   - each pile's rank-sum becomes one metal card
 *   - deal 5 metal cards each to player & npc
 *
 * Important: metal generation does NOT consume or affect the play deck.
 */
export function dealMangaMetalCards(
  rng: () => number = Math.random
): MangaDeal {
  const targetFull = createFullDeck();
  const targetShuffled = shuffleDeck(targetFull, rng);
  const targetUnused = targetShuffled.slice(0, 2);
  const targetDeck = targetShuffled.slice(2); // 50

  const piles: Card[][] = [];
  for (let i = 0; i < 10; i++) {
    piles.push(targetDeck.slice(i * 5, i * 5 + 5));
  }

  const metal: TargetCard[] = piles.map((pile, i) => ({
    id: `S${i}`,
    sum: pile.reduce((acc, c) => acc + rankToValue(c.rank), 0),
  }));

  const metalShuffled = shuffleMetal(metal, rng);
  const player = metalShuffled.slice(0, 5).sort((a, b) => a.sum - b.sum);
  const npc = metalShuffled.slice(5, 10);

  // 2) PLAY deck (independent)
  const playFull = createFullDeck();
  const deck = shuffleDeck(playFull, rng);

  return { deck, targetUnused, piles, player, npc };
}

function shuffleMetal(
  xs: readonly TargetCard[],
  rng: () => number
): TargetCard[] {
  const arr = [...xs];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function removeMetalById(
  hand: readonly TargetCard[],
  id: string
): TargetCard[] {
  const i = hand.findIndex((c) => c.id === id);
  if (i === -1) return [...hand];
  return [...hand.slice(0, i), ...hand.slice(i + 1)];
}

export function pickRandomMetal(
  hand: readonly TargetCard[],
  rng: () => number = Math.random
): TargetCard | null {
  if (hand.length === 0) return null;
  const i = Math.floor(rng() * hand.length);
  return hand[i] ?? null;
}
