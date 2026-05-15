"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { NotificationRow } from "@/lib/dashboard/types";
import { markNotificationReadAction } from "@/app/dashboard/notifications/actions";

type NotificationsBellProps = {
  unreadCount: number;
  notifications: NotificationRow[];
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function NotificationsBell({
  unreadCount,
  notifications,
}: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className="relative inline-flex rounded-lg border border-border p-2 text-foreground transition hover:bg-card"
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
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border border-border bg-background shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <Link
              href="/dashboard/notifications"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-accent hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="max-h-80 overflow-y-auto py-1">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted">
                No notifications yet.
              </li>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <li key={n.id}>
                  <NotificationItem
                    notification={n}
                    onNavigate={() => setOpen(false)}
                  />
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function NotificationItem({
  notification,
  onNavigate,
}: {
  notification: NotificationRow;
  onNavigate: () => void;
}) {
  const unread = !notification.read_at;
  const href = notification.link_path ?? "/dashboard/notifications";

  return (
    <form
      action={markNotificationReadAction}
      className={`block border-b border-border last:border-0 ${unread ? "bg-accent/5" : ""}`}
    >
      <input type="hidden" name="id" value={notification.id} />
      <input type="hidden" name="redirect_to" value={href} />
      <button
        type="submit"
        role="menuitem"
        onClick={onNavigate}
        className="w-full px-4 py-3 text-left transition hover:bg-card"
      >
        <p className="text-sm font-medium text-foreground">{notification.title}</p>
        {notification.body ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{notification.body}</p>
        ) : null}
        <p className="mt-1 text-[10px] text-muted/80">
          {formatWhen(notification.created_at)}
        </p>
      </button>
    </form>
  );
}
