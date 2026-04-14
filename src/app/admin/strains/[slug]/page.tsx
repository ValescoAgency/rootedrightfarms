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
      <p className="eyebrow mb-2">ADMIN / CATALOG</p>
      <h1 className="font-serif text-3xl lg:text-4xl mb-6">{strain.name}</h1>
      <StrainEditor mode="edit" strain={strain} />
    </section>
  );
}
