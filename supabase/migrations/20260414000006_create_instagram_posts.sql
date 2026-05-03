-- Instagram posts cache. The sync-instagram Edge Function upserts the 6
-- latest posts here daily. On API failure we never truncate — last-good
-- values remain visible on the homepage.

create type instagram_media_type as enum ('IMAGE', 'VIDEO', 'CAROUSEL_ALBUM');

create table public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  ig_post_id text not null unique,
  media_url text not null,
  thumbnail_url text,
  permalink text not null,
  caption text,
  media_type instagram_media_type not null,
  posted_at timestamptz not null,
  fetched_at timestamptz not null default now()
);

create index idx_instagram_posts_posted_at on public.instagram_posts (posted_at desc);

alter table public.instagram_posts enable row level security;

create policy select_instagram_posts_public
  on public.instagram_posts
  for select
  to anon, authenticated
  using (true);

-- Writes restricted to service_role (the Edge Function runs with service_role
-- credentials). No explicit anon/authenticated INSERT policy means those
-- roles are denied by default under RLS.

comment on policy select_instagram_posts_public on public.instagram_posts is
  'Cached Instagram posts are public — mirror of what is already visible on @rootedrightfarms.';

-- Token bookkeeping. Single-row table keyed by id='default'. The Edge
-- Function reads the long-lived token, rotates it before expiry, and
-- writes back the new value.

create table public.instagram_auth (
  id text primary key default 'default',
  access_token text not null,
  token_expires_at timestamptz not null,
  last_refreshed_at timestamptz,
  last_sync_at timestamptz,
  last_sync_status text,
  last_sync_error text
);

alter table public.instagram_auth enable row level security;

-- No public or authenticated access; only service_role may read/write.
comment on table public.instagram_auth is
  'Instagram long-lived token + sync state. service_role only.';
