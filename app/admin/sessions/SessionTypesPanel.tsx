"use client";

import { useEffect, useRef, useState } from "react";
import type { SessionTypeRow } from "@/lib/admin/types";
import {
  createSessionTypeAction,
  deleteSessionTypeAction,
  updateSessionTypeAction,
} from "@/app/admin/sessions/actions";

const field =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-accent/30 focus:ring-2";
const label = "block text-xs font-medium text-muted";
const th =
  "border-b border-border bg-background px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted";
const td = "border-b border-border px-3 py-2.5 text-sm text-foreground";

type SessionTypesPanelProps = {
  types: SessionTypeRow[];
  flashError: string | null;
  flashOk: string | null;
};

export function SessionTypesPanel({
  types,
  flashError,
  flashOk,
}: SessionTypesPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<SessionTypeRow | null>(null);

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
          {flashOk === "created" && "Session type created."}
          {flashOk === "updated" && "Session type updated."}
          {flashOk === "deleted" && "Session type deleted."}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">New session type</h2>
        <form action={createSessionTypeAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>
              Title
              <input name="title" required className={field} placeholder="Strength Foundation" />
            </label>
          </div>
          <div>
            <label className={label}>
              Slug (optional)
              <input name="slug" className={field} placeholder="auto from title" />
            </label>
          </div>
          <div>
            <label className={label}>
              Category
              <input name="category" className={field} placeholder="Strength" />
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>
              Description
              <textarea name="description" rows={2} className={field} />
            </label>
          </div>
          <div>
            <label className={label}>
              Duration (minutes)
              <input
                name="default_duration_min"
                type="number"
                min={1}
                defaultValue={60}
                className={field}
              />
            </label>
          </div>
          <div>
            <label className={label}>
              Max slots
              <input
                name="default_max_slots"
                type="number"
                min={1}
                defaultValue={10}
                className={field}
              />
            </label>
          </div>
          <div>
            <label className={label}>
              Default price (USD)
              <input
                name="default_price_dollars"
                type="text"
                defaultValue="25"
                className={field}
                placeholder="25 or 19.99"
              />
            </label>
          </div>
          <div>
            <label className={label}>
              Default location
              <input name="default_location" className={field} placeholder="Studio" />
            </label>
          </div>
          <div className="flex items-end gap-2 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input type="checkbox" name="is_active" defaultChecked className="rounded border-border" />
              Active (visible to public catalog)
            </label>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-muted"
            >
              Create session type
            </button>
          </div>
        </form>
      </section>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr>
              <th className={th}>Title</th>
              <th className={th}>Slug</th>
              <th className={th}>Category</th>
              <th className={th}>Duration</th>
              <th className={th}>Slots</th>
              <th className={th}>Price</th>
              <th className={th}>Active</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {types.map((row) => (
              <tr key={row.id} className="hover:bg-background/80">
                <td className={td}>{row.title}</td>
                <td className={`${td} font-mono text-xs text-muted`}>{row.slug}</td>
                <td className={td}>{row.category ?? "—"}</td>
                <td className={`${td} font-mono text-xs`}>
                  {row.default_duration_min} min
                </td>
                <td className={`${td} font-mono text-xs`}>{row.default_max_slots}</td>
                <td className={`${td} font-mono text-xs`}>
                  ${(row.default_price_cents / 100).toFixed(2)}
                </td>
                <td className={td}>
                  <span
                    className={
                      row.is_active
                        ? "rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent"
                        : "rounded-full bg-muted/20 px-2 py-0.5 text-xs font-medium text-muted"
                    }
                  >
                    {row.is_active ? "Yes" : "No"}
                  </span>
                </td>
                <td className={`${td} text-right`}>
                  <button
                    type="button"
                    onClick={() => setEditing(row)}
                    className="mr-3 text-xs font-medium text-accent hover:underline"
                  >
                    Edit
                  </button>
                  <form
                    action={deleteSessionTypeAction}
                    className="inline"
                    onSubmit={(e) => {
                      if (
                        !window.confirm(
                          "Delete this session type? Linked occurrences keep their times but lose the type link.",
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-muted hover:text-foreground"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog
        ref={dialogRef}
        className="w-[min(100%,28rem)] rounded-xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-foreground/20"
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <form
            action={updateSessionTypeAction}
            className="flex max-h-[90vh] flex-col gap-4 overflow-y-auto p-5"
          >
            <input type="hidden" name="id" value={editing.id} />
            <h3 className="text-base font-semibold">Edit session type</h3>
            <label className={label}>
              Title
              <input
                name="title"
                required
                defaultValue={editing.title}
                className={field}
              />
            </label>
            <label className={label}>
              Slug
              <input name="slug" required defaultValue={editing.slug} className={field} />
            </label>
            <label className={label}>
              Category
              <input
                name="category"
                defaultValue={editing.category ?? ""}
                className={field}
              />
            </label>
            <label className={label}>
              Description
              <textarea
                name="description"
                rows={2}
                defaultValue={editing.description ?? ""}
                className={field}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>
                Duration (min)
                <input
                  name="default_duration_min"
                  type="number"
                  min={1}
                  defaultValue={editing.default_duration_min}
                  className={field}
                />
              </label>
              <label className={label}>
                Max slots
                <input
                  name="default_max_slots"
                  type="number"
                  min={1}
                  defaultValue={editing.default_max_slots}
                  className={field}
                />
              </label>
            </div>
            <label className={label}>
              Default price (USD)
              <input
                name="default_price_dollars"
                defaultValue={(editing.default_price_cents / 100).toFixed(2)}
                className={field}
              />
            </label>
            <label className={label}>
              Default location
              <input
                name="default_location"
                defaultValue={editing.default_location ?? ""}
                className={field}
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={editing.is_active}
                className="rounded border-border"
              />
              Active
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
                Save changes
              </button>
            </div>
          </form>
        ) : null}
      </dialog>
    </div>
  );
}
