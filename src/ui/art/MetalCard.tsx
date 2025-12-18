// src/ui/art/MetalCard.tsx

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function MetalCard(props: {
  sum: number;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const { sum, selected = false, disabled = false, onClick } = props;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        // ✅ match PlayingCard sizing/spacing/behavior
        "h-[3.6em] aspect-[5/7] p-2",
        "grid place-items-center",
        "text-white",
        "transition-transform duration-300",
        !disabled && "hover:-translate-y-[5px] active:translate-y-0"
      )}
      style={{
        // ✅ match disabled/blank playing card background
        backgroundColor: "#6B7280",
      }}>
      <span
        className={cn(
          "w-[2ch] text-center text-[20px] font-semibold tabular-nums leading-none",
          disabled && "opacity-50"
        )}>
        {sum}
      </span>
    </button>
  );
}
