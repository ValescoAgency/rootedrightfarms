# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Rooted Right Farms — marketing site for a cannabis farm in Ardmore, Oklahoma. No e-commerce. Four pages: Home, Strains, About, Contact.

## Tech Stack

- Next.js 16+ (App Router, TypeScript strict, `src/` directory)
- Supabase (Postgres for contact form storage, Edge Functions for email notifications)
- Tailwind CSS + shadcn/ui
- pnpm as package manager
- Deployed on Vercel (preview URL during dev, DNS cutover to rootedrightfarms.com for production)

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm test         # Run tests (Vitest)
pnpm test -- src/path/to/file.test.ts  # Single test file
```

## Architecture

- **Pages:** Home (`/`), Strains (`/strains`), About (`/about`), Contact (`/contact`)
- **Strains:** Static data (no CMS). Visual cards with strain photo, name, type, flavor, effects, THC/CBD. "Contact for Wholesale" CTA links to contact form.
- **Contact form:** Server action -> Supabase `contact_submissions` table + email notification. Inquiry type dropdown distinguishes dispensary wholesale vs general questions.
- **Design:** Modern organic — deep greens, cream/white, subtle gold. Inter (body) + serif accent (Playfair Display or Lora) for headings. Mobile-first.
- **Imagery:** Real farm photography from client (pending). Placeholders until delivered.

## Content Status

Four strains from existing site. Only Pie Hoe has a description. Client owes:
- Descriptions, THC/CBD data for Banana Candy, Pine Bud, TropicanaCookies
- 5-10 high-res farm/facility/team photos
- Updated About Us copy (current is one sentence)
