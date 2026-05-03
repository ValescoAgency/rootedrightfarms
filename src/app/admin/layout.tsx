import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)]">
        <div className="container-site flex items-center justify-between h-14">
          <span className="font-serif text-lg font-semibold text-[var(--color-ink)]">
            Rooted Right Farms · Admin
          </span>
          <Link
            href="/"
            className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            Back to site
          </Link>
        </div>
      </header>
      <main id="main">{children}</main>
    </div>
  );
}
