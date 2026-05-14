import Image from "next/image";
import Link from "next/link";
import { hero, heroImage, trainerName } from "@/lib/trainer-content";

export function Hero() {
  return (
    <section className="relative isolate min-h-[85vh] overflow-hidden">
      <Image
        src={heroImage.src}
        alt={heroImage.alt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pb-28 lg:pt-40">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
          {trainerName}
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {hero.title}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">{hero.subtitle}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="#weekly-schedule"
            className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-muted"
          >
            {hero.primaryCta}
          </Link>
          <Link
            href="#about"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card/80 px-8 py-3 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-card"
          >
            {hero.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
