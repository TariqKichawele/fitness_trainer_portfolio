import Link from "next/link";
import { flashErrorFromParam } from "@/lib/admin/flash-params";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { ClientDirectoryRow } from "@/lib/admin/types";
import { ClientsPanel } from "@/app/admin/clients/ClientsPanel";

const ROLE_OPTIONS = ["all", "user", "client", "admin"] as const;
type RoleFilterOption = (typeof ROLE_OPTIONS)[number];

function parseRoleFilter(raw: unknown): Exclude<RoleFilterOption, "all"> | "all" {
  if (raw === "user" || raw === "client" || raw === "admin") {
    return raw;
  }
  return "all";
}

type PageProps = {
  searchParams: Promise<{ err?: string; ok?: string; role?: string }>;
};

export default async function AdminClientsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const flashError = flashErrorFromParam(sp.err);
  const flashOk = typeof sp.ok === "string" ? sp.ok : null;
  const roleFilter = parseRoleFilter(sp.role);

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.rpc("admin_list_clients");

  const clients = (error ? [] : (data ?? [])) as ClientDirectoryRow[];

  const filtered =
    roleFilter === "all"
      ? clients
      : clients.filter((c) => c.role === roleFilter);

  const counts = {
    all: clients.length,
    user: clients.filter((c) => c.role === "user").length,
    client: clients.filter((c) => c.role === "client").length,
    admin: clients.filter((c) => c.role === "admin").length,
  };

  const filterLink = (role: RoleFilterOption) =>
    role === "all" ? "/admin/clients" : `/admin/clients?role=${role}`;

  const filterLabel: Record<RoleFilterOption, string> = {
    all: "All",
    user: "User",
    client: "Client",
    admin: "Admin",
  };

  return (
    <>
      <header className="border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Clients
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Client directory
        </h1>
        <p className="mt-1 text-sm text-muted">
          Profiles and roles from the database. Email comes from Auth via a
          secure admin-only function.
        </p>
      </header>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error.message}
        </p>
      ) : null}

      <div className="mt-6">
        <nav
          className="mb-4 flex flex-wrap items-center gap-2"
          aria-label="Filter by role"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Role
          </span>
          {ROLE_OPTIONS.map((role) => {
            const active = roleFilter === role;
            return (
              <Link
                key={role}
                href={filterLink(role)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-card text-muted hover:border-accent/40 hover:text-foreground"
                }`}
              >
                {filterLabel[role]}{" "}
                <span className="font-mono text-[10px] opacity-80">
                  ({counts[role]})
                </span>
              </Link>
            );
          })}
        </nav>

        <ClientsPanel
          clients={filtered}
          flashError={flashError}
          flashOk={flashOk}
          activeRoleFilter={roleFilter}
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
