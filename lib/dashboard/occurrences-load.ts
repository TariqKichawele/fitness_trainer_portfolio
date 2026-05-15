import type { SupabaseClient } from "@supabase/supabase-js";
import { mapOccurrenceRow } from "@/lib/sessions/map-occurrence";
import {
  SESSION_HORIZON_DAYS,
  type BookableOccurrence,
} from "@/lib/sessions/types";
import {
  uniqueCategoriesFromOccurrences,
  uniqueLocationsFromOccurrences,
} from "@/lib/sessions/format";

export { SESSION_HORIZON_DAYS as BOOKABLE_HORIZON_DAYS };
export type { BookableOccurrence };

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
  user_booking_status: string | null;
};

export async function loadBookableOccurrences(
  supabase: SupabaseClient,
  horizonDays = SESSION_HORIZON_DAYS,
): Promise<BookableOccurrence[]> {
  const { data, error } = await supabase.rpc("list_bookable_occurrences", {
    p_horizon_days: horizonDays,
  });

  if (error) {
    console.error("[occurrences-load] list_bookable_occurrences failed:", error);
    return [];
  }

  return ((data ?? []) as RpcRow[]).map((row) => {
    const base = mapOccurrenceRow(row);
    const userStatus = row.user_booking_status;
    return {
      ...base,
      user_booking_status:
        userStatus === "pending" || userStatus === "confirmed"
          ? userStatus
          : "none",
    };
  });
}

export function uniqueCategories(occurrences: BookableOccurrence[]): string[] {
  return uniqueCategoriesFromOccurrences(occurrences);
}

export function uniqueLocations(occurrences: BookableOccurrence[]): string[] {
  return uniqueLocationsFromOccurrences(occurrences);
}
