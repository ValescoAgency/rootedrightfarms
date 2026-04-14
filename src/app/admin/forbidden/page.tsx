export const metadata = {
  title: "Access denied",
  robots: { index: false, follow: false },
};

import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <section className="container-site py-20 lg:py-28 max-w-md text-center">
      <p className="eyebrow mb-4">403</p>
      <h1 className="font-serif text-4xl mb-4">Not your surface.</h1>
      <p className="text-[var(--color-ink-muted)] mb-8">
        You&rsquo;re signed in, but this area is for staff only. If you
        should have access, ask Jason to grant the admin role.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] text-sm font-medium"
      >
        Back to site
      </Link>
    </section>
  );
}
