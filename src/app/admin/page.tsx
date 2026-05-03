import Link from "next/link";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface AdminTile {
  href: string;
  label: string;
  description: string;
  eyebrow: string;
}

const ADMIN_TILES: AdminTile[] = [
  {
    href: "/admin/strains",
    label: "Strains",
    description:
      "Create, edit, publish, and unpublish strain records. Manage hero imagery and lineage.",
    eyebrow: "CATALOG",
  },
];

export default async function AdminHomePage() {
  const session = await requireRole(["admin"], "/admin");

  return (
    <section className="container-site py-12 lg:py-16 max-w-4xl">
      <p className="eyebrow mb-4">ADMIN</p>
      <h1 className="font-serif text-4xl lg:text-5xl mb-3">
        Welcome, {session.email}.
      </h1>
      <p className="text-[var(--color-ink-muted)] mb-10">
        Pick a surface below to get started.
      </p>

      <ul className="grid gap-5 sm:grid-cols-2">
        {ADMIN_TILES.map((tile) => (
          <li key={tile.href}>
            <Link
              href={tile.href}
              className="group block h-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[var(--shadow-sm)] transition-all duration-[var(--duration-quick)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <p
                className="text-[11px] font-medium mb-2"
                style={{
                  letterSpacing: "0.2em",
                  color: "var(--color-accent)",
                }}
              >
                {tile.eyebrow}
              </p>
              <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)] mb-2">
                {tile.label}
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)]">
                {tile.description}
              </p>
              <span
                className="mt-4 inline-flex text-sm font-medium transition-colors"
                style={{ color: "var(--color-accent)" }}
              >
                Open →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-12 pt-8 border-t border-[var(--color-border)] text-xs text-[var(--color-ink-subtle)] space-y-1">
        <p>
          Signed in as <span className="text-[var(--color-ink-muted)]">{session.email}</span>
        </p>
        <p>
          Roles: <span className="text-[var(--color-ink-muted)]">{session.roles.join(", ") || "(none)"}</span>
        </p>
      </div>
    </section>
  );
}
