import Link from "next/link";
import { trainerName } from "@/lib/trainer-content";
import { BOOK_PROFILE_NEXT } from "@/lib/profile/requirements";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAppRole } from "@/lib/auth/role";
import { getAvatarSignedUrl } from "@/lib/avatar";
import { UserMenu } from "@/components/landing/UserMenu";

const navLinks = [
  { href: "#weekly-schedule", label: "Schedule" },
  { href: "#about", label: "About" },
  { href: "#testimonials", label: "Testimonials" },
] as const;

export async function Navbar() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  let role: "user" | "client" | "admin" | null = null;

  const bookHref = user
    ? BOOK_PROFILE_NEXT
    : `/login?next=${encodeURIComponent(BOOK_PROFILE_NEXT)}`;

  if (user) {
    const [{ data: profile }, resolvedRole] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      fetchAppRole(supabase, user.id),
    ]);
    displayName = profile?.display_name ?? null;
    role = resolvedRole;
    avatarUrl = await getAvatarSignedUrl(supabase, profile?.avatar_url);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        <Link
          href="/"
          className="shrink-0 text-base font-semibold tracking-tight text-foreground sm:text-lg"
        >
          {trainerName}
        </Link>

        <ul className="flex min-w-0 flex-1 justify-center gap-3 sm:gap-8">
          {navLinks.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-xs font-medium text-muted transition hover:text-foreground sm:text-sm"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <UserMenu
              email={user.email ?? ""}
              displayName={displayName}
              avatarUrl={avatarUrl}
              role={role}
            />
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-border px-3 py-2 text-center text-xs font-medium text-foreground transition hover:bg-card sm:px-4 sm:text-sm"
            >
              Log in
            </Link>
          )}
          <Link
            href={bookHref}
            className="rounded-full bg-accent px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-accent-muted sm:px-5 sm:text-sm"
          >
            <span className="hidden sm:inline">Book a session</span>
            <span className="sm:hidden">Book</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
