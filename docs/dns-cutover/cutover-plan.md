# Cutover plan

Run at T-0. Before you start, confirm:

- [ ] Jeff has said YES in writing on the preview URL.
- [ ] TTLs have been at 300s for at least 48 hours on A/CNAME.
- [ ] `pre-cutover-zone.txt` is committed to git.
- [ ] You can open `pre-cutover-zone.txt` in a second window. If anything goes wrong the answer is *"put the old values back."*

## 1. DNS changes at GoDaddy

All values below track [Vercel's current DNS setup docs](https://vercel.com/docs/projects/domains/working-with-dns). **Re-read the Vercel docs before running this** — the apex A record IP has changed in the past.

| Record | Type | Name | Value | TTL | Notes |
| --- | --- | --- | --- | --- | --- |
| Apex | `A` | `@` | `76.76.21.21` | 300 | Replaces legacy GoDaddy hosting IPs. Verify with Vercel's current recommended IP at the time of cutover. |
| www | `CNAME` | `www` | `cname.vercel-dns.com.` | 300 | |

### Records to leave alone

- Every `MX` record (Google Workspace, Office 365, or whichever provider Jeff uses).
- `TXT` records for SPF (`v=spf1 …`), DKIM selectors, `_dmarc`.
- Any provider-specific autodiscover / autoconfig records.
- `NS` records (managed by GoDaddy).

If GoDaddy surfaces a "we recommend replacing these records" banner, **click away from it**. We are not using their hosting suggestions.

## 2. Verify propagation

- [ ] `dig rootedrightfarms.com A +short` returns `76.76.21.21` (or whichever Vercel IP you set).
- [ ] `dig www.rootedrightfarms.com CNAME +short` returns `cname.vercel-dns.com.`.
- [ ] Open https://dnschecker.org/#A/rootedrightfarms.com — wait for ≥ 15 of 20 probes green before moving on.

## 3. Claim the domain on Vercel

- [ ] In Vercel → Project → Domains, mark `rootedrightfarms.com` as **Primary**.
- [ ] Confirm Vercel issues a Let's Encrypt certificate (usually < 60s once DNS resolves).
- [ ] Confirm `www.rootedrightfarms.com` is set to redirect to the apex (default Vercel behavior when both are added).

## 4. Run post-cutover verification

Switch to `post-cutover-verification.md` and work through the list. Do not consider the cutover done until every box is checked.

## Rollback procedure

If **any** step in post-cutover verification fails in a way that can't be fixed in ≤ 15 minutes, roll back:

1. In GoDaddy, revert the A and CNAME records to the values captured in `pre-cutover-zone.txt`.
2. Set TTLs on those reverted records back to 300 so propagation stays fast.
3. Post the failure + rollback timestamp in `cutover-log.md` and in the Linear issue.
4. Schedule a new cutover window after the root cause is understood.

**Do not** touch MX or TXT records during a rollback — they were never changed.
