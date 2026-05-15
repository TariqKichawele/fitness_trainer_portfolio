"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { BOOKING_FILTER_STATUSES, DATE_RANGE_KEYS } from "@/lib/admin/booking-filters";
import { notifyBookingStatusChange } from "@/lib/notifications/create";

const bookingStatuses = new Set([
  "pending",
  "confirmed",
  "cancelled_by_client",
  "cancelled_by_admin",
  "no_show",
  "attended",
]);

const paymentStatuses = new Set(["unpaid", "paid_on_site", "waived", ""]);

const filterStatusSet = new Set<string>(BOOKING_FILTER_STATUSES);
const filterRangeSet = new Set<string>(DATE_RANGE_KEYS);

const BOOKING_DB_ERROR_FLASH =
  "We could not complete that action. Please try again.";

function uuidLike(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

function filterQuerySuffix(formData: FormData): string {
  const parts: string[] = [];
  const st = String(formData.get("retain_status") ?? "").trim();
  if (st !== "all" && filterStatusSet.has(st)) {
    parts.push(`status=${encodeURIComponent(st)}`);
  }
  const ty = String(formData.get("retain_session_type") ?? "").trim();
  if (ty !== "all") {
    if (ty === "none" || uuidLike(ty)) {
      parts.push(`type=${encodeURIComponent(ty)}`);
    }
  }
  const rng = String(formData.get("retain_range") ?? "").trim();
  if (rng !== "all" && filterRangeSet.has(rng)) {
    parts.push(`range=${encodeURIComponent(rng)}`);
  }
  return parts.length ? `&${parts.join("&")}` : "";
}

export async function createBookingAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const user_id = String(formData.get("user_id") ?? "").trim();
  const session_occurrence_id = String(
    formData.get("session_occurrence_id") ?? "",
  ).trim();
  const status = String(formData.get("status") ?? "pending").trim();
  const payment_status_raw = String(
    formData.get("payment_status") ?? "",
  ).trim();
  const payment_status =
    payment_status_raw === "" ? null : payment_status_raw;

  const fq = filterQuerySuffix(formData);

  if (!user_id || !session_occurrence_id) {
    redirect(
      "/admin/bookings?err=" +
        encodeURIComponent("Client and session are required") +
        fq,
    );
  }
  if (!bookingStatuses.has(status)) {
    redirect("/admin/bookings?err=" + encodeURIComponent("Invalid status") + fq);
  }
  if (payment_status !== null && !paymentStatuses.has(payment_status)) {
    redirect(
      "/admin/bookings?err=" +
        encodeURIComponent("Invalid payment status") +
        fq,
    );
  }

  const { error } = await supabase.from("bookings").insert({
    user_id,
    session_occurrence_id,
    status,
    payment_status,
  });

  if (error) {
    console.error("[admin/bookings] createBookingAction insert failed:", error);
    redirect(
      "/admin/bookings?err=" + encodeURIComponent(BOOKING_DB_ERROR_FLASH) + fq,
    );
  }
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  redirect("/admin/bookings?ok=created" + fq);
}

export async function updateBookingAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const payment_status_raw = String(
    formData.get("payment_status") ?? "",
  ).trim();
  const payment_status =
    payment_status_raw === "" ? null : payment_status_raw;

  const fq = filterQuerySuffix(formData);

  if (!id) {
    redirect("/admin/bookings?err=" + encodeURIComponent("Missing booking id") + fq);
  }
  if (!bookingStatuses.has(status)) {
    redirect("/admin/bookings?err=" + encodeURIComponent("Invalid status") + fq);
  }
  if (payment_status !== null && !paymentStatuses.has(payment_status)) {
    redirect(
      "/admin/bookings?err=" +
        encodeURIComponent("Invalid payment status") +
        fq,
    );
  }

  const { data: existing } = await supabase
    .from("bookings")
    .select(
      `
      user_id,
      status,
      session_occurrences (
        starts_at,
        title_override,
        session_types ( title )
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("bookings")
    .update({ status, payment_status })
    .eq("id", id);

  if (error) {
    console.error("[admin/bookings] updateBookingAction failed:", error);
    redirect(
      "/admin/bookings?err=" + encodeURIComponent(BOOKING_DB_ERROR_FLASH) + fq,
    );
  }

  if (
    existing &&
    existing.status !== status &&
    (status === "confirmed" || status === "cancelled_by_admin")
  ) {
    const rawOcc = existing.session_occurrences;
    const occ = (Array.isArray(rawOcc) ? rawOcc[0] : rawOcc) as {
      starts_at: string;
      title_override?: string | null;
      session_types?: { title: string } | { title: string }[] | null;
    } | null | undefined;
    const st = occ?.session_types;
    const title =
      occ?.title_override?.trim() ||
      (Array.isArray(st) ? st[0]?.title : (st as { title?: string } | null)?.title) ||
      "Session";

    await notifyBookingStatusChange(supabase, {
      userId: existing.user_id as string,
      bookingId: id,
      status,
      sessionTitle: title,
      startsAt: occ?.starts_at ?? "",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/dashboard", "layout");
  redirect("/admin/bookings?ok=updated" + fq);
}

export async function deleteBookingAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const fq = filterQuerySuffix(formData);

  if (!id) {
    redirect("/admin/bookings?err=" + encodeURIComponent("Missing booking id") + fq);
  }

  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) {
    console.error("[admin/bookings] deleteBookingAction failed:", error);
    redirect(
      "/admin/bookings?err=" + encodeURIComponent(BOOKING_DB_ERROR_FLASH) + fq,
    );
  }
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  redirect("/admin/bookings?ok=deleted" + fq);
}
