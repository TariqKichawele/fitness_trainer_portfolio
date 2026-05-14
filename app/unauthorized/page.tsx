import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Access denied</h1>
      <p className="mt-3 text-muted">
        You do not have permission to view this area. If you need admin access,
        ask an owner to grant the admin role in Supabase.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
        >
          User dashboard
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-muted"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
