import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminDashboardStats = {
  upcomingSessions: number;
  activeClients: number;
  openBookings: number;
  revenueWeekCents: number;
};

export async function getAdminDashboardStats(
  supabase: SupabaseClient,
): Promise<AdminDashboardStats> {
  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * 86400000).toISOString();
  const nowIso = now.toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

  const [{ count: upcoming }, { count: clients }, { count: pending }, bookingsRev] =
    await Promise.all([
      supabase
        .from("session_occurrences")
        .select("id", { count: "exact", head: true })
        .eq("status", "scheduled")
        .gte("starts_at", nowIso)
        .lte("starts_at", in14),
      supabase
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "client"),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("bookings")
        .select(
          `
          status,
          session_occurrences ( price_cents )
        `,
        )
        .in("status", ["confirmed", "attended"])
        .gte("created_at", weekAgo),
    ]);

  let revenueWeekCents = 0;
  const rows = bookingsRev.error ? [] : (bookingsRev.data ?? []);
  for (const row of rows) {
    const rawOcc = row.session_occurrences;
    const occ = (Array.isArray(rawOcc) ? rawOcc[0] : rawOcc) as {
      price_cents: number;
    } | null | undefined;
    if (occ && typeof occ.price_cents === "number") {
      revenueWeekCents += occ.price_cents;
    }
  }

  return {
    upcomingSessions: upcoming ?? 0,
    activeClients: clients ?? 0,
    openBookings: pending ?? 0,
    revenueWeekCents,
  };
}
