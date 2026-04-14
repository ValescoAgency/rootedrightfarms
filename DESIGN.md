# Rooted Right Farms — Design System

Design decisions locked during plan-design-review (commit a75f704). Any change requires updating this file.

## Brand

- **Direction:** Hybrid — Prototype A's immersive full-bleed hero + Prototype B's scientific annotation language (FIG. labels, stats bar, horizontal strain cards).
- **Positioning:** Premium indoor hydroponic cannabis cultivar. B2B-facing. Science + craft.
- **Audience:** Oklahoma dispensary buyers (primary). Curious consumers + industry (secondary).

## Color Tokens

```
--color-bg           #FAFAF7   warm white, primary surface
--color-bg-dark      #1B3A28   deep forest, inverse surface (strain section, footer)
--color-ink          #1B3A28   primary text on light bg
--color-ink-muted    #4A6B52   secondary text (body copy)
--color-ink-subtle   #808A80   tertiary text (captions, FIG. labels)
--color-ink-inverse  #FFFFFF   text on dark bg
--color-ink-inv-mut  #D6DDD0   muted text on dark bg
--color-primary      #2D5E3A   primary brand green (CTAs, nav on dark variants)
--color-accent       #DA724F   terracotta from logo — CTAs, active states, stats, highlights
--color-border       #D6DDD0   subtle dividers on light bg
--color-border-inv   #FFFFFF30 hairline on dark bg (10% white)

# Semantic
--color-success      #2D6B3F
--color-error        #B54A2F   (desaturated terracotta, do not confuse with accent)
--color-focus        #DA724F   accent used for focus rings
```

**Usage rules:**
- Accent (`#DA724F`) is reserved for: primary CTAs, active nav state, stats bar numbers, strain type labels, decorative divider icons, key links. Never use it on body copy.
- Background alternation: light section → dark slab (strains) → light section → dark slab (wholesale CTA) → light footer. This is the core section rhythm.
- One accent per screen. If multiple elements compete for terracotta attention, downgrade secondary ones to primary green.

## Typography

```
--font-serif    "Playfair Display", Georgia, serif       (display, headings)
--font-sans     "Inter", -apple-system, sans-serif       (body, UI)

# Scale (rem-based, 1rem = 16px)
--text-xs       0.6875rem  (11px)  FIG. labels, eyebrow text
--text-sm       0.8125rem  (13px)  card type labels, small UI
--text-base     1rem       (16px)  body default
--text-lg       1.0625rem  (17px)  desktop body, lead paragraphs
--text-xl       1.25rem    (20px)  strain card names
--text-2xl      1.75rem    (28px)  section headings (mobile)
--text-3xl      2rem       (32px)  section headings (desktop)
--text-4xl      2.5rem     (40px)  page headings
--text-5xl      2.625rem   (42px)  mobile hero
--text-6xl      3.75rem    (60px)  desktop hero
--text-7xl      4rem       (64px)  xl desktop hero

# Weight
--font-regular  400
--font-medium   500
--font-semibold 600
--font-bold     700
```

**Usage rules:**
- Serif (`Playfair Display`) for all headings, hero text, strain names, stat numbers, footer wordmark.
- Sans (`Inter`) for all body copy, CTAs, nav, captions, labels.
- Letter-spacing on FIG. labels and eyebrows: `0.15em` (tracks generously for clarity).
- Line-height on body: `1.6`. Line-height on hero/display: `1.08`.

## Spacing Scale

```
--space-1   4px
--space-2   8px
--space-3   12px
--space-4   16px
--space-5   20px
--space-6   24px
--space-8   32px
--space-10  40px
--space-12  48px
--space-16  64px
--space-20  80px
--space-24  96px
```

**Usage rules:**
- Card inner padding: `--space-4` mobile, `--space-5` desktop.
- Section padding (top/bottom): `--space-10` mobile, `--space-16` desktop.
- Section padding (left/right): `--space-6` mobile, `--space-20` desktop.

## Radius

```
--radius-none  0
--radius-sm    4px    strain cards (Prototype A), subtle UI
--radius-md    6px    buttons, cards (Prototype B style), images
--radius-lg    12px   modals, drawers
--radius-full  9999px pill nav, pill-shaped secondary buttons
```

## Shadow

