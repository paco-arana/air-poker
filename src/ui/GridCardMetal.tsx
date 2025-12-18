// GridCardMetal.tsx
import { useRef } from "react";
import type { TargetCard } from "../game/targets";
import { MetalCard } from "./art/MetalCard";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function GridCardMetal(props: {
  enabled: boolean;
  cards: TargetCard[]; // may shrink over time as cards are used
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { enabled, cards, selectedId, onSelect } = props;

  // ✅ Capture the initial order ONCE, so "holes" persist when cards disappear.
  const orderRef = useRef<string[] | null>(null);
  if (orderRef.current === null) {
    orderRef.current = cards.map((c) => c.id);
  }

  // If a new id ever appears (edge case), append it (keeps stable order)
  for (const c of cards) {
    if (!orderRef.current.includes(c.id)) orderRef.current.push(c.id);
  }

  const slots = orderRef.current.map(
    (id) => cards.find((c) => c.id === id) ?? null
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.max(
          slots.length,
          1
        )}, max-content)`,
        gap: 10,
        justifyContent: "center",
        alignItems: "start",
      }}>
      {slots.map((c, i) => {
        // ✅ Permanent hole (used-up / missing card)
        if (!c) {
          return (
            <div
              key={`empty-${orderRef.current![i]}`}
              aria-hidden
              className="h-[3.6em] aspect-[5/7] p-2"
              style={{ pointerEvents: "none" }}
            />
          );
        }

        const isSelected = c.id === selectedId;

        // hide whenever selected (so it stays out during build-hand too)
        const hideInGrid = isSelected;

        // clickable only during pick-metal + not already selected
        const clickable = enabled && !isSelected;

        return (
          <div
            key={c.id}
            className={cn(
              "transition-opacity duration-300",
              hideInGrid && "opacity-0 pointer-events-none"
            )}>
            <MetalCard
              sum={c.sum}
              selected={isSelected}
              disabled={!clickable}
              onClick={clickable ? () => onSelect(c.id) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
