import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getStrainRepository } from "@/lib/strains/repository";

export const dynamic = "force-dynamic";

export default async function AdminStrainsPage() {
  await requireRole(["admin"], "/admin/strains");
  const repo = getStrainRepository();
  const strains = await repo.listStrains({ includeDrafts: true });

  return (
    <section className="container-site py-10 lg:py-14">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="eyebrow mb-2">ADMIN / CATALOG</p>
          <h1 className="font-serif text-3xl lg:text-4xl">Strains</h1>
        </div>
        <Link
          href="/admin/strains/new"
          className="inline-flex items-center px-5 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] text-sm font-medium"
        >
          New strain
        </Link>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[color-mix(in_srgb,var(--color-bg-dark)_4%,var(--color-bg))] text-left">
            <tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>THC / CBD</Th>
              <Th>Published</Th>
              <Th>Updated</Th>
              <Th aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {strains.map((s) => (
              <tr key={s.id}>
                <Td>
                  <Link
                    href={`/admin/strains/${s.slug}`}
                    className="font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                  >
                    {s.name}
                  </Link>
                  <div className="text-xs text-[var(--color-ink-subtle)]">
                    /{s.slug}
                  </div>
                </Td>
                <Td>{s.type}</Td>
                <Td>
                  {s.thcPct ?? "—"}% / {s.cbdPct ?? "—"}%
                </Td>
                <Td>
                  <span
                    className={
                      s.isPublished
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-ink-subtle)]"
                    }
                  >
                    {s.isPublished ? "Published" : "Draft"}
                  </span>
                </Td>
                <Td className="text-[var(--color-ink-subtle)]">
                  {formatDate(s.updatedAt)}
                </Td>
                <Td className="text-right">
                  <Link
                    href={`/admin/strains/${s.slug}`}
                    className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-accent)]"
                  >
                    Edit
                  </Link>
                </Td>
              </tr>
            ))}
            {strains.length === 0 ? (
              <tr>
                <Td colSpan={6} className="py-8 text-center text-[var(--color-ink-muted)]">
                  No strains yet.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-subtle)]"
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td {...props} className={`px-4 py-3 ${className ?? ""}`}>
      {children}
    </td>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
