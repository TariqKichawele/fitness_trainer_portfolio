import Link from "next/link";
import { finalCta } from "@/lib/trainer-content";

export function FinalCta() {
  return (
    <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-gradient-to-br from-accent/20 via-card to-card px-6 py-12 text-center sm:px-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {finalCta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">{finalCta.body}</p>
        <Link
          href="#weekly-schedule"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-muted"
        >
          {finalCta.buttonLabel}
        </Link>
      </div>
    </section>
  );
}
