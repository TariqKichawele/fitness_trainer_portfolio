"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SpotsBar } from "@/components/sessions/SpotsBar";
import type { BookableOccurrence } from "@/lib/dashboard/occurrences-load";
import { BOOK_PROFILE_NEXT } from "@/lib/profile/requirements";
import { createBookingAction } from "@/app/dashboard/book/actions";
import {
  dateKey,
  endOfWeekSunday,
  formatDateHeader,
  formatTimeRange,
  startOfWeekMonday,
  weekdayIndexFromIso,
  WEEKDAY_LABELS,
} from "@/lib/sessions/format";

type ViewMode = "list" | "week";

const selectClass =
  "min-w-[128px] max-w-[180px] rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 sm:min-w-[140px] sm:max-w-[200px]";

type BookSessionsPanelProps = {
  occurrences: BookableOccurrence[];
  profileComplete: boolean;
  flashError: string | null;
  categories: string[];
  locations: string[];
};


function bookButtonLabel(occ: BookableOccurrence): string {
  if (occ.user_booking_status === "pending") return "Pending confirmation";
  if (occ.user_booking_status === "confirmed") return "Booked";
  if (occ.is_full) return "Full";
  return "Book";
}

function canBook(occ: BookableOccurrence, profileComplete: boolean): boolean {
  return (
    profileComplete &&
    !occ.is_full &&
    occ.user_booking_status === "none"
  );
}

