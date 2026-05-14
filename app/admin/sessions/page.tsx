import Link from "next/link";
import { flashErrorFromParam } from "@/lib/admin/flash-params";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { SessionTypeRow } from "@/lib/admin/types";
import { SessionTypesPanel } from "@/app/admin/sessions/SessionTypesPanel";

type PageProps = {
  searchParams: Promise<{ err?: string; ok?: string }>;
};

export default async function AdminSessionsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const flashError = flashErrorFromParam(sp.err);
  const flashOk = typeof sp.ok === "string" ? sp.ok : null;

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("session_types")
    .select("*")
    .order("title", { ascending: true });

  const types = (error ? [] : (data ?? [])) as SessionTypeRow[];

  return (
    <>
      <header className="border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Sessions
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Session categories
        </h1>
        <p className="mt-1 text-sm text-muted">
          Live data from <span className="font-mono text-xs">session_types</span>.
          Create, edit, or delete catalog entries (occurrences keep optional type
          link if removed).
        </p>
      </header>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error.message}
        </p>
      ) : null}

      <div className="mt-6">
        <SessionTypesPanel
          types={types}
          flashError={flashError}
          flashOk={flashOk}
        />
      </div>

      <p className="mt-10 text-center text-sm text-muted">
        <Link href="/admin" className="text-accent hover:underline">
          ← Back to overview
        </Link>
      </p>
    </>
  );
}
