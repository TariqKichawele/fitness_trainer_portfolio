import type { BookingAdminRow } from "@/lib/admin/types";

export const BOOKING_FILTER_STATUSES = [
  "pending",
  "confirmed",
  "cancelled_by_client",
  "cancelled_by_admin",
  "no_show",
  "attended",
] as const;

export const DATE_RANGE_KEYS = [
  "all",
  "today",
  "tomorrow",
  "this_week",
  "next_7",
  "this_month",
] as const;

export type DateRangeKey = (typeof DATE_RANGE_KEYS)[number];

export type ActiveBookingFilters = {
  status: "all" | (typeof BOOKING_FILTER_STATUSES)[number];
  sessionType: "all" | "none" | string;
  range: DateRangeKey;
};

const statusSet = new Set<string>(BOOKING_FILTER_STATUSES);
const rangeSet = new Set<string>(DATE_RANGE_KEYS);

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

export function parseActiveBookingFilters(sp: {
  status?: string;
  type?: string;
  range?: string;
}): ActiveBookingFilters {
  const statusRaw = String(sp.status ?? "").trim();
  const status =
    statusRaw && statusSet.has(statusRaw)
      ? (statusRaw as ActiveBookingFilters["status"])
      : "all";

  const typeRaw = String(sp.type ?? "").trim();
  let sessionType: ActiveBookingFilters["sessionType"] = "all";
  if (typeRaw === "none") sessionType = "none";
  else if (isUuid(typeRaw)) sessionType = typeRaw;

  const rangeRaw = String(sp.range ?? "").trim();
  const range =
    rangeRaw && rangeSet.has(rangeRaw)
      ? (rangeRaw as DateRangeKey)
      : "all";

  return { status, sessionType, range };
}

export function bookingsListPath(f: ActiveBookingFilters): string {
  const q = new URLSearchParams();
  if (f.status !== "all") q.set("status", f.status);
  if (f.sessionType !== "all") q.set("type", f.sessionType);
  if (f.range !== "all") q.set("range", f.range);
  const s = q.toString();
  return s ? `/admin/bookings?${s}` : "/admin/bookings";
}

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Inclusive local-time window for `starts_at` (ISO strings). */
export function getDateRangeBounds(
  range: DateRangeKey,
): { start: Date | null; end: Date | null } {
  const now = new Date();
  if (range === "all") return { start: null, end: null };

  if (range === "today") {
    return { start: startOfLocalDay(now), end: endOfLocalDay(now) };
  }

  if (range === "tomorrow") {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    return { start: startOfLocalDay(t), end: endOfLocalDay(t) };
  }

  if (range === "this_week") {
    const d = new Date(now);
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    const start = startOfLocalDay(monday);
    const sunday = new Date(start);
    sunday.setDate(start.getDate() + 6);
    return { start, end: endOfLocalDay(sunday) };
  }

  if (range === "next_7") {
    const start = startOfLocalDay(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    end.setMilliseconds(end.getMilliseconds() - 1);
    return { start, end };
  }

  if (range === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    return { start, end };
  }

  return { start: null, end: null };
}

function inDateRange(iso: string, start: Date | null, end: Date | null): boolean {
  if (!start && !end) return true;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  if (start && t < start.getTime()) return false;
  if (end && t > end.getTime()) return false;
  return true;
}

export function filterBookings(
  rows: BookingAdminRow[],
  f: ActiveBookingFilters,
): BookingAdminRow[] {
  const { start, end } = getDateRangeBounds(f.range);
  return rows.filter((b) => {
    if (f.status !== "all" && b.status !== f.status) return false;
    if (f.sessionType !== "all") {
      if (f.sessionType === "none") {
        if (b.session_type_id) return false;
      } else if (b.session_type_id !== f.sessionType) {
        return false;
      }
    }
    if (!inDateRange(b.starts_at, start, end)) return false;
    return true;
  });
}

export type SessionTypeFilterOption = { id: string; title: string };

export function sessionTypeOptionsFromBookings(
  rows: BookingAdminRow[],
): SessionTypeFilterOption[] {
  const map = new Map<string, string>();
  let none = false;
  for (const b of rows) {
    if (!b.session_type_id) {
      none = true;
      continue;
    }
    if (!map.has(b.session_type_id)) {
      map.set(b.session_type_id, b.session_title);
    }
  }
  const opts = [...map.entries()].map(([id, title]) => ({ id, title }));
  opts.sort((a, b) => a.title.localeCompare(b.title));
  if (none) {
    return [{ id: "none", title: "Other (no type)" }, ...opts];
  }
  return opts;
}
