# TODOs

Tracked work that is not immediately blocking but should not be lost.

## Design

- [ ] **Tablet (640–1023px) mockup** — responsive rules are documented in DESIGN.md (pill nav stays, 2-col strain grid). Design follows during build unless pixel audit reveals surprises.
- [ ] **Motion spec refinement** — concrete easing curves locked in DESIGN.md; during build, tune stagger delays and scroll trigger thresholds with live content.
- [ ] **Strain detail page: related strains section** — needs client approval on "3 suggested" logic (by type? by effect?) before we design.
- [ ] **Favicon + OG social share image** — waiting on final hero hero image and client approval.

## Content (waiting on client)

- [ ] **Real strain descriptions** — Banana Candy, Pine Bud, TropicanaCookies (only Pie Hoe has real copy). Need: flavor, effects, THC/CBD %, lineage.
- [ ] **Real facility + team photos** — replace AI-generated imagery. Need: 5–10 high-res shots (facility interior, grow lights, plants in various stages, close-up of roots/hydroponic setup, any shots of owner/operator).
  - Current placeholder locations (all sourced from `design/prototypes.pen`, credited in `public/images/CREDITS.md`):
    - [ ] `public/images/home/hero-desktop.png` + `hero-mobile.png` — homepage hero background
    - [ ] `public/images/home/wholesale-cta.png` — dark wholesale CTA on homepage
    - [ ] `public/images/about/hero-desktop.jpg` + `hero-mobile.jpg` — About hero
    - [ ] `public/images/about/process-desktop.jpg` + `process-mobile.jpg` — About "Method" section
    - [ ] `public/images/strains-hero/grow-room.png` — Strains catalog hero
    - [ ] `public/images/strains-hero/canopy-wide.png` — reserve (unused backup)
    - [ ] `public/images/services/nursery-design.png` — Services: Nursery & Design
    - [ ] `public/images/services/tissue-cultures.png` — Services: Tissue Cultures
    - [ ] `public/images/contact/dispensary-shelf.png` — Contact sidebar
    - [ ] `public/images/employment/team.png` — Employment hero
    - [ ] `public/images/wholesale/banner-desktop.jpg` — strains-page wholesale CTA
  - Each usage site is tagged with `TODO: swap for client-supplied …` so a repo-wide grep finds them.
- [ ] **Trust bar content** — OBNDD license #, METRC compliance status, testing lab partner name.
- [ ] **About page copy** — current existing site has one sentence. Need: 2–3 paragraphs on mission, 1 on indoor hydroponic approach, 1 on Ardmore / Oklahoma.
- [ ] **Contact info** — business phone number, business email (for the contact form recipient), physical address or "by appointment".
- [ ] **Hero copy approval** — "Rooted in Science. Grown with Purpose." (Prototype A) vs something owner-approved.

## Accessibility (during build)

- [ ] **Contrast ratio audit** — verify all text-on-background pairs hit WCAG AA. Main concern: `--color-ink-muted` (#4A6B52) body on `--color-bg` (#FAFAF7).
- [ ] **Keyboard nav pass** — tab order, focus visibility, skip link, ESC closes drawers.
- [ ] **Screen reader pass** — alt text, ARIA landmarks, form field associations, live regions for form errors.
- [ ] **`prefers-reduced-motion` respect** — disable transforms, keep opacity only.

## Post-launch (phase 2)

- [ ] **Strain detail page OG images** — unique social share image per strain.
- [ ] **Blog / content marketing** — deferred from launch scope.
- [ ] **Google Business Profile integration** — reviews/hours widget on Contact page.
- [ ] **Analytics** — Vercel Analytics + conversion tracking on form submits.
