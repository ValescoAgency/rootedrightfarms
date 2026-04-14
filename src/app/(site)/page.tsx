import Image from "next/image";
import Link from "next/link";
import { getSiteConfig } from "@/lib/site-config";
import { getStrainRepository } from "@/lib/strains/repository";
import type { Strain } from "@/lib/strains/types";
import { StrainCard } from "@/components/strains/strain-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { InstagramGrid } from "@/components/instagram-grid";

export default async function HomePage() {
  const { hero } = getSiteConfig();
  const allStrains = await getStrainRepository().listStrains();
  const featured = allStrains.slice(0, 4);

  return (
    <>
      <HeroSection tagline={hero.tagline} subtitle={hero.subtitle} />
      <StatsBar />
      <FeaturedStrains strains={featured} />
      <InstagramGrid />
      <WholesaleCtaBanner />
    </>
  );
}

function HeroSection({
  tagline,
  subtitle,
}: {
  tagline: string;
  subtitle: string;
}) {
  return (
    <section
      aria-label="Hero"
      className="relative isolate overflow-hidden"
      style={{ minHeight: "min(84vh, 780px)" }}
    >
      {/* TODO: swap for client-supplied facility photo when delivered. Placeholder sourced from design/prototypes.pen (see public/images/CREDITS.md). */}
      <Image
        src="/images/home/hero-desktop.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover -z-20 hidden sm:block"
      />
      <Image
        src="/images/home/hero-mobile.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover -z-20 sm:hidden"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(100deg, color-mix(in srgb, var(--color-bg-dark) 82%, transparent) 0%, color-mix(in srgb, var(--color-bg-dark) 55%, transparent) 55%, color-mix(in srgb, var(--color-bg-dark) 25%, transparent) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(27,58,40,0) 40%, rgba(27,58,40,0.6) 100%)",
        }}
      />

      <div className="container-site py-20 lg:py-28 text-[var(--color-ink-inverse)] grid lg:grid-cols-2 lg:gap-12 lg:items-center min-h-[60vh]">
        <div>
          <ScrollReveal delayIndex={0}>
            <div
              className="inline-block rounded-[var(--radius-sm)] backdrop-blur px-2.5 py-1.5 mb-8"
              style={{ background: "rgba(255,255,255,0.8)" }}
            >
              <p
                className="text-[11px] font-medium text-[var(--color-ink)]"
                style={{ letterSpacing: "0.2em" }}
              >
                ARDMORE, OKLAHOMA
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delayIndex={1}>
            <h1 className="font-serif text-5xl lg:text-7xl leading-[1.02] tracking-tight max-w-2xl">
              {tagline}
            </h1>
          </ScrollReveal>
          <ScrollReveal delayIndex={2}>
            <p
              className="mt-6 text-lg lg:text-xl max-w-xl"
              style={{ color: "var(--color-ink-inv-muted)" }}
            >
              {subtitle}
            </p>
          </ScrollReveal>
          <ScrollReveal delayIndex={3}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact?inquiry=wholesale"
                className="inline-flex items-center justify-center px-8 py-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm transition-all duration-[var(--duration-quick)] hover:brightness-95"
              >
                Wholesale Inquiries
              </Link>
              <Link
                href="/strains"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border-[1.5px] border-[var(--color-ink-inverse)] text-[var(--color-ink-inverse)] font-medium text-sm transition-colors duration-[var(--duration-quick)] hover:bg-[var(--color-ink-inverse)] hover:text-[var(--color-ink)]"
              >
                Explore Our Strains
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { value: "4", label: "Cultivars in rotation" },
    { value: "100%", label: "Indoor hydroponic" },
    { value: "Ardmore", label: "Oklahoma, USA" },
  ];
  return (
    <section aria-label="At a glance" className="surface-dark">
      <div className="container-site py-10 lg:py-14">
        <ScrollReveal>
          <dl className="grid grid-cols-3 gap-6 lg:flex lg:justify-around lg:gap-16 text-center lg:text-left">
            {stats.map((s) => (
              <div key={s.label}>
                <dd
                  className="font-serif font-bold text-3xl lg:text-5xl mb-2"
                  style={{ color: "var(--color-accent)" }}
                >
                  {s.value}
                </dd>
                <dt
                  className="eyebrow"
                  style={{ color: "var(--color-ink-inv-muted)" }}
                >
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </ScrollReveal>
      </div>
    </section>
  );
}

function FeaturedStrains({ strains }: { strains: Strain[] }) {
  return (
    <section aria-label="Featured strains" className="container-site py-20 lg:py-28">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 lg:mb-14">
        <ScrollReveal>
          <div>
            <p className="eyebrow mb-3">CULTIVARS</p>
            <h2 className="font-serif text-3xl lg:text-5xl max-w-xl">
              Flower we&rsquo;re proud to put on the shelf.
            </h2>
          </div>
        </ScrollReveal>
        <ScrollReveal delayIndex={1}>
          <Link
            href="/strains"
            className="self-start text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
          >
            See all strains →
          </Link>
        </ScrollReveal>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {strains.map((s, i) => (
          <li key={s.id}>
            <ScrollReveal delayIndex={i}>
              <StrainCard strain={s} />
            </ScrollReveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WholesaleCtaBanner() {
  return (
    <section aria-label="Wholesale CTA" className="surface-dark relative overflow-hidden">
      {/* TODO: swap for client-supplied facility photo when delivered. Placeholder sourced from design/prototypes.pen (see public/images/CREDITS.md). */}
      <Image
        src="/images/home/wholesale-cta.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      <div className="relative container-site py-20 lg:py-24">
        <ScrollReveal>
          <div className="max-w-3xl">
            <p
              className="eyebrow mb-4"
              style={{ color: "var(--color-ink-inv-muted)" }}
            >
              WHOLESALE
            </p>
            <h2 className="font-serif text-4xl lg:text-6xl leading-[1.08] mb-6">
              Stock flower that moves itself.
            </h2>
            <p
              className="text-lg mb-10 max-w-xl"
              style={{ color: "var(--color-ink-inv-muted)" }}
            >
              We&rsquo;re selective about the dispensaries we partner with.
              If you care about consistency and your customers come back for
              a cultivar — let&rsquo;s talk.
            </p>
            <Link
              href="/contact?inquiry=wholesale"
              className="inline-flex items-center px-8 py-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm transition-all duration-[var(--duration-quick)] hover:brightness-95"
            >
              Start a conversation
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
