import {
  ShieldCheck,
  Leaf,
  Clock1,
  BadgeCheck,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
} from "lucide-react";
import {
  INQUIRY_TYPES,
  type InquiryType,
} from "@/lib/submissions/types";
import { ContactForm } from "./contact-form";
import { getSiteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Contact",
  description:
    "Reach Rooted Right Farms for wholesale, registration, nursery + design, tissue cultures, or general inquiries.",
};

function parseInquiry(raw: string | undefined): InquiryType {
  if (raw && (INQUIRY_TYPES as readonly string[]).includes(raw)) {
    return raw as InquiryType;
  }
  return "general";
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ inquiry?: string }>;
}) {
  const params = await searchParams;
  const defaultInquiry = parseInquiry(params.inquiry);
  const { license } = getSiteConfig();

  const trustItems = [
    { icon: ShieldCheck, label: `OBNDD Licensed · #${license.obndd}` },
    { icon: Leaf, label: "Indoor Hydroponic · Ardmore, OK" },
    { icon: BadgeCheck, label: "METRC Compliant" },
    { icon: Clock1, label: "Reply within 1 business day" },
  ];

  return (
    <>
      <section className="container-site py-16 lg:py-24">
        <p className="eyebrow mb-4">CONTACT</p>
        <h1 className="font-serif text-4xl lg:text-5xl max-w-2xl mb-6">
          Partner With Us
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-ink-muted)]">
          Dispensaries and partners — reach out and we&rsquo;ll reply within
          one business day.
        </p>
      </section>

      <section
        aria-label="Credentials"
        className="container-site pb-8 border-t border-[var(--color-border)]"
      >
        <ul className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-8 gap-y-3 pt-6 text-sm">
          {trustItems.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon
                size={14}
                className="shrink-0 text-[var(--color-accent)]"
                aria-hidden
              />
              <span className="font-medium text-[var(--color-ink)]">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-site py-12 lg:py-16 grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div>
          <ContactForm defaultInquiry={defaultInquiry} />
        </div>
        <aside>
          <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-dark)] p-8">
            <p
              className="eyebrow mb-2"
              style={{ color: "var(--color-ink-inv-muted)" }}
            >
              OTHER WAYS
            </p>
            <h2 className="font-serif text-2xl text-[var(--color-ink-inverse)] mb-4">
              Reach us directly
            </h2>
            <ul className="divide-y divide-white/[0.12]">
              <li className="flex items-center gap-3 py-4">
                <Phone
                  size={18}
                  className="shrink-0 text-[var(--color-accent)]"
                  aria-hidden
                />
                <a
                  href="tel:+15804000000"
                  className="text-sm font-medium text-[var(--color-ink-inverse)] hover:text-[var(--color-accent)] transition-colors"
                >
                  (580) XXX-XXXX
                </a>
              </li>
              <li className="flex items-center gap-3 py-4">
                <Mail
                  size={18}
                  className="shrink-0 text-[var(--color-accent)]"
                  aria-hidden
                />
                <a
                  href="mailto:hello@rootedrightfarms.com"
                  className="text-sm font-medium text-[var(--color-ink-inverse)] hover:text-[var(--color-accent)] transition-colors"
                >
                  hello@rootedrightfarms.com
                </a>
              </li>
              <li className="flex items-center gap-3 py-4">
                <MapPin
                  size={18}
                  className="shrink-0 text-[var(--color-accent)]"
                  aria-hidden
                />
                <span className="text-sm font-medium text-[var(--color-ink-inverse)]">
                  Ardmore, Oklahoma
                </span>
              </li>
              <li className="flex items-center gap-4 pt-4">
                <Instagram
                  size={20}
                  className="text-[var(--color-ink-inv-muted)] hover:text-[var(--color-ink-inverse)] transition-colors cursor-pointer"
                  aria-label="Instagram"
                />
                <Facebook
                  size={20}
                  className="text-[var(--color-ink-inv-muted)] hover:text-[var(--color-ink-inverse)] transition-colors cursor-pointer"
                  aria-label="Facebook"
                />
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
