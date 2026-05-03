-- Newsletter subscribers: email list mirrored to Resend Audiences.
-- Source of truth lives in this table; Resend Audiences is a side-effect sync.

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  resend_contact_id text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_newsletter_subscribers_created
  on public.newsletter_subscribers (created_at desc);

create trigger newsletter_subscribers_touch_updated_at
  before update on public.newsletter_subscribers
  for each row execute function public.tg_touch_updated_at();

alter table public.newsletter_subscribers enable row level security;

-- anon may INSERT (footer widget). Duplicate emails are upserted by the
-- server action, not by a RLS-visible ON CONFLICT — the anon role shouldn't
-- be able to read back whether an email already exists.
create policy insert_newsletter_subscribers_anon
  on public.newsletter_subscribers
  for insert
  to anon
  with check (true);

-- Admins can read/update (e.g., writing resend_contact_id after provider sync).
create policy select_newsletter_subscribers_admin
  on public.newsletter_subscribers
  for select
  to authenticated
  using (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

create policy update_newsletter_subscribers_admin
  on public.newsletter_subscribers
  for update
  to authenticated
  using (coalesce((auth.jwt() ->> 'role'), '') = 'admin')
  with check (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

comment on policy insert_newsletter_subscribers_anon on public.newsletter_subscribers is
  'Public newsletter signup. INSERT only — anon may not read back.';
comment on policy select_newsletter_subscribers_admin on public.newsletter_subscribers is
  'Admin may view the subscriber list.';
comment on policy update_newsletter_subscribers_admin on public.newsletter_subscribers is
  'Admin-only updates (e.g., writing resend_contact_id after provider sync).';
