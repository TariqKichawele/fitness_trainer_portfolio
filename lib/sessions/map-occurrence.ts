import type { OccurrenceDisplay } from "@/lib/sessions/types";

export function mapOccurrenceRow(row: {
  id: string;
  session_type_id?: string | null;
  title: string;
  category: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string;
  max_slots: number;
  price_cents: number;
  spots_taken: number | bigint;
}): OccurrenceDisplay {
  const spotsTaken = Number(row.spots_taken) || 0;
  const maxSlots = row.max_slots;
  const spotsLeft = Math.max(0, maxSlots - spotsTaken);
  return {
    id: row.id,
    session_type_id: row.session_type_id ?? null,
    title: row.title,
    category: row.category,
    location: row.location,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    max_slots: maxSlots,
    price_cents: row.price_cents,
    spots_taken: spotsTaken,
    spots_left: spotsLeft,
    is_full: spotsLeft <= 0,
  };
}
