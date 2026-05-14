"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  startTransition,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";
import { trainerName } from "@/lib/trainer-content";
import { UserMenu } from "@/components/landing/UserMenu";

function brandInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";

const NAV = [
  { href: "/admin", label: "Overview", match: "exact" as const },
  { href: "/admin/sessions", label: "Sessions", match: "prefix" as const },
  { href: "/admin/clients", label: "Clients", match: "prefix" as const },
  { href: "/admin/bookings", label: "Bookings", match: "prefix" as const },
];

function IconOverview({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconSessions({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M4 6h16M4 12h10M4 18h14" />
    </svg>
  );
}

function IconClients({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M15 6h1a3 3 0 0 1 3 3v0" />
      <path d="M4 20v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" />
      <path d="M18 14v1a2 2 0 0 0 2 2h0" />
    </svg>
  );
}

function IconBookings({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

const navIcons = [IconOverview, IconSessions, IconClients, IconBookings];

function isNavActive(
  pathname: string,
  href: string,
  match: "exact" | "prefix",
): boolean {
  if (match === "exact") {
    return pathname === href || pathname === `${href}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function buildBreadcrumbs(pathname: string) {
  const normalized = pathname.replace(/\/$/, "") || "/admin";
  const segments = normalized.split("/").filter(Boolean);
  const labels: Record<string, string> = {
    admin: "Admin",
    sessions: "Sessions",
    clients: "Clients",
    bookings: "Bookings",
  };
  const items: { href: string; label: string }[] = [];
  for (let i = 0; i < segments.length; i++) {
    const href = `/${segments.slice(0, i + 1).join("/")}`;
    const seg = segments[i] ?? "";
    items.push({
      href,
      label: labels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    });
  }
  return items;
}

export type AdminShellProps = {
  children: ReactNode;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  showDevBadge: boolean;
};

export function AdminShell({
  children,
  email,
  displayName,
  avatarUrl,
  showDevBadge,
}: AdminShellProps) {
  const pathname = usePathname() ?? "/admin";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const navId = useId();

  useEffect(() => {
    startTransition(() => {
      try {
        const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (raw === "1") setCollapsed(true);
      } catch {
        /* ignore */
      }
      setHydrated(true);
    });
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const crumbs = buildBreadcrumbs(pathname);

  const narrow = collapsed && hydrated;
  const sidebarWidthClass = narrow ? "w-56 lg:w-[4.5rem]" : "w-56";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        id={navId}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-[width,transform] duration-200 ease-out motion-reduce:transition-none lg:static lg:translate-x-0 ${sidebarWidthClass} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className={`flex shrink-0 border-b border-border px-3 py-2 ${
            narrow
              ? "min-h-14 flex-col items-stretch justify-center gap-2 lg:items-center lg:py-3"
              : "h-14 flex-row items-center justify-between gap-2"
          }`}
        >
          {!narrow ? (
            <Link
              href="/admin"
              className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground"
              onClick={closeMobile}
            >
              {trainerName}
            </Link>
          ) : (
            <>
              <Link
                href="/admin"
                className="truncate text-sm font-semibold tracking-tight text-foreground lg:hidden"
                onClick={closeMobile}
              >
                {trainerName}
              </Link>
              <Link
                href="/admin"
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-accent lg:flex"
                title={trainerName}
                onClick={closeMobile}
              >
                {brandInitials(trainerName)}
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="ml-auto hidden rounded-lg border border-border p-1.5 text-muted transition hover:bg-background hover:text-foreground lg:inline-flex"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              {collapsed ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2" aria-label="Admin">
          {NAV.map((item, index) => {
            const active = isNavActive(pathname, item.href, item.match);
            const Icon = navIcons[index] ?? IconOverview;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={`flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition motion-reduce:transition-none ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-background hover:text-foreground"
                } ${narrow ? "justify-start lg:justify-center" : ""}`}
                title={narrow ? item.label : undefined}
              >
                <Icon
                  className={`shrink-0 ${active ? "text-accent" : "text-muted"}`}
                />
                <span
                  className={
                    narrow ? "truncate lg:sr-only" : "truncate"
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-2">
          <Link
            href="/"
            onClick={closeMobile}
            className={`flex rounded-lg px-2 py-2 text-xs font-medium text-muted transition hover:bg-background hover:text-foreground ${
              narrow ? "justify-start lg:justify-center" : ""
            }`}
            title={narrow ? "Marketing site" : undefined}
          >
            {narrow ? (
              <>
                <span className="lg:hidden">← Marketing site</span>
                <span className="hidden lg:inline" aria-hidden>
                  ←
                </span>
              </>
            ) : (
              "← Marketing site"
            )}
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex rounded-lg border border-border p-2 text-foreground lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls={navId}
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {showDevBadge ? (
              <span className="hidden rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300 sm:inline-block">
                Dev
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <UserMenu
              email={email}
              displayName={displayName}
              avatarUrl={avatarUrl}
              role="admin"
              triggerVariant="iconWithLabel"
            />
          </div>
        </header>

        <div className="border-b border-border bg-card/40 px-4 py-2">
          <nav aria-label="Breadcrumb" className="text-xs text-muted">
            <ol className="flex flex-wrap items-center gap-1">
              {crumbs.map((crumb, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <li key={crumb.href} className="flex items-center gap-1">
                    {i > 0 ? (
                      <span className="text-muted/60" aria-hidden>
                        /
                      </span>
                    ) : null}
                    {last ? (
                      <span className="font-medium text-foreground/80">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="transition hover:text-accent"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <main id="admin-main" className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