```
--shadow-sm    0 2px 4px  rgba(0,0,0,0.04)          strain cards at rest
--shadow-md    0 4px 16px rgba(0,0,0,0.08)          cards on hover
--shadow-lg    0 8px 24px rgba(0,0,0,0.25)          floating pill nav
--shadow-inner none                                  we don't use inner shadows
```

## Motion

**Philosophy:** Editorial reveal on scroll, utilitarian on hover. Three speeds, no more.

```
--ease-out     cubic-bezier(0.16, 1, 0.3, 1)    default, decelerating
--ease-in-out  cubic-bezier(0.4, 0, 0.2, 1)     state transitions
--ease-spring  cubic-bezier(0.34, 1.56, 0.64, 1) pill active indicator

--duration-instant  120ms   micro-interactions (tap feedback)
--duration-quick    240ms   hover, focus, state changes
--duration-editorial 480ms  scroll reveals, section transitions
```

**Required motions:**
1. **Scroll reveal:** Section content fades in + translates up 16px over 480ms, staggered children at 60ms delay. Trigger at 20% viewport intersection.
2. **Card hover:** `translateY(-4px)` + shadow `sm → md` + image `scale(1.03)`. All 240ms ease-out.
3. **Pill nav active:** Active pill morphs to accent color with spring ease (480ms). Icon + label inside retain color transition.

**Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all translates/scales/transforms. Opacity fades are kept (at 240ms instead of 480ms). Hover states fall back to color-only changes.

## Layout + Breakpoints

```
--breakpoint-sm   640px    tablet begins
--breakpoint-md   1024px   desktop begins
--breakpoint-lg   1440px   large desktop

--container-max   1440px   max content width on large screens
--container-pad-mobile   24px
--container-pad-tablet   48px
--container-pad-desktop  80px
```

**Breakpoint behavior:**

| Range | Nav | Strains grid | Hero |
|-------|-----|--------------|------|
| 0 - 639 | Floating pill at bottom | 1-col vertical | Full-bleed photo with gradient overlay |
| 640 - 1023 | Floating pill at bottom | 2-col | Full-bleed photo with gradient overlay |
| 1024 - 1439 | Horizontal top nav | 3-col | Split layout (text + photo) |
| 1440+ | Horizontal top nav, container capped | 4-col | Split layout, full container width |

## Components

### Floating Pill Nav (mobile + tablet)
- Fixed position, `bottom: 16px`, centered horizontally
- Fill: `rgba(27, 58, 40, 0.92)` with `backdrop-filter: blur(20px)`
- Border: `1px solid rgba(255,255,255,0.2)` (hairline glass edge)
- Shadow: `--shadow-lg`
- Radius: `--radius-full`
- Item: 52×52px min touch target, icon (18px) + label (10px) stacked
- Active state: item fill = `--color-accent`, label weight = semibold
- Tab order: Home → Strains → About → Contact
- ARIA: `<nav aria-label="Primary">`

### Primary Button
- Fill `--color-accent`, text `--color-ink-inverse`
- Padding: `14px 28px` mobile, `16px 32px` desktop
- Radius: `--radius-md`
- Hover: darken accent by 8%, shadow `sm → md`
- Focus ring: 2px solid `--color-accent`, 2px offset
- Min height 44px (touch target)

### Secondary Button (outline + pill)
- Transparent fill, `1.5px` stroke in `--color-ink` (or `--color-ink-inverse` on dark)
- Radius: `--radius-full`
- Same padding + states as primary

### Strain Card (vertical — mobile list)
- Fill `--color-bg` card on `--color-bg-dark` section, or inverse
- Radius `--radius-sm`
- Image area 200-220px tall, full width, `object-fit: cover`
- Body: 16px padding, strain name (xl serif) → type label (xs accent tracked) → description (sm muted) → [CTA on hover]
- Hover: lift 4px, image zoom 1.03, shadow `sm → md`

### Strain Card (horizontal — tablet/desktop option B style)
- Image 130×160 on left, body on right with fill_container
- Same hover behavior

### FIG. Label
- Inside rectangle fill `rgba(255,255,255,0.8)` with backdrop-blur
- Radius `--radius-sm`
- Padding `6px 10px`
- Text: `--text-xs` Inter 500, letter-spacing 0.2em
- Content format: `FIG. 00X — ALL CAPS DESCRIPTOR`
- Purpose: scientific annotation on full-bleed photos

