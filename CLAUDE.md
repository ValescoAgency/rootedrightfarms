# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository. Keep this file in sync with the real code — if you change conventions, update this doc in the same PR.

## Project

Rooted Right Farms — marketing site for a cannabis farm in Ardmore, Oklahoma. B2B-facing (dispensary wholesale), no e-commerce. Public pages: Home, Strains (list + detail), About, Contact, Employment, Privacy, Terms. Admin area for signed-in staff to manage strain content.

Companion design docs:
- `DESIGN.md` — design system (color tokens, type scale, motion, spacing, component rules). Update before changing tokens.
- `TODOS.md` — non-blocking follow-ups + client-owed content.
- `docs/quality-gate.md` — a11y + perf gate for pre-DNS-cutover.

## Tech Stack

- **Next.js 16** (App Router, React 19, TypeScript strict, `src/` directory, `@/*` → `./src/*`)
- **Supabase** — Postgres (content + submissions + RBAC), Auth (admin sign-in), Storage (strain images), Edge Functions (Deno, e.g. `sync-instagram`)
- **Resend** — transactional email + newsletter Audiences
- **Tailwind CSS v4** (PostCSS plugin) + shadcn/ui-style components, `lucide-react` icons
- **Zod v4** for all runtime validation (form data, site config, env-sourced payloads)
- **Vitest** (jsdom) for unit/component tests; **Playwright** for e2e
- **pnpm** (version pinned in `package.json` → `packageManager`)
- Deployed on **Vercel**. Production will cut over to rootedrightfarms.com; previews run behind Vercel deployment protection.

## Commands

```bash
pnpm dev                               # Start dev server (localhost:3000)
pnpm build                             # Production build
pnpm start                             # Serve production build
pnpm lint                              # ESLint (next/core-web-vitals + ts)
pnpm typecheck                         # tsc --noEmit
pnpm test                              # Vitest run (single pass)
pnpm test:watch                        # Vitest watch
pnpm test -- src/path/to/file.test.ts  # Single test file
pnpm test:e2e                          # Playwright (spawns `pnpm dev` unless CI)
pnpm format                            # Prettier write
```

Local Supabase runs on non-default ports (see `supabase/config.toml`): API `54421`, DB `54422`. Run `supabase start` from the repo root; copy the printed anon/service keys into `.env.local`.

## Repository Layout

```
src/
  app/
    layout.tsx              # Root layout: fonts (Inter + Playfair), Analytics, CookieBanner
    globals.css             # Design tokens + Tailwind entry
    manifest.ts / robots.ts / sitemap.ts / opengraph-image.tsx
    (site)/                 # Public marketing layout (TopNav + FloatingPillNav + Footer)
      layout.tsx
      page.tsx              # Home
      employment/           # Careers form (PII-encrypted at rest)
      privacy/ terms/
    strains/                # /strains (list) + /strains/[slug] (detail)
    about/ contact/         # page.tsx + (contact) actions.ts + contact-form.tsx
    services/               # /services page
    actions/newsletter.ts   # Newsletter signup server action
    age-check/ age-blocked/ # Age gate landing + rejection
    admin/                  # Authenticated admin area
      login/ callback/ forbidden/
      layout.tsx page.tsx   # Dashboard
      strains/              # Strain CRUD (actions.ts + strain-editor.tsx + [slug]/ + new/)
  components/
    nav/                    # TopNav, FloatingPillNav
    strains/                # StrainCard, StrainFilter, StrainImageZoom (Shopify-style)
    footer.tsx cookie-banner.tsx instagram-grid.tsx newsletter-signup.tsx scroll-reveal.tsx
  lib/
    auth.ts                 # getSession / decideRequireRole / requireRole (RBAC)
    age-gate.ts             # Cookie name, exempt paths, sanitizeNextParam
    site-url.ts site-config.ts  # Zod-parsed site metadata from config/site.json
    pii-crypto.ts           # AES-256-GCM for employment form PII
    image-upload.ts utils.ts nav.ts
    supabase/               # anon.ts (public), browser.ts (client), server.ts (cookies-aware)
    strains/                # types, seed, admin-schema (Zod), repository (interface + in-memory), supabase-repository
    submissions/            # Contact + Employment: schema, repository, emailer, rate-limiter, submit*
    newsletter/             # Resend Audiences wrapper + repository
    instagram/              # Graph API sync
  config/site.json          # Hero copy, contact, license, socials, trust bar (schema-validated)
  test/setup.ts             # Vitest global setup (jsdom + testing-library matchers)
  proxy.ts                  # Next middleware — redirects to /age-check when cookie missing
supabase/
  config.toml               # Local ports shifted to 544xx (VA-53)
  migrations/               # 10 timestamped SQL files — strains, submissions, newsletter, employment,
                            # instagram, user_roles + grant_role_by_email, strain-images bucket,
                            # admin allowlist trigger, admin RLS fixes
  functions/sync-instagram/ # Deno Edge Function
e2e/                        # age-gate.spec.ts + smoke.spec.ts (Playwright)
public/                     # Static assets (strain imagery etc.)
.github/workflows/e2e-preview.yml  # Playwright run against Vercel preview on deployment_status
```

