import type { Card } from "../../game/card";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

function suitColor(suit?: string) {
  switch (suit) {
    case "♠":
      return "#403995FF";
    case "♥":
      return "#F03464FF";
    case "♣":
      return "#235955FF";
    case "♦":
      return "#F06B3FFF";
    default:
      return "#6B7280";
  }
}

export function PlayingCard(props: {
  card?: Card;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { card, selected = false, onClick, disabled = false } = props;

  const r = card ? rankLabel(card.rank) : "★";
  const s = card ? card.suit : "";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "h-[3.6em] aspect-[5/7] p-2",
        "grid place-items-center",
        "text-white",
        "transition-transform duration-300",
        !disabled && "hover:-translate-y-[5px] active:translate-y-0"
      )}
      style={{ backgroundColor: suitColor(card?.suit) }}>
      <span
        className={cn(
          "flex flex-col items-center leading-none",
          "transition-opacity duration-200",
          disabled && "opacity-50"
        )}>
        <span className="w-[2ch] text-center text-[20px] font-semibold tabular-nums">
          {r}
        </span>
        {card && <span className="text-[20px]">{s}</span>}
      </span>
    </button>
  );
}
