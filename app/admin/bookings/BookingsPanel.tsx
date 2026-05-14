"use client";

import { useEffect, useRef, useState } from "react";
import type { BookingAdminRow, OccurrenceOption } from "@/lib/admin/types";
import type { ActiveBookingFilters } from "@/lib/admin/booking-filters";
import {
  createBookingAction,
  deleteBookingAction,
  updateBookingAction,
} from "@/app/admin/bookings/actions";

const field =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-accent/30 focus:ring-2";
const label = "block text-xs font-medium text-muted";
const th =
  "border-b border-border bg-background px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted";
const td = "border-b border-border px-3 py-2.5 text-sm text-foreground";

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled_by_client",
  "cancelled_by_admin",
  "no_show",
  "attended",
] as const;

const PAYMENT_STATUSES = ["", "unpaid", "paid_on_site", "waived"] as const;

type ClientOption = {
  user_id: string;
  email: string;
  display_name: string | null;
  role: string;
};

type BookingsPanelProps = {
  bookings: BookingAdminRow[];
  clients: ClientOption[];
  occurrences: OccurrenceOption[];
  flashError: string | null;
  flashOk: string | null;
  activeFilters: ActiveBookingFilters;
};

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

export function BookingsPanel({
  bookings,
  clients,
  occurrences,
  flashError,
  flashOk,
  activeFilters,
}: BookingsPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<BookingAdminRow | null>(null);

  useEffect(() => {
    if (editing) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [editing]);

  const bookingClients = clients.filter((c) => c.role !== "admin");

  const retainFilters = (
    <>
      <input type="hidden" name="retain_status" value={activeFilters.status} />
      <input
        type="hidden"
        name="retain_session_type"
        value={activeFilters.sessionType}
      />
      <input type="hidden" name="retain_range" value={activeFilters.range} />
    </>
  );

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
      {flashOk ? (
        <p className="mb-4 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted">
          {flashOk === "created" && "Booking created."}
          {flashOk === "updated" && "Booking updated."}
          {flashOk === "deleted" && "Booking deleted."}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">New booking</h2>
        <form action={createBookingAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          {retainFilters}
          <label className={label}>
            Client
            <select name="user_id" required className={field}>
              <option value="">Select client…</option>
              {bookingClients.map((c) => (
                <option key={c.user_id} value={c.user_id}>
                  {(c.display_name ?? c.email) + ` (${c.email})`}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Session slot
            <select name="session_occurrence_id" required className={field}>
              <option value="">Select occurrence…</option>
              {occurrences.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Status
            <select name="status" defaultValue="pending" className={field}>
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Payment
            <select name="payment_status" defaultValue="unpaid" className={field}>
              {(["unpaid", "paid_on_site", "waived"] as const).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-muted"
            >
              Create booking
            </button>
          </div>
        </form>
      </section>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        {bookings.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No bookings match these filters.{" "}
            <a href="/admin/bookings" className="text-accent hover:underline">
              Clear filters
            </a>
          </p>
        ) : (
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr>
              <th className={th}>Client</th>
              <th className={th}>Session</th>
              <th className={th}>Starts</th>
              <th className={th}>Status</th>
              <th className={th}>Payment</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((row) => (
              <tr key={row.id} className="hover:bg-background/80">
                <td className={td}>{row.client_name ?? row.user_id.slice(0, 8)}</td>
                <td className={td}>{row.session_title}</td>
                <td className={`${td} font-mono text-xs text-muted`}>
                  {formatWhen(row.starts_at)}
                </td>
                <td className={`${td} font-mono text-xs`}>{row.status}</td>
                <td className={`${td} font-mono text-xs`}>
                  {row.payment_status ?? "—"}
                </td>
                <td className={`${td} text-right`}>
                  <button
                    type="button"
                    onClick={() => setEditing(row)}
                    className="mr-3 text-xs font-medium text-accent hover:underline"
                  >
                    Edit
                  </button>
                  <form
                    action={deleteBookingAction}
                    className="inline"
                    onSubmit={(e) => {
                      if (!window.confirm("Delete this booking permanently?")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {retainFilters}
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-muted hover:text-foreground"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className="w-[min(100%,26rem)] rounded-xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-foreground/20"
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <form
            action={updateBookingAction}
            className="flex flex-col gap-4 p-5"
          >
            {retainFilters}
            <input type="hidden" name="id" value={editing.id} />
            <h3 className="text-base font-semibold">Edit booking</h3>
            <p className="text-xs text-muted">
              {editing.client_name ?? editing.user_id} · {editing.session_title}
            </p>
            <label className={label}>
              Status
              <select name="status" defaultValue={editing.status} className={field}>
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Payment
              <select
                name="payment_status"
                defaultValue={editing.payment_status ?? ""}
                className={field}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s || "none"} value={s}>
                    {s === "" ? "—" : s}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 text-sm"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </form>
        ) : null}
      </dialog>
    </div>
  );
}