## Architecture Notes

### Routing + layouts
- The `(site)` route group provides the public chrome (skip-link, `<main id="main">`, `TopNav`, `Footer`, `FloatingPillNav`). Pages that need a different chrome (admin, age-check) live outside the group.
- Root `layout.tsx` injects `Inter` (body) and `Playfair Display` (serif accent) via `next/font/google`, plus `@vercel/analytics` and `@vercel/speed-insights`. Cookie banner is rendered site-wide and hidden on `/age-check` + `/age-blocked`.

### Age gate
`src/proxy.ts` is a Next middleware (`export const config = { matcher: ... }`). All non-exempt paths without the `rrf_age_verified=1` cookie redirect to `/age-check?next=<path>`. Exemptions live in `src/lib/age-gate.ts`. Never weaken `sanitizeNextParam` — it guards against open-redirect.

### Data access
Every table has a **repository interface** in `src/lib/<domain>/repository.ts` with two implementations:
1. **In-memory** (tests, local dev without Supabase) — seeded from `seed.ts` where applicable.
2. **Supabase-backed** (`supabase-repository.ts`) — used when `NEXT_PUBLIC_SUPABASE_URL` + anon key are set.

Entry points (`get*Repository()`) pick the right impl based on env. Add new persistence behind this interface; never reach into Supabase from a page or action directly.

### Auth + RBAC
- `src/lib/auth.ts` exports `getSession`, `decideRequireRole` (pure, test-friendly), and `requireRole` (redirects unauthenticated → `/admin/login?next=`, forbidden → `/admin/forbidden`). Every admin server component and server action must call `requireRole(["admin"], currentPath)` at the top.
- Roles live in `public.user_roles` (Postgres). Promote via `select public.grant_role_by_email('email', 'admin')`. Emails in the allowlist migration `20260414000009` are auto-promoted on signup via a trigger.
- Admin writes are additionally enforced by RLS policies (`insert_strains_admin`, `update_strains_admin`, see migration `20260414000010`). The Supabase strain repository is split into public (anon) and admin (service-role) clients so page builds don't require admin auth.

