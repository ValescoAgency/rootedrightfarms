import Image from "next/image";
import Link from "next/link";
import { getSiteConfig } from "@/lib/site-config";

export const metadata = {
  title: "About",
  description:
    "Rooted Right Farms is a premium indoor hydroponic cannabis cultivator based in Ardmore, Oklahoma.",
};

export default function AboutPage() {
  const { license } = getSiteConfig();
  return (
    <>
      <section className="relative overflow-hidden" style={{ height: "clamp(320px, 50vh, 480px)" }}>
        <Image
          src="/images/about/hero-desktop.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover hidden lg:block"
        />
        <Image
          src="/images/about/hero-mobile.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover lg:hidden"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(27,58,40,0) 20%, rgba(27,58,40,0.87) 100%)",
          }}
        />
        <div className="relative h-full flex flex-col justify-end container-site pb-8 lg:pb-12">
          <p
            className="eyebrow mb-3"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            OUR STORY
          </p>
          <h1 className="font-serif text-4xl lg:text-6xl leading-[1.08] text-[var(--color-ink-inverse)] max-w-2xl">
            Passion for Science, Health, &amp; Healing
          </h1>
        </div>
      </section>

      <section className="surface-dark">
        <div className="container-site py-16 lg:py-24 max-w-3xl">
          <p
            className="eyebrow mb-4"
            style={{ color: "var(--color-ink-inv-muted)" }}
          >
            OUR MISSION
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl mb-6">
            Consistency over volume.
          </h2>
          <p
            className="text-lg leading-[1.6]"
            style={{ color: "var(--color-ink-inv-muted)" }}
          >
            Our mission is to produce cannabis that a buyer can shelve with
            confidence: the same structure, the same terp profile, the same
            burn week after week. That takes a controlled environment, a
            patient schedule, and people who care about the plant.
          </p>
          {/* TODO: Jeff approval — mission copy is Jason-drafted from brand direction */}
        </div>
      </section>

      <section className="container-site py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="eyebrow mb-4">WHY INDOOR HYDROPONIC</p>
            <h2 className="font-serif text-3xl lg:text-4xl mb-6">
              Why indoor hydroponic.
            </h2>
            <p className="text-base lg:text-lg text-[var(--color-ink-muted)] leading-[1.7]">
              Indoor cultivation decouples the plant from the sky. No weather,
              no pests riding in on wind, no surprises. Hydroponic delivery
              lets us tune nutrient load by the hour instead of the week.
              Together they let us hit a target and stay there — which is
              what wholesale buyers actually need.
            </p>
            <div className="mt-8 relative aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)]">
              <Image
                src="/images/about/process-desktop.jpg"
                alt="Rooted Right Farms cultivation process"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover hidden lg:block"
              />
              <Image
                src="/images/about/process-mobile.jpg"
                alt="Rooted Right Farms cultivation process"
                fill
                sizes="100vw"
                className="object-cover lg:hidden"
              />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-2xl mb-4">Our process</h3>
            <ol className="space-y-5 text-base text-[var(--color-ink-muted)]">
              <li className="flex gap-4">
                <span
                  className="font-serif font-bold"
                  style={{ color: "var(--color-accent)", minWidth: "2rem" }}
                >
                  01
                </span>
                <div>
                  <p className="font-medium text-[var(--color-ink)]">
                    Clone &amp; veg
                  </p>
                  <p>
                    Mothers chosen for structure and terpene expression. Clones
                    vegged under controlled DLI for even canopy.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span
                  className="font-serif font-bold"
                  style={{ color: "var(--color-accent)", minWidth: "2rem" }}
                >
                  02
                </span>
                <div>
                  <p className="font-medium text-[var(--color-ink)]">Flower</p>
                  <p>
                    Eight to ten week flower cycles in sealed rooms. CO₂, RH,
                    and temp held tight to cultivar spec.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span
                  className="font-serif font-bold"
                  style={{ color: "var(--color-accent)", minWidth: "2rem" }}
                >
                  03
                </span>
                <div>
                  <p className="font-medium text-[var(--color-ink)]">
                    Cure &amp; trim
                  </p>
                  <p>
                    Slow cure in food-grade containers. Every flower is
                    hand-trimmed — no wet-trim, no bucker shortcuts.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span
                  className="font-serif font-bold"
                  style={{ color: "var(--color-accent)", minWidth: "2rem" }}
                >
                  04
                </span>
                <div>
                  <p className="font-medium text-[var(--color-ink)]">
                    Test &amp; release
                  </p>
                  <p>
                    Every batch tested by our licensed lab partner. COAs
                    available to every wholesale buyer.
                  </p>
                </div>
              </li>
            </ol>
            {/* TODO: Jeff approval — process steps drafted from standard indoor hydro workflow, confirm timing + lab partner name */}
          </div>
        </div>
      </section>

      <section className="container-site py-16 lg:py-24 border-t border-[var(--color-border)]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow mb-4">LOCATION</p>
            <h2 className="font-serif text-3xl lg:text-4xl mb-4">
              Ardmore, Oklahoma.
            </h2>
            <p className="text-base lg:text-lg text-[var(--color-ink-muted)] leading-[1.7]">
              We&rsquo;re licensed by the Oklahoma Medical Marijuana Authority
              and METRC-compliant. Our facility sits on the edge of Carter
              County — close enough to the I-35 corridor to reach every
              licensed dispensary in the state inside a day.
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-6 space-y-3 text-sm text-[var(--color-ink-muted)] bg-[color-mix(in_srgb,var(--color-bg-dark)_4%,var(--color-bg))]">
            <p>
              <span className="text-[var(--color-ink)] font-medium">
                Licensed by:
              </span>{" "}
              Oklahoma Medical Marijuana Authority
            </p>
            <p>
              <span className="text-[var(--color-ink)] font-medium">
                OBNDD License:
              </span>{" "}
              # {license.obndd}
            </p>
            <p>
              <span className="text-[var(--color-ink)] font-medium">
                Compliance:
              </span>{" "}
              METRC
            </p>
            <p>
              <span className="text-[var(--color-ink)] font-medium">
                Testing:
              </span>{" "}
              Independent lab partner — COA per batch
            </p>
          </div>
        </div>
      </section>

      <section className="surface-dark">
        <div className="container-site py-16 lg:py-20 text-center lg:text-left lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl mx-auto lg:mx-0 mb-8 lg:mb-0">
            <h2 className="font-serif text-3xl lg:text-4xl mb-3">
              Wholesale inquiries welcome.
            </h2>
            <p style={{ color: "var(--color-ink-inv-muted)" }}>
              Licensed Oklahoma dispensaries — reach out and we&rsquo;ll
              reply within one business day.
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
