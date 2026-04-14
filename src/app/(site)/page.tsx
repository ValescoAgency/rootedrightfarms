import Link from "next/link";

export default function HomePage() {
  return (
    <section className="container-site py-24 lg:py-32">
      <p className="eyebrow mb-6">FIG. 001 — PIPELINE CHECK</p>
      <h1 className="font-serif text-5xl lg:text-6xl text-[var(--color-ink)] max-w-3xl">
        Hello from Rooted Right Farms.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-[var(--color-ink-muted)]">
        Design tokens, fonts, nav, and footer are wired. This surface proves the
        pipeline end-to-end before we build real pages.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/strains"
          className="inline-flex items-center px-7 py-3.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm transition-all duration-[var(--duration-quick)] hover:brightness-95"
        >
          Browse Strains
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center px-7 py-3.5 rounded-full border-[1.5px] border-[var(--color-ink)] text-[var(--color-ink)] font-medium text-sm transition-colors duration-[var(--duration-quick)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ink-inverse)]"
        >
          Contact Wholesale
        </Link>
      </div>
    </section>
  );
}
