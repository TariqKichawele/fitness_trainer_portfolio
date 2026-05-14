export type ClientDirectoryRow = {
  user_id: string;
  email: string;
  display_name: string | null;
  phone_number: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  post_code: string | null;
  status: string;
  role: string;
  granted_at: string;
  auth_created_at: string;
};

export type SessionTypeRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  default_duration_min: number;
  default_max_slots: number;
  default_price_cents: number;
  default_location: string | null;
  is_active: boolean;
};

export type BookingAdminRow = {
  id: string;
  user_id: string;
  session_occurrence_id: string;
  session_type_id: string | null;
  status: string;
  payment_status: string | null;
  created_at: string;
  client_name: string | null;
  starts_at: string;
  session_title: string;
};

export type OccurrenceOption = {
  id: string;
  label: string;
  starts_at: string;
};
