import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin Sign-in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = sanitize(params.next);
  return (
    <section className="container-site py-20 lg:py-28 max-w-md">
      <p className="eyebrow mb-4">ADMIN</p>
      <h1 className="font-serif text-3xl lg:text-4xl mb-3">Sign in.</h1>
      <p className="text-[var(--color-ink-muted)] mb-8">
        Email sign-in uses a one-time link. Google sign-in uses your
        @rootedrightfarms or @valescoagency account.
      </p>
      {params.error ? (
        <p
          role="alert"
          className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-error)] text-[var(--color-error)] text-sm px-4 py-3"
        >
          {friendlyError(params.error)}
        </p>
      ) : null}
      <LoginForm next={next} />
    </section>
  );
}

function sanitize(next: string | undefined): string {
  if (!next) return "/admin";
  if (!next.startsWith("/") || next.startsWith("//")) return "/admin";
  return next;
}

function friendlyError(code: string): string {
  switch (code) {
    case "otp-failed":
      return "Couldn't send the link — check the email and try again.";
    case "oauth-failed":
      return "Google sign-in was cancelled or failed. Try again.";
    case "callback-failed":
      return "Sign-in callback failed. Request a fresh link.";
    default:
      return "Something went wrong signing you in. Try again.";
  }
}
