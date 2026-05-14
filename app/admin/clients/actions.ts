"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { fetchAppRole } from "@/lib/auth/role";

const allowedRoles = new Set(["user", "client"]);

function roleQuerySuffix(formData: FormData): string {
  const r = String(formData.get("retain_role") ?? "").trim();
  if (r === "user" || r === "client" || r === "admin") {
    return `&role=${encodeURIComponent(r)}`;
  }
  return "";
}

export async function updateClientAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const userId = String(formData.get("user_id") ?? "").trim();
  if (!userId) {
    redirect("/admin/clients?err=" + encodeURIComponent("Missing user") + roleQuerySuffix(formData));
  }

  const targetRole = await fetchAppRole(supabase, userId);
  if (targetRole === "admin") {
    redirect(
      "/admin/clients?err=" +
        encodeURIComponent("Admin accounts cannot be edited here") +
        roleQuerySuffix(formData),
    );
  }

  const display_name =
    String(formData.get("display_name") ?? "").trim() || null;
  const phone_number =
    String(formData.get("phone_number") ?? "").trim() || null;
  const address_line_1 =
    String(formData.get("address_line_1") ?? "").trim() || null;
  const address_line_2 =
    String(formData.get("address_line_2") ?? "").trim() || null;
  const post_code = String(formData.get("post_code") ?? "").trim() || null;
  const roleRaw = String(formData.get("role") ?? "").trim();
  if (!allowedRoles.has(roleRaw)) {
    redirect(
      "/admin/clients?err=" + encodeURIComponent("Invalid role") + roleQuerySuffix(formData),
    );
  }

  const { error: pErr } = await supabase
    .from("profiles")
    .update({
      display_name,
      phone_number,
      address_line_1,
      address_line_2,
      post_code,
    })
    .eq("id", userId);

  if (pErr) {
    redirect("/admin/clients?err=" + encodeURIComponent(pErr.message) + roleQuerySuffix(formData));
  }

  const { error: rErr } = await supabase
    .from("user_roles")
    .update({ role: roleRaw })
    .eq("user_id", userId);

  if (rErr) {
    redirect("/admin/clients?err=" + encodeURIComponent(rErr.message) + roleQuerySuffix(formData));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  redirect("/admin/clients?ok=updated" + roleQuerySuffix(formData));
}

export async function setClientStatusAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const userId = String(formData.get("user_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!userId || !["active", "rejected", "banned"].includes(status)) {
    redirect(
      "/admin/clients?err=" +
        encodeURIComponent("Invalid request") +
        roleQuerySuffix(formData),
    );
  }

  const targetRole = await fetchAppRole(supabase, userId);
  if (targetRole === "admin") {
    redirect(
      "/admin/clients?err=" +
        encodeURIComponent("Cannot change status for admins") +
        roleQuerySuffix(formData),
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId);

  if (error) {
    redirect(
      "/admin/clients?err=" +
        encodeURIComponent(error.message) +
        roleQuerySuffix(formData),
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  redirect("/admin/clients?ok=status" + roleQuerySuffix(formData));
}
