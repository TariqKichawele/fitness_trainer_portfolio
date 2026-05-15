import { spotsBarFillClass } from "@/lib/sessions/spots-bar";

type SpotsBarProps = {
  spotsLeft: number;
  maxSlots: number;
  spotsTaken: number;
  compact?: boolean;
};

export function SpotsBar({
  spotsLeft,
  maxSlots,
  spotsTaken,
  compact = false,
}: SpotsBarProps) {
  const pctLeft = maxSlots > 0 ? spotsLeft / maxSlots : 0;
  const fillPct = Math.round(pctLeft * 100);
  const fillClass = spotsBarFillClass(pctLeft);

  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      <div
        className={`flex items-baseline justify-between gap-2 text-muted ${compact ? "text-[10px]" : "text-xs"}`}
      >
        <span>
          <span className="font-medium text-foreground">{spotsLeft}</span> of{" "}
          {maxSlots} spots left
        </span>
        <span className="shrink-0 tabular-nums opacity-80">
          {spotsTaken} booked
        </span>
      </div>
      <div
        className={`mt-1.5 w-full overflow-hidden rounded-full bg-foreground/10 ${compact ? "h-1.5" : "h-2.5"}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={maxSlots}
        aria-valuenow={spotsLeft}
        aria-label={`${spotsLeft} of ${maxSlots} spots remaining`}
      >
        <div
          className={`h-full rounded-full transition-all ${fillClass}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
    </div>
  );
}
