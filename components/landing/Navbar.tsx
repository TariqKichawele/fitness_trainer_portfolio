import Link from "next/link";
import { hero, trainerName } from "@/lib/trainer-content";

const navLinks = [
  { href: "#weekly-schedule", label: "Schedule" },
  { href: "#about", label: "About" },
  { href: "#testimonials", label: "Testimonials" },
] as const;

export function Navbar() {
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

        <a
          href="#weekly-schedule"
          className="shrink-0 rounded-full bg-accent px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-accent-muted sm:px-5 sm:text-sm"
        >
          <span className="hidden sm:inline">{hero.primaryCta}</span>
          <span className="sm:hidden">Schedule</span>
        </a>
      </nav>
    </header>
  );
}
