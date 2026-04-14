import Image from "next/image";
import {
  INQUIRY_TYPES,
  type InquiryType,
} from "@/lib/submissions/types";
import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Contact",
  description:
    "Reach Rooted Right Farms for wholesale, registration, nursery + design, tissue cultures, or general inquiries.",
};

const TRUST_BAR = [
  "OBNDD Licensed",
  "Indoor Hydroponic",
  "METRC Compliant",
  "Reply within 1 business day",
];

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

  return (
    <>
      <section className="container-site py-16 lg:py-24">
        <p className="eyebrow mb-4">FIG. 006 — CONTACT</p>
        <h1 className="font-serif text-4xl lg:text-5xl max-w-2xl mb-6">
          Let&rsquo;s talk.
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-ink-muted)]">
          Tell us a little about the inquiry and we&rsquo;ll route it to the
          right person.
        </p>
      </section>

      <section
        aria-label="Credentials"
        className="container-site pb-8 border-t border-[var(--color-border)]"
      >
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 text-sm text-[var(--color-ink-muted)]">
          {TRUST_BAR.map((item, i) => (
            <li key={item} className="flex items-center gap-3">
              {i > 0 ? (
                <span
                  aria-hidden
                  className="w-1 h-1 rounded-full bg-[var(--color-border)]"
                />
              ) : null}
              <span className="text-[var(--color-ink)] font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-site py-12 lg:py-16 grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div>
          <ContactForm defaultInquiry={defaultInquiry} />
        </div>
        <aside className="space-y-6 lg:pl-8 lg:border-l lg:border-[var(--color-border)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
            {/* TODO: swap for client-supplied dispensary/partner photo when delivered. Placeholder sourced from design/prototypes.pen (see public/images/CREDITS.md). */}
            <Image
              src="/images/contact/dispensary-shelf.png"
              alt="Dispensary shelf displaying Rooted Right Farms flower"
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute left-3 bottom-3 rounded-[var(--radius-sm)] bg-[rgba(255,255,255,0.85)] backdrop-blur px-2.5 py-1.5"
            >
              <p
                className="text-[10px] font-medium text-[var(--color-ink)]"
                style={{ letterSpacing: "0.2em" }}
              >
                FIG. 006.A — PARTNER SHELVES
              </p>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-2">DIRECT</p>
            <p className="text-base text-[var(--color-ink)]">
              <a
                href="mailto:hello@rootedrightfarms.com"
                className="underline hover:text-[var(--color-accent)]"
              >
                hello@rootedrightfarms.com
              </a>
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2">LOCATION</p>
            <p className="text-base text-[var(--color-ink-muted)]">
              Ardmore, Oklahoma
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2">RESPONSE</p>
            <p className="text-base text-[var(--color-ink-muted)]">
              Within one business day, Monday through Friday.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
