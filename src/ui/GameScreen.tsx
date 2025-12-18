// src/ui/GameScreen.tsx
import { useMemo, useState } from "react";
import { createInitialGameState } from "../game/engine";
import type { Hand } from "../game/hand";
import type { Card } from "../game/card";
import { playRoundVsNpcDealt } from "../game/playRoundVsNpc";
import { countRemaining } from "../game/deck";

import { GameHeader } from "./GameHeader";
import { GameBoard } from "./GameBoard";
import { GameFooter } from "./GameFooter";

function keyOf(card: Card) {
  return `${card.rank}${card.suit}`;
}

type Phase = "pick-metal" | "build-hand" | "revealed";

export function GameScreen() {
  // state now includes deck (50), playerMetal (5), npcMetal (5)
  const [state, setState] = useState(() => createInitialGameState(5));

  // 3-phase control
  const [phase, setPhase] = useState<Phase>("pick-metal");
  const revealed = phase === "revealed";

  // Phase 1: which metal card player chose
  const [playerMetalId, setPlayerMetalId] = useState<string | null>(null);

  // Phase 3 reveal info
  const [lastNpcHand, setLastNpcHand] = useState<Hand | null>(null);
  const [lastPlayerHand, setLastPlayerHand] = useState<Hand | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [lastNpcTargetSum, setLastNpcTargetSum] = useState<number | null>(null);

  // Phase 2: selected playing cards
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const selectedKeys = useMemo(() => {
    const s = new Set<string>();
    for (const c of selectedCards) s.add(keyOf(c));
    return s;
  }, [selectedCards]);

  const currentPlayerTargetSum = useMemo(() => {
    if (!playerMetalId) return null;
    const sc = state.playerMetal.find((c) => c.id === playerMetalId);
    return sc?.sum ?? null;
  }, [playerMetalId, state.playerMetal]);

  function toggleMetal(id: string) {
    if (revealed) return;

    // clicking the fanned card again returns it to the grid
    if (playerMetalId === id) {
      setPlayerMetalId(null);
      setSelectedCards([]);
      setPhase("pick-metal");
      return;
    }

    setPlayerMetalId(id);
    setSelectedCards([]); // start clean for the new target
    setPhase("build-hand");
  }

  function toggleCard(card: Card) {
    if (phase !== "build-hand") return;

    const k = keyOf(card);
    if (selectedKeys.has(k)) {
      setSelectedCards((prev) => prev.filter((c) => keyOf(c) !== k));
      return;
    }
    if (selectedCards.length >= 5) return;
    setSelectedCards((prev) => [...prev, card]);
  }

  function clearSelection() {
    if (phase !== "build-hand") return;
    setSelectedCards([]);
  }

  function submit() {
    if (phase !== "build-hand") return;
    if (!playerMetalId) return;
    if (selectedCards.length !== 5) return;

    const playerHand: Hand = { cards: selectedCards };

    const { result, nextState, npcHand, npcTargetSum } = playRoundVsNpcDealt({
      state,
      playerMetalId,
      playerHand,
    });

    setState(nextState);

    setLastNpcHand(npcHand);
    setLastPlayerHand(playerHand);
    setLastResult(result);
    setLastNpcTargetSum(npcTargetSum);

    setPhase("revealed");
  }

  function nextRound() {
    // clear round UI
    setLastNpcHand(null);
    setLastPlayerHand(null);
    setLastResult(null);
    setLastNpcTargetSum(null);
    setSelectedCards([]);
    setPlayerMetalId(null);
    setPhase("pick-metal");
  }

  // What to show in header before reveal:
  const npcTargetLabel = revealed ? String(lastNpcTargetSum ?? "??") : "??";

  // If you can’t change GameHeader props yet, pass a number (0) when unchosen.
  // Prefer updating GameHeader to accept a label/string instead.
  const playerTargetNumber = currentPlayerTargetSum ?? 0;

  return (
    <div className="h-screen p-4 box-border bg-black text-white font-mono">
      <div className="h-full grid grid-rows-[1fr_auto_1fr] gap-4 border border-zinc-700 p-4 box-border">
        <GameHeader
          round={Math.min(state.round, state.maxRounds)}
          maxRounds={state.maxRounds}
          playerScore={state.playerScore}
          npcScore={state.npcScore}
          deckRemaining={countRemaining(state.deck)}
          npcTargetLabel={npcTargetLabel}
          playerTarget={playerTargetNumber}
          revealed={revealed}
          lastNpcHand={lastNpcHand}
          lastResult={lastResult}

          // ✅ NEW (you’ll likely want these in the header UI)
          // playerMetal={state.playerMetal}
          // onSelectPlayerMetal={selectMetal}
          // phase={phase}
        />

        <GameBoard
          revealed={revealed}
          phase={phase}
          selectedKeys={selectedKeys}
          onToggleCard={toggleCard}
          playerMetal={state.playerMetal}
          selectedPlayerMetalId={playerMetalId}
          onSelectPlayerMetal={toggleMetal} // ✅
        />

        <GameFooter
          revealed={revealed}
          phase={phase}
          playerMetal={state.playerMetal}
          selectedPlayerMetalId={playerMetalId}
          onSelectPlayerMetal={(id) => {
            if (id === null) {
              // clear selection exactly like your toggleMetal does when clicked again
              setPlayerMetalId(null);
              setSelectedCards([]);
              setPhase("pick-metal");
              return;
            }
            toggleMetal(id);
          }}
          onClearSelection={clearSelection}
          playerTarget={playerTargetNumber}
          selectedCards={selectedCards}
          locked={false}
          onSubmit={submit}
          onToggleCard={toggleCard}
          lastResult={lastResult}
          lastPlayerHand={lastPlayerHand}
          onNextRound={nextRound}
        />
      </div>
    </div>
  );
}
