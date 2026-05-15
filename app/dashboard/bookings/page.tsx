import { requireDashboardUser } from "@/lib/auth/require-dashboard";
import { loadBookingsForUser } from "@/lib/dashboard/bookings-load";
import { BookingsPanel } from "@/components/dashboard/BookingsPanel";

type BookingsPageProps = {
  searchParams: Promise<{ err?: string; ok?: string }>;
};

export default async function DashboardBookingsPage({
  searchParams,
}: BookingsPageProps) {
  const { supabase, user } = await requireDashboardUser();
  const sp = await searchParams;
  const bookings = await loadBookingsForUser(supabase, user.id);

  return (
    <>
      <header className="border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          My bookings
        </h1>
        <p className="mt-1 text-sm text-muted">
          View upcoming sessions and cancel reservations when needed.
        </p>
      </header>

      <section className="mt-8">
        <BookingsPanel
          bookings={bookings}
          flashError={sp.err ? decodeURIComponent(sp.err) : null}
          flashOk={sp.ok ?? null}
        />
      </section>
    </>
  );
}
