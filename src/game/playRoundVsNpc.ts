// src/game/playVsNpc.ts
import type { Hand } from "./hand";
import type { GameState } from "./engine";
import { resolveRound } from "./engine";
import { npcSmartBest } from "./handPatterns/npc";
import { pickRandomMetal, removeMetalById } from "./targets";

export function playRoundVsNpcDealt(params: {
  state: GameState;
  playerMetalId: string;
  playerHand: Hand;
  rng?: () => number;
}): ReturnType<typeof resolveRound> & {
  npcHand: Hand;
  playerTargetSum: number;
  npcTargetSum: number;
} {
  const { state, playerMetalId, playerHand, rng } = params;
  const R = rng ?? Math.random;

  const playerCard =
    state.playerMetal.find((c) => c.id === playerMetalId) ??
    state.playerMetal[0];

  // If player somehow has none left, just behave safely:
  const playerTargetSum = playerCard?.sum ?? 0;

  const npcCard = pickRandomMetal(state.npcMetal, R);
  const npcTargetSum = npcCard?.sum ?? 0;

  const npcHand = npcSmartBest({
    targetSum: npcTargetSum,
    remainingDeck: state.deck,
    rng: R,
  });

  const out = resolveRound({
    state,
    player: { targetSum: playerTargetSum, hand: playerHand },
    npc: { targetSum: npcTargetSum, hand: npcHand },
  });

  // Consume the chosen metal cards for next state
  const nextState: GameState = {
    ...out.nextState,
    playerMetal: playerCard
      ? removeMetalById(state.playerMetal, playerCard.id)
      : [],
    npcMetal: npcCard
      ? removeMetalById(state.npcMetal, npcCard.id)
      : state.npcMetal,
  };

  return { ...out, nextState, npcHand, playerTargetSum, npcTargetSum };
}
