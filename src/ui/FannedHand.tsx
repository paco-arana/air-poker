import React from "react";
import type { Card } from "../game/card";
import { PlayingCard } from "./art/PlayingCard";

const SLOTS = 5;

function keyOf(card: Card) {
  return `${card.rank}${card.suit}`;
}

// Copied from GameBoard.tsx
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

export function FannedHand(props: {
  cards: Card[];
  onToggle?: (card: Card) => void;
  disabled?: boolean;
}) {
  const { cards, onToggle, disabled = false } = props;

  const fixed = Array.from({ length: SLOTS }, (_, i) => cards[i] ?? null);

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
        const clickable = !!card && !!onToggle && !disabled;

        return (
          <div
            key={card ? keyOf(card) : `empty-${i}`}
            style={frameStyle(clickable)}>
            {card ? (
              <PlayingCard
                card={card}
                selected={false}
                disabled={disabled}
                onClick={clickable ? () => onToggle(card) : undefined}
              />
            ) : (
              // Placeholder matches your card footprint (same as MetalCard)
              <div aria-hidden className="h-[3.6em] aspect-[5/7] p-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}
