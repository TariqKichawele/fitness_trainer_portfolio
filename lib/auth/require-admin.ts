import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAppRole } from "@/lib/auth/role";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/admin");
  }
  const role = await fetchAppRole(supabase, user.id);
  if (role !== "admin") {
    redirect("/unauthorized");
  }
  return { supabase, user };
}
