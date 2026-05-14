"use client";

import { useRef, useState, useTransition } from "react";
import {
  uploadAvatarAction,
  removeAvatarAction,
} from "@/app/profile/actions";
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
} from "@/lib/avatar";

type AvatarUploadProps = {
  hasAvatar: boolean;
};

const acceptAttr = AVATAR_ALLOWED_MIME_TYPES.join(",");
const maxBytesLabel = `${Math.round(AVATAR_MAX_BYTES / (1024 * 1024))} MB`;

export function AvatarUpload({ hasAvatar }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setClientError(null);

    if (file.size > AVATAR_MAX_BYTES) {
      setClientError(`That image is over ${maxBytesLabel}.`);
      event.target.value = "";
      return;
    }
    if (
      !AVATAR_ALLOWED_MIME_TYPES.includes(
        file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number],
      )
    ) {
      setClientError("Use a PNG, JPG, WebP, or GIF image.");
      event.target.value = "";
      return;
    }

    const form = new FormData();
    form.set("avatar", file);
    startTransition(async () => {
      await uploadAvatarAction(form);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending}
          className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:bg-background disabled:opacity-60"
        >
          {pending
            ? "Uploading…"
            : hasAvatar
              ? "Change picture"
              : "Upload picture"}
        </button>
        {hasAvatar ? (
          <form
            action={removeAvatarAction}
            onSubmit={() => setClientError(null)}
          >
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-xs font-medium text-muted transition hover:bg-card disabled:opacity-60"
            >
              Remove
            </button>
          </form>
        ) : null}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={handleChange}
      />
      {clientError ? (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {clientError}
        </p>
      ) : (
        <p className="text-xs text-muted">
          PNG, JPG, WebP, or GIF. Up to {maxBytesLabel}.
        </p>
      )}
    </div>
  );
}
