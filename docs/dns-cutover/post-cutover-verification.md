# Post-cutover verification

Run every item. Log the actual observed value in `cutover-log.md` — don't just check the box.

## Site + cert

- [ ] `curl -sI https://rootedrightfarms.com` → returns `HTTP/2 200` and `server: Vercel`.
- [ ] Browser loads `https://rootedrightfarms.com` with a valid HTTPS padlock (Let's Encrypt issuer).
- [ ] `https://www.rootedrightfarms.com` 301-redirects to the apex.
- [ ] `http://rootedrightfarms.com` (plain HTTP) 301-redirects to HTTPS.

## Page smoke

Walk each page on the live domain, not the preview:

- [ ] `/` loads; hero + stats + featured strains + Instagram tiles + wholesale CTA all render
- [ ] `/strains` loads; filter chips work; click a card → detail loads
- [ ] `/services`, `/about`, `/contact`, `/employment` all load
- [ ] `/privacy` and `/terms` load without the age gate prompting
- [ ] Age gate appears on first visit; "Yes, 21+" persists for the session
- [ ] `/sitemap.xml` responds with the live domain in every URL
- [ ] `/robots.txt` responds and lists the sitemap URL

## Contact form end-to-end

- [ ] Submit a real contact form entry with `inquiry=wholesale`. Use a throwaway external email.
- [ ] Jeff confirms he received the notification email within a minute.
- [ ] Row is visible in `/admin/submissions/contact` once Jeff signs in.

## Email (MX preservation)

- [ ] From an external inbox (gmail/outlook, not Jeff's own), send a test email to `jeff@rootedrightfarms.com`. Ask him to reply.
- [ ] Jeff receives it. Full round-trip works.
- [ ] Outbound test: Jeff sends an email from `jeff@rootedrightfarms.com` to an external address. Check SPF + DKIM headers still pass.
- [ ] Run `dig MX rootedrightfarms.com +short` — unchanged from `pre-cutover-zone.txt`.

## Analytics + SEO hygiene

- [ ] Vercel Analytics dashboard shows production traffic (hit `/` a few times; entries appear within a few minutes).
- [ ] `contact_submitted` event appears in Vercel Analytics after the form submission above.
- [ ] Speed Insights dashboard records at least one LCP sample.
- [ ] Open the OpenGraph preview in a social debugger (e.g., [opengraph.xyz](https://www.opengraph.xyz/)) — image, title, description all resolve.

## Wrap

- [ ] All checklist items above are green.
- [ ] Raise TTLs on the A + CNAME records back to normal values (3600s) **24 hours after cutover**, once we're confident we won't roll back.
- [ ] Close VA-46 in Linear with a link to the completed `cutover-log.md`.
- [ ] Send Jeff a short "we're live" note.
