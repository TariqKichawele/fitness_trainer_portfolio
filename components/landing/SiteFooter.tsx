import { footer, trainerName } from "@/lib/trainer-content";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card/60 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-foreground">{trainerName}</p>
          <p className="mt-2 max-w-sm text-sm text-muted">{footer.tagline}</p>
        </div>
        <div className="text-sm text-muted">
          <p>
            <span className="text-foreground">Email</span>{" "}
            <a href={`mailto:${footer.email}`} className="text-accent hover:underline">
              {footer.email}
            </a>
          </p>
          <p className="mt-2">
            <span className="text-foreground">Social</span> {footer.socialLabel}
          </p>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-muted">
        © {new Date().getFullYear()} {trainerName}. All rights reserved.
      </p>
    </footer>
  );
}
