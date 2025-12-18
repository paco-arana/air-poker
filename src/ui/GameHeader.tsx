// src/ui/GameHeader.tsx
import type { Hand } from "../game/hand";
import { FannedHand } from "./FannedHand";

export function GameHeader(props: {
  round: number;
  maxRounds: number;
  playerScore: number;
  npcScore: number;
  deckRemaining: number;
  npcTargetLabel: string;
  playerTarget: number;

  revealed: boolean;
  lastNpcHand: Hand | null;
  lastResult: any;
}) {
  const {
    round,
    maxRounds,
    playerScore,
    npcScore,
    deckRemaining,
    npcTargetLabel,
    playerTarget,
    revealed,
    lastNpcHand,
    lastResult,
  } = props;

  const npcHandType = lastResult?.npc?.handCategory ?? "invalid";

  return (
    <div className="pb-3 border-b border-zinc-700 grid grid-cols-12 gap-3 items-stretch min-h-0">
      {/* LEFT: info */}
      <div className="col-span-4 flex flex-col justify-start items-start min-h-0">
        <div className="tracking-widest font-semibold mb-2">
          AIR POKER (ASCII)
        </div>

        <div className="text-sm text-zinc-400 space-y-1">
          <div>
            <span className="opacity-80">Round:</span> {round} / {maxRounds}
          </div>
          <div>
            <span className="opacity-80">Score:</span> You {playerScore} -{" "}
            {npcScore} NPC
          </div>
          <div>
            <span className="opacity-80">Deck remaining:</span> {deckRemaining}
          </div>

          <div className="pt-2 text-zinc-300">
            <div>
              <span className="opacity-80">NPC target:</span> {npcTargetLabel}
            </div>
            <div>
              <span className="opacity-80">Your target:</span> {playerTarget}
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE: reveal (same structure as footer) */}
      <div className="col-span-4 min-h-0 grid grid-rows-[1fr_auto] justify-items-center">
        <div className="min-h-0 flex items-center">
          {revealed && lastNpcHand ? (
            <FannedHand cards={lastNpcHand.cards} disabled={true} />
          ) : (
            <div className="h-[110px]" /> // reserves space without growing
          )}
        </div>

        <div className="w-fit whitespace-nowrap text-zinc-400">
          {revealed ? (
            <>
              Fukurou played a{" "}
              <span className="text-zinc-200 font-semibold">{npcHandType}</span>
            </>
          ) : (
            <span className="opacity-0">placeholder</span> // keeps row height stable
          )}
        </div>
      </div>

      {/* RIGHT: empty for now */}
      <div className="col-span-4" />
    </div>
  );
}
