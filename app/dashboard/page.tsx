import Link from "next/link";
import { requireDashboardUser } from "@/lib/auth/require-dashboard";
import {
  getDashboardBookingStats,
  loadBookingsForUser,
} from "@/lib/dashboard/bookings-load";
import { getUnreadNotificationCount } from "@/lib/dashboard/notifications-load";
import {
  bookingStatusClass,
  bookingStatusLabel,
} from "@/lib/bookings/status";
import {
  isProfileCompleteForBooking,
  BOOK_PROFILE_NEXT,
} from "@/lib/profile/requirements";

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

export default async function DashboardOverviewPage() {
  const { supabase, user, role } = await requireDashboardUser();

  const [{ data: profile }, bookings, unreadCount] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, phone_number, address_line_1, post_code")
      .eq("id", user.id)
      .maybeSingle(),
    loadBookingsForUser(supabase, user.id),
    getUnreadNotificationCount(supabase, user.id),
  ]);

  const stats = getDashboardBookingStats(bookings);
  const recent = bookings.slice(0, 5);
  const greeting =
    profile?.display_name?.trim() ||
    user.email?.split("@")[0] ||
    "there";
  const isNewUser = role === "user" && bookings.length === 0;
  const showProfileCta = !isProfileCompleteForBooking(profile);

  return (
    <>
      <header className="border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Welcome back, {greeting}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {role === "client"
            ? "Manage your sessions and stay up to date."
            : "Book a session to get started with training."}
        </p>
      </header>

      {isNewUser ? (
        <section className="mt-8 rounded-xl border border-accent/30 bg-accent/5 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">
            Book your first session
          </h2>
          <p className="mt-2 text-sm text-muted">
            Browse the weekly schedule and reserve a spot. Your trainer will
            confirm your booking.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/book"
              className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-muted"
            >
              Book a session
            </Link>
            {showProfileCta ? (
              <Link
                href={`/profile?next=${encodeURIComponent(BOOK_PROFILE_NEXT)}`}
                className="inline-flex rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
              >
                Complete profile
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-medium text-muted">Next session</h2>
          {stats.nextBooking ? (
            <>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {stats.nextBooking.session_title}
              </p>
              <p className="mt-1 font-mono text-xs text-accent">
                {formatWhen(stats.nextBooking.starts_at)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">No upcoming sessions</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-medium text-muted">Pending</h2>
          <p className="mt-2 font-mono text-2xl font-semibold text-accent">
            {stats.pendingCount}
          </p>
          <p className="mt-1 text-xs text-muted">Awaiting confirmation</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-medium text-muted">Notifications</h2>
          <p className="mt-2 font-mono text-2xl font-semibold text-accent">
            {unreadCount}
          </p>
          <p className="mt-1 text-xs text-muted">
            <Link href="/dashboard/notifications" className="hover:text-accent">
              View all →
            </Link>
          </p>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-foreground">
            Recent bookings
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-medium text-accent hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-4 rounded-xl border border-border bg-card p-6 text-sm text-muted shadow-sm">
            You have no bookings yet.{" "}
            <Link
              href="/dashboard/book"
              className="font-medium text-accent hover:underline"
            >
              Browse sessions
            </Link>
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Session
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    When
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5 text-sm font-medium text-foreground">
                      {b.session_title}
                    </td>
                    <td className="px-3 py-2.5 text-sm tabular-nums text-muted">
                      {b.starts_at ? formatWhen(b.starts_at) : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${bookingStatusClass(b.status)}`}
                      >
                        {bookingStatusLabel(b.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
