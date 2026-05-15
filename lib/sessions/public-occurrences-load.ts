import type { SupabaseClient } from "@supabase/supabase-js";
import { mapOccurrenceRow } from "@/lib/sessions/map-occurrence";
import type { PublicOccurrence } from "@/lib/sessions/types";
import { SESSION_HORIZON_DAYS } from "@/lib/sessions/types";

export async function loadPublicOccurrences(
  supabase: SupabaseClient,
  horizonDays = SESSION_HORIZON_DAYS,
): Promise<PublicOccurrence[]> {
  const { data, error } = await supabase.rpc("list_public_occurrences", {
    p_horizon_days: horizonDays,
  });

  if (error) {
    console.error("[public-occurrences] list_public_occurrences failed:", error);
    return [];
  }

  type RpcRow = {
    id: string;
    session_type_id: string | null;
    title: string;
    category: string | null;
    location: string | null;
    starts_at: string;
    ends_at: string;
    max_slots: number;
    price_cents: number;
    spots_taken: number;
  };

  return ((data ?? []) as RpcRow[]).map((row) => mapOccurrenceRow(row));
}
