import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAppRole, type AppRole } from "@/lib/auth/role";

export async function requireDashboardUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }
  const role = await fetchAppRole(supabase, user.id);
  if (role === "admin") {
    redirect("/admin");
  }
  return { supabase, user, role: (role ?? "user") as AppRole };
}
