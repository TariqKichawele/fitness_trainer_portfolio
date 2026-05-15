import { requireDashboardUser } from "@/lib/auth/require-dashboard";
import {
  loadBookableOccurrences,
  uniqueCategories,
  uniqueLocations,
} from "@/lib/dashboard/occurrences-load";
import { isProfileCompleteForBooking } from "@/lib/profile/requirements";
import { BookSessionsPanel } from "@/components/dashboard/BookSessionsPanel";

type BookPageProps = {
  searchParams: Promise<{ err?: string }>;
};

export default async function DashboardBookPage({ searchParams }: BookPageProps) {
  const { supabase, user } = await requireDashboardUser();
  const sp = await searchParams;

  const [{ data: profile }, occurrences] = await Promise.all([
    supabase
      .from("profiles")
      .select("phone_number, address_line_1, post_code")
      .eq("id", user.id)
      .maybeSingle(),
    loadBookableOccurrences(supabase),
  ]);

  const profileComplete = isProfileCompleteForBooking(profile);

  return (
    <>
      <header className="border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Book a session
        </h1>
        <p className="mt-1 text-sm text-muted">
          Browse upcoming sessions and request a spot. Bookings stay pending until
          your trainer confirms.
        </p>
      </header>

      <section className="mt-8">
        <BookSessionsPanel
          occurrences={occurrences}
          profileComplete={profileComplete}
          flashError={sp.err ? decodeURIComponent(sp.err) : null}
          categories={uniqueCategories(occurrences)}
          locations={uniqueLocations(occurrences)}
        />
      </section>
    </>
  );
}
