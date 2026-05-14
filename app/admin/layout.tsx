import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAppRole } from "@/lib/auth/role";
import { getAvatarSignedUrl } from "@/lib/avatar";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const avatarUrl = await getAvatarSignedUrl(supabase, profile?.avatar_url);

  const showDevBadge = process.env.NODE_ENV !== "production";

  return (
    <AdminShell
      email={user.email ?? ""}
      displayName={profile?.display_name ?? null}
      avatarUrl={avatarUrl}
      showDevBadge={showDevBadge}
    >
      {children}
    </AdminShell>
  );
}
