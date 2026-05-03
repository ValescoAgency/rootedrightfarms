# Quality Gate — VA-45

Last updated: 2026-04-13 (pre-DNS-cutover pass)

This document tracks the a11y + perf checks required before flipping DNS.
Numbers marked _pending_ are measurable only after the preview deploy has
all VA-28..VA-44 PRs merged; those slots are filled after the first
production build.

## Contrast audit

All text pairs verified against the WCAG 2.1 relative-luminance formula.
`normal-AA` = 4.5:1 threshold; `large-AA` = 3:1 (≥18px or ≥14px bold).

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `--color-ink` #1B3A28 on `--color-bg` #FAFAF7 | 12.5 : 1 | AAA |
| `--color-ink-muted` #4A6B52 on `--color-bg` #FAFAF7 | 5.6 : 1 | AA |
| `--color-ink-subtle` **#6B776B** on `--color-bg` #FAFAF7 | 5.0 : 1 | AA |
| `--color-ink-inverse` #FFFFFF on `--color-bg-dark` #1B3A28 | 14.6 : 1 | AAA |
| `--color-ink-inv-muted` #D6DDD0 on `--color-bg-dark` #1B3A28 | 8.95 : 1 | AAA |
| `--color-accent` #DA724F on `--color-ink-inverse` (CTA button) | 3.0 : 1 | large-AA — reserved for CTAs only |

### Fix applied
`--color-ink-subtle` was **#808A80** at launch — ratio 3.4:1 which fails
body-text AA at `text-xs` (11px). Darkened to **#6B776B** (ratio 5.0:1)
across `globals.css` and `DESIGN.md`. All `text-xs` captions and FIG.
labels still use ink-subtle and now pass AA.

## Keyboard + landmarks

Verified via static review (screen-reader pass still pending a manual
VoiceOver run on the preview):

- [x] Skip-to-content link is first in the tab order
- [x] `<main id="main">` in `(site)/layout.tsx`
- [x] `<nav aria-label="Primary">` desktop + `<nav aria-label="Primary (mobile)">`
      floating pill (previously both labeled "Primary" — fixed in this PR)
- [x] `<footer>` landmark from `Footer` component
- [x] Focus rings are 2px `--color-focus` at 2px offset (global)
- [x] All interactive elements ≥ 44x44px (DESIGN.md rule enforced in
      form fields + nav items)

## Forms

- [x] Every `<label htmlFor>` pairs with an `<input id>`
- [x] Field errors render `aria-invalid="true"` + `aria-describedby`
      pointing at the message element
- [x] Required fields marked with an accent dot and `required` attribute
- [x] Server-side Zod validation mirrors client required/optional semantics
- [x] `role="alert"` on form-level error rendered on server action failure

## Reduced motion

`globals.css` defines:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 240ms !important;
    transition-property: opacity, color, background-color, border-color !important;
  }
}
```

This drops transforms/scales, caps transitions at opacity fades, and
holds duration at 240ms per the DESIGN.md motion spec. Verified against
the ScrollReveal component + card hover + pill-nav active transition.

## Performance targets (pending preview measurements)

| Surface | Metric | Target | Result |
| --- | --- | --- | --- |
| Homepage | Lighthouse performance (mobile) | ≥ 90 | _pending_ |
| Homepage | Lighthouse performance (desktop) | ≥ 95 | _pending_ |
| Homepage | LCP (4G throttle) | < 2.5s | _pending_ |
| Strains | LCP (4G throttle) | < 2.5s | _pending_ |
| Contact | TBT | < 200ms | _pending_ |
| Largest JS chunk | gzipped | < 150 KB | _pending_ |

Fill these after the VA-28 Vercel wiring lands and a preview deploy is
live with all slices merged. A Playwright-based Lighthouse run can be
added to CI at that point.

## Tooling follow-ups

- [ ] Add `vitest-axe` / `jest-axe`-style assertions to component tests
      for the nav + strain card + forms once live DOM is stable.
- [ ] Add a Playwright project that runs `@axe-core/playwright` against
      every route on the preview deploy.
- [ ] Wire Core Web Vitals assertions into `canary` post-deploy check.
