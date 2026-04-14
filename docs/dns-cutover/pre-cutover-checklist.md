# Pre-cutover checklist

Work top to bottom. Check each item off in `cutover-log.md` with the actual timestamp.

## T-7 days

- [ ] Confirm all merge PRs landed; smoke-test the Vercel preview URL end-to-end.
- [ ] Verify `docs/quality-gate.md` is filled in for the current preview build (contrast, a11y, Lighthouse).
- [ ] Confirm `jeff@rootedrightfarms.com` has been seeded as `admin` in Supabase (\`grant_role_by_email\`).
- [ ] Confirm Resend domain verification records are already on the zone (so production form emails don't go to spam).

## T-48h

- [ ] **Export the full zone from GoDaddy** and save verbatim to `pre-cutover-zone.txt`. Include every record type: `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `SRV`, `CAA`, `NS`. Inspect for surprise records (e.g., a webmail CNAME) — anything we don't recognize gets preserved unless Jeff explicitly confirms it's obsolete.
- [ ] **Identify and note the email-critical records** in the zone export:
  - [ ] All `MX` entries (priority + target)
  - [ ] `TXT` records: SPF (`v=spf1 …`), DKIM selector(s), DMARC (`_dmarc`)
  - [ ] Any `autodiscover`, `autoconfig`, or provider-specific records (`mail`, `pop`, `imap`, `smtp`)
- [ ] **Lower TTLs to 300 seconds** on every A/AAAA/CNAME record that currently points to the legacy host. Leave MX + TXT TTLs alone.
- [ ] Re-check in a secondary DNS viewer (e.g., `dig +trace rootedrightfarms.com`) that the lowered TTL has propagated.
- [ ] Open the Linear VA-46 issue and drop a comment: *"TTL lowered to 300. Cutover window scheduled for {date} {time} CT."*

## T-24h

- [ ] Send Jeff the preview URL and the **explicit question**: *"Sign off on this build for production? Reply YES to proceed."*
- [ ] Wait for the written YES. Paste Jeff's reply into `cutover-log.md`.
- [ ] If Jeff asks for changes, cancel the cutover window and restart this checklist after the fixes ship.

## T-1h

- [ ] Add `rootedrightfarms.com` and `www.rootedrightfarms.com` as custom domains on the Vercel project — but do **not** set either as primary yet. Vercel will show "Invalid Configuration" until DNS flips, which is expected.
- [ ] Confirm the Vercel project's `NEXT_PUBLIC_SITE_URL` is set to `https://rootedrightfarms.com` in production env.
- [ ] Confirm `CONTACT_NOTIFICATION_TO` points at Jeff's real address.
- [ ] Pre-open five browser tabs for the cutover:
  1. GoDaddy DNS editor
  2. Vercel project Domains page
  3. `dig rootedrightfarms.com` via `https://dnschecker.org/#A/rootedrightfarms.com`
  4. Mail-tester or equivalent (external email sender)
  5. The production site URL (will start failing during the flip)

## T-0 (start of window)

Proceed to `cutover-plan.md`.
