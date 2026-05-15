import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingClientRow } from "@/lib/dashboard/types";
import { ACTIVE_BOOKING_STATUSES, CANCELLED_BOOKING_STATUSES } from "@/lib/bookings/status";

function occTitle(occ: {
  title_override?: string | null;
  session_types?: { title: string } | { title: string }[] | null;
}): string {
  const o = occ.title_override?.trim();
  if (o) return o;
  const st = occ.session_types;
  if (Array.isArray(st)) return st[0]?.title ?? "Session";
  if (st && typeof st === "object" && "title" in st) {
    return (st as { title: string }).title;
  }
  return "Session";
}

export async function loadBookingsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<BookingClientRow[]> {
  const { data: rows, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      session_occurrence_id,
      status,
      payment_status,
      created_at,
      session_occurrences (
        starts_at,
        ends_at,
        location,
        title_override,
        session_types ( title )
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !rows?.length) {
    return [];
  }

  return rows.map((r) => {
    const rawOcc = r.session_occurrences;
    const occ = (Array.isArray(rawOcc) ? rawOcc[0] : rawOcc) as {
      starts_at: string;
      ends_at?: string | null;
      location?: string | null;
      title_override?: string | null;
      session_types?:
        | { title: string }
        | { title: string }[]
        | null;
    } | null | undefined;
    return {
      id: r.id as string,
      session_occurrence_id: r.session_occurrence_id as string,
      status: r.status as string,
      payment_status: (r.payment_status as string | null) ?? null,
      created_at: r.created_at as string,
      starts_at: occ?.starts_at ?? "",
      ends_at: (occ?.ends_at as string | null) ?? null,
      location: (occ?.location as string | null) ?? null,
      session_title: occ ? occTitle(occ) : "Session",
    };
  });
}

export type BookingTab = "upcoming" | "past" | "cancelled";

export function filterBookingsByTab(
  bookings: BookingClientRow[],
  tab: BookingTab,
  now = new Date(),
): BookingClientRow[] {
  return bookings.filter((b) => {
    const isCancelled = CANCELLED_BOOKING_STATUSES.has(b.status);
    const isActive = ACTIVE_BOOKING_STATUSES.has(b.status);
    const startsAt = b.starts_at ? new Date(b.starts_at) : null;
    const isFuture = startsAt ? startsAt >= now : false;

    if (tab === "cancelled") {
      return isCancelled;
    }
    if (tab === "upcoming") {
      return isActive && (isFuture || !startsAt);
    }
    return (
      !isCancelled &&
      (!isActive || (startsAt !== null && startsAt < now) || b.status === "attended" || b.status === "no_show")
    );
  });
}

export function getDashboardBookingStats(bookings: BookingClientRow[]) {
  const now = new Date();
  const pending = bookings.filter((b) => b.status === "pending").length;
  const upcoming = bookings.filter(
    (b) =>
      ACTIVE_BOOKING_STATUSES.has(b.status) &&
      b.starts_at &&
      new Date(b.starts_at) >= now,
  );
  upcoming.sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
  return {
    pendingCount: pending,
    nextBooking: upcoming[0] ?? null,
  };
}
