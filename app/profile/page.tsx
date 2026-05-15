import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAppRole } from "@/lib/auth/role";
import { logoutAction } from "@/app/auth/actions";
import { getAvatarSignedUrl } from "@/lib/avatar";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import {
  updateProfileAction,
  updateEmailAction,
  updatePasswordAction,
} from "@/app/profile/actions";
import { BOOK_PROFILE_NEXT } from "@/lib/profile/requirements";
import { safeNextPath } from "@/lib/profile/safe-next";

const fieldClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none ring-accent/30 transition focus:ring-2";

type ProfilePageProps = {
  searchParams: Promise<{
    avatar_error?: string;
    avatar_notice?: string;
    profile_error?: string;
    profile_notice?: string;
    credential_error?: string;
    credential_notice?: string;
    next?: string;
  }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const sp = await searchParams;
  const nextPath = safeNextPath(sp.next, "");
  const returningToBook = nextPath === BOOK_PROFILE_NEXT;

  const [{ data: profile }, role] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, avatar_url, status, phone_number, address_line_1, address_line_2, post_code",
      )
      .eq("id", user.id)
      .maybeSingle(),
    fetchAppRole(supabase, user.id),
  ]);

  const avatarSignedUrl = await getAvatarSignedUrl(
    supabase,
    profile?.avatar_url,
  );

  const fullName = profile?.display_name?.trim() || user.email || "";
  const initials =
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";

  const avatarErrorMessage = (() => {
    switch (sp.avatar_error) {
      case undefined:
        return null;
      case "missing_file":
        return "Pick an image to upload.";
      case "too_large":
        return "That image is over 2 MB.";
      case "bad_type":
        return "Use a PNG, JPG, WebP, or GIF image.";
      default:
        return sp.avatar_error;
    }
  })();

  const avatarNoticeMessage = (() => {
    switch (sp.avatar_notice) {
      case "updated":
        return "Profile picture updated.";
      case "removed":
        return "Profile picture removed.";
      default:
        return null;
    }
  })();

  const profileNoticeMessage =
    sp.profile_notice === "saved" ? "Your details were saved." : null;

  const credentialNoticeMessage = (() => {
    switch (sp.credential_notice) {
      case "password_updated":
        return "Your password was updated.";
      case "email_updated":
        return "Email update requested. If your project requires confirmation, check your inbox (new and old address) to finish the change.";
      case "email_unchanged":
        return "That is already your sign-in email.";
      default:
        return null;
    }
  })();

  const credentialErrorMessage = (() => {
    switch (sp.credential_error) {
      case undefined:
        return null;
      case "invalid_email":
        return "Enter a valid email address.";
      case "password_required":
        return "Enter a new password.";
      case "password_short":
        return "Password must be at least 6 characters.";
      case "password_mismatch":
        return "New password and confirmation do not match.";
      default:
        return sp.credential_error;
    }
  })();

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <header className="flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border bg-card">
            {avatarSignedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSignedUrl}
                alt={profile?.display_name ?? "Avatar"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-foreground">
                {initials}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Profile
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              {profile?.display_name ?? "Unnamed user"}
            </h1>
            <p className="mt-1 text-sm text-muted">{user.email}</p>
            <div className="mt-3">
              <AvatarUpload hasAvatar={Boolean(profile?.avatar_url)} />
            </div>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
          >
            Sign out
          </button>
        </form>
      </header>

      {avatarErrorMessage ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {avatarErrorMessage}
        </p>
      ) : null}
      {avatarNoticeMessage ? (
        <p className="mt-6 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted">
          {avatarNoticeMessage}
        </p>
      ) : null}

      {sp.profile_error ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {sp.profile_error}
        </p>
      ) : null}
      {profileNoticeMessage ? (
        <p className="mt-6 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted">
          {profileNoticeMessage}
        </p>
      ) : null}

      {credentialErrorMessage ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {credentialErrorMessage}
        </p>
      ) : null}
      {credentialNoticeMessage ? (
        <p className="mt-6 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted">
          {credentialNoticeMessage}
        </p>
      ) : null}

      {returningToBook ? (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-foreground">
          <p className="font-medium">Complete your profile to book a session</p>
          <p className="mt-1 text-muted">
            Phone, address line 1, and post code are required. You will return to
            booking after you save.
          </p>
        </div>
      ) : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted">Role</h2>
          <p className="mt-2 text-lg font-semibold capitalize text-foreground">
            {role ?? "unknown"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted">Account status</h2>
          <p className="mt-2 text-lg font-semibold capitalize text-foreground">
            {profile?.status ?? "—"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Your details</h2>
          <p className="mt-1 text-sm text-muted">
            Update how we show your name and how to reach you.
          </p>
          <form action={updateProfileAction} className="mt-4 flex flex-col gap-4">
            {nextPath ? (
              <input type="hidden" name="next" value={nextPath} />
            ) : null}
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Display name
              <input
                name="display_name"
                type="text"
                autoComplete="name"
                defaultValue={profile?.display_name ?? ""}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Phone
              <input
                name="phone_number"
                type="tel"
                autoComplete="tel"
                defaultValue={profile?.phone_number ?? ""}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Address line 1
              <input
                name="address_line_1"
                type="text"
                autoComplete="address-line1"
                defaultValue={profile?.address_line_1 ?? ""}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Address line 2
              <input
                name="address_line_2"
                type="text"
                autoComplete="address-line2"
                defaultValue={profile?.address_line_2 ?? ""}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Post code
              <input
                name="post_code"
                type="text"
                autoComplete="postal-code"
                defaultValue={profile?.post_code ?? ""}
                className={fieldClass}
              />
            </label>
            <button
              type="submit"
              className="w-fit rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-muted"
            >
              Save details
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Sign-in email</h2>
          <p className="mt-1 text-sm text-muted">
            Current:{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <form action={updateEmailAction} className="mt-4 flex flex-col gap-4 sm:max-w-md">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              New email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className={fieldClass}
              />
            </label>
            <button
              type="submit"
              className="w-fit rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-card"
            >
              Update email
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Password</h2>
          <p className="mt-1 text-sm text-muted">
            Choose a new password while you are signed in. Use at least 6
            characters.
          </p>
          <form
            action={updatePasswordAction}
            className="mt-4 flex max-w-md flex-col gap-4"
          >
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              New password
              <input
                name="new_password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Confirm new password
              <input
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className={fieldClass}
              />
            </label>
            <button
              type="submit"
              className="w-fit rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-card"
            >
              Update password
            </button>
          </form>
        </div>
      </section>

      <p className="mt-10 flex items-center justify-center gap-4 text-sm text-muted">
        <Link href="/" className="text-accent hover:underline">
          ← Back to marketing site
        </Link>
        {role === "admin" ? (
          <Link href="/admin" className="text-accent hover:underline">
            Go to admin dashboard →
          </Link>
        ) : null}
      </p>
    </div>
  );
}
