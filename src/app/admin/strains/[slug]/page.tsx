import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getStrainRepository } from "@/lib/strains/repository";
import { StrainEditor } from "../strain-editor";

export const dynamic = "force-dynamic";

export default async function AdminStrainEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireRole(["admin"], `/admin/strains/${slug}`);
  const strain = await getStrainRepository().getStrainBySlug(slug, {
    includeDrafts: true,
  });
  if (!strain) notFound();

  return (
    <section className="container-site py-10 lg:py-14 max-w-3xl">
      {/* VA-87: linked breadcrumb eyebrow */}
      <nav aria-label="Breadcrumb" className="eyebrow mb-2">
        <ol className="flex items-center gap-1.5 list-none">
          <li>
            <Link href="/admin" className="hover:text-[var(--color-accent)] transition-colors">
              ADMIN
            </Link>
          </li>
          <li aria-hidden className="opacity-50">/</li>
          <li>
            <Link href="/admin/strains" className="hover:text-[var(--color-accent)] transition-colors">
              CATALOG
            </Link>
          </li>
          <li aria-hidden className="opacity-50">/</li>
          <li aria-current="page">{strain.name.toUpperCase()}</li>
        </ol>
      </nav>

      <h1 className="font-serif text-3xl lg:text-4xl mb-1">{strain.name}</h1>

      {/* VA-89: last updated + published metadata */}
      <p className="text-xs text-[var(--color-ink-subtle)] mb-6 flex flex-wrap gap-x-4">
        <span>Updated {formatDateTime(strain.updatedAt)}</span>
        {strain.isPublished ? (
          <span className="text-[var(--color-success)]">Published</span>
        ) : (
          <span>Draft</span>
        )}
      </p>

      <StrainEditor mode="edit" strain={strain} />
    </section>
  );
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Chicago",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}
