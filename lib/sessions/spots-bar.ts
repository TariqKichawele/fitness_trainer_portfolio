export function spotsBarFillClass(pctLeft: number): string {
  if (pctLeft <= 0.15) return "bg-rose-500";
  if (pctLeft <= 0.35) return "bg-amber-500";
  return "bg-accent";
}
