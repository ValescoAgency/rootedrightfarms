# DNS cutover — rootedrightfarms.com

Launch-day runbook for repointing `rootedrightfarms.com` (apex) + `www.rootedrightfarms.com` from the legacy hosting at GoDaddy to the new Vercel deploy, **without dropping Jeff's email**.

The short version:

1. **Preserve every MX, SPF, DKIM, and DMARC record exactly as it exists today.** Email is on a separate provider from hosting — only A / AAAA / CNAME for the site need to change.
2. **Lower TTLs to 300s 48 hours before the cutover window** so a rollback is minutes, not hours.
3. **Get written sign-off from Jeff** on the preview URL before touching DNS.
4. **Run the verification checklist end-to-end after the cutover** — site + email both.

The files in this directory:

| File | Purpose |
| --- | --- |
| [`pre-cutover-checklist.md`](./pre-cutover-checklist.md) | T-48h through T-0 prep steps |
| [`pre-cutover-zone.txt`](./pre-cutover-zone.txt) | Current zone export, committed as the rollback source of truth |
| [`cutover-plan.md`](./cutover-plan.md) | Exact DNS changes, Vercel domain-add steps, rollback procedure |
| [`post-cutover-verification.md`](./post-cutover-verification.md) | Site + email smoke tests to run inside the window |
| [`cutover-log.md`](./cutover-log.md) | Filled in during execution — timestamps, observed values, decisions |

## Ownership

| Role | Person |
| --- | --- |
| Driver | Jason (valesco) |
| Approver | Jeff (client) |
| On-call if email breaks | Jeff |

## Cutover window

TBD — schedule during a low-traffic window on a **weekday morning (US Central)** so email issues surface before the end of business, not overnight.
