-- Strains: public catalog of cannabis cultivars.
-- Public read for published rows only; writes require `admin` role (wired in
-- VA-32 / VA-42 — for now the policy exists and denies all non-admin writes).

create extension if not exists pgcrypto;

create type strain_type as enum ('indica', 'sativa', 'hybrid');

create table public.strains (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  type strain_type not null,
  thc_pct numeric(5, 2),
  cbd_pct numeric(5, 2),
  description text,
  lineage text,
  flavors text[] not null default '{}',
  effects text[] not null default '{}',
  hero_image_url text,
  gallery_image_urls text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_strains_type on public.strains (type);
create index idx_strains_published on public.strains (is_published) where is_published = true;

-- Keep updated_at fresh on any row change.
create or replace function public.tg_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger strains_touch_updated_at
  before update on public.strains
  for each row execute function public.tg_touch_updated_at();

alter table public.strains enable row level security;

-- Public read access only for published rows. The homepage + /strains +
-- /strains/[slug] all consume this policy.
create policy select_strains_public
  on public.strains
  for select
  to anon, authenticated
  using (is_published = true);

-- Admins (custom JWT claim written in VA-32) can read every row regardless
-- of publication state.
create policy select_strains_admin
  on public.strains
  for select
  to authenticated
  using (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

-- Only admins can mutate the catalog.
create policy insert_strains_admin
  on public.strains
  for insert
  to authenticated
  with check (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

create policy update_strains_admin
  on public.strains
  for update
  to authenticated
  using (coalesce((auth.jwt() ->> 'role'), '') = 'admin')
  with check (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

create policy delete_strains_admin
  on public.strains
  for delete
  to authenticated
  using (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

comment on policy select_strains_public on public.strains is
  'Anyone (anon or authenticated) may read rows where is_published = true.';
comment on policy select_strains_admin on public.strains is
  'Admins (role claim on JWT) may read any row including drafts.';
comment on policy insert_strains_admin on public.strains is
  'Only admins may create catalog entries.';
comment on policy update_strains_admin on public.strains is
  'Only admins may mutate catalog entries.';
comment on policy delete_strains_admin on public.strains is
  'Only admins may delete catalog entries.';
