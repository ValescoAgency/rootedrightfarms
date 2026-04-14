import Link from "next/link";

export default function StrainNotFound() {
  return (
    <section className="container-site py-24 lg:py-32 text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="font-serif text-4xl lg:text-5xl mb-4">
        We don&rsquo;t have that strain.
      </h1>
      <p className="text-[var(--color-ink-muted)] mb-8">
        It may have been renamed, unpublished, or never existed.
      </p>
      <Link
        href="/strains"
        className="inline-flex items-center px-7 py-3.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm"
      >
        Browse all strains
      </Link>
    </section>
  );
}
