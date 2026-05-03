# Cutover log — {DATE TBD}

Fill in as you execute. Keep terse — this is evidence, not prose.

## Sign-off

- [ ] Jeff YES received at: {timestamp}
- [ ] Quote / link to the approval message:

## Pre-cutover

- [ ] Zone exported at: {timestamp}
- [ ] TTL lowered to 300 at: {timestamp}
- [ ] MX records noted (count + providers):
- [ ] Unexpected records discovered (if any):

## Cutover window

| Step | Start | End | Observed value / note |
| --- | --- | --- | --- |
| GoDaddy A apex → Vercel |  |  |  |
| GoDaddy CNAME www → Vercel |  |  |  |
| `dig` shows new A |  |  |  |
| Vercel marks Primary |  |  |  |
| TLS cert issued |  |  |  |

## Post-cutover verification

Paste observed values next to each — don't just tick.

- [ ] `curl -sI https://rootedrightfarms.com` status:
- [ ] www redirect status:
- [ ] `/sitemap.xml` OK:
- [ ] Contact form → Jeff notification at: {timestamp}
- [ ] Inbound email test (Jeff received):
- [ ] Outbound email test (SPF + DKIM pass):
- [ ] `dig MX` unchanged:
- [ ] Analytics event captured at: {timestamp}

## Anomalies

(Anything unexpected. Empty is fine.)

## Wrap

- [ ] TTL restored to 3600 at: {timestamp, 24h after cutover}
- [ ] Linear VA-46 closed at: {timestamp}
- [ ] "We're live" note sent to Jeff at: {timestamp}
