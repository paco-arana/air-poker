// src/game/engine.ts
import type { Card } from "./card";
import type { Hand } from "./hand";
import { removeCardsBestEffort } from "./deck";
import { validateHandSubmission } from "./validate";
import { compareHands, scoreHand } from "./handTypes";
import type { TargetCard } from "./targets";
import { dealMangaMetalCards } from "./targets";

export type PlayerId = "player" | "npc";

export interface Submission {
  targetSum: number;
  hand: Hand;
}

export interface PlayerRoundOutcome {
  targetSum: number;
  valid: boolean;
  bust: boolean; // true if used burnt/unavailable card (instant loss condition)
  reason?: string;
  handCategory?: string;
}

export interface RoundResult {
  round: number;
  player: PlayerRoundOutcome;
  npc: PlayerRoundOutcome;
  winner: PlayerId | "tie";
  winReason: "bust" | "invalid" | "hand-rank" | "tie";
}

export interface GameState {
  round: number;
  maxRounds: number;
  deck: Card[];

  playerScore: number;
  npcScore: number;

  // NEW: 5 dealt metal cards each (consumed one per round)
  playerMetal: TargetCard[];
  npcMetal: TargetCard[];

  // Keep history without storing exact cards (memory game!)
  history: RoundResult[];
}

export function createInitialGameState(
  maxRounds: number = 5,
  rng: () => number = Math.random
): GameState {
  const deal = dealMangaMetalCards(rng);

  return {
    round: 1,
    maxRounds,

    deck: deal.deck,

    playerScore: 0,
    npcScore: 0,

    playerMetal: deal.player,
    npcMetal: deal.npc,

    history: [],
  };
}

export function resolveRound(params: {
  state: GameState;
  player: Submission;
  npc: Submission;
}): { result: RoundResult; nextState: GameState } {
  const { state, player, npc } = params;

  // Validate both hands against current deck
  const pv = validateHandSubmission({
    hand: player.hand,
    targetSum: player.targetSum,
    remainingDeck: state.deck,
  });

  const nv = validateHandSubmission({
    hand: npc.hand,
    targetSum: npc.targetSum,
    remainingDeck: state.deck,
  });

  const playerBust = !pv.ok && pv.reason === "burnt-card";
  const npcBust = !nv.ok && nv.reason === "burnt-card";

  const playerValid = pv.ok;
  const npcValid = nv.ok;

  function safeCategory(hand: Hand): string | undefined {
    if (hand.cards.length !== 5) return undefined;
    return scoreHand(hand).category;
  }

  const playerOutcome: PlayerRoundOutcome = {
    targetSum: player.targetSum,
    valid: playerValid,
    bust: playerBust,
    reason: pv.ok ? undefined : pv.message,
    handCategory: safeCategory(player.hand),
  };

  const npcOutcome: PlayerRoundOutcome = {
    targetSum: npc.targetSum,
    valid: npcValid,
    bust: npcBust,
    reason: nv.ok ? undefined : nv.message,
    handCategory: safeCategory(npc.hand),
  };

  // Decide winner
  let winner: RoundResult["winner"] = "tie";
  let winReason: RoundResult["winReason"] = "tie";

  // Bust beats everything (instant loss that round)
  if (playerBust && !npcBust) {
    winner = "npc";
    winReason = "bust";
  } else if (npcBust && !playerBust) {
    winner = "player";
    winReason = "bust";
  } else if (playerBust && npcBust) {
    winner = "tie";
    winReason = "tie";
  } else {
    // No busts; handle other invalids (sum mismatch, wrong size, duplicates)
    if (!playerValid && npcValid) {
      winner = "npc";
      winReason = "invalid";
    } else if (!npcValid && playerValid) {
      winner = "player";
      winReason = "invalid";
    } else if (!playerValid && !npcValid) {
      winner = "tie";
      winReason = "tie";
    } else {
      // Both valid: compare poker strength
      const cmp = compareHands(player.hand, npc.hand);
      if (cmp === 1) {
        winner = "player";
        winReason = "hand-rank";
      } else if (cmp === -1) {
        winner = "npc";
        winReason = "hand-rank";
      } else {
        winner = "tie";
        winReason = "tie";
      }
    }
  }

  // Burn cards for the round:
  // Overlapping cards are allowed and should only burn once.
  // Also: even invalid hands should burn any cards that were actually available.
  const roundAttemptedCards = [...player.hand.cards, ...npc.hand.cards];
  const nextDeck = removeCardsBestEffort(state.deck, roundAttemptedCards);

  // Update scores
  let playerScore = state.playerScore;
  let npcScore = state.npcScore;
  if (winner === "player") playerScore += 1;
  if (winner === "npc") npcScore += 1;

  const result: RoundResult = {
    round: state.round,
    player: playerOutcome,
    npc: npcOutcome,
    winner,
    winReason,
  };

  const nextRound = state.round + 1;

  const nextState: GameState = {
    ...state,
    round: nextRound,
    deck: nextDeck,
    playerScore,
    npcScore,
    history: [...state.history, result],
  };

  return { result, nextState };
}

export function isGameOver(state: GameState): boolean {
  return state.round > state.maxRounds;
}
