// src/game/card.ts

export type Suit = "♠" | "♦" | "♥" | "♣";

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  rank: Rank;
  suit: Suit;
}

export function rankToValue(rank: Rank): number {
  return rank;
}

export function makeCard(rank: Rank, suit: Suit): Card {
  return { rank, suit };
}
