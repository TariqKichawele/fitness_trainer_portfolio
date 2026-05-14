import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingAdminRow, OccurrenceOption } from "@/lib/admin/types";

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

export async function loadBookingsForAdmin(
  supabase: SupabaseClient,
): Promise<BookingAdminRow[]> {
  const { data: rows, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      user_id,
      session_occurrence_id,
      status,
      payment_status,
      created_at,
      session_occurrences (
        starts_at,
        title_override,
        session_type_id,
        session_types ( id, title )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error || !rows?.length) {
    return [];
  }

  const userIds = [...new Set(rows.map((r) => r.user_id as string))];
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);

  const pmap = new Map(
    (profs ?? []).map((p) => [p.id as string, p.display_name as string | null]),
  );

  return rows.map((r) => {
    const rawOcc = r.session_occurrences;
    const occ = (Array.isArray(rawOcc) ? rawOcc[0] : rawOcc) as {
      starts_at: string;
      session_type_id?: string | null;
      title_override?: string | null;
      session_types?:
        | { id: string; title: string }
        | { id: string; title: string }[]
        | null;
    } | null | undefined;
    return {
      id: r.id as string,
      user_id: r.user_id as string,
      session_occurrence_id: r.session_occurrence_id as string,
      session_type_id: (occ?.session_type_id as string | null) ?? null,
      status: r.status as string,
      payment_status: (r.payment_status as string | null) ?? null,
      created_at: r.created_at as string,
      client_name: pmap.get(r.user_id as string) ?? null,
      starts_at: occ?.starts_at ?? "",
      session_title: occ ? occTitle(occ) : "—",
    };
  });
}

export async function loadOccurrenceOptions(
  supabase: SupabaseClient,
): Promise<OccurrenceOption[]> {
  const { data, error } = await supabase
    .from("session_occurrences")
    .select(
      `
      id,
      starts_at,
      title_override,
      session_types ( title )
    `,
    )
    .eq("status", "scheduled")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(200);

  if (error || !data) return [];

  return data.map((row) => {
    const occ = row as {
      id: string;
      starts_at: string;
      title_override?: string | null;
      session_types?: { title: string } | { title: string }[] | null;
    };
    const title = occTitle(occ);
    const when = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(occ.starts_at));
    return {
      id: occ.id,
      starts_at: occ.starts_at,
      label: `${when} · ${title}`,
    };
  });
}
