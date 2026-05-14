"use client";

import { useMemo, useState } from "react";
import type { Session, SessionCategory, SessionLocation, Weekday } from "@/lib/types";
import { sessions, weekdaysOrdered } from "@/lib/trainer-content";

type ViewMode = "grid" | "calendar";
type AllFilter = "all";

const selectClass =
  "min-w-[128px] max-w-[180px] rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 sm:min-w-[140px] sm:max-w-[200px]";

function spotsLeft(session: Session): number {
  return Math.max(0, session.spots - session.spotsTaken);
}

function barFillClass(pctLeft: number): string {
  if (pctLeft <= 0.15) return "bg-rose-500";
  if (pctLeft <= 0.35) return "bg-amber-500";
  return "bg-accent";
}

function SpotsBarAndBook({
  session,
  compact = false,
}: {
  session: Session;
  compact?: boolean;
}) {
  const left = spotsLeft(session);
  const pctLeft = session.spots > 0 ? left / session.spots : 0;
  const fillPct = Math.round(pctLeft * 100);
  const fillClass = barFillClass(pctLeft);
  const soldOut = left === 0;

  return (
    <div className={compact ? "mt-2" : "mt-4"}>
      <div
        className={`flex items-baseline justify-between gap-2 text-muted ${compact ? "text-[10px]" : "text-xs"}`}
      >
        <span>
          <span className="font-medium text-foreground">{left}</span> of {session.spots}{" "}
          spots left
        </span>
        <span className="shrink-0 tabular-nums opacity-80">
          {session.spotsTaken} booked
        </span>
      </div>
      <div
        className={`mt-1.5 w-full overflow-hidden rounded-full bg-foreground/10 ${compact ? "h-1.5" : "h-2.5"}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={session.spots}
        aria-valuenow={left}
        aria-label={`${left} of ${session.spots} spots remaining`}
      >
        <div
          className={`h-full rounded-full transition-all ${fillClass}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <button
        type="button"
        disabled={soldOut}
        className={`mt-3 w-full rounded-lg font-semibold text-white transition ${compact ? "py-1.5 text-[11px]" : "py-2.5 text-sm"} ${
          soldOut
            ? "cursor-not-allowed bg-muted/40 text-foreground/50"
            : "bg-accent shadow-sm hover:bg-accent-muted"
        }`}
      >
        {soldOut ? "Full" : "Book now"}
      </button>
    </div>
  );
}

function SessionCard({ session }: { session: Session }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
          {session.category}
        </span>
        <span className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-muted">
          {session.location}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-foreground">{session.name}</h3>
      <dl className="mt-3 grid gap-1 text-sm text-muted">
        <div className="flex justify-between gap-4">
          <dt>Day</dt>
          <dd className="font-medium text-foreground">{session.day}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Duration</dt>
          <dd className="font-medium text-foreground">{session.durationMin} min</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Capacity</dt>
          <dd className="font-medium text-foreground">{session.spots} spots</dd>
        </div>
      </dl>
      <SpotsBarAndBook session={session} />
    </article>
  );
}

export function WeeklySchedule() {
  const [view, setView] = useState<ViewMode>("grid");
  const [location, setLocation] = useState<SessionLocation | AllFilter>("all");
  const [category, setCategory] = useState<SessionCategory | AllFilter>("all");
  const [dayFilter, setDayFilter] = useState<AllFilter | Weekday>("all");

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (location !== "all" && s.location !== location) return false;
      if (category !== "all" && s.category !== category) return false;
      if (dayFilter !== "all" && s.day !== dayFilter) return false;
      return true;
    });
  }, [location, category, dayFilter]);

  return (
    <section
      id="weekly-schedule"
      className="scroll-mt-20 border-t border-border bg-background px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Weekly schedule
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Filter by location, session type, or day. Switch between grid and calendar to
          plan your week.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="inline-flex shrink-0 rounded-full border border-border bg-card p-1"
            role="group"
            aria-label="Schedule view"
          >
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                view === "grid"
                  ? "bg-accent text-white shadow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                view === "calendar"
                  ? "bg-accent text-white shadow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Calendar
            </button>
          </div>

          <div className="flex w-full flex-wrap items-end justify-end gap-3 sm:w-auto sm:max-w-none">
            <div className="min-w-0 shrink">
              <label
                htmlFor="schedule-location"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted sm:text-right"
              >
                Location
              </label>
              <select
                id="schedule-location"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value as SessionLocation | AllFilter)
                }
                className={selectClass}
              >
                <option value="all">All locations</option>
                <option value="Studio">Studio</option>
                <option value="Outdoor">Outdoor</option>
              </select>
            </div>
            <div className="min-w-0 shrink">
              <label
                htmlFor="schedule-type"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted sm:text-right"
              >
                Type
              </label>
              <select
                id="schedule-type"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as SessionCategory | AllFilter)
                }
                className={selectClass}
              >
                <option value="all">All types</option>
                <option value="Strength">Strength</option>
                <option value="Conditioning">Conditioning</option>
                <option value="Mobility">Mobility</option>
              </select>
            </div>
            <div className="min-w-0 shrink">
              <label
                htmlFor="schedule-day"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted sm:text-right"
              >
                Day
              </label>
              <select
                id="schedule-day"
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value as AllFilter | Weekday)}
                className={selectClass}
              >
                <option value="all">All days</option>
                {weekdaysOrdered.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-muted">
            No sessions match these filters. Try widening location, type, or day.
          </p>
        ) : view === "grid" ? (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((session) => (
              <li key={session.id}>
                <SessionCard session={session} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-card p-4">
            <div className="grid min-w-[720px] grid-cols-7 gap-2">
              {weekdaysOrdered.map((day) => (
                <div key={day} className="flex min-h-[200px] flex-col rounded-xl bg-background/80 p-2">
                  <p className="border-b border-border pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    {day.slice(0, 3)}
                  </p>
                  <div className="mt-2 flex flex-1 flex-col gap-2">
                    {filtered
                      .filter((s) => s.day === day)
                      .map((session) => (
                        <div
                          key={session.id}
                          className="rounded-lg border border-border bg-card p-2 text-left shadow-sm"
                        >
                          <p className="text-xs font-semibold text-foreground">{session.name}</p>
                          <p className="mt-1 text-[10px] text-muted">
                            {session.category} · {session.durationMin}m · {session.location}
                          </p>
                          <SpotsBarAndBook session={session} compact />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
