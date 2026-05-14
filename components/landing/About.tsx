import Image from "next/image";
import { about, trainerName } from "@/lib/trainer-content";

export function About() {
  return (
    <section
      id="about"
      className="scroll-mt-20 border-t border-border bg-card/40 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          About {trainerName}
        </h2>
        <p className="mt-3 text-lg text-accent">{about.headline}</p>
        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="space-y-5 text-muted">
            {about.bio.map((p, i) => (
              <p key={i} className="leading-relaxed">
                {p}
              </p>
            ))}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Credentials
              </h3>
              <ul className="mt-3 list-inside list-disc space-y-2 marker:text-accent">
                {about.credentials.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {about.images.map((img) => (
              <div
                key={img.src}
                className="relative aspect-4/5 overflow-hidden rounded-2xl border border-border bg-background shadow-sm sm:aspect-square"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
