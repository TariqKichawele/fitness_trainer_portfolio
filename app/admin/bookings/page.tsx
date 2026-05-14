import Link from "next/link";
import { BookingFiltersBar } from "@/components/admin/BookingFiltersBar";
import { flashErrorFromParam } from "@/lib/admin/flash-params";
import {
  filterBookings,
  parseActiveBookingFilters,
  sessionTypeOptionsFromBookings,
} from "@/lib/admin/booking-filters";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { ClientDirectoryRow } from "@/lib/admin/types";
import { loadBookingsForAdmin, loadOccurrenceOptions } from "@/lib/admin/bookings-load";
import { BookingsPanel } from "@/app/admin/bookings/BookingsPanel";

type PageProps = {
  searchParams: Promise<{
    err?: string;
    ok?: string;
    status?: string;
    type?: string;
    range?: string;
  }>;
};

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const flashError = flashErrorFromParam(sp.err);
  const flashOk = typeof sp.ok === "string" ? sp.ok : null;
  const activeFilters = parseActiveBookingFilters(sp);

  const { supabase } = await requireAdmin();
  const [bookings, occurrences, clientsRes] = await Promise.all([
    loadBookingsForAdmin(supabase),
    loadOccurrenceOptions(supabase),
    supabase.rpc("admin_list_clients"),
  ]);

  if (clientsRes.error) {
    console.error("[admin/bookings] admin_list_clients failed:", clientsRes.error);
  }

  const clients = (clientsRes.error ? [] : (clientsRes.data ?? [])) as ClientDirectoryRow[];

  const filtered = filterBookings(bookings, activeFilters);
  const sessionTypeOptions = sessionTypeOptionsFromBookings(bookings);

  return (
    <>
      <header className="border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Bookings
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Bookings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Live <span className="font-mono text-xs">bookings</span> with session
          slots. Admins can create bookings for any client.
        </p>
      </header>

      {clientsRes.error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          Unable to load clients
        </p>
      ) : null}

      <div className="mt-6 space-y-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <BookingFiltersBar active={activeFilters} sessionTypes={sessionTypeOptions} />
          <p className="mt-4 text-xs text-muted">
            Showing <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            of <span className="font-medium text-foreground">{bookings.length}</span>{" "}
            bookings
          </p>
        </div>

        <BookingsPanel
          bookings={filtered}
          clients={clients.map((c) => ({
            user_id: c.user_id,
            email: c.email,
            display_name: c.display_name,
            role: c.role,
          }))}
          occurrences={occurrences}
          flashError={flashError}
          flashOk={flashOk}
          activeFilters={activeFilters}
        />
      </div>

      <p className="mt-10 text-center text-sm text-muted">
        <Link href="/admin" className="text-accent hover:underline">
          ← Back to overview
        </Link>
      </p>
    </>
  );
}
