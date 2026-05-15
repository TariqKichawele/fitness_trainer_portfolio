import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireDashboardUser } from "@/lib/auth/require-dashboard";
import { getAvatarSignedUrl } from "@/lib/avatar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getUnreadNotificationCount,
  loadNotificationsForUser,
} from "@/lib/dashboard/notifications-load";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { supabase, user, role } = await requireDashboardUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.status === "banned" || profile?.status === "rejected") {
    redirect("/unauthorized");
  }

  const [avatarUrl, unreadCount, recentNotifications] = await Promise.all([
    getAvatarSignedUrl(supabase, profile?.avatar_url),
    getUnreadNotificationCount(supabase, user.id),
    loadNotificationsForUser(supabase, user.id, 5),
  ]);

  return (
    <DashboardShell
      email={user.email ?? ""}
      displayName={profile?.display_name ?? null}
      avatarUrl={avatarUrl}
      role={role}
      unreadCount={unreadCount}
      recentNotifications={recentNotifications}
    >
      {children}
    </DashboardShell>
  );
}
