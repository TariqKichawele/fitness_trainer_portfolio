import { testimonials, trainerName } from "@/lib/trainer-content";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-20 border-t border-border bg-background px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          What clients say
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
          Real feedback from people training with {trainerName}. (Sample testimonials for
          demo.)
        </p>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <li
              key={t.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <p className="text-foreground">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent"
                  aria-hidden
                >
                  {t.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted">{t.subtitle}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
