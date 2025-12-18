// src/ui/FannedHandMetal.tsx
import React from "react";
import type { TargetCard } from "../game/targets";
import { MetalCard } from "./art/MetalCard";

const SLOTS = 5;

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

export function FannedHandMetal(props: {
  slots: Array<TargetCard | null>; // length 5 (holes allowed)
  selectedId?: string | null; // current round selection
  onToggle?: (id: string) => void; // clicking selected card returns it to grid
  disabled?: boolean; // disable all clicks (e.g. revealed)
}) {
  const { slots, selectedId = null, onToggle, disabled = false } = props;

  const fixed = Array.from({ length: SLOTS }, (_, i) => slots[i] ?? null);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${SLOTS}, max-content)`,
        gap: 10,
        justifyContent: "center",
        alignItems: "start",
        paddingBottom: 12,
      }}>
      {fixed.map((card, i) => {
        const isActive = !!card && selectedId === card.id;
        const hasCard = !!card;

        // Bright only for the active card of THIS round (and only if not disabled)
        const outlinedActive = !disabled && isActive;

        // Only active card is clickable to "return to grid"
        const clickable = hasCard && !!onToggle && !disabled && isActive;

        return (
          <div
            key={card?.id ?? `empty-${i}`}
            style={frameStyle(outlinedActive)}>
            {card ? (
              <MetalCard
                sum={card.sum}
                selected={isActive}
                disabled={!clickable}
                onClick={clickable ? () => onToggle(card.id) : undefined}
              />
            ) : (
              // Placeholder keeps the footprint; wrapper provides the outline
              <div aria-hidden className="h-[3.6em] aspect-[5/7] rounded-lg" />
            )}
          </div>
        );
      })}
    </div>
  );
}
