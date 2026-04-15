import Link from "next/link";
import { notFound } from "next/navigation";
import { getStrainRepository } from "@/lib/strains/repository";
import { StrainCard } from "@/components/strains/strain-card";
import { StrainImageZoom } from "@/components/strains/strain-image-zoom";
import type { StrainType } from "@/lib/strains/types";
import { stripHtml } from "@/lib/utils";

// ISR: refresh the pre-rendered detail pages once an hour. Admin edits
// already fire `revalidatePath` for immediate propagation (see
// src/app/admin/strains/actions.ts); this TTL guards against direct-SQL
// drift (e.g. ad-hoc data migrations run in the Supabase dashboard).
export const revalidate = 3600;

const TYPE_LABEL: Record<StrainType, string> = {
  indica: "INDICA",
  sativa: "SATIVA",
  hybrid: "HYBRID",
};

interface RouteParams {
  slug: string;
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  const strains = await getStrainRepository().listStrains();
  return strains.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const strain = await getStrainRepository().getStrainBySlug(slug);
  if (!strain) return { title: "Strain not found" };
  return {
    title: strain.name,
    description: strain.description
      ? stripHtml(strain.description)
      : `${strain.name} — ${TYPE_LABEL[strain.type]} cultivar from Rooted Right Farms.`,
  };
}

export default async function StrainDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const repo = getStrainRepository();
  const strain = await repo.getStrainBySlug(slug);
  if (!strain) notFound();

  const related = await repo.getRelatedStrains(strain.type, strain.slug, 3);

  return (
    <>
      <div className="container-site pt-8">
        <Link
          href="/strains"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          ← All strains
        </Link>
      </div>

      <section className="container-site py-10 lg:py-16 grid gap-10 lg:gap-16 lg:grid-cols-[5fr_6fr] lg:items-start">
        {strain.heroImageUrl ? (
          <StrainImageZoom
            src={strain.heroImageUrl}
            alt={`${strain.name} cannabis bud — ${strain.type}`}
            className="aspect-[4/5] rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--color-bg-dark)_15%,var(--color-bg))]"
          />
        ) : (
          <div
            className="aspect-[4/5] rounded-[var(--radius-sm)] overflow-hidden bg-[color-mix(in_srgb,var(--color-bg-dark)_15%,var(--color-bg))] grid place-items-center"
            aria-hidden="true"
          >
            <span
              className="font-serif text-[var(--color-ink-subtle)]"
              style={{ fontSize: "4rem" }}
            >
              {strain.name.charAt(0)}
            </span>
          </div>
        )}

        <div>
          <p
            className="text-[11px] font-medium mb-3"
            style={{
              letterSpacing: "0.2em",
              color: "var(--color-accent)",
            }}
          >
            {TYPE_LABEL[strain.type]}
          </p>
          <h1 className="font-serif text-4xl lg:text-6xl leading-[1.08] mb-6">
            {strain.name}
          </h1>
          {strain.lineage ? (
            <p className="text-base text-[var(--color-ink-muted)] mb-6">
              Lineage:{" "}
              <span className="text-[var(--color-ink)]">{strain.lineage}</span>
            </p>
          ) : null}
          {strain.description ? (
            <div
              className="strain-description text-lg text-[var(--color-ink-muted)] leading-[1.7]"
              dangerouslySetInnerHTML={{ __html: strain.description }}
            />
          ) : null}
        </div>
      </section>

      <section className="border-y border-[var(--color-border)]">
        <div className="container-site py-10 lg:py-14">
          <dl
            className="grid grid-cols-3 gap-6 lg:flex lg:justify-around lg:gap-16 text-center lg:text-left"
            aria-label="Strain stats"
          >
            <Stat label="Type" value={TYPE_LABEL[strain.type]} />
            <Stat
              label="THC"
              value={strain.thcPct !== null ? `${strain.thcPct}%` : "—"}
            />
            <Stat
              label="CBD"
              value={strain.cbdPct !== null ? `${strain.cbdPct}%` : "—"}
            />
          </dl>
        </div>
      </section>

      <section className="container-site py-16 lg:py-24 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProfileList title="Flavors" items={strain.flavors} />
        <ProfileList title="Effects" items={strain.effects} />
      </section>

      {related.length > 0 ? (
        <section className="container-site pb-16 lg:pb-24 border-t border-[var(--color-border)] pt-16 lg:pt-24">
          <div className="flex items-end justify-between mb-8 lg:mb-10">
            <div>
              <p className="eyebrow mb-2">RELATED CULTIVARS</p>
              <h2 className="font-serif text-3xl lg:text-4xl">
                More from the catalog.
              </h2>
            </div>
            <Link
              href="/strains"
              className="hidden sm:inline-flex text-sm text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
            >
              See all →
            </Link>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <StrainCard strain={r} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="surface-dark">
        <div className="container-site py-16 lg:py-20 text-center lg:text-left lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl mx-auto lg:mx-0 mb-8 lg:mb-0">
            <h2 className="font-serif text-3xl lg:text-4xl mb-3">
              Carry {strain.name}
            </h2>
            <p style={{ color: "var(--color-ink-inv-muted)" }}>
              Licensed Oklahoma dispensaries — reach out and we&rsquo;ll
              confirm availability.
            </p>
          </div>
          <Link
            href={`/contact?inquiry=wholesale&strain=${encodeURIComponent(strain.name)}`}
            className="inline-flex items-center px-7 py-3.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm transition-all duration-[var(--duration-quick)] hover:brightness-95"
          >
            Contact Wholesale
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd
        className="font-serif font-bold text-3xl lg:text-4xl mb-1"
        style={{ color: "var(--color-accent)" }}
      >
        {value}
      </dd>
      <dt className="eyebrow">
        {label}
      </dt>
    </div>
  );
}

function ProfileList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return (
      <div>
        <p className="eyebrow mb-3">{title.toUpperCase()}</p>
        <p className="text-base text-[var(--color-ink-subtle)]">
          Not yet documented.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="eyebrow mb-4">{title.toUpperCase()}</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="px-4 py-2 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-ink)] capitalize"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
