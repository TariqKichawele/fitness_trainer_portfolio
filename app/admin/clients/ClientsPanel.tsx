"use client";

import { useEffect, useRef, useState } from "react";
import type { ClientDirectoryRow } from "@/lib/admin/types";
import {
  setClientStatusAction,
  updateClientAction,
} from "@/app/admin/clients/actions";

const field =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-accent/30 focus:ring-2";
const label = "block text-xs font-medium text-muted";
const th =
  "border-b border-border bg-background px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted";
const td = "border-b border-border px-3 py-2.5 text-sm text-foreground";

type ClientsPanelProps = {
  clients: ClientDirectoryRow[];
  flashError: string | null;
  flashOk: string | null;
  /** When not `all`, hidden field keeps role filter after form redirects. */
  activeRoleFilter: "all" | "user" | "client" | "admin";
};

export function ClientsPanel({
  clients,
  flashError,
  flashOk,
  activeRoleFilter,
}: ClientsPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<ClientDirectoryRow | null>(null);

  const retainRoleHidden =
    activeRoleFilter !== "all" ? (
      <input type="hidden" name="retain_role" value={activeRoleFilter} />
    ) : null;

  useEffect(() => {
    if (editing) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [editing]);

  return (
    <div>
      {flashError ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {flashError}
        </p>
      ) : null}
      {flashOk ? (
        <p className="mb-4 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted">
          {flashOk === "updated" && "Client saved."}
          {flashOk === "status" && "Account status updated."}
        </p>
      ) : null}

      <p className="mb-6 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted">
        New accounts are created via{" "}
        <a href="/signup" className="font-medium text-accent hover:underline">
          public signup
        </a>
        . Use this list to edit profiles and roles (not admins).
      </p>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        {clients.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No accounts match this role. Try another filter or{" "}
            <a href="/admin/clients" className="text-accent hover:underline">
              show all
            </a>
            .
          </p>
        ) : (
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr>
              <th className={th}>Name</th>
              <th className={th}>Email</th>
              <th className={th}>Role</th>
              <th className={th}>Status</th>
              <th className={th}>Joined</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((row) => {
              const isAdmin = row.role === "admin";
              return (
                <tr
                  key={row.user_id}
                  tabIndex={0}
                  className="cursor-pointer hover:bg-background/80"
                  onClick={() => setEditing(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setEditing(row);
                    }
                  }}
                >
                  <td className={td}>{row.display_name ?? "—"}</td>
                  <td className={`${td} font-mono text-xs text-muted`}>{row.email}</td>
                  <td className={`${td} capitalize`}>{row.role}</td>
                  <td className={`${td} capitalize`}>{row.status}</td>
                  <td className={`${td} font-mono text-xs`}>
                    {row.auth_created_at?.slice(0, 10) ?? "—"}
                  </td>
                  <td
                    className={`${td} text-right`}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {isAdmin ? (
                      <span className="text-xs text-muted">—</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditing(row)}
                          className="mr-2 text-xs font-medium text-accent hover:underline"
                        >
                          Edit
                        </button>
                        <form action={setClientStatusAction} className="inline">
                          {retainRoleHidden}
                          <input type="hidden" name="user_id" value={row.user_id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button
                            type="submit"
                            className="text-xs font-medium text-muted hover:text-foreground"
                            onClick={(e) => {
                              if (!window.confirm("Set this account to rejected?")) {
                                e.preventDefault();
                              }
                            }}
                          >
                            Reject
                          </button>
                        </form>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className="w-[min(100%,32rem)] rounded-xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-foreground/20"
        onClose={() => setEditing(null)}
      >
        {editing ? (
          editing.role === "admin" ? (
            <div className="flex max-h-[90vh] flex-col gap-4 overflow-y-auto p-5">
              <h3 className="text-base font-semibold">Account details</h3>
              <p className="text-xs text-muted">
                Admin accounts cannot be edited from this directory.
              </p>
              <p className="text-xs font-mono text-muted">{editing.email}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted">Name</dt>
                <dd>{editing.display_name ?? "—"}</dd>
                <dt className="text-muted">Role</dt>
                <dd className="capitalize">{editing.role}</dd>
                <dt className="text-muted">Status</dt>
                <dd className="capitalize">{editing.status}</dd>
                <dt className="text-muted">Phone</dt>
                <dd>{editing.phone_number ?? "—"}</dd>
                <dt className="text-muted">Address</dt>
                <dd className="min-w-0 wrap-break-word">
                  {[editing.address_line_1, editing.address_line_2]
                    .filter(Boolean)
                    .join(", ") || "—"}
                  {editing.post_code ? ` · ${editing.post_code}` : ""}
                </dd>
                <dt className="text-muted">Joined</dt>
                <dd className="font-mono text-xs">
                  {editing.auth_created_at?.slice(0, 10) ?? "—"}
                </dd>
              </dl>
              <div className="flex justify-end border-t border-border pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                  onClick={() => setEditing(null)}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
          <>
            <form
              action={updateClientAction}
              className="flex max-h-[90vh] flex-col gap-4 overflow-y-auto p-5"
            >
              {retainRoleHidden}
              <input type="hidden" name="user_id" value={editing.user_id} />
              <h3 className="text-base font-semibold">Edit client</h3>
              <p className="text-xs text-muted">{editing.email}</p>
              <label className={label}>
                Display name
                <input
                  name="display_name"
                  defaultValue={editing.display_name ?? ""}
                  className={field}
                />
              </label>
              <label className={label}>
                Phone
                <input
                  name="phone_number"
                  defaultValue={editing.phone_number ?? ""}
                  className={field}
                />
              </label>
              <label className={label}>
                Address line 1
                <input
                  name="address_line_1"
                  defaultValue={editing.address_line_1 ?? ""}
                  className={field}
                />
              </label>
              <label className={label}>
                Address line 2
                <input
                  name="address_line_2"
                  defaultValue={editing.address_line_2 ?? ""}
                  className={field}
                />
              </label>
              <label className={label}>
                Post code
                <input
                  name="post_code"
                  defaultValue={editing.post_code ?? ""}
                  className={field}
                />
              </label>
              <label className={label}>
                Role
                <select name="role" defaultValue={editing.role} className={field}>
                  <option value="user">user</option>
                  <option value="client">client</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </form>
            <div className="border-t border-border px-5 pb-5">
              <p className="mb-2 text-xs font-medium text-muted">Quick status</p>
              <div className="flex flex-wrap gap-2">
                <form action={setClientStatusAction} className="inline">
                  {retainRoleHidden}
                  <input type="hidden" name="user_id" value={editing.user_id} />
                  <input type="hidden" name="status" value="active" />
                  <button
                    type="submit"
                    className="rounded border border-border px-2 py-1 text-xs hover:bg-card"
                  >
                    Active
                  </button>
                </form>
                <form action={setClientStatusAction} className="inline">
                  {retainRoleHidden}
                  <input type="hidden" name="user_id" value={editing.user_id} />
                  <input type="hidden" name="status" value="banned" />
                  <button
                    type="submit"
                    className="rounded border border-border px-2 py-1 text-xs hover:bg-card"
                    onClick={(e) => {
                      if (!window.confirm("Ban this account?")) e.preventDefault();
                    }}
                  >
                    Ban
                  </button>
                </form>
              </div>
            </div>
          </>
          )
        ) : null}
      </dialog>
    </div>
  );
}
