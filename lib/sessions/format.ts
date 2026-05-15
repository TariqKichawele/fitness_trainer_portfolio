export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function startOfWeekMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfWeekSunday(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 7);
  return end;
}

export function weekdayIndexFromIso(iso: string): number {
  const d = new Date(iso).getDay();
  return d === 0 ? 6 : d - 1;
}

export function formatTimeRange(starts: string, ends: string): string {
  const opts: Intl.DateTimeFormatOptions = { timeStyle: "short" };
  try {
    const s = new Intl.DateTimeFormat(undefined, opts).format(new Date(starts));
    const e = new Intl.DateTimeFormat(undefined, opts).format(new Date(ends));
    return `${s} – ${e}`;
  } catch {
    return starts;
  }
}

export function formatDateHeader(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function durationMinutes(starts: string, ends: string): number {
  try {
    return Math.round(
      (new Date(ends).getTime() - new Date(starts).getTime()) / 60_000,
    );
  } catch {
    return 0;
  }
}

export function uniqueCategoriesFromOccurrences(
  occurrences: { category: string | null }[],
): string[] {
  const set = new Set<string>();
  for (const o of occurrences) {
    if (o.category?.trim()) set.add(o.category.trim());
  }
  return [...set].sort();
}

export function uniqueLocationsFromOccurrences(
  occurrences: { location: string | null }[],
): string[] {
  const set = new Set<string>();
  for (const o of occurrences) {
    if (o.location?.trim()) set.add(o.location.trim());
  }
  return [...set].sort();
}
