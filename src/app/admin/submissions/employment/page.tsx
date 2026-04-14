import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EmploymentInboxPage() {
  // The in-memory employment repository lives under VA-40's server action;
  // the admin inbox only surfaces entries once the Supabase-backed repo
  // replaces it. For now we ship the surface with an explicit empty state
  // so the URL + requireRole wiring is exercised without impersonating
  // data that doesn't exist.
  return (
    <>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <h1 className="font-serif text-3xl lg:text-4xl">
          Employment applications
        </h1>
        <Link
          href="/admin/submissions/employment/export.csv"
          className="inline-flex items-center px-4 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-ink)] text-sm text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ink-inverse)] transition-colors"
        >
          Export CSV
        </Link>
      </div>

      <p
        role="note"
        className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-accent)_4%,var(--color-bg))] p-4 text-sm text-[var(--color-ink-muted)]"
      >
        <strong className="text-[var(--color-ink)]">PII handling:</strong>{" "}
        sensitive columns (DOB, felony status + explanation, arrests) are
        encrypted at rest and only appear in the detail view. Opening a
        detail record writes an entry to{" "}
        <code>submission_access_log</code>.
      </p>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-10 text-center text-[var(--color-ink-muted)]">
        <p className="font-serif text-xl mb-2">No applications yet.</p>
        <p className="text-sm">
          Applications submitted via <code>/employment</code> will appear
          here once the Supabase-backed repository is wired (VA-28 env +
          VA-40 persist step).
        </p>
      </div>
    </>
  );
}
