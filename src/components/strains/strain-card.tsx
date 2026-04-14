import Link from "next/link";
import type { Strain } from "@/lib/strains/types";

const TYPE_LABEL: Record<Strain["type"], string> = {
  indica: "INDICA",
  sativa: "SATIVA",
  hybrid: "HYBRID",
};

export function StrainCard({ strain }: { strain: Strain }) {
  return (
    <Link
      href={`/strains/${strain.slug}`}
      className="group block rounded-[var(--radius-sm)] bg-[var(--color-bg)] shadow-[var(--shadow-sm)] overflow-hidden transition-all duration-[var(--duration-quick)] ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
    >
      <div
        className="relative aspect-[4/3] overflow-hidden bg-[color-mix(in_srgb,var(--color-bg-dark)_15%,var(--color-bg))]"
        aria-hidden={!strain.heroImageUrl}
      >
        {strain.heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- placeholder until next/image config lands in VA-42
          <img
            src={strain.heroImageUrl}
            alt={`${strain.name} cannabis bud — ${strain.type}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--duration-quick)] ease-[var(--ease-out)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span
              className="font-serif text-[var(--color-ink-subtle)]"
              style={{ fontSize: "2rem" }}
            >
              {strain.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="p-5 space-y-2">
        <p
          className="text-[11px] font-medium"
          style={{
            letterSpacing: "0.2em",
            color: "var(--color-accent)",
          }}
        >
          {TYPE_LABEL[strain.type]}
          {strain.thcPct !== null ? ` · THC ${strain.thcPct}%` : ""}
        </p>
        <h3 className="font-serif text-xl font-semibold text-[var(--color-ink)]">
          {strain.name}
        </h3>
        {strain.description ? (
          <p className="text-sm text-[var(--color-ink-muted)] line-clamp-3">
            {strain.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
