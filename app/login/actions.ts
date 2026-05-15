"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAppRole } from "@/lib/auth/role";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function safeNextPath(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const role =
    data.user != null ? await fetchAppRole(supabase, data.user.id) : null;
  revalidatePath("/", "layout");
  redirect(role === "admin" ? "/admin" : next);
}
