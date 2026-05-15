"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { logoutAction } from "@/app/auth/actions";

type UserMenuProps = {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "user" | "client" | "admin" | null;
  /** When set, show truncated name beside the avatar (e.g. admin header). */
  triggerVariant?: "icon" | "iconWithLabel";
};

function getInitials(displayName: string | null, email: string): string {
  const source = displayName?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return letters || "?";
}

export function UserMenu({
  email,
  displayName,
  avatarUrl,
  role,
  triggerVariant = "icon",
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initials = getInitials(displayName, email);
  const showName = displayName?.trim() || email;
  const withLabel = triggerVariant === "iconWithLabel";

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

  const avatarInner = avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <span aria-hidden="true">{initials}</span>
  );

  const triggerButton = (
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      aria-label="Open account menu"
      className={
        withLabel
          ? "flex max-w-[220px] items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 text-left transition hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:max-w-[280px]"
          : "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-xs font-semibold text-foreground transition hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:h-10 sm:w-10 sm:text-sm"
      }
    >
      <span
        className={
          withLabel
            ? "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm"
            : "contents"
        }
      >
        {withLabel ? (
          <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
            {avatarInner}
          </span>
        ) : (
          avatarInner
        )}
      </span>
      {withLabel ? (
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {showName}
        </span>
      ) : null}
    </button>
  );

  return (
    <div ref={containerRef} className="relative">
      {triggerButton}

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-border bg-background shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {showName}
            </p>
            {displayName ? (
              <p className="truncate text-xs text-muted">{email}</p>
            ) : null}
            {role ? (
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted">
                {role}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col py-1">
            {role !== "admin" ? (
              <Link
                href="/dashboard"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-foreground transition hover:bg-card"
              >
                Dashboard
              </Link>
            ) : null}
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm text-foreground transition hover:bg-card"
            >
              Profile
            </Link>
            {role === "admin" ? (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-foreground transition hover:bg-card"
              >
                Admin dashboard
              </Link>
            ) : null}
            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="w-full px-4 py-2 text-left text-sm text-foreground transition hover:bg-card"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
