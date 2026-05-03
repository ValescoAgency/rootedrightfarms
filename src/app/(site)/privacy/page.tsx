export const metadata = {
  title: "Privacy Policy",
  description:
    "How Rooted Right Farms collects, uses, and retains information from visitors and applicants.",
};

const UPDATED = "April 13, 2026";

export default function PrivacyPage() {
  return (
    <article className="container-site py-16 lg:py-24 max-w-3xl">
      <p className="eyebrow mb-4">LEGAL</p>
      <h1 className="font-serif text-4xl lg:text-5xl mb-3">Privacy Policy</h1>
      <p className="text-sm text-[var(--color-ink-subtle)] mb-10">
        Last updated {UPDATED}
      </p>

      <div className="space-y-8 text-base leading-[1.7] text-[var(--color-ink-muted)] [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:lg:text-3xl [&_h2]:text-[var(--color-ink)] [&_h2]:mt-12 [&_h2]:mb-3 [&_strong]:text-[var(--color-ink)]">
        <p>
          Rooted Right Farms LLC (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
          &ldquo;us&rdquo;) operates rootedrightfarms.com (the
          &ldquo;Site&rdquo;). This policy explains what information we collect,
          how we use it, and the choices you have. We do not sell cannabis
          products through this Site — it is a marketing and wholesale inquiry
          site only.
        </p>

        <section>
          <h2>Information We Collect</h2>
          <p>
            <strong>Contact form submissions.</strong> When you submit the
            contact form we receive the name, email, phone (optional), company
            or dispensary name, inquiry type, and the message you send.
          </p>
          <p>
            <strong>Employment applications.</strong> When you apply for a
            position we collect the information you enter in the employment
            form, which may include identifiers (name, contact), work history,
            references, and voluntary equal-employment-opportunity
            (&ldquo;EEO&rdquo;) fields. EEO responses are optional and stored
            separately from your application content.
          </p>
          <p>
            <strong>Newsletter.</strong> If you subscribe to updates we store
            your email address with our email provider (Resend).
          </p>
          <p>
            <strong>Automatic data.</strong> Our hosting provider and privacy-
            focused analytics (Vercel Analytics) record coarse request
            metadata — IP-derived country, referrer, viewport, and the path
            you visited. We do not use third-party advertising trackers.
          </p>
        </section>

        <section>
          <h2>Cookies and Similar Technologies</h2>
          <p>
            We use a small number of functional cookies. None are used for
            cross-site advertising.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Age verification.</strong> Once you confirm you are
              twenty-one or older we set <code>rrf_age_verified</code> for
              thirty days so you don&rsquo;t see the interstitial on every
              visit.
            </li>
            <li>
              <strong>Cookie notice dismissal.</strong>{" "}
              <code>rrf_cookie_dismissed</code> remembers that you&rsquo;ve
              acknowledged this policy.
            </li>
            <li>
              <strong>Instagram embeds.</strong> Our homepage may embed Instagram
              content from Meta Platforms. Loading those embeds causes Meta to
              set its own cookies; their handling is governed by Meta&rsquo;s
              privacy policy.
            </li>
          </ul>
        </section>

        <section>
          <h2>How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To reply to wholesale, media, and general inquiries.</li>
            <li>To evaluate employment applications.</li>
            <li>
              To send the newsletter you subscribed to (unsubscribe any time
              via the link in every message).
            </li>
            <li>To keep the Site reliable and measure aggregate usage.</li>
          </ul>
        </section>

        <section>
          <h2>Retention</h2>
          <p>
            <strong>Contact submissions</strong> are archived after thirty days
            and deleted after one year unless a conversation is ongoing.
          </p>
          <p>
            <strong>Employment applications</strong> are retained indefinitely
            so we can consider you for future openings. Ask us to delete your
            application any time and we will, subject to any legal retention
            obligation.
          </p>
          <p>
            <strong>Newsletter data</strong> is retained until you unsubscribe.
          </p>
        </section>

        <section>
          <h2>Sharing</h2>
          <p>
            We share information only with service providers who help us run
            the Site — our hosting provider (Vercel), database and auth
            provider (Supabase), transactional email provider (Resend), and
            Meta for Instagram embeds you load. We do not sell your
            information.
          </p>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>
            You may ask us to access, correct, or delete personal information
            we hold about you, or to stop using it for a particular purpose.
            Email <a href="mailto:hello@rootedrightfarms.com" className="underline">hello@rootedrightfarms.com</a> with your request and we will
            respond within thirty days.
          </p>
        </section>

        <section>
          <h2>Children</h2>
          <p>
            The Site is restricted to visitors twenty-one and older. We do not
            knowingly collect information from anyone under twenty-one.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            We may update this policy; the &ldquo;last updated&rdquo; date at
            the top of the page always reflects the current version.
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
