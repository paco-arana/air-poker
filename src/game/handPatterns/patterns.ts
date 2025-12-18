import type { Rank } from "../card";

export type RankPattern = readonly [Rank, Rank, Rank, Rank, Rank];
export type PatternsBySum = ReadonlyMap<number, RankPattern[]>;

const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function generatePatternsBySum(): PatternsBySum {
  const map = new Map<number, RankPattern[]>();

  for (let a = 0; a < RANKS.length; a++) {
    for (let b = a; b < RANKS.length; b++) {
      for (let c = b; c < RANKS.length; c++) {
        for (let d = c; d < RANKS.length; d++) {
          for (let e = d; e < RANKS.length; e++) {
            const p = [
              RANKS[a],
              RANKS[b],
              RANKS[c],
              RANKS[d],
              RANKS[e],
            ] as const;

            // disallow 5-of-a-kind (impossible in a 52-card deck)
            if (p[0] === p[4]) continue;

            const sum = p[0] + p[1] + p[2] + p[3] + p[4];
            const arr = map.get(sum) ?? [];
            arr.push(p);
            map.set(sum, arr);
          }
        }
      }
    }
  }

  return map;
}
