import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { primaryNav, socialLinks } from "@/lib/nav";
import { getSiteConfig } from "@/lib/site-config";
import { NewsletterSignup } from "@/components/newsletter-signup";

export function Footer() {
  const { copyright, license } = getSiteConfig();
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
          <Link
            href="/"
            aria-label="Rooted Right Farms — home"
            className="inline-flex items-center gap-3"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <p className="font-serif text-2xl font-semibold text-[var(--color-ink)]">
              Rooted Right Farms
            </p>
          </Link>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Premium indoor hydroponic cannabis — Ardmore, Oklahoma.
          </p>
          <p className="text-xs text-[var(--color-ink-subtle)]">
            © {copyright.year} Rooted Right Farms. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-ink-subtle)]">
            {copyright.licenseText}
          </p>
          <p className="text-xs text-[var(--color-ink-subtle)]">
            OBNDD Registration # {license.obndd}
          </p>
        </div>

        <nav aria-label="Footer" className="space-y-3">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors min-h-[44px] inline-flex items-center"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link
                href="/employment"
                className="text-xs text-[var(--color-ink-subtle)] hover:text-[var(--color-accent)] transition-colors min-h-[44px] inline-flex items-center"
              >
                Employment
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-xs text-[var(--color-ink-subtle)] hover:text-[var(--color-accent)] transition-colors min-h-[44px] inline-flex items-center"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-xs text-[var(--color-ink-subtle)] hover:text-[var(--color-accent)] transition-colors min-h-[44px] inline-flex items-center"
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
                  aria-label={`${s.label} (opens in new tab)`}
                  className="text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors min-h-[44px] inline-flex items-center"
                >
                  <Instagram size={20} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-6 border-t border-[var(--color-border)] text-center">
          <p className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-subtle)]">
            Built with{" "}
            <span className="text-[var(--color-accent)]" aria-hidden="true">
              ♥
            </span>{" "}
            by{" "}
            <a
              href="https://valescoagency.com/?utm_source=rootedrightfarms&utm_medium=website&utm_campaign=customers&utm_content=footer"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ color: "oklch(0.717 0.0901 64.99)" }}
            >
              <svg
                aria-hidden="true"
                className="size-4 fill-current"
                viewBox="0 0 198 186"
              >
                <path d="M66.11 185.65L0 70.81H71.55L66.11 80.27H16.38L66.11 166.67L119.93 73.18H130.86L66.11 185.65Z" />
                <path d="M131.25 0L197.36 114.84H125.81L131.25 105.38H180.99L131.25 18.98L77.43 112.48H66.5L131.25 0Z" />
              </svg>
              <span>Valesco Agency</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
