const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled_by_client: "Cancelled by you",
  cancelled_by_admin: "Cancelled",
  no_show: "No show",
  attended: "Attended",
};

export function bookingStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

export function bookingStatusClass(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-500/15 text-amber-800 dark:text-amber-200";
    case "confirmed":
      return "bg-accent/15 text-accent";
    case "attended":
      return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200";
    case "cancelled_by_client":
    case "cancelled_by_admin":
      return "bg-muted/20 text-muted";
    case "no_show":
      return "bg-rose-500/15 text-rose-800 dark:text-rose-200";
    default:
      return "bg-muted/20 text-muted";
  }
}

export const ACTIVE_BOOKING_STATUSES = new Set(["pending", "confirmed"]);

export const CANCELLED_BOOKING_STATUSES = new Set([
  "cancelled_by_client",
  "cancelled_by_admin",
]);
