export const metadata = {
  title: "Terms of Use",
  description:
    "Terms under which visitors may use the Rooted Right Farms website.",
};

const UPDATED = "April 13, 2026";

export default function TermsPage() {
  return (
    <article className="container-site py-16 lg:py-24 max-w-3xl">
      <p className="eyebrow mb-4">LEGAL</p>
      <h1 className="font-serif text-4xl lg:text-5xl mb-3">Terms of Use</h1>
      <p className="text-sm text-[var(--color-ink-subtle)] mb-10">
        Last updated {UPDATED}
      </p>

      <div className="space-y-8 text-base leading-[1.7] text-[var(--color-ink-muted)] [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:lg:text-3xl [&_h2]:text-[var(--color-ink)] [&_h2]:mt-12 [&_h2]:mb-3 [&_strong]:text-[var(--color-ink)]">
        <p>
          These terms govern your use of rootedrightfarms.com (the
          &ldquo;Site&rdquo;), operated by Rooted Right Farms LLC
          (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By
          visiting the Site you agree to these terms. If you do not agree,
          please do not use the Site.
        </p>

        <section>
          <h2>Ownership</h2>
          <p>
            The Site, its content, design, logos, and brand assets are owned
            by Rooted Right Farms LLC or its licensors and are protected by
            copyright, trademark, and other intellectual-property laws.
          </p>
        </section>

        <section>
          <h2>Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the Site if you are under twenty-one.</li>
            <li>
              Attempt to probe, scan, overload, or otherwise interfere with
              the Site or its infrastructure.
            </li>
            <li>
              Scrape, duplicate, or repost content from the Site without our
              written permission, except for ordinary browsing and caching by
              search engines.
            </li>
            <li>
              Use the Site for any unlawful purpose or to submit false or
              misleading information on any form.
            </li>
            <li>
              Misuse our trademarks, or imply an endorsement or partnership we
              have not granted.
            </li>
          </ul>
        </section>

        <section>
          <h2>Intellectual Property</h2>
          <p>
            We grant you a limited, non-exclusive, non-transferable license to
            view the Site for your personal or legitimate business-inquiry
            use. All rights not expressly granted are reserved.
          </p>
        </section>

        <section>
          <h2>No Sales; No Medical Advice</h2>
          <p>
            The Site does not sell cannabis products to consumers. Wholesale
            inquiries from licensed Oklahoma dispensaries are handled
            off-platform, in compliance with Oklahoma law. Nothing on the Site
            is medical, legal, or professional advice.
          </p>
        </section>

        <section>
          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by Oklahoma law, Rooted Right
            Farms LLC and its officers, employees, and affiliates are not
            liable for any indirect, incidental, consequential, special, or
            punitive damages arising out of your use of the Site. Our total
            aggregate liability for any claim related to the Site will not
            exceed one hundred US dollars.
          </p>
          <p>
            The Site is provided on an &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; basis. We disclaim all warranties, express or
            implied, to the maximum extent permitted by law.
          </p>
        </section>

        <section>
          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of the State of Oklahoma,
            without regard to conflict-of-laws principles. Any dispute arising
            from the Site will be resolved in the state or federal courts
            sitting in Carter County, Oklahoma, and you consent to that
            jurisdiction and venue.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            We may update these terms; the &ldquo;last updated&rdquo; date at
            the top of the page reflects the current version. Continued use
            after an update constitutes acceptance.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions? Email{" "}
            <a
              href="mailto:hello@rootedrightfarms.com"
              className="underline"
            >
              hello@rootedrightfarms.com
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
