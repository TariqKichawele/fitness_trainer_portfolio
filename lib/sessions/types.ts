export const SESSION_HORIZON_DAYS = 28;

export type OccurrenceDisplay = {
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
  spots_left: number;
  is_full: boolean;
};

export type BookableOccurrence = OccurrenceDisplay & {
  user_booking_status: "none" | "pending" | "confirmed";
};

export type PublicOccurrence = OccurrenceDisplay;
