"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";

function slugify(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function moneyToCents(raw: string): number {
  const n = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export async function createSessionTypeAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  if (!title) {
    redirect("/admin/sessions?err=" + encodeURIComponent("Title is required"));
  }
  if (!slug) slug = slugify(title);
  else slug = slugify(slug);

  const description =
    String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const default_duration_min = Number.parseInt(
    String(formData.get("default_duration_min") ?? "60"),
    10,
  );
  const default_max_slots = Number.parseInt(
    String(formData.get("default_max_slots") ?? "10"),
    10,
  );
  const default_price_cents = moneyToCents(
    String(formData.get("default_price_dollars") ?? "0"),
  );
  const default_location =
    String(formData.get("default_location") ?? "").trim() || null;
  const is_active = formData.get("is_active") === "on";

  if (default_duration_min < 1 || default_max_slots < 1) {
    redirect(
      "/admin/sessions?err=" + encodeURIComponent("Duration and slots must be positive"),
    );
  }

  const { error } = await supabase.from("session_types").insert({
    slug,
    title,
    description,
    category,
    default_duration_min,
    default_max_slots,
    default_price_cents,
    default_location,
    is_active,
  });

  if (error) {
    redirect("/admin/sessions?err=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin");
  revalidatePath("/admin/sessions");
  redirect("/admin/sessions?ok=created");
}

export async function updateSessionTypeAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/admin/sessions?err=" + encodeURIComponent("Missing id"));
  }

  const title = String(formData.get("title") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  if (!title) {
    redirect("/admin/sessions?err=" + encodeURIComponent("Title is required"));
  }
  slug = slug ? slugify(slug) : slugify(title);

  const description =
    String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const default_duration_min = Number.parseInt(
    String(formData.get("default_duration_min") ?? "60"),
    10,
  );
  const default_max_slots = Number.parseInt(
    String(formData.get("default_max_slots") ?? "10"),
    10,
  );
  const default_price_cents = moneyToCents(
    String(formData.get("default_price_dollars") ?? "0"),
  );
  const default_location =
    String(formData.get("default_location") ?? "").trim() || null;
  const is_active = formData.get("is_active") === "on";

  const { error } = await supabase
    .from("session_types")
    .update({
      slug,
      title,
      description,
      category,
      default_duration_min,
      default_max_slots,
      default_price_cents,
      default_location,
      is_active,
    })
    .eq("id", id);

  if (error) {
    redirect("/admin/sessions?err=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin");
  revalidatePath("/admin/sessions");
  redirect("/admin/sessions?ok=updated");
}

export async function deleteSessionTypeAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/admin/sessions?err=" + encodeURIComponent("Missing id"));
  }

  const { error } = await supabase.from("session_types").delete().eq("id", id);
  if (error) {
    redirect("/admin/sessions?err=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin");
  revalidatePath("/admin/sessions");
  redirect("/admin/sessions?ok=deleted");
}
