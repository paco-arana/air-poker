import type { Card, Rank, Suit } from "../card";
import type { RankPattern } from "./patterns";

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

function countRanks(pattern: RankPattern): Map<Rank, number> {
  const m = new Map<Rank, number>();
  for (const r of pattern) m.set(r, (m.get(r) ?? 0) + 1);
  return m;
}

function isCard<T>(x: T | null | undefined): x is T {
  return x != null;
}

export function isPatternFeasible(
  pattern: RankPattern,
  remainingDeck: readonly Card[]
): boolean {
  const need = countRanks(pattern);

  const have = new Map<Rank, number>();
  for (const c of remainingDeck) have.set(c.rank, (have.get(c.rank) ?? 0) + 1);

  for (const [r, n] of need) {
    if ((have.get(r) ?? 0) < n) return false;
  }
  return true;
}

export function materializePatternRandom(
  pattern: RankPattern,
  remainingDeck: readonly Card[],
  rng: () => number = Math.random
): Card[] | null {
  if (!isPatternFeasible(pattern, remainingDeck)) return null;

  const byRank = new Map<Rank, Card[]>();
  for (const c of remainingDeck) {
    const arr = byRank.get(c.rank) ?? [];
    arr.push(c);
    byRank.set(c.rank, arr);
  }

  const need = countRanks(pattern);
  const chosen: Card[] = [];

  for (const [rank, n] of need) {
    const options = [...(byRank.get(rank) ?? [])];
    shuffleInPlace(options, rng);
    chosen.push(...options.slice(0, n));
  }

  return chosen.length === 5 ? chosen : null;
}

function shuffleInPlace<T>(arr: T[], rng: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function isStraightRanks(ranksDistinct: Rank[]): boolean {
  const rs = [...ranksDistinct].sort((a, b) => a - b);

  // A-2-3-4-5
  if (
    rs.length === 5 &&
    rs[0] === 1 &&
    rs[1] === 2 &&
    rs[2] === 3 &&
    rs[3] === 4 &&
    rs[4] === 5
  ) {
    return true;
  }

  // 10-J-Q-K-A  (sorted: [1,10,11,12,13])
  if (
    rs.length === 5 &&
    rs[0] === 1 &&
    rs[1] === 10 &&
    rs[2] === 11 &&
    rs[3] === 12 &&
    rs[4] === 13
  ) {
    return true;
  }

  // normal consecutive
  for (let i = 1; i < rs.length; i++) {
    if (rs[i] !== rs[i - 1] + 1) return false;
  }
  return true;
}

function buildIndexes(remainingDeck: readonly Card[]) {
  const byRank = new Map<Rank, Card[]>();
  const bySuitRank = new Map<Suit, Map<Rank, Card>>();

  for (const c of remainingDeck) {
    const arr = byRank.get(c.rank) ?? [];
    arr.push(c);
    byRank.set(c.rank, arr);

    const sr = bySuitRank.get(c.suit) ?? new Map<Rank, Card>();
    sr.set(c.rank, c); // unique by (suit, rank) in a standard deck
    bySuitRank.set(c.suit, sr);
  }

  return { byRank, bySuitRank };
}

/**
 * Deterministic “best” materialization for a given rank-pattern:
 * - if distinct ranks and straight => try straight flush, else straight
 * - if distinct ranks and not straight => try flush, else high card
 * - if duplicates exist => suits can't improve category, just satisfy counts
 */
export function materializePatternBest(
  pattern: RankPattern,
  remainingDeck: readonly Card[]
): Card[] | null {
  if (!isPatternFeasible(pattern, remainingDeck)) return null;

  const need = countRanks(pattern);
  const { byRank, bySuitRank } = buildIndexes(remainingDeck);

  let hasDup = false;
  for (const n of need.values()) {
    if (n > 1) {
      hasDup = true;
      break;
    }
  }

  if (hasDup) {
    const chosen: Card[] = [];
    for (const [rank, n] of need) {
      const options = byRank.get(rank) ?? [];
      if (options.length < n) return null;
      chosen.push(...options.slice(0, n));
    }
    return chosen.length === 5 ? chosen : null;
  }

  const ranks = [...need.keys()];
  const straight = isStraightRanks(ranks);

  if (straight) {
    // straight flush attempt
    for (const s of SUITS) {
      const sr = bySuitRank.get(s);
      if (!sr) continue;
      const cards = ranks.map((r) => sr.get(r)).filter(isCard);
      if (cards.length === 5) return cards;
    }

    // plain straight (any suit)
    const cards = ranks.map((r) => (byRank.get(r) ?? [])[0]).filter(isCard);
    return cards.length === 5 ? cards : null;
  }

  // flush attempt
  for (const s of SUITS) {
    const sr = bySuitRank.get(s);
    if (!sr) continue;
    const cards = ranks.map((r) => sr.get(r)).filter(isCard);
    if (cards.length === 5) return cards;
  }

  // high-card materialization
  const cards = ranks.map((r) => (byRank.get(r) ?? [])[0]).filter(isCard);
  return cards.length === 5 ? cards : null;
}
