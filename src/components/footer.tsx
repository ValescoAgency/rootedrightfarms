import Link from "next/link";
import { primaryNav, socialLinks } from "@/lib/nav";
import { getSiteConfig } from "@/lib/site-config";
import { NewsletterSignup } from "@/components/newsletter-signup";

export function Footer() {
  const { copyright } = getSiteConfig();
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] pt-16 pb-32 lg:pb-16">
      <div className="container-site space-y-12 lg:space-y-16">
        <section
          aria-label="Newsletter signup"
          className="grid gap-6 lg:grid-cols-[2fr_3fr] lg:items-center pb-10 border-b border-[var(--color-border)]"
        >
          <div>
            <p className="eyebrow mb-2">STAY IN TOUCH</p>
            <p className="font-serif text-2xl lg:text-3xl text-[var(--color-ink)]">
              New drops + farm updates, occasionally.
            </p>
          </div>
          <div className="lg:max-w-md">
            <NewsletterSignup source="footer" />
            <p className="mt-3 text-xs text-[var(--color-ink-subtle)]">
              Licensed-dispensary addresses only. Unsubscribe in one click.
            </p>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-3 lg:items-start">
          <div className="space-y-3">
          <p className="font-serif text-2xl font-semibold text-[var(--color-ink)]">
            Rooted Right Farms
          </p>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Premium indoor hydroponic cannabis — Ardmore, Oklahoma.
          </p>
          <p className="text-xs text-[var(--color-ink-subtle)]">
            © {copyright.year} Rooted Right Farms. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-ink-subtle)]">
            {copyright.licenseText}
          </p>
        </div>

        <nav aria-label="Footer" className="space-y-3">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link
                href="/privacy"
                className="text-xs text-[var(--color-ink-subtle)] hover:text-[var(--color-accent)] transition-colors"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-xs text-[var(--color-ink-subtle)] hover:text-[var(--color-accent)] transition-colors"
              >
                Terms
              </Link>
            </li>
          </ul>
        </nav>

          <ul className="flex gap-4 lg:justify-end">
            {socialLinks.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
