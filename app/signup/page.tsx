import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { signupAction } from "@/app/signup/actions";

type SignupPageProps = {
  searchParams: Promise<{ error?: string; notice?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const sp = await searchParams;

  return (
    <AuthCard
      title="Create account"
      subtitle="You will start as a standard user. Bookings will promote you to client later."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {sp.error ? (
        <p
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {sp.error}
        </p>
      ) : null}
      {sp.notice === "confirm_email" ? (
        <p className="mb-4 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted">
          Check your email to confirm your account, then return here to sign in.
        </p>
      ) : null}
      <form action={signupAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Display name
          <input
            name="display_name"
            type="text"
            autoComplete="name"
            className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none ring-accent/30 transition focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none ring-accent/30 transition focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none ring-accent/30 transition focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-muted"
        >
          Sign up
        </button>
      </form>
    </AuthCard>
  );
}
