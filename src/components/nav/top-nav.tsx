import Image from "next/image";
import Link from "next/link";
import { primaryNav } from "@/lib/nav";

export function TopNav() {
  return (
    <>
      {/* Desktop nav — full logo + links */}
      <nav
        aria-label="Primary"
        className="hidden lg:block border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur sticky top-0 z-40"
      >
        <div className="container-site flex items-center justify-between h-16">
          <Link
            href="/"
            aria-label="Rooted Right Farms — home"
            className="flex items-center gap-3 font-serif text-xl font-semibold tracking-tight text-[var(--color-ink)]"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={36}
              height={36}
              priority
              className="h-9 w-9"
            />
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

      {/* Mobile header — brand identity only; navigation is handled by FloatingPillNav */}
      <header
        className="lg:hidden border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur sticky top-0 z-40"
      >
        <div className="container-site flex items-center h-14">
          <Link
            href="/"
            aria-label="Rooted Right Farms — home"
            className="flex items-center gap-2.5 font-serif text-lg font-semibold tracking-tight text-[var(--color-ink)]"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={32}
              height={32}
              priority
              className="h-8 w-8"
            />
            Rooted Right Farms
          </Link>
        </div>
      </header>
    </>
  );
}