### Forms + submissions
- **Contact form** (`src/app/contact/`) — server action → Zod-validated → rate-limited → persisted to `contact_submissions` → Resend notification (best-effort; failures log but don't fail the user). The pure core is `lib/submissions/submit.ts` (pass deps in, unit-test without Supabase).
- **Employment form** — same shape. PII fields (SSN, DOB, address) are encrypted at rest with `PII_ENCRYPTION_KEY` (AES-256-GCM, see `src/lib/pii-crypto.ts`). Only admins with the `submissions_viewer` or `admin` role can decrypt.
- **Newsletter** — Resend Audiences (audience id via `RESEND_AUDIENCE_ID`). Signup action at `src/app/actions/newsletter.ts`.

All submission actions return `Envelope<T> = { data: T; error: null } | { data: null; error: { code, message, fields? } }`. Client forms render per-field `aria-describedby` errors from `error.fields`.

### Strains
- Public read: `getStrainRepository().listStrains()` / `getStrainBySlug()` filter out drafts by default (`includeDrafts` opt-in for admin).
- Admin CRUD: server actions in `src/app/admin/strains/actions.ts` (`saveStrainAction`, `deleteStrainAction`) use `parseStrainFormData` + `strainAdminSchema` for validation, then revalidate `/strains`, `/strains/[slug]`, and admin routes. Image gallery uploads go to the Supabase `strain-images` bucket (migration `20260414000008`).
- Detail page includes a Shopify-style zoom (`StrainImageZoom`) and related-strains suggestion (by type).

### Site configuration
Hero copy, contact details, license, socials, trust bar, and copyright year live in `src/config/site.json` and are parsed by `getSiteConfig()` through a Zod schema. **Update JSON, not components.** Schema mismatches fail loudly at startup with a formatted issue list.

### Instagram
`src/lib/instagram/` syncs posts via the Graph API into a `instagram_posts` table. Running as a Supabase Edge Function (`supabase/functions/sync-instagram/`, Deno — excluded from eslint). Images are rendered client-side from `scontent.cdninstagram.com` / `*.fbcdn.net` — allowlisted in `next.config.ts` `images.remotePatterns`.

## Conventions

- **TypeScript strict.** No `any` — use `unknown` + Zod parsing at boundaries. Exported types live next to the code that owns them (`lib/<domain>/types.ts`).
- **Server actions** use `"use server"` at file top. Always validate with Zod, always return an `Envelope`, always `revalidatePath` for anything the action mutates. Admin actions start with `await requireRole([...])`.
- **Test placement.** Co-locate: `foo.ts` + `foo.test.ts`. Vitest picks up `src/**/*.{test,spec}.{ts,tsx}`. Keep pure logic in separate modules so tests don't need to stub Supabase — the in-memory repository exists for this.
- **Styling.** Use design tokens from `DESIGN.md` / `globals.css` (`--color-accent`, `--text-xl`, etc.) rather than hex literals. Prettier is configured with `prettier-plugin-tailwindcss` — class ordering is automated. One accent (`#DA724F`) per screen.
- **Accessibility.** Every label has `htmlFor`; every error has `aria-describedby` + `aria-invalid`; interactive targets ≥ 44×44; focus ring is `--color-focus` at 2px offset; respect `prefers-reduced-motion` (`globals.css` already caps transitions). Before merging a UI change, skim `docs/quality-gate.md`.
- **ESLint ignores** `supabase/functions/**` (Deno runtime, not Node). Lint those with `deno lint` if needed.
- **Commit style.** Scoped conventional commits used throughout history: `feat(strains): …`, `fix(admin): …`, `ci(e2e): …`, `chore(supabase): …`. Reference the Linear ticket in parentheses when applicable (e.g. `(VA-42)`).

## Environment

Copy `.env.example` → `.env.local`. Required for full functionality:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_NOTIFICATION_TO`, `RESEND_AUDIENCE_ID`
- `PII_ENCRYPTION_KEY` (16+ chars — used by `pii-crypto.ts`)
- `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_ACCESS_TOKEN`
- `VERCEL_AUTOMATION_BYPASS_SECRET` (Playwright only — attaches the bypass header so previews behind Vercel Protection are testable)
- `E2E_BASE_URL` (optional — overrides `http://localhost:3000` for e2e)

Missing Supabase env vars degrade gracefully: the site renders strains from the in-memory seed. Missing Resend/Instagram env vars skip those side effects.

## CI

`.github/workflows/e2e-preview.yml` runs Playwright against each Vercel preview on `deployment_status`. The job uses `mcr.microsoft.com/playwright` to match browser binaries and passes the Vercel protection bypass through `extraHTTPHeaders` (see `playwright.config.ts`).

## Content Status

Tracked in `TODOS.md` — still waiting on client for real strain descriptions (Banana Candy, Pine Bud, TropicanaCookies), 5–10 high-res farm photos, expanded About copy, OBNDD license #, and business contact info. Placeholders + AI imagery in use until delivered.
