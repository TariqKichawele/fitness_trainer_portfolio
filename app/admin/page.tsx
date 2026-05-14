import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminDashboardStats } from "@/lib/admin/dashboard-stats";

function formatMoney(cents: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();
  const [stats, typesCount, clientsCount, bookingsCount] = await Promise.all([
    getAdminDashboardStats(supabase),
    supabase.from("session_types").select("id", { count: "exact", head: true }),
    supabase.from("user_roles").select("user_id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }),
  ]);

  const quickLinks = [
    {
      href: "/admin/sessions",
      title: "Manage session types",
      description: "Create, edit, or retire session categories.",
      cta: "Open sessions",
    },
    {
      href: "/admin/clients",
      title: "Client directory",
      description: "View roles, status, and contact details.",
      cta: "Open clients",
    },
    {
      href: "/admin/bookings",
      title: "Bookings pipeline",
      description: "Confirm, adjust, or cancel reservations.",
      cta: "Open bookings",
    },
  ] as const;

  return (
    <>
      <header className="border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Admin dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Operations overview
        </h1>
        <p className="mt-1 text-sm text-muted">
          Summary metrics are computed from your Supabase project.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-medium text-muted">Upcoming sessions</h2>
          <p className="mt-2 font-mono text-2xl font-semibold text-accent">
            {stats.upcomingSessions}
          </p>
          <p className="mt-1 text-xs text-muted">Scheduled in next 14 days</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-medium text-muted">Clients</h2>
          <p className="mt-2 font-mono text-2xl font-semibold text-accent">
            {stats.activeClients}
          </p>
          <p className="mt-1 text-xs text-muted">Users with role client</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-medium text-muted">Open bookings</h2>
          <p className="mt-2 font-mono text-2xl font-semibold text-accent">
            {stats.openBookings}
          </p>
          <p className="mt-1 text-xs text-muted">Status pending</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-medium text-muted">Revenue (7 days)</h2>
          <p className="mt-2 font-mono text-2xl font-semibold text-accent">
            {formatMoney(stats.revenueWeekCents)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Sum of occurrence prices on confirmed/attended bookings created this
            week
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold text-foreground">Quick actions</h2>
        <p className="mt-1 text-sm text-muted">
          Jump to a workspace to add or edit data.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {quickLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-accent/40 hover:bg-background"
              >
                <span className="text-sm font-semibold text-foreground">
                  {item.title}
                </span>
                <span className="mt-1 flex-1 text-xs text-muted">
                  {item.description}
                </span>
                <span className="mt-3 text-xs font-semibold text-accent">
                  {item.cta} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Session types</h3>
          <p className="mt-1 font-mono text-xs text-muted">
            {typesCount.count ?? 0} in catalog
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Accounts</h3>
          <p className="mt-1 font-mono text-xs text-muted">
            {clientsCount.count ?? 0} with a role row
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Bookings</h3>
          <p className="mt-1 font-mono text-xs text-muted">
            {bookingsCount.count ?? 0} total rows
          </p>
        </div>
      </section>
    </>
  );
}
