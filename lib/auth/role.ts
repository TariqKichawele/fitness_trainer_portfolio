import type { SupabaseClient } from "@supabase/supabase-js";

export type AppRole = "user" | "client" | "admin";

export async function fetchAppRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.role) return null;
  return data.role as AppRole;
}
