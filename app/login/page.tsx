import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { loginAction } from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    logged_out?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/dashboard";

  return (
    <AuthCard
      title="Sign in"
      subtitle="Use the email and password for your account."
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="font-medium text-accent hover:underline">
            Create one
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
      {sp.logged_out ? (
        <p className="mb-4 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted">
          You have been signed out.
        </p>
      ) : null}
      <form action={loginAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
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
            autoComplete="current-password"
            required
            minLength={6}
            className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none ring-accent/30 transition focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-muted"
        >
          Sign in
        </button>
      </form>
    </AuthCard>
  );
}
