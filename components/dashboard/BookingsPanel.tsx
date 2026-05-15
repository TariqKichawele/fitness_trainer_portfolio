"use client";

import { useEffect, useRef, useState } from "react";
import type { BookingClientRow } from "@/lib/dashboard/types";
import type { BookingTab } from "@/lib/dashboard/bookings-load";
import { filterBookingsByTab } from "@/lib/dashboard/bookings-load";
import {
  bookingStatusClass,
  bookingStatusLabel,
  ACTIVE_BOOKING_STATUSES,
} from "@/lib/bookings/status";
import { cancelBookingAction } from "@/app/dashboard/bookings/actions";

const th =
  "border-b border-border bg-background px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted";
const td = "border-b border-border px-3 py-2.5 text-sm text-foreground";

const TABS: { id: BookingTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

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

type BookingsPanelProps = {
  bookings: BookingClientRow[];
  flashError: string | null;
  flashOk: string | null;
  initialTab?: BookingTab;
};

export function BookingsPanel({
  bookings,
  flashError,
  flashOk,
  initialTab = "upcoming",
}: BookingsPanelProps) {
  const [tab, setTab] = useState<BookingTab>(initialTab);
  const [cancelling, setCancelling] = useState<BookingClientRow | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (cancelling) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [cancelling]);

  const filtered = filterBookingsByTab(bookings, tab);

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
      {flashOk === "cancelled" ? (
        <p className="mb-4 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted">
          Booking cancelled.
        </p>
      ) : null}
      {flashOk === "requested" ? (
        <p className="mb-4 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-foreground">
          Booking requested. Your trainer will confirm it shortly.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? "bg-accent/15 text-accent"
                : "text-muted hover:bg-card hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">
          {tab === "upcoming"
            ? "No upcoming bookings."
            : tab === "cancelled"
              ? "No cancelled bookings."
              : "No past bookings yet."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr>
                <th className={th}>Session</th>
                <th className={th}>When</th>
                <th className={th}>Status</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td className={td}>
                    <p className="font-medium">{b.session_title}</p>
                    {b.location ? (
                      <p className="mt-0.5 text-xs text-muted">{b.location}</p>
                    ) : null}
                  </td>
                  <td className={`${td} whitespace-nowrap tabular-nums`}>
                    {b.starts_at ? formatWhen(b.starts_at) : "—"}
                  </td>
                  <td className={td}>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${bookingStatusClass(b.status)}`}
                    >
                      {bookingStatusLabel(b.status)}
                    </span>
                  </td>
                  <td className={td}>
                    {ACTIVE_BOOKING_STATUSES.has(b.status) ? (
                      <button
                        type="button"
                        onClick={() => setCancelling(b)}
                        className="text-xs font-medium text-rose-600 transition hover:underline dark:text-rose-400"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-foreground/40"
        onClose={() => setCancelling(null)}
      >
        {cancelling ? (
          <form action={cancelBookingAction} className="p-6">
            <h2 className="text-lg font-semibold">Cancel booking?</h2>
            <p className="mt-2 text-sm text-muted">
              {cancelling.session_title}
              {cancelling.starts_at
                ? ` · ${formatWhen(cancelling.starts_at)}`
                : ""}
            </p>
            <p className="mt-2 text-sm text-muted">
              This cannot be undone. Contact your trainer if you need to
              rebook.
            </p>
            <input type="hidden" name="id" value={cancelling.id} />
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelling(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
              >
                Keep booking
              </button>
              <button
                type="submit"
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Cancel booking
              </button>
            </div>
          </form>
        ) : null}
      </dialog>
    </div>
  );
}
