import { requireRole } from "@/lib/auth";
import { StrainEditor } from "../strain-editor";

export const dynamic = "force-dynamic";

export default async function AdminStrainsNewPage() {
  await requireRole(["admin"], "/admin/strains/new");
  return (
    <section className="container-site py-10 lg:py-14 max-w-3xl">
      <p className="eyebrow mb-2">ADMIN / CATALOG</p>
      <h1 className="font-serif text-3xl lg:text-4xl mb-6">New strain</h1>
      <StrainEditor mode="create" />
    </section>
  );
}
