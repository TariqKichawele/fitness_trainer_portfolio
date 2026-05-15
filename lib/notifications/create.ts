import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateNotificationInput = {
  userId: string;
  kind: string;
  title: string;
  body?: string | null;
  linkPath?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function createNotification(
  supabase: SupabaseClient,
  input: CreateNotificationInput,
): Promise<string | null> {
  const { data, error } = await supabase.rpc("create_notification_for_user", {
    p_user_id: input.userId,
    p_kind: input.kind,
    p_title: input.title,
    p_body: input.body ?? null,
    p_link_path: input.linkPath ?? null,
    p_metadata: input.metadata ?? null,
  });

  if (error) {
    console.error("[notifications] create failed:", error);
    return null;
  }
  return typeof data === "string" ? data : null;
}

export async function notifyBookingStatusChange(
  supabase: SupabaseClient,
  params: {
    userId: string;
    bookingId: string;
    status: string;
    sessionTitle: string;
    startsAt: string;
  },
): Promise<void> {
  const when = formatSessionWhen(params.startsAt);
  const sessionLine = `${params.sessionTitle} · ${when}`;

  if (params.status === "confirmed") {
    await createNotification(supabase, {
      userId: params.userId,
      kind: "booking_confirmed",
      title: "Booking confirmed",
      body: sessionLine,
      linkPath: "/dashboard/bookings",
      metadata: { booking_id: params.bookingId },
    });
    return;
  }

  if (params.status === "cancelled_by_admin") {
    await createNotification(supabase, {
      userId: params.userId,
      kind: "booking_cancelled_admin",
      title: "Booking cancelled",
      body: `Your trainer cancelled: ${sessionLine}`,
      linkPath: "/dashboard/bookings",
      metadata: { booking_id: params.bookingId },
    });
  }
}

function formatSessionWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
