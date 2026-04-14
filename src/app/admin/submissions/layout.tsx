import Link from "next/link";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SubmissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["admin"], "/admin/submissions");
  return (
    <div className="container-site py-10 lg:py-14">
      <p className="eyebrow mb-2">ADMIN / SUBMISSIONS</p>
      <nav
        aria-label="Submissions tabs"
        className="flex gap-6 border-b border-[var(--color-border)] mb-8"
      >
        <Tab href="/admin/submissions/contact">Contact</Tab>
        <Tab href="/admin/submissions/employment">Employment</Tab>
      </nav>
      {children}
    </div>
  );
}

function Tab({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="pb-3 -mb-px text-sm font-medium text-[var(--color-ink-muted)] border-b-2 border-transparent hover:text-[var(--color-ink)] hover:border-[var(--color-accent)] transition-colors"
    >
      {children}
    </Link>
  );
}
