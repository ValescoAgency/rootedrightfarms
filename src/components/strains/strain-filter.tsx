"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { STRAIN_TYPES, type StrainType } from "@/lib/strains/types";
import { cn } from "@/lib/utils";

interface Props {
  current: StrainType | "all";
}

const LABELS: Record<StrainType | "all", string> = {
  all: "All",
  indica: "Indica",
  sativa: "Sativa",
  hybrid: "Hybrid",
};

export function StrainFilter({ current }: Props) {
  // Layout segment exposed so filter chips rerender on client-side nav.
  useSelectedLayoutSegment();

  const options: Array<StrainType | "all"> = ["all", ...STRAIN_TYPES];

  return (
    <nav aria-label="Filter strains" className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === current;
        const href = opt === "all" ? "/strains" : `/strains?type=${opt}`;
        return (
          <Link
            key={opt}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-4 py-2 rounded-full border-[1.5px] text-sm font-medium transition-colors duration-[var(--duration-quick)]",
              active
                ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-ink-inverse)]"
                : "border-[var(--color-border)] text-[var(--color-ink)] hover:border-[var(--color-ink)]",
            )}
          >
            {LABELS[opt]}
          </Link>
        );
      })}
    </nav>
  );
}
