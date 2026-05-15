"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDashboardUser } from "@/lib/auth/require-dashboard";

function safeRedirectPath(raw: string | null | undefined): string {
  const path = String(raw ?? "").trim();
  if (path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return "/dashboard/notifications";
}

export async function markNotificationReadAction(formData: FormData) {
  const { supabase, user } = await requireDashboardUser();
  const id = String(formData.get("id") ?? "").trim();
  const redirectTo = safeRedirectPath(
    formData.get("redirect_to") as string | null,
  );

  if (!id) {
    redirect(redirectTo);
  }

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/notifications");
  redirect(redirectTo);
}

export async function markAllNotificationsReadAction() {
  const { supabase, user } = await requireDashboardUser();

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/notifications");
  redirect("/dashboard/notifications");
}