### Stats Bar
- Dark slab (`--color-bg-dark`), horizontal flex, `space-around`
- Each stat: number (2xl-3xl serif bold, accent color) + label (xs Inter tracked, muted on dark)
- Three stats per bar. No more, no less.
- Desktop: inline horizontal `{number} {label}`. Mobile: stacked vertical.

### Form Field
- Label above input, `--text-sm` medium, `--color-ink`
- Input: 44px min-height, 1.5px border `--color-border`, `--radius-md`, `--space-4` horizontal padding
- Focus: border `--color-accent`, 2px glow
- Error: border `--color-error`, error message below in `--color-error` `--text-xs`
- Required indicator: small accent dot after label, not asterisk

## Interaction States

```
FEATURE                 | LOADING             | EMPTY                    | ERROR                | SUCCESS              | FOCUS
------------------------|---------------------|--------------------------|----------------------|----------------------|------
Strain image            | Shimmer + tint      | N/A                      | Leaf placeholder     | Fade-in blur-up      | N/A
Strains list            | Skeleton cards ×6   | "No strains match —      | Retry button +       | N/A                  | First card
                        |                     |  Clear filters" + CTA    | support email link   |                      |
Strain filter chip      | N/A                 | "No matches" under grid  | N/A                  | Filled accent        | 2px ring
Contact form submit     | Button spinner      | N/A                      | Inline field errors  | Full-screen thanks   | Ring on focused field
Form field              | N/A                 | Placeholder hint         | Red border + msg     | Green check icon     | Accent border + glow
Pill nav tap            | N/A                 | N/A                      | N/A                  | Accent fill          | 2px offset ring
Pill nav detail page    | N/A                 | N/A                      | N/A                  | "Strains" active +   | N/A
                        |                     |                          |                      | back link at top     |
Hero image              | Low-res + blur 20px | N/A                      | Gradient fallback    | Fade in at 240ms     | N/A
```

## Contact Form Success State

Full-screen takeover (replaces form section):
- Background: `--color-bg-dark` with backdrop facility photo at 15% opacity
- Content centered: logo → "Thanks. We'll reply within 1 business day." (display serif, text-4xl, ink-inverse) → sub copy → [Explore Our Strains] button → social links row
- Animates in: fade + scale from 0.98 to 1.0 over 480ms
- ESC or clicking outside does NOT dismiss. Back button or nav to dismiss.

## Trust Bar (Contact Page)

Horizontal row above form (desktop) / stacked vertical (mobile):
- OBNDD License # — with mini Oklahoma state outline icon
- "Indoor Hydroponic" — with mini leaf icon
- "METRC Compliant" — with mini badge icon
- Testing Lab Partner name — with lab flask icon
- "Reply within 1 business day" — with mini clock icon

All icons: lucide, 16px, `--color-ink-muted`. Text: `--text-sm` Inter 500. Separators: `•` in `--color-border`.

## Accessibility Baseline

- All interactive elements meet 44×44 touch target minimum
- Focus rings on every interactive element (2px solid `--color-accent`, 2px offset)
- Contrast ratios verified WCAG AA: 4.5:1 body, 3:1 large text (18px+ or 14px+ bold)
- Tab order follows visual hierarchy top-to-bottom, left-to-right
- Skip-to-content link (hidden until focused) first in tab order
- `<nav aria-label>`, `<main>`, `<footer>` landmarks present
- Reduced motion preference respected (see Motion section)
- Form fields: `<label>` always associated via `for`/`id`, error messages linked via `aria-describedby`
- Color is never the sole indicator of state (icons + text accompany color always)
- Alt text on all strain images: `"{Strain Name} cannabis bud — {type}"`
- Alt text on facility photos: describe content, not mood

## Page Map

- `/` — Homepage (done, 4 variants)
- `/strains` — Catalog (filter + grid)
- `/strains/[slug]` — Detail page per strain
- `/about` — Mission, process, location (no team section at launch)
- `/contact` — Form + trust bar + sidebar contact info
- `/thanks` — N/A, handled as full-screen takeover state

## Build Order

1. DESIGN.md (this file) ✅
2. Remaining mockups: Strains catalog, Strain detail, About, Contact — mobile + desktop each
3. Next.js scaffold with stack per CLAUDE.md
4. Homepage → Strains catalog → Strain detail → About → Contact
5. Form submission wired to Supabase + email
6. Motion pass (Framer Motion)
7. A11y audit + contrast verification
8. Vercel preview → client review → DNS cutover
