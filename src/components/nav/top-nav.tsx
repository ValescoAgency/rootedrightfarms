import Link from "next/link";
import { primaryNav } from "@/lib/nav";

export function TopNav() {
  return (
    <nav
      aria-label="Primary"
      className="hidden lg:block border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur sticky top-0 z-40"
    >
      <div className="container-site flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-[var(--color-ink)]"
        >
          Rooted Right Farms
        </Link>
        <ul className="flex items-center gap-8">
          {primaryNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors duration-[var(--duration-quick)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
