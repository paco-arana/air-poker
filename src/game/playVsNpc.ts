// src/game/playVsNpc.ts
import type { Hand } from "./hand";
import type { GameState } from "./engine";
import { resolveRound } from "./engine";
import { npcSmartBest } from "./handPatterns/npc";

/**
 * Convenience wrapper:
 * - NPC generates a hand based on the remaining deck
 * - engine resolves the round and burns cards
 */
export function playRoundVsNpc(params: {
  state: GameState;
  playerTargetSum: number;
  playerHand: Hand;
  npcTargetSum: number;
  rng?: () => number;
}): ReturnType<typeof resolveRound> & { npcHand: Hand } {
  const { state, playerTargetSum, playerHand, npcTargetSum, rng } = params;

  const npcHand = npcSmartBest({
    targetSum: npcTargetSum,
    remainingDeck: state.deck,
    rng,
  });

  const out = resolveRound({
    state,
    player: { targetSum: playerTargetSum, hand: playerHand },
    npc: { targetSum: npcTargetSum, hand: npcHand },
  });

  return { ...out, npcHand };
}
