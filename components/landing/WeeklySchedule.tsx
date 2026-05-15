"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SpotsBar } from "@/components/sessions/SpotsBar";
import type { PublicOccurrence } from "@/lib/sessions/types";
import { bookSessionHref, bookSessionLabel } from "@/lib/sessions/book-links";
import {
  dateKey,
  endOfWeekSunday,
  formatDateHeader,
  formatTimeRange,
  startOfWeekMonday,
  uniqueCategoriesFromOccurrences,
  uniqueLocationsFromOccurrences,
  weekdayIndexFromIso,
  WEEKDAY_LABELS,
  durationMinutes,
} from "@/lib/sessions/format";

type ViewMode = "list" | "week";

const selectClass =
  "min-w-[128px] max-w-[180px] rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 sm:min-w-[140px] sm:max-w-[200px]";

type WeeklyScheduleProps = {
  occurrences: PublicOccurrence[];
  isLoggedIn: boolean;
};

function OccurrenceRow({
  occ,
  isLoggedIn,
}: {
  occ: PublicOccurrence;
  isLoggedIn: boolean;
}) {
  const href = bookSessionHref(isLoggedIn);
  const label = bookSessionLabel(isLoggedIn, occ.is_full);
  const duration = durationMinutes(occ.starts_at, occ.ends_at);

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="text-base font-semibold text-foreground">{occ.title}</h3>
          {occ.category ? (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
              {occ.category}
            </span>
          ) : null}
          {occ.location ? (
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] text-muted">
              {occ.location}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted">
          {formatTimeRange(occ.starts_at, occ.ends_at)}
          {duration > 0 ? ` · ${duration} min` : ""}
        </p>
        <p className="mt-0.5 text-xs text-muted sm:hidden">
          <span className="font-medium text-foreground">{occ.spots_left}</span> of{" "}
          {occ.max_slots} spots left
        </p>
        <div className="mt-2 hidden max-w-xs sm:block">
          <SpotsBar
            spotsLeft={occ.spots_left}
            maxSlots={occ.max_slots}
            spotsTaken={occ.spots_taken}
            compact
          />
        </div>
      </div>
      <div className="shrink-0 sm:w-36">
        {occ.is_full ? (
          <span className="block w-full rounded-lg bg-muted/40 py-2 text-center text-sm font-semibold text-foreground/50">
            {label}
          </span>
        ) : (
          <Link
            href={href}
            className="block w-full rounded-lg bg-accent py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-accent-muted"
          >
            {label}
          </Link>
        )}
      </div>
    </article>
  );
}

export function WeeklySchedule({
  occurrences,
  isLoggedIn,
}: WeeklyScheduleProps) {
  const [view, setView] = useState<ViewMode>("list");
  const [location, setLocation] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [hideFull, setHideFull] = useState(false);
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));

  const locations = useMemo(
    () => uniqueLocationsFromOccurrences(occurrences),
    [occurrences],
  );
  const categories = useMemo(
    () => uniqueCategoriesFromOccurrences(occurrences),
    [occurrences],
  );

  const filtered = useMemo(() => {
    return occurrences.filter((o) => {
      if (location !== "all" && o.location !== location) return false;
      if (category !== "all" && o.category !== category) return false;
      if (hideFull && o.is_full) return false;
      return true;
    });
  }, [occurrences, location, category, hideFull]);

  const listGrouped = useMemo(() => {
    const groups = new Map<string, PublicOccurrence[]>();
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

  const bookHref = bookSessionHref(isLoggedIn);

  return (
    <section
      id="weekly-schedule"
      className="scroll-mt-20 border-t border-border bg-background px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Upcoming sessions
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Browse real scheduled classes for the next few weeks. Filter by location
          or type, then book through your dashboard.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                  htmlFor="schedule-location"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted sm:text-right"
                >
                  Location
                </label>
                <select
                  id="schedule-location"
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
                  htmlFor="schedule-type"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted sm:text-right"
                >
                  Type
                </label>
                <select
                  id="schedule-type"
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
            {occurrences.length === 0
              ? "No upcoming sessions in the next few weeks. Check back soon."
              : "No sessions match these filters. Try widening location or type."}
          </p>
        ) : view === "list" ? (
          <div className="mt-8 space-y-5">
            {listGrouped.map(([day, items]) => (
              <section key={day}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                  {formatDateHeader(items[0]!.starts_at)}
                </h3>
                <ul className="flex flex-col gap-2">
                  {items.map((occ) => (
                    <li key={occ.id}>
                      <OccurrenceRow occ={occ} isLoggedIn={isLoggedIn} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-12">
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
                        .map((occ) => {
                          const labelBtn = bookSessionLabel(
                            isLoggedIn,
                            occ.is_full,
                          );
                          return (
                            <div
                              key={occ.id}
                              className="rounded-lg border border-border bg-card p-2 text-left shadow-sm"
                            >
                              <p className="text-xs font-semibold text-foreground">
                                {occ.title}
                              </p>
                              <p className="mt-1 text-[10px] text-muted">
                                {formatTimeRange(occ.starts_at, occ.ends_at)}
                              </p>
                              <SpotsBar
                                spotsLeft={occ.spots_left}
                                maxSlots={occ.max_slots}
                                spotsTaken={occ.spots_taken}
                                compact
                              />
                              {occ.is_full ? (
                                <span className="mt-2 block w-full rounded-lg bg-muted/40 py-1.5 text-center text-[11px] font-semibold text-foreground/50">
                                  {labelBtn}
                                </span>
                              ) : (
                                <Link
                                  href={bookHref}
                                  className="mt-2 block w-full rounded-lg bg-accent py-1.5 text-center text-[11px] font-semibold text-white transition hover:bg-accent-muted"
                                >
                                  {labelBtn}
                                </Link>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
