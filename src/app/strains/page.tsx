import Image from "next/image";
import Link from "next/link";
import { getStrainRepository } from "@/lib/strains/repository";
import { STRAIN_TYPES, type StrainType } from "@/lib/strains/types";
import { StrainCard } from "@/components/strains/strain-card";
import { StrainFilter } from "@/components/strains/strain-filter";

export const metadata = {
  title: "Strains",
  description:
    "Indoor hydroponic cannabis cultivars from Rooted Right Farms. Wholesale to licensed Oklahoma dispensaries.",
};

function parseType(raw: string | undefined): StrainType | null {
  if (raw && (STRAIN_TYPES as readonly string[]).includes(raw))
    return raw as StrainType;
  return null;
}

export default async function StrainsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const type = parseType(params.type);

  const repo = getStrainRepository();
  const strains = await repo.listStrains(type ? { type } : undefined);

  return (
    <>
      <section className="container-site py-16 lg:py-24">
        <p className="eyebrow mb-4">FIG. 002 — CATALOG</p>
        <h1 className="font-serif text-4xl lg:text-5xl max-w-2xl mb-6">
          Strains cultivated in Ardmore.
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-ink-muted)] mb-10">
          Hand-trimmed, small-batch flower. Available to licensed Oklahoma
          dispensaries.
        </p>
        <StrainFilter current={type ?? "all"} />
      </section>

      <section className="container-site pb-20">
        {strains.length === 0 ? (
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-10 text-center">
            <p className="font-serif text-2xl mb-2">No strains match.</p>
            <p className="text-[var(--color-ink-muted)] mb-6">
              Try a different filter.
            </p>
            <Link
              href="/strains"
              className="inline-flex items-center px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] text-sm font-medium"
            >
              Clear filter
            </Link>
          </div>
        ) : (
          <ul
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-label={`${strains.length} strain${strains.length === 1 ? "" : "s"}`}
          >
            {strains.map((strain) => (
              <li key={strain.id}>
                <StrainCard strain={strain} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface-dark relative overflow-hidden">
        <Image
          src="/images/wholesale/banner-desktop.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="relative container-site py-16 lg:py-20 text-center lg:text-left lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl mx-auto lg:mx-0 mb-8 lg:mb-0">
            <h2 className="font-serif text-3xl lg:text-4xl mb-3">
              Interested in wholesale?
            </h2>
            <p className="text-[var(--color-ink-inv-muted)]">
              Licensed Oklahoma dispensaries — let&rsquo;s talk.
            </p>
          </div>
          <Link
            href="/contact?inquiry=wholesale"
            className="inline-flex items-center px-7 py-3.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm transition-all duration-[var(--duration-quick)] hover:brightness-95"
          >
            Contact Wholesale
          </Link>
        </div>
      </section>
    </>
  );
}
