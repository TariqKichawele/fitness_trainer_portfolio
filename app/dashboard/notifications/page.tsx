import Link from "next/link";
import { requireDashboardUser } from "@/lib/auth/require-dashboard";
import { loadNotificationsForUser } from "@/lib/dashboard/notifications-load";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/dashboard/notifications/actions";

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function DashboardNotificationsPage() {
  const { supabase, user } = await requireDashboardUser();
  const notifications = await loadNotificationsForUser(supabase, user.id);
  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <>
      <header className="border-b border-border pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-muted">
              {unread > 0
                ? `${unread} unread`
                : "You're all caught up."}
            </p>
          </div>
          {unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <button
                type="submit"
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-background"
              >
                Mark all read
              </button>
            </form>
          ) : null}
        </div>
      </header>

      <section className="mt-8">
        {notifications.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted shadow-sm">
            No notifications yet. When your trainer confirms a booking or
            sends updates, they will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {notifications.map((n) => {
              const unreadItem = !n.read_at;
              const href = n.link_path ?? "/dashboard/notifications";
              return (
                <li
                  key={n.id}
                  className={unreadItem ? "bg-accent/5" : undefined}
                >
                  {unreadItem ? (
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <input type="hidden" name="redirect_to" value={href} />
                      <button
                        type="submit"
                        className="block w-full px-5 py-4 text-left transition hover:bg-background"
                      >
                        <NotificationContent notification={n} />
                      </button>
                    </form>
                  ) : (
                    <div className="px-5 py-4">
                      {n.link_path ? (
                        <Link
                          href={n.link_path}
                          className="block transition hover:opacity-90"
                        >
                          <NotificationContent notification={n} />
                        </Link>
                      ) : (
                        <NotificationContent notification={n} />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

function NotificationContent({
  notification,
}: {
  notification: {
    title: string;
    body: string | null;
    created_at: string;
    read_at: string | null;
  };
}) {
  return (
    <>
      <p className="text-sm font-semibold text-foreground">
        {notification.title}
      </p>
      {notification.body ? (
        <p className="mt-1 text-sm text-muted">{notification.body}</p>
      ) : null}
      <p className="mt-2 text-xs text-muted/80">
        {formatWhen(notification.created_at)}
        {!notification.read_at ? (
          <span className="ml-2 font-medium text-accent">New</span>
        ) : null}
      </p>
    </>
  );
}