export function BookSessionsPanel({
  occurrences,
  profileComplete,
  flashError,
  categories,
  locations,
}: BookSessionsPanelProps) {
  const [view, setView] = useState<ViewMode>("list");
  const [location, setLocation] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [hideFull, setHideFull] = useState(false);
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [booking, setBooking] = useState<BookableOccurrence | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (booking) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [booking]);

  const filtered = useMemo(() => {
    return occurrences.filter((o) => {
      if (location !== "all" && o.location !== location) return false;
      if (category !== "all" && o.category !== category) return false;
      if (hideFull && o.is_full && o.user_booking_status === "none") return false;
      return true;
    });
  }, [occurrences, location, category, hideFull]);

  const listGrouped = useMemo(() => {
    const groups = new Map<string, BookableOccurrence[]>();
    for (const o of filtered) {
      const key = dateKey(o.starts_at);
      const list = groups.get(key) ?? [];
      list.push(o);
      groups.set(key, list);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const weekEnd = useMemo(() => endOfWeekSunday(weekStart), [weekStart]);

  const weekOccurrences = useMemo(() => {
    return filtered.filter((o) => {
      const t = new Date(o.starts_at).getTime();
      return t >= weekStart.getTime() && t < weekEnd.getTime();
    });
  }, [filtered, weekStart, weekEnd]);

  const weekLabel = useMemo(() => {
    const endDisplay = new Date(weekEnd);
    endDisplay.setDate(endDisplay.getDate() - 1);
    const fmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${new Intl.DateTimeFormat(undefined, fmt).format(weekStart)} – ${new Intl.DateTimeFormat(undefined, fmt).format(endDisplay)}`;
  }, [weekStart, weekEnd]);

  return (
    <div>
      {flashError ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {flashError}
        </p>
      ) : null}

      {!profileComplete ? (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">
            Complete your profile to book
          </h2>
          <p className="mt-1 text-sm text-muted">
            We need your phone number, address, and post code before you can
            reserve a session.
          </p>
          <Link
            href={`/profile?next=${encodeURIComponent(BOOK_PROFILE_NEXT)}`}
            className="mt-3 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-muted"
          >
            Complete profile
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex shrink-0 rounded-full border border-border bg-card p-1"
          role="group"
          aria-label="Schedule view"
        >
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              view === "list"
                ? "bg-accent text-white shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("week")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              view === "week"
                ? "bg-accent text-white shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            Week
          </button>
        </div>

        <div className="flex w-full flex-wrap items-end justify-end gap-3 sm:w-auto">
          <label className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={hideFull}
              onChange={(e) => setHideFull(e.target.checked)}
              className="rounded border-border"
            />
            Hide full
          </label>
          {locations.length > 0 ? (
            <div className="min-w-0 shrink">
              <label
                htmlFor="book-location"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Location
              </label>
              <select
                id="book-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={selectClass}
              >
                <option value="all">All locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {categories.length > 0 ? (
            <div className="min-w-0 shrink">
              <label
                htmlFor="book-category"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Type
              </label>
              <select
                id="book-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectClass}
              >
                <option value="all">All types</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-muted">
          No sessions match these filters in the next few weeks.
        </p>
      ) : view === "list" ? (
        <div className="mt-10 space-y-8">
          {listGrouped.map(([day, items]) => (
            <section key={day}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {formatDateHeader(items[0]!.starts_at)}
              </h3>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {items.map((occ) => (
                  <li key={occ.id}>
                    <OccurrenceCard
                      occ={occ}
                      profileComplete={profileComplete}
                      onBook={() => setBooking(occ)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">{weekLabel}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setWeekStart((w) => {
                    const n = new Date(w);
                    n.setDate(n.getDate() - 7);
                    return n;
                  })
                }
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-card"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() => setWeekStart(startOfWeekMonday(new Date()))}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-card"
              >
                This week
              </button>
              <button
                type="button"
                onClick={() =>
                  setWeekStart((w) => {
                    const n = new Date(w);
                    n.setDate(n.getDate() + 7);
                    return n;
                  })
                }
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-card"
              >
                Next →
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card p-4">
            <div className="grid min-w-[720px] grid-cols-7 gap-2">
              {WEEKDAY_LABELS.map((label, index) => (
                <div
                  key={label}
                  className="flex min-h-[200px] flex-col rounded-xl bg-background/80 p-2"
                >
                  <p className="border-b border-border pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    {label}
                  </p>
                  <div className="mt-2 flex flex-1 flex-col gap-2">
                    {weekOccurrences
                      .filter((o) => weekdayIndexFromIso(o.starts_at) === index)
                      .map((occ) => (
                        <div
                          key={occ.id}
                          className="rounded-lg border border-border bg-card p-2 text-left shadow-sm"
                        >
                          <p className="text-xs font-semibold text-foreground">
                            {occ.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted">
                            {formatTimeRange(occ.starts_at, occ.ends_at)}
                          </p>
                          <SpotsBar
                            spotsLeft={occ.spots_left}
                            maxSlots={occ.max_slots}
                            spotsTaken={occ.spots_taken}
                            compact
                          />
                          <button
                            type="button"
                            disabled={!canBook(occ, profileComplete)}
                            onClick={() => setBooking(occ)}
                            className={`mt-2 w-full rounded-lg py-1.5 text-[11px] font-semibold transition ${
                              canBook(occ, profileComplete)
                                ? "bg-accent text-white hover:bg-accent-muted"
                                : "cursor-not-allowed bg-muted/40 text-foreground/50"
                            }`}
                          >
                            {bookButtonLabel(occ)}
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-foreground/40"
        onClose={() => setBooking(null)}
      >
        {booking ? (
          <form action={createBookingAction} className="p-6">
            <h2 className="text-lg font-semibold">Confirm booking</h2>
            <p className="mt-2 text-sm font-medium text-foreground">
              {booking.title}
            </p>
            <p className="mt-1 text-sm text-muted">
              {formatDateHeader(booking.starts_at)} ·{" "}
              {formatTimeRange(booking.starts_at, booking.ends_at)}
            </p>
            {booking.location ? (
              <p className="mt-1 text-sm text-muted">{booking.location}</p>
            ) : null}
            <p className="mt-3 text-sm text-muted">
              Your booking will be <strong className="text-foreground">pending</strong>{" "}
              until your trainer confirms it.
            </p>
            <input
              type="hidden"
              name="session_occurrence_id"
              value={booking.id}
            />
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setBooking(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-muted"
              >
                Request booking
              </button>
            </div>
          </form>
        ) : null}
      </dialog>
    </div>
  );
}

function OccurrenceCard({
  occ,
  profileComplete,
  onBook,
}: {
  occ: BookableOccurrence;
  profileComplete: boolean;
  onBook: () => void;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {occ.category ? (
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
            {occ.category}
          </span>
        ) : null}
        {occ.location ? (
          <span className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-muted">
            {occ.location}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-foreground">{occ.title}</h3>
      <p className="mt-1 text-sm text-muted">
        {formatTimeRange(occ.starts_at, occ.ends_at)}
      </p>
      <SpotsBar
        spotsLeft={occ.spots_left}
        maxSlots={occ.max_slots}
        spotsTaken={occ.spots_taken}
      />
      <button
        type="button"
        disabled={!canBook(occ, profileComplete)}
        onClick={onBook}
        className={`mt-4 w-full rounded-lg py-2.5 text-sm font-semibold transition ${
          canBook(occ, profileComplete)
            ? "bg-accent text-white shadow-sm hover:bg-accent-muted"
            : "cursor-not-allowed bg-muted/40 text-foreground/50"
        }`}
      >
        {bookButtonLabel(occ)}
      </button>
    </article>
  );
}
