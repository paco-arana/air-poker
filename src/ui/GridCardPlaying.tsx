import { useMemo } from "react";
import type { Card, Rank, Suit } from "../game/card";
import { PlayingCard } from "./art/PlayingCard";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const SUITS: Suit[] = ["♠", "♥", "♣", "♦"];
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function keyOf(card: Card) {
  return `${card.rank}${card.suit}`;
}

export function GridCardPlaying(props: {
  enabled: boolean;
  selectedKeys: Set<string>;
  onToggle: (card: Card) => void;
}) {
  const { enabled, selectedKeys, onToggle } = props;

  const cards = useMemo(() => {
    return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })));
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${RANKS.length}, max-content)`,
        columnGap: 10,
        rowGap: 10,
        alignItems: "start",
      }}>
      {cards.map((card) => {
        const k = keyOf(card);
        const isSelected = selectedKeys.has(k);

        // only “hide from grid” while selecting (enabled=true)
        const hideInGrid = enabled && isSelected;

        // clickable only during selection + not already selected
        const clickable = enabled && !isSelected;

        return (
          <div
            key={k}
            className={cn(
              "transition-opacity duration-300",
              hideInGrid && "opacity-0 pointer-events-none"
            )}>
            <PlayingCard
              card={enabled ? card : undefined}
              selected={isSelected}
              disabled={!clickable}
              onClick={clickable ? () => onToggle(card) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
