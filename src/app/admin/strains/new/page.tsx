import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { StrainEditor } from "../strain-editor";

export const dynamic = "force-dynamic";

export default async function AdminStrainsNewPage() {
  await requireRole(["admin"], "/admin/strains/new");
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
          <li aria-current="page">NEW</li>
        </ol>
      </nav>

      <h1 className="font-serif text-3xl lg:text-4xl mb-6">New strain</h1>
      <StrainEditor mode="create" />
    </section>
  );
}
