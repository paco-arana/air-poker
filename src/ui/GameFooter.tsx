// src/ui/GameFooter.tsx
import { useEffect, useMemo, useState } from "react";
import type { Card } from "../game/card";
import type { Hand } from "../game/hand";
import type { TargetCard } from "../game/targets";
import { FannedHand } from "./FannedHand";
import { FannedHandMetal } from "./FannedHandMetal";

type Phase = "pick-metal" | "build-hand" | "revealed";

const METAL_SLOTS = 5;
const EMPTY_SLOTS = Array.from(
  { length: METAL_SLOTS },
  () => null
) as Array<TargetCard | null>;

export function GameFooter(props: {
  revealed: boolean;

  phase: Phase;
  playerMetal: TargetCard[];
  selectedPlayerMetalId: string | null;

  onSelectPlayerMetal: (id: string | null) => void;

  onClearSelection: () => void;

  playerTarget: number;
  selectedCards: Card[];
  locked: boolean;
  onSubmit: () => void;
  onToggleCard: (card: Card) => void;

  lastResult: any;
  lastPlayerHand: Hand | null;
  onNextRound: () => void;
}) {
  const {
    revealed,
    phase,
    playerMetal,
    selectedPlayerMetalId,
    onSelectPlayerMetal,
    onClearSelection,
    playerTarget,
    selectedCards,
    locked,
    onSubmit,
    onToggleCard,
    lastResult,
    lastPlayerHand,
    onNextRound,
  } = props;

  // ✅ start EMPTY: outlines only
  const [metalSlots, setMetalSlots] = useState<Array<TargetCard | null>>(() =>
    EMPTY_SLOTS.slice()
  );

  const selectedMetal = useMemo(() => {
    if (!selectedPlayerMetalId) return null;
    return playerMetal.find((m) => m.id === selectedPlayerMetalId) ?? null;
  }, [playerMetal, selectedPlayerMetalId]);

  // ✅ when a target is selected, ADD it to the next empty slot (left -> right)
  useEffect(() => {
    if (!selectedMetal) return;

    setMetalSlots((prev) => {
      // already in slots? do nothing
      if (prev.some((s) => s?.id === selectedMetal.id)) return prev;

      const i = prev.findIndex((s) => s === null);
      if (i === -1) return prev; // full

      const next = prev.slice();
      next[i] = selectedMetal;
      return next;
    });
  }, [selectedMetal]);

  const cardsForSum = revealed
    ? lastPlayerHand?.cards ?? []
    : selectedCards ?? [];

  const currentSum = useMemo(() => {
    return cardsForSum.reduce((acc, c) => acc + c.rank, 0);
  }, [cardsForSum]);

  const targetLabel = playerTarget > 0 ? String(playerTarget) : "--";
  const away = playerTarget > 0 ? Math.max(0, playerTarget - currentSum) : null;

  const canSubmit =
    !locked && phase === "build-hand" && selectedCards.length === 5;

  const hint =
    phase === "pick-metal"
      ? "Pick a target"
      : phase === "build-hand"
      ? "Build a 5-card hand"
      : "Revealed";

  const outcomeText =
    lastResult?.winner === "player"
      ? "You win"
      : lastResult?.winner === "npc"
      ? "You lose"
      : lastResult?.winner
      ? "Tie"
      : null;

  const handType = lastResult?.player?.handCategory ?? "invalid";
  const lossReason = lastResult?.player?.reason ?? "";

  return (
    <div className="pt-3 h-full min-h-0">
      <div
        className={[
          "h-full min-h-0",
          "rounded-xl border border-white/10 bg-black/40",
          "px-4 py-3",
          "grid grid-cols-12 gap-4 items-center",
        ].join(" ")}>
        {/* LEFT */}
        <div className="col-span-3 flex flex-col gap-2 min-h-0">
          <div className="w-fit text-xs text-zinc-300 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            {hint}
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-zinc-300">
            <div className="text-zinc-400">Target</div>
            <div className="text-white font-semibold tabular-nums">
              {targetLabel}
            </div>

            <div className="text-zinc-400">Current</div>
            <div className="text-white font-semibold tabular-nums">
              {currentSum}
            </div>

            <div className="text-zinc-400">Away</div>
            <div className="text-zinc-200 tabular-nums">
              {away === null ? "--" : away}
            </div>
          </div>

          {phase === "build-hand" ? (
            <button
              className="w-fit text-sm text-zinc-300 hover:text-white transition disabled:opacity-50"
              onClick={onClearSelection}
              disabled={locked}>
              Clear selection
            </button>
          ) : null}
        </div>

        {/* METAL */}
        <div className="col-span-3 min-h-0 grid grid-rows-[1fr_auto] justify-items-center">
          <div className="min-h-0 flex items-center">
            <FannedHandMetal
              slots={metalSlots}
              selectedId={selectedPlayerMetalId}
              disabled={revealed}
              onToggle={(id) => {
                // only allow returning the CURRENT selected target
                if (revealed) return;
                if (id !== selectedPlayerMetalId) return;

                // remove it from the history slots (so it's "back in the grid")
                setMetalSlots((prev) => {
                  const next = prev.slice();
                  const idx = next.findIndex((s) => s?.id === id);
                  if (idx !== -1) next[idx] = null;
                  return next;
                });

                onSelectPlayerMetal(null);
              }}
            />
          </div>

          <div className="w-fit whitespace-nowrap text-xs text-zinc-400">
            {selectedPlayerMetalId ? "Target selected" : "Select a target sum"}
          </div>
        </div>

        {/* HAND */}
        <div className="col-span-3 min-h-0 grid grid-rows-[1fr_auto] justify-items-center">
          <div className="min-h-0 flex items-center">
            {!revealed ? (
              <FannedHand
                cards={selectedCards}
                disabled={locked || phase !== "build-hand"}
                onToggle={onToggleCard}
              />
            ) : lastPlayerHand ? (
              <FannedHand cards={lastPlayerHand.cards} disabled />
            ) : (
              <pre>(none)</pre>
            )}
          </div>

          {!revealed ? (
            <div className="w-fit whitespace-nowrap text-xs text-zinc-400">
              {selectedCards.length}/5 selected
            </div>
          ) : (
            <div className="w-fit whitespace-nowrap text-xs text-zinc-400">
              You played a {handType}
            </div>
          )}
        </div>

        {/* ACTION */}
        <div className="col-span-3 flex flex-col items-end justify-end gap-2 min-h-0">
          {!revealed ? (
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className={[
                "px-6 py-3",
                "font-semibold",
                "border border-white/10",
                "bg-white text-black",
                "hover:bg-zinc-100 active:translate-y-[1px] transition",
                "disabled:opacity-40 disabled:hover:bg-white disabled:active:translate-y-0",
              ].join(" ")}>
              Submit
            </button>
          ) : (
            <>
              {lossReason ? (
                <div className="text-sm text-zinc-300">{lossReason}</div>
              ) : null}
              {outcomeText ? (
                <div className="text-lg font-bold text-white">
                  {outcomeText}
                </div>
              ) : null}

              <button
                onClick={() => {
                  onSelectPlayerMetal(null);
                  onNextRound();
                }}
                className={[
                  "px-5 py-2 rounded-lg",
                  "font-semibold text-white",
                  "border border-white/15 bg-white/5",
                  "hover:bg-white/10 active:translate-y-[1px] transition",
                ].join(" ")}>
                Next round
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
