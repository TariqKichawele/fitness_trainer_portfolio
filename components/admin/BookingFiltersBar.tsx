import Link from "next/link";
import type { ReactElement } from "react";
import type { ActiveBookingFilters, DateRangeKey } from "@/lib/admin/booking-filters";
import {
  BOOKING_FILTER_STATUSES,
  bookingsListPath,
  type SessionTypeFilterOption,
} from "@/lib/admin/booking-filters";

const pill = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-xs font-medium transition ${
    active
      ? "border-accent bg-accent/15 text-accent"
      : "border-border bg-card text-muted hover:border-accent/40 hover:text-foreground"
  }`;

const iconBtn = (active: boolean) =>
  `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
    active
      ? "border-accent bg-accent/15 text-accent"
      : "border-border bg-card text-muted hover:border-accent/40 hover:text-foreground"
  }`;

function mergePath(active: ActiveBookingFilters, patch: Partial<ActiveBookingFilters>) {
  return bookingsListPath({ ...active, ...patch });
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSunrise() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 18h18M6 18a6 6 0 0 1 12 0M12 3v4M8 7l-2-2M16 7l2-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10a3 3 0 1 0 0 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconWeek() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          x={4 + i * 2.2}
          y="8"
          width="1.6"
          height="8"
          rx="0.4"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function IconSevenDays() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 5h11a2 2 0 0 1 2 2v11H5V5z"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
      />
      <path d="M5 10h15" stroke="currentColor" strokeWidth="1.75" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={7 + i * 2} cy="16" r="0.9" fill="currentColor" />
      ))}
    </svg>
  );
}

function IconMonth() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M3 10h18M9 3v4M15 3v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="9" cy="15" r="1" fill="currentColor" />
      <circle cx="15" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

const RANGE_ROWS: {
  key: DateRangeKey;
  title: string;
  label: string;
  Icon: () => ReactElement;
}[] = [
  { key: "all", title: "Any date", label: "All dates", Icon: IconCalendar },
  { key: "today", title: "Today", label: "Today", Icon: IconSun },
  { key: "tomorrow", title: "Tomorrow", label: "Tomorrow", Icon: IconSunrise },
  { key: "this_week", title: "This week (Mon–Sun)", label: "Week", Icon: IconWeek },
  { key: "next_7", title: "Next 7 days", label: "7 days", Icon: IconSevenDays },
  { key: "this_month", title: "This calendar month", label: "Month", Icon: IconMonth },
];

function statusLabel(s: (typeof BOOKING_FILTER_STATUSES)[number]) {
  return s.replace(/_/g, " ");
}

type BookingFiltersBarProps = {
  active: ActiveBookingFilters;
  sessionTypes: SessionTypeFilterOption[];
};

export function BookingFiltersBar({ active, sessionTypes }: BookingFiltersBarProps) {
  return (
    <div className="space-y-5">
      <nav className="flex flex-col gap-2" aria-label="Filter by date range">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Date range
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {RANGE_ROWS.map(({ key, title, label, Icon }) => {
            const isActive = active.range === key;
            return (
              <Link
                key={key}
                href={mergePath(active, { range: key })}
                title={title}
                aria-current={isActive ? "page" : undefined}
                className={iconBtn(isActive)}
              >
                <span className="sr-only">
                  {label}
                  {isActive ? " (current filter)" : ""}
                </span>
                <Icon />
              </Link>
            );
          })}
        </div>
        <p className="text-[11px] text-muted">
          Quick ranges use your local timezone for start and end of day.
        </p>
      </nav>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Filter by status">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Status
        </span>
        <Link
          href={mergePath(active, { status: "all" })}
          className={pill(active.status === "all")}
          aria-current={active.status === "all" ? "page" : undefined}
        >
          All
        </Link>
        {BOOKING_FILTER_STATUSES.map((s) => (
          <Link
            key={s}
            href={mergePath(active, { status: s })}
            className={pill(active.status === s)}
            aria-current={active.status === s ? "page" : undefined}
          >
            {statusLabel(s)}
          </Link>
        ))}
      </nav>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Filter by session type">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Session type
        </span>
        <Link
          href={mergePath(active, { sessionType: "all" })}
          className={pill(active.sessionType === "all")}
          aria-current={active.sessionType === "all" ? "page" : undefined}
        >
          All types
        </Link>
        {sessionTypes.map((t) => (
          <Link
            key={t.id}
            href={mergePath(active, { sessionType: t.id })}
            className={pill(active.sessionType === t.id)}
            aria-current={active.sessionType === t.id ? "page" : undefined}
          >
            {t.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
