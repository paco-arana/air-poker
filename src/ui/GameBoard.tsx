// GameBoard.tsx
import React from "react";
import type { Card } from "../game/card";
import type { TargetCard } from "../game/targets";
import { GridCardPlaying } from "./GridCardPlaying";
import { GridCardMetal } from "./GridCardMetal";

type Phase = "pick-metal" | "build-hand" | "revealed";

function frameStyle(active: boolean): React.CSSProperties {
  return {
    width: "fit-content",
    padding: 6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)",
    transition: "border-color 250ms ease, box-shadow 250ms ease",
    boxShadow: active ? "0 0 0 1px rgba(255,255,255,0.08)" : "none",
  };
}

export function GameBoard(props: {
  revealed: boolean;
  phase: Phase;

  selectedKeys: Set<string>;
  onToggleCard: (card: Card) => void;

  playerMetal: TargetCard[];
  selectedPlayerMetalId: string | null;
  onSelectPlayerMetal: (id: string) => void;
}) {
  const {
    revealed,
    phase,
    selectedKeys,
    onToggleCard,
    playerMetal,
    selectedPlayerMetalId,
    onSelectPlayerMetal,
  } = props;

  const playingEnabled = !revealed && phase === "build-hand";
  const metalEnabled = !revealed && phase === "pick-metal";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "8px 0",
        overflow: "visible",
      }}>
      <div style={frameStyle(playingEnabled)}>
        <GridCardPlaying
          enabled={playingEnabled}
          selectedKeys={selectedKeys}
          onToggle={onToggleCard}
        />
      </div>

      <div style={frameStyle(metalEnabled)}>
        <GridCardMetal
          enabled={metalEnabled}
          cards={playerMetal}
          selectedId={selectedPlayerMetalId}
          onSelect={onSelectPlayerMetal}
        />
      </div>
    </div>
  );
}
