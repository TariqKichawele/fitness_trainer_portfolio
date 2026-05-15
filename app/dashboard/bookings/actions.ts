"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDashboardUser } from "@/lib/auth/require-dashboard";
import { createNotification } from "@/lib/notifications/create";
import { ACTIVE_BOOKING_STATUSES } from "@/lib/bookings/status";

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

export async function cancelBookingAction(formData: FormData) {
  const { supabase, user } = await requireDashboardUser();
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    redirect(
      "/dashboard/bookings?err=" + encodeURIComponent("Missing booking id"),
    );
  }

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      user_id,
      session_occurrences (
        starts_at,
        title_override,
        session_types ( title )
      )
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !booking) {
    redirect(
      "/dashboard/bookings?err=" +
        encodeURIComponent("Booking not found"),
    );
  }

  if (!ACTIVE_BOOKING_STATUSES.has(booking.status as string)) {
    redirect(
      "/dashboard/bookings?err=" +
        encodeURIComponent("This booking can no longer be cancelled"),
    );
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled_by_client",
      cancelled_at: now,
      cancelled_by: user.id,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[dashboard/bookings] cancel failed:", updateError);
    redirect(
      "/dashboard/bookings?err=" +
        encodeURIComponent("Could not cancel booking. Please try again."),
    );
  }

  const rawOcc = booking.session_occurrences;
  const occ = (Array.isArray(rawOcc) ? rawOcc[0] : rawOcc) as {
    starts_at: string;
    title_override?: string | null;
    session_types?: { title: string } | { title: string }[] | null;
  } | null | undefined;

  const sessionTitle = occ ? occTitle(occ) : "Session";
  const when = occ?.starts_at
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(occ.starts_at))
    : "";

  await createNotification(supabase, {
    userId: user.id,
    kind: "booking_cancelled_client",
    title: "Booking cancelled",
    body: when ? `${sessionTitle} · ${when}` : sessionTitle,
    linkPath: "/dashboard/bookings",
    metadata: { booking_id: id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  redirect("/dashboard/bookings?ok=cancelled");
}
