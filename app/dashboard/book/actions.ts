"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDashboardUser } from "@/lib/auth/require-dashboard";
import { createNotification } from "@/lib/notifications/create";
import {
  isProfileCompleteForBooking,
  BOOK_PROFILE_NEXT,
} from "@/lib/profile/requirements";

export async function createBookingAction(formData: FormData) {
  const { supabase, user } = await requireDashboardUser();
  const session_occurrence_id = String(
    formData.get("session_occurrence_id") ?? "",
  ).trim();

  if (!session_occurrence_id) {
    redirect(
      "/dashboard/book?err=" + encodeURIComponent("Missing session"),
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone_number, address_line_1, post_code")
    .eq("id", user.id)
    .maybeSingle();

  if (!isProfileCompleteForBooking(profile)) {
    redirect(
      `/profile?next=${encodeURIComponent(BOOK_PROFILE_NEXT)}&profile_error=${encodeURIComponent("Complete your profile before booking")}`,
    );
  }

  const { data: bookableRows, error: listError } = await supabase.rpc(
    "list_bookable_occurrences",
    { p_horizon_days: 56 },
  );

  if (listError) {
    console.error("[dashboard/book] list_bookable_occurrences failed:", listError);
    redirect(
      "/dashboard/book?err=" +
        encodeURIComponent("Could not verify session availability"),
    );
  }

  type RpcRow = {
    id: string;
    title: string;
    starts_at: string;
    max_slots: number;
    spots_taken: number;
    user_booking_status: string | null;
  };

  const slot = ((bookableRows ?? []) as RpcRow[]).find(
    (r) => r.id === session_occurrence_id,
  );

  if (!slot) {
    redirect(
      "/dashboard/book?err=" +
        encodeURIComponent("This session is no longer available"),
    );
  }

  const spotsLeft = Math.max(0, slot.max_slots - Number(slot.spots_taken || 0));
  if (spotsLeft <= 0) {
    redirect(
      "/dashboard/book?err=" + encodeURIComponent("This session is now full"),
    );
  }

  if (
    slot.user_booking_status === "pending" ||
    slot.user_booking_status === "confirmed"
  ) {
    redirect(
      "/dashboard/book?err=" +
        encodeURIComponent("You already have a booking for this session"),
    );
  }

  const occurrence = {
    starts_at: slot.starts_at,
    title: slot.title,
  };

  const { error: insertError } = await supabase.from("bookings").insert({
    user_id: user.id,
    session_occurrence_id,
    status: "pending",
    payment_status: "unpaid",
  });

  if (insertError) {
    if (insertError.code === "23505") {
      redirect(
        "/dashboard/book?err=" +
          encodeURIComponent("You already have a booking for this session"),
      );
    }
    console.error("[dashboard/book] createBookingAction failed:", insertError);
    redirect(
      "/dashboard/book?err=" +
        encodeURIComponent("Could not create booking. Please try again."),
    );
  }

  const sessionTitle = occurrence.title;
  const when = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(occurrence.starts_at));

  await createNotification(supabase, {
    userId: user.id,
    kind: "booking_requested",
    title: "Booking requested",
    body: `${sessionTitle} · ${when}. Pending trainer confirmation.`,
    linkPath: "/dashboard/bookings",
    metadata: { session_occurrence_id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/book");
  revalidatePath("/dashboard/bookings");
  redirect("/dashboard/bookings?ok=requested");
}
