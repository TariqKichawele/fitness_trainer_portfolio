export type BookingClientRow = {
  id: string;
  session_occurrence_id: string;
  status: string;
  payment_status: string | null;
  created_at: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  session_title: string;
};

export type NotificationRow = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link_path: string | null;
  read_at: string | null;
  created_at: string;
};
