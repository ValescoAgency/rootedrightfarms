import Link from "next/link";

export const metadata = {
  title: "Services",
  description:
    "Nursery, design, and tissue culture services from Rooted Right Farms for Oklahoma cultivators.",
};

interface Service {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  inquiry: string;
  todo?: string;
}

// NOTE: Service categories finalized during planning (obs S18/205) —
// Nursery and Design Services are combined into a single offering.
// "Grower Consultation" was dropped. Tissue Cultures remains standalone.
const services: Service[] = [
  {
    eyebrow: "SERVICE · 001",
    title: "Nursery &amp; Design",
    description:
      "Clones and plantlets from our mothers, plus facility design advisory for operators building out new rooms. One engagement that covers both the genetics pipeline and the room you grow them in.",
    bullets: [
      "Vigorous clones from selected mothers, ready for veg",
      "Room layout, airflow, irrigation, and fertigation planning",
      "Cultivar selection tuned to your market and facility",
    ],
    inquiry: "nursery-design",
    todo: "Jeff approval — copy is Jason-drafted from merged Nursery + Design offering",
  },
  {
    eyebrow: "SERVICE · 002",
    title: "Tissue Cultures",
    description:
      "Clean-stock tissue culture services for cultivars you want to preserve or scale. Meristem work in a dedicated lab space with documented provenance.",
    bullets: [
      "Cultivar cleanup — virus and pathogen remediation",
      "Cold-stored genetic library with signed chain of custody",
      "Scale-up from TC to clones on request",
    ],
    inquiry: "tissue-cultures",
    todo: "Jeff approval — tissue culture capability + pricing",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="container-site py-16 lg:py-24">
        <p className="eyebrow mb-4">FIG. 005 — SERVICES</p>
        <h1 className="font-serif text-4xl lg:text-6xl max-w-3xl leading-[1.08] mb-8">
          For Oklahoma cultivators who need a partner upstream.
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-ink-muted)]">
          Beyond our own flower we run two operator services drawn from the
          same facility and the same standards.
        </p>
      </section>

      <div className="container-site pb-20 space-y-16 lg:space-y-24">
        {services.map((service, i) => (
          <section
            key={service.inquiry}
            className={`grid gap-10 lg:gap-16 lg:grid-cols-2 lg:items-center ${
              i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div>
              <p className="eyebrow mb-3">{service.eyebrow}</p>
              <h2
                className="font-serif text-3xl lg:text-4xl mb-5"
                dangerouslySetInnerHTML={{ __html: service.title }}
              />
              <p className="text-base lg:text-lg text-[var(--color-ink-muted)] mb-6 leading-[1.7]">
                {service.description}
              </p>
              <ul className="space-y-2 mb-8 text-base text-[var(--color-ink-muted)]">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span
                      style={{ color: "var(--color-accent)" }}
                      aria-hidden
                    >
                      —
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/contact?inquiry=${service.inquiry}`}
                className="inline-flex items-center px-7 py-3.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm transition-all duration-[var(--duration-quick)] hover:brightness-95"
              >
                Start a conversation
              </Link>
              {service.todo ? (
                <p className="sr-only">TODO: {service.todo}</p>
              ) : null}
            </div>
            <div
              className="aspect-[4/3] rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-bg-dark)_8%,var(--color-bg))] border border-[var(--color-border)] grid place-items-center"
              aria-hidden
            >
              <span
                className="font-serif text-[var(--color-ink-subtle)]"
                style={{ fontSize: "3rem", letterSpacing: "0.02em" }}
              >
                {service.title.replace(/&amp;/g, "&").charAt(0)}
              </span>
              {/* TODO: replace with facility photo once client delivers */}
            </div>
          </section>
        ))}
      </div>

      <section className="surface-dark">
        <div className="container-site py-16 lg:py-20 text-center lg:text-left lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl mx-auto lg:mx-0 mb-8 lg:mb-0">
            <h2 className="font-serif text-3xl lg:text-4xl mb-3">
              Not sure which one fits?
            </h2>
            <p style={{ color: "var(--color-ink-inv-muted)" }}>
              Send us the shape of the project — we&rsquo;ll route you to
              the right person.
            </p>
          </div>
          <Link
            href="/contact?inquiry=general"
            className="inline-flex items-center px-7 py-3.5 rounded-full border-[1.5px] border-[var(--color-ink-inverse)] text-[var(--color-ink-inverse)] font-medium text-sm transition-colors duration-[var(--duration-quick)] hover:bg-[var(--color-ink-inverse)] hover:text-[var(--color-ink)]"
          >
            General inquiry
          </Link>
        </div>
      </section>
    </>
  );
}
